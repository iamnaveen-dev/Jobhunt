from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Application, ApplicationTimeline, SavedJob
from .serializers import (
    ApplicationCreateSerializer,
    ApplicationListSerializer,
    ApplicationDetailSerializer,
    ApplicationStatusUpdateSerializer,
    SavedJobSerializer,
)
from .tasks import (
    send_application_received_email,
    send_new_applicant_email,
    send_status_update_email,
)
from apps.accounts.permissions import IsJobSeeker, IsRecruiter
from apps.notifications.models import Notification


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsJobSeeker])
def apply_view(request):
    serializer = ApplicationCreateSerializer(
        data=request.data,
        context={'request': request}
    )

    if serializer.is_valid():
        application = serializer.save(
            applicant=request.user
        )

        ApplicationTimeline.objects.create(
            application=application,
            from_status='',
            to_status='applied',
            changed_by=request.user,
            note='Application submitted.'
        )

        send_application_received_email.delay(
            applicant_email=request.user.email,
            applicant_name=request.user.username,
            job_title=application.job.title,
            company_name=application.job.recruiter.recruiter_profile.company_name
        )

        send_new_applicant_email.delay(
            recruiter_email=application.job.recruiter.email,
            recruiter_name=application.job.recruiter.username,
            applicant_name=request.user.username,
            job_title=application.job.title
        )

        Notification.objects.create(
            recipient=application.job.recruiter,
            notif_type='new_applicant',
            title=f'New applicant for {application.job.title}',
            message=f'{request.user.username} has applied for your job.'
        )

        return Response({
            'message': 'Application submitted successfully.',
            'application': ApplicationDetailSerializer(application).data
        }, status=status.HTTP_201_CREATED)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsJobSeeker])
def my_applications_view(request):
    applications = Application.objects.filter(
        applicant=request.user
    ).select_related(
        'job',
        'job__recruiter__recruiter_profile'
    ).order_by('-applied_at')

    serializer = ApplicationListSerializer(
        applications,
        many=True
    )
    return Response({
        'total': applications.count(),
        'applications': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def application_detail_view(request, pk):
    try:
        application = Application.objects.select_related(
            'job',
            'job__recruiter__recruiter_profile',
            'applicant'
        ).prefetch_related('timeline').get(pk=pk)
    except Application.DoesNotExist:
        return Response(
            {'error': 'Application not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if (application.applicant != request.user and
            application.job.recruiter != request.user):
        return Response(
            {'error': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = ApplicationDetailSerializer(application)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsRecruiter])
def job_applicants_view(request, job_pk):
    applications = Application.objects.filter(
        job_id=job_pk,
        job__recruiter=request.user
    ).select_related(
        'applicant',
        'job'
    ).order_by(
        '-ai_match_score',
        '-applied_at'
    )

    serializer = ApplicationListSerializer(
        applications,
        many=True
    )
    return Response({
        'total': applications.count(),
        'applications': serializer.data
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsRecruiter])
def update_application_status_view(request, pk):
    try:
        application = Application.objects.select_related(
            'applicant',
            'job',
            'job__recruiter__recruiter_profile'
        ).get(pk=pk)
    except Application.DoesNotExist:
        return Response(
            {'error': 'Application not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if application.job.recruiter != request.user:
        return Response(
            {'error': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    old_status = application.status

    serializer = ApplicationStatusUpdateSerializer(
        application,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():
        note = serializer.validated_data.pop('note', '')
        application = serializer.save()

        ApplicationTimeline.objects.create(
            application=application,
            from_status=old_status,
            to_status=application.status,
            changed_by=request.user,
            note=note
        )

        send_status_update_email.delay(
            applicant_email=application.applicant.email,
            applicant_name=application.applicant.username,
            job_title=application.job.title,
            new_status=application.status,
            company_name=application.job.recruiter.recruiter_profile.company_name
        )

        Notification.objects.create(
            recipient=application.applicant,
            notif_type='application_update',
            title=f'Application Update — {application.job.title}',
            message=f'Your application status changed to {application.status.upper()}.'
        )

        return Response({
            'message': 'Application status updated.',
            'application': ApplicationDetailSerializer(application).data
        })

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsJobSeeker])
def withdraw_application_view(request, pk):
    try:
        application = Application.objects.get(
            pk=pk,
            applicant=request.user
        )
    except Application.DoesNotExist:
        return Response(
            {'error': 'Application not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if application.status in ['rejected', 'withdrawn']:
        return Response(
            {'error': f'Cannot withdraw application with status {application.status}.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    old_status = application.status
    application.status = 'withdrawn'
    application.save()

    ApplicationTimeline.objects.create(
        application=application,
        from_status=old_status,
        to_status='withdrawn',
        changed_by=request.user,
        note='Applicant withdrew their application.'
    )

    return Response(
        {'message': 'Application withdrawn successfully.'}
    )


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsJobSeeker])
def saved_jobs_view(request):
    if request.method == 'GET':
        saved = SavedJob.objects.filter(
            user=request.user
        ).select_related('job').order_by('-saved_at')

        serializer = SavedJobSerializer(saved, many=True)
        return Response({
            'total': saved.count(),
            'saved_jobs': serializer.data
        })

    job_id = request.data.get('job_id')
    if SavedJob.objects.filter(
        user=request.user,
        job_id=job_id
    ).exists():
        return Response(
            {'error': 'Job already saved.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = SavedJobSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({
            'message': 'Job saved successfully.',
            'saved_job': serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsJobSeeker])
def remove_saved_job_view(request, pk):
    try:
        saved = SavedJob.objects.get(
            pk=pk,
            user=request.user
        )
    except SavedJob.DoesNotExist:
        return Response(
            {'error': 'Saved job not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    saved.delete()
    return Response(
        {'message': 'Job removed from saved list.'},
        status=status.HTTP_204_NO_CONTENT
    )