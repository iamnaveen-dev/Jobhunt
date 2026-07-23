from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, JobSeekerProfile, RecruiterProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password',
            'password2', 'role', 'phone'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password': 'Passwords do not match.'}
            )
        if not attrs.get('role'):
            raise serializers.ValidationError(
                {'role': 'Please select job_seeker or recruiter.'}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role'],
            phone=validated_data.get('phone', '')
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role',
            'phone', 'is_email_verified', 'created_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'is_email_verified'
        ]


class JobSeekerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = JobSeekerProfile
        fields = [
            'id', 'user', 'bio', 'location',
            'resume', 'linkedin_url', 'github_url',
            'experience_years', 'ai_skills', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at', 'ai_skills']


class RecruiterProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = [
            'id', 'user', 'company_name',
            'company_website', 'designation', 'verified'
        ]
        read_only_fields = ['id', 'verified']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password]
    )