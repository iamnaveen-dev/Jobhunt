from rest_framework import serializers
from .models import Application, ApplicationTimeline, SavedJob
from apps.jobs.serializers import JobListSerializer


class ApplicationTimelineSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(
        source='changed_by.username',
        read_only=True
    )

    class Meta:
        model = ApplicationTimeline
        fields = [
            'id', 'from_status', 'to_status',
            'changed_by_name', 'note', 'changed_at'
        ]


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['job', 'cover_letter']

    def validate_job(self, value):
        if not value.is_active:
            raise serializers.ValidationError(
                'This job is no longer accepting applications.'
            )
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        job = attrs.get('job')

        if Application.objects.filter(
            job=job,
            applicant=request.user
        ).exists():
            raise serializers.ValidationError(
                'You have already applied for this job.'
            )
        return attrs


class ApplicationListSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(
        source='job.title',
        read_only=True
    )
    job_location = serializers.CharField(
        source='job.location',
        read_only=True
    )
    company_name = serializers.SerializerMethodField()
    applicant_name = serializers.CharField(
        source='applicant.username',
        read_only=True
    )
    applicant_email = serializers.CharField(
        source='applicant.email',
        read_only=True
    )

    class Meta:
        model = Application
        fields = [
            'id', 'job', 'job_title', 'job_location',
            'company_name', 'applicant_name',
            'applicant_email', 'status',
            'ai_match_score', 'applied_at', 'updated_at'
        ]

    def get_company_name(self, obj):
        try:
            return obj.job.recruiter.recruiter_profile.company_name
        except Exception:
            return ''


class ApplicationDetailSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)
    timeline = ApplicationTimelineSerializer(
        many=True,
        read_only=True
    )
    applicant_name = serializers.CharField(
        source='applicant.username',
        read_only=True
    )
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id', 'job', 'applicant_name', 'status',
            'cover_letter', 'ai_match_score',
            'company_name', 'timeline',
            'applied_at', 'updated_at'
        ]

    def get_company_name(self, obj):
        try:
            return obj.job.recruiter.recruiter_profile.company_name
        except Exception:
            return ''


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    note = serializers.CharField(
        write_only=True,
        required=False,
        default=''
    )

    class Meta:
        model = Application
        fields = ['status', 'note']

    VALID_TRANSITIONS = {
        'applied':    ['screening', 'rejected'],
        'screening':  ['interview', 'rejected'],
        'interview':  ['offer', 'rejected'],
        'offer':      ['rejected'],
        'rejected':   [],
        'withdrawn':  [],
    }

    def validate_status(self, new_status):
        current_status = self.instance.status
        allowed = self.VALID_TRANSITIONS.get(
            current_status, []
        )

        if new_status not in allowed:
            raise serializers.ValidationError(
                f'Cannot move from {current_status} to '
                f'{new_status}. '
                f'Allowed next steps: {allowed}'
            )
        return new_status


class SavedJobSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)
    job_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = SavedJob
        fields = ['id', 'job', 'job_id', 'saved_at']

    def validate_job_id(self, value):
        from apps.jobs.models import Job
        try:
            Job.objects.get(id=value)
        except Job.DoesNotExist:
            raise serializers.ValidationError(
                'Job not found.'
            )
        return value