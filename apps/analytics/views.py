from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta
from apps.accounts.permissions import IsRecruiter, IsJobSeeker
from apps.applications.models import Application
from apps.jobs.models import Job
from apps.notifications.models import Notification


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsRecruiter])
def recruiter_dashboard_view(request):
    recruiter = request.user

    total_jobs = Job.objects.filter(
        recruiter=recruiter
    ).count()

    active_jobs = Job.objects.filter(
        recruiter=recruiter,
        is_active=True
    ).count()

    all_applications = Application.objects.filter(
        job__recruiter=recruiter
    )

    total_applications = all_applications.count()

    funnel = all_applications.values('status').annotate(
        count=Count('id')
    ).order_by('status')

    funnel_data = {
        item['status']: item['count']
        for item in funnel
    }

    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_applications = all_applications.filter(
        applied_at__gte=thirty_days_ago
    ).count()

    top_jobs = Job.objects.filter(
        recruiter=recruiter
    ).annotate(
        app_count=Count('applications')
    ).order_by('-app_count')[:5].values(
        'id', 'title', 'app_count', 'is_active'
    )

    return Response({
        'overview': {
            'total_jobs': total_jobs,
            'active_jobs': active_jobs,
            'total_applications': total_applications,
            'recent_applications_30d': recent_applications,
        },
        'funnel': {
            'applied': funnel_data.get('applied', 0),
            'screening': funnel_data.get('screening', 0),
            'interview': funnel_data.get('interview', 0),
            'offer': funnel_data.get('offer', 0),
            'rejected': funnel_data.get('rejected', 0),
        },
        'top_jobs': list(top_jobs),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsJobSeeker])
def jobseeker_dashboard_view(request):
    user = request.user

    my_applications = Application.objects.filter(
        applicant=user
    )

    total_applications = my_applications.count()

    status_breakdown = my_applications.values(
        'status'
    ).annotate(
        count=Count('id')
    ).order_by('status')

    status_data = {
        item['status']: item['count']
        for item in status_breakdown
    }

    avg_score = my_applications.filter(
        ai_match_score__isnull=False
    ).aggregate(
        avg=Avg('ai_match_score')
    )['avg']

    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent = my_applications.filter(
        applied_at__gte=thirty_days_ago
    ).count()

    unread_notifications = Notification.objects.filter(
        recipient=user,
        is_read=False
    ).count()

    offers = status_data.get('offer', 0)
    success_rate = round(
        (offers / total_applications * 100), 1
    ) if total_applications > 0 else 0

    return Response({
        'overview': {
            'total_applications': total_applications,
            'recent_applications_30d': recent,
            'average_match_score': round(avg_score, 1) if avg_score else 0,
            'success_rate_percent': success_rate,
            'unread_notifications': unread_notifications,
        },
        'status_breakdown': {
            'applied': status_data.get('applied', 0),
            'screening': status_data.get('screening', 0),
            'interview': status_data.get('interview', 0),
            'offer': status_data.get('offer', 0),
            'rejected': status_data.get('rejected', 0),
            'withdrawn': status_data.get('withdrawn', 0),
        },
    })
