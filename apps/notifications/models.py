from django.db import models


class Notification(models.Model):
    NOTIF_TYPE = [
        ('application_update', 'Application Update'),
        ('new_applicant', 'New Applicant'),
        ('system', 'System'),
    ]

    recipient = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notif_type = models.CharField(max_length=30, choices=NOTIF_TYPE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient.email} — {self.title}"