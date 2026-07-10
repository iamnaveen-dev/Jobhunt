from django.db import models


class ResumeAnalysis(models.Model):
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='resume_analyses'
    )
    raw_text = models.TextField()
    extracted_skills = models.JSONField(default=list)
    experience_years = models.FloatField(null=True, blank=True)
    education = models.JSONField(default=list)
    ai_summary = models.TextField(blank=True)
    analyzed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Resume analysis for {self.user.email}"