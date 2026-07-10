from  django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('job_seeker', 'Job Seeker'),
        ('recruiter', 'Recruiter'),
        ('admin', 'Admin'),
    ]

    role=models.CharField(max_length=20, choices=ROLE_CHOICES)  
    phone=models.CharField(max_length=15, blank=True, null=True)
    is_email_verified=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email} ({self.role})"


class JobSeekerProfile(models.Model):
    user=models.OneToOneField(User, on_delete=models.CASCADE, related_name='seeker_profile')
    bio=models.TextField(blank=True)
    location=models.CharField(max_length=150,blank=True)
    resume=models.FileField(upload_to='resumes/', blank=True)
    linkedin_url=models.URLField(blank=True)
    github_url=models.URLField(blank=True)
    experience_years=models.PositiveIntegerField(default=0)
    ai_skills=models.JSONField(default=list)
    updated_at  = models.DateTimeField(auto_now=True)

class RecruiterProfile(models.Model):
    user=models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    company_name=models.CharField(max_length=200)
    company_website=models.URLField(blank=True)
    designation=models.CharField(max_length=100)
    verified=models.BooleanField(default=False)