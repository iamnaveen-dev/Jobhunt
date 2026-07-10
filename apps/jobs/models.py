from django.db import models

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Job(models.Model):
    JOB_TYPE = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
    ]
    EXP_LEVEL = [
        ('entry', 'Entry'),
        ('mid', 'Mid'),
        ('senior', 'Senior'),
        ('lead', 'Lead'),
    ]

    recruiter = models.ForeignKey(
        'accounts.User', on_delete=models.CASCADE, related_name='posted_jobs'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=100)
    is_remote = models.BooleanField(default=False)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE)
    experience_level = models.CharField(max_length=20, choices=EXP_LEVEL)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    skills_required = models.ManyToManyField(Skill, related_name='jobs')
    is_active = models.BooleanField(default=True)
    deadline = models.DateField(null=True, blank=True)
    embedding = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['location']),
            models.Index(fields=['is_active', 'created_at']),
            models.Index(fields=['experience_level']),
        ]