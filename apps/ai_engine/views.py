from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
from .models import ResumeAnalysis
from .tasks import analyze_resume_task, calculate_match_score_task
from .ai_service import (
    generate_interview_questions,
    generate_cover_letter,
    calculate_match_score,
)
from apps.accounts.permissions import IsJobSeeker
from apps.applications.models import Application
from apps.ai_engine.resume_parser import extract_resume_text


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsJobSeeker])
def upload_resume_view(request):
    if 'resume' not in request.FILES:
        return Response(
            {'error': 'No resume file provided.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    resume_file = request.FILES['resume']
    filename = resume_file.name

    if not (filename.endswith('.pdf') or filename.endswith('.docx')):
        return Response(
            {'error': 'Only PDF and DOCX files are supported.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if resume_file.size > 5 * 1024 * 1024:
        return Response(
            {'error': 'File size must be under 5MB.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    temp_path = f'temp_resumes/user_{request.user.id}_{filename}'
    saved_path = default_storage.save(
        temp_path,
        ContentFile(resume_file.read())
    )
    full_path = os.path.join(settings.MEDIA_ROOT, saved_path)

    profile = request.user.seeker_profile
    profile.resume = saved_path
    profile.save()

    analyze_resume_task.delay(
        request.user.id,
        full_path,
        filename
    )

    return Response({
        'message': 'Resume uploaded successfully. AI analysis started.',
        'filename': filename
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsJobSeeker])
def resume_analysis_view(request):
    try:
        analysis = ResumeAnalysis.objects.filter(
            user=request.user
        ).latest('analyzed_at')

        return Response({
            'skills': analysis.extracted_skills,
            'experience_years': analysis.experience_years,
            'education': analysis.education,
            'summary': analysis.ai_summary,
            'analyzed_at': analysis.analyzed_at
        })
    except ResumeAnalysis.DoesNotExist:
        return Response(
            {'error': 'No resume analysis found. Please upload your resume first.'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsJobSeeker])
def job_match_score_view(request, job_pk):
    from apps.jobs.models import Job

    try:
        job = Job.objects.prefetch_related(
            'skills_required'
        ).get(pk=job_pk)
    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        analysis = ResumeAnalysis.objects.filter(
            user=request.user
        ).latest('analyzed_at')
        candidate_skills = analysis.extracted_skills
    except ResumeAnalysis.DoesNotExist:
        candidate_skills = request.user.seeker_profile.ai_skills

    if not candidate_skills:
        return Response(
            {'error': 'Please upload your resume first to get a match score.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    job_skills = list(
        job.skills_required.values_list('name', flat=True)
    )

    score, matched, missing = calculate_match_score(
        candidate_skills,
        job_skills
    )

    return Response({
        'job_title': job.title,
        'match_score': score,
        'matched_skills': matched,
        'missing_skills': missing,
        'your_skills': candidate_skills,
        'required_skills': job_skills,
        'recommendation': (
            'Strong match! Apply now.' if score >= 70
            else 'Decent match. Consider applying.' if score >= 50
            else 'Low match. Build missing skills first.'
        )
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsJobSeeker])
def interview_prep_view(request, application_pk):
    try:
        application = Application.objects.select_related(
            'job',
            'job__recruiter__recruiter_profile'
        ).get(
            pk=application_pk,
            applicant=request.user
        )
    except Application.DoesNotExist:
        return Response(
            {'error': 'Application not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        analysis = ResumeAnalysis.objects.filter(
            user=request.user
        ).latest('analyzed_at')
        resume_text = analysis.raw_text
    except ResumeAnalysis.DoesNotExist:
        return Response(
            {'error': 'Please upload your resume first.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    questions = generate_interview_questions(
        resume_text=resume_text,
        job_description=application.job.description,
        job_title=application.job.title
    )

    return Response({
        'job_title': application.job.title,
        'company': application.job.recruiter.recruiter_profile.company_name,
        'technical_questions': questions.get('technical_questions', []),
        'behavioral_questions': questions.get('behavioral_questions', []),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsJobSeeker])
def generate_cover_letter_view(request, job_pk):
    from apps.jobs.models import Job

    try:
        job = Job.objects.select_related(
            'recruiter__recruiter_profile'
        ).get(pk=job_pk)
    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        analysis = ResumeAnalysis.objects.filter(
            user=request.user
        ).latest('analyzed_at')
        resume_text = analysis.raw_text
    except ResumeAnalysis.DoesNotExist:
        return Response(
            {'error': 'Please upload your resume first.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    cover_letter = generate_cover_letter(
        resume_text=resume_text,
        job_description=job.description,
        job_title=job.title,
        company_name=job.recruiter.recruiter_profile.company_name
    )

    return Response({
        'job_title': job.title,
        'company': job.recruiter.recruiter_profile.company_name,
        'cover_letter': cover_letter
    })