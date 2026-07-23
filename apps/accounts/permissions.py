from rest_framework.permissions import BasePermission


class IsJobSeeker(BasePermission):
    message = 'Access denied. Job seeker account required.'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'job_seeker'
        )


class IsRecruiter(BasePermission):
    message = 'Access denied. Recruiter account required.'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'recruiter'
        )


class IsAdminUser(BasePermission):
    message = 'Access denied. Admin account required.'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'admin'
        )