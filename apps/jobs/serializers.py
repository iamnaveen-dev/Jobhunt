from rest_framework import serializers
from .models import Job, Skill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category']


class JobListSerializer(serializers.ModelSerializer):
    skills_required = SkillSerializer(many=True, read_only=True)
    recruiter_name = serializers.CharField(
        source='recruiter.username',
        read_only=True
    )
    company_name = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'location', 'is_remote',
            'job_type', 'experience_level', 'salary_min',
            'salary_max', 'skills_required', 'recruiter_name',
            'company_name', 'applications_count',
            'is_active', 'deadline', 'created_at'
        ]

    def get_company_name(self, obj):
        try:
            return obj.recruiter.recruiter_profile.company_name
        except Exception:
            return ''

    def get_applications_count(self, obj):
        return obj.applications.count()


class JobDetailSerializer(serializers.ModelSerializer):
    skills_required = SkillSerializer(many=True, read_only=True)
    recruiter_name = serializers.CharField(
        source='recruiter.username',
        read_only=True
    )
    company_name = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'location',
            'is_remote', 'job_type', 'experience_level',
            'salary_min', 'salary_max', 'skills_required',
            'recruiter_name', 'company_name',
            'applications_count', 'is_active',
            'deadline', 'created_at', 'updated_at'
        ]

    def get_company_name(self, obj):
        try:
            return obj.recruiter.recruiter_profile.company_name
        except Exception:
            return ''

    def get_applications_count(self, obj):
        return obj.applications.count()


class JobCreateUpdateSerializer(serializers.ModelSerializer):
    skills_required = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Skill.objects.all()
    )

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'location',
            'is_remote', 'job_type', 'experience_level',
            'salary_min', 'salary_max', 'skills_required',
            'is_active', 'deadline'
        ]

    def validate(self, attrs):
        salary_min = attrs.get('salary_min')
        salary_max = attrs.get('salary_max')

        if salary_min and salary_max:
            if salary_min > salary_max:
                raise serializers.ValidationError(
                    {'salary': 'Minimum salary cannot be higher than maximum.'}
                )
        return attrs

    def create(self, validated_data):
        skills = validated_data.pop('skills_required')
        job = Job.objects.create(**validated_data)
        job.skills_required.set(skills)
        return job

    def update(self, instance, validated_data):
        skills = validated_data.pop('skills_required', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if skills is not None:
            instance.skills_required.set(skills)
        return instance