from rest_framework import status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.core.cache import cache
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from django_redis import get_redis_connection
from .models import Job, Skill
from .serializers import (
    JobListSerializer,
    JobDetailSerializer,
    JobCreateUpdateSerializer,
    SkillSerializer,
)
from apps.accounts.permissions import IsRecruiter


@api_view(['GET'])
@permission_classes([AllowAny])
def job_list_view(request):
    queryset = Job.objects.filter(
        is_active=True
    ).select_related(
        'recruiter',
        'recruiter__recruiter_profile'
    ).prefetch_related(
        'skills_required',
        'applications'
    ).order_by('-created_at')

    location = request.query_params.get('location')
    if location:
        queryset = queryset.filter(
            location__icontains=location
        )

    job_type = request.query_params.get('job_type')
    if job_type:
        queryset = queryset.filter(job_type=job_type)

    experience_level = request.query_params.get('experience_level')
    if experience_level:
        queryset = queryset.filter(
            experience_level=experience_level
        )

    salary_min = request.query_params.get('salary_min')
    if salary_min:
        queryset = queryset.filter(
            salary_min__gte=salary_min
        )

    is_remote = request.query_params.get('is_remote')
    if is_remote:
        queryset = queryset.filter(is_remote=True)

    skill = request.query_params.get('skill')
    if skill:
        queryset = queryset.filter(
            skills_required__name__icontains=skill
        )

    search = request.query_params.get('search')
    if search:
        from django.db.models import Q
        queryset = queryset.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search)
        )

    cache_key = f"jobs_list_{request.query_params}"
    cached = cache.get(cache_key)
    if cached:
        return Response(cached)

    serializer = JobListSerializer(queryset, many=True)
    data = {
        'total': queryset.count(),
        'jobs': serializer.data
    }

    cache.set(cache_key, data, settings.CACHE_TTL)

    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def job_detail_view(request, pk):
    try:
        job = Job.objects.select_related(
            'recruiter',
            'recruiter__recruiter_profile'
        ).prefetch_related(
            'skills_required',
            'applications'
        ).get(pk=pk, is_active=True)
    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = JobDetailSerializer(job)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsRecruiter])
def job_create_view(request):
    serializer = JobCreateUpdateSerializer(data=request.data)

    if serializer.is_valid():
        job = serializer.save(recruiter=request.user)
        cache.delete_many(cache.keys('jobs_list_*'))

        return Response({
            'message': 'Job posted successfully.',
            'job': JobDetailSerializer(job).data
        }, status=status.HTTP_201_CREATED)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsRecruiter])
def job_update_view(request, pk):
    try:
        job = Job.objects.get(pk=pk)
    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if job.recruiter != request.user:
        return Response(
            {'error': 'You can only edit your own jobs.'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = JobCreateUpdateSerializer(
        job,
        data=request.data,
        partial=request.method == 'PATCH'
    )

    if serializer.is_valid():
        serializer.save()
        cache.clear()
        return Response({
            'message': 'Job updated successfully.',
            'job': serializer.data
        })

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsRecruiter])
def job_delete_view(request, pk):
    try:
        job = Job.objects.get(pk=pk)
    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if job.recruiter != request.user:
        return Response(
            {'error': 'You can only delete your own jobs.'},
            status=status.HTTP_403_FORBIDDEN
        )

    job.delete()
    cache.delete_many(cache.keys('jobs_list_*'))

    return Response(
        {'message': 'Job deleted successfully.'},
        status=status.HTTP_204_NO_CONTENT
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsRecruiter])
def my_jobs_view(request):
    jobs = Job.objects.filter(
        recruiter=request.user
    ).prefetch_related(
        'skills_required',
        'applications'
    ).order_by('-created_at')

    serializer = JobListSerializer(jobs, many=True)
    return Response({
        'total': jobs.count(),
        'jobs': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsRecruiter])
def job_toggle_active_view(request, pk):
    try:
        job = Job.objects.get(pk=pk)
    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if job.recruiter != request.user:
        return Response(
            {'error': 'You can only manage your own jobs.'},
            status=status.HTTP_403_FORBIDDEN
        )

    job.is_active = not job.is_active
    job.save()

    cache.delete_many(cache.keys('jobs_list_*'))

    status_text = 'activated' if job.is_active else 'paused'
    return Response({
        'message': f'Job {status_text} successfully.',
        'is_active': job.is_active
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def skill_list_view(request):
    skills = Skill.objects.all().order_by('category', 'name')

    search = request.query_params.get('search')
    if search:
        skills = skills.filter(name__icontains=search)

    serializer = SkillSerializer(skills, many=True)
    return Response({
        'total': skills.count(),
        'skills': serializer.data
    })