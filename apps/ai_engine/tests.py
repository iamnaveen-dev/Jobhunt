from celery import shared_task


@shared_task
def analyze_resume_task(user_id, file_path, filename):
    from apps.accounts.models import User, JobSeekerProfile
    from apps.ai_engine.models import ResumeAnalysis
    from apps.ai_engine.resume_parser import extract_resume_text
    from apps.ai_engine.ai_service import analyze_resume
    from apps.notifications.utils import send_notification_to_user
    import os

    try:
        user = User.objects.get(id=user_id)

        with open(file_path, 'rb') as f:
            class FileWrapper:
                def __init__(self, file_obj):
                    self.file_obj = file_obj
                def read(self):
                    return self.file_obj.read()

            wrapper = FileWrapper(f)
            resume_text = extract_resume_text(wrapper, filename)

        analysis_data = analyze_resume(resume_text)

        ResumeAnalysis.objects.update_or_create(
            user=user,
            defaults={
                'raw_text': resume_text,
                'extracted_skills': analysis_data.get('skills', []),
                'experience_years': analysis_data.get('experience_years', 0),
                'education': analysis_data.get('education', []),
                'ai_summary': analysis_data.get('summary', ''),
            }
        )

        profile = user.seeker_profile
        profile.ai_skills = analysis_data.get('skills', [])
        profile.save()

        send_notification_to_user(
            recipient=user,
            notif_type='system',
            title='Resume Analysis Complete',
            message=f'We found {len(analysis_data.get("skills", []))} skills in your resume.'
        )

        if os.path.exists(file_path):
            os.remove(file_path)

    except Exception as e:
        print(f'Resume analysis failed for user {user_id}: {str(e)}')


@shared_task
def calculate_match_score_task(application_id):
    from apps.applications.models import Application
    from apps.ai_engine.ai_service import calculate_match_score

    try:
        application = Application.objects.select_related(
            'applicant',
            'job'
        ).prefetch_related(
            'job__skills_required'
        ).get(id=application_id)

        try:
            resume_analysis = application.applicant.resume_analyses.latest(
                'analyzed_at'
            )
            candidate_skills = resume_analysis.extracted_skills
        except Exception:
            candidate_skills = application.applicant.seeker_profile.ai_skills

        job_skills = list(
            application.job.skills_required.values_list('name', flat=True)
        )

        score, matched, missing = calculate_match_score(
            candidate_skills,
            job_skills
        )

        application.ai_match_score = score
        application.save()

    except Exception as e:
        print(f'Match score calculation failed: {str(e)}')