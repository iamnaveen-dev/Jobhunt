from django.db import models


class ProfileView(models.Model):
    profile_user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='profile_views'
    )
    viewed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='views_given'
    )
    viewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.viewed_by.email} viewed {self.profile_user.email}"