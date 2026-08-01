from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task
def send_application_received_email(
    applicant_email,
    applicant_name,
    job_title,
    company_name
):
    send_mail(
        subject=f'Application Received — {job_title}',
        message=f"""
Hi {applicant_name},

Your application for {job_title} at {company_name}
has been received successfully.

We will review your profile and get back to you.

Best of luck!
Team JobHunt
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[applicant_email],
        fail_silently=False,
    )


@shared_task
def send_new_applicant_email(
    recruiter_email,
    recruiter_name,
    applicant_name,
    job_title
):
    send_mail(
        subject=f'New Applicant — {job_title}',
        message=f"""
Hi {recruiter_name},

{applicant_name} has applied for your job: {job_title}.

Login to JobHunt to review their application.

Team JobHunt
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recruiter_email],
        fail_silently=False,
    )


@shared_task
def send_status_update_email(
    applicant_email,
    applicant_name,
    job_title,
    new_status,
    company_name
):
    status_messages = {
        'screening': 'Your application is being reviewed.',
        'interview': 'Congratulations! You have been selected for an interview.',
        'offer':     'Congratulations! You have received a job offer.',
        'rejected':  'Unfortunately your application was not selected this time. Keep going!',
    }

    send_mail(
        subject=f'Application Update — {job_title}',
        message=f"""
Hi {applicant_name},

Update on your application for {job_title} at {company_name}:

Status: {new_status.upper()}
{status_messages.get(new_status, '')}

Login to JobHunt to view full details.

Team JobHunt
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[applicant_email],
        fail_silently=False,
    )


@shared_task
def notify_pending_applications():
    from apps.applications.models import Application
    from django.utils import timezone
    from datetime import timedelta

    seven_days_ago = timezone.now() - timedelta(days=7)

    pending = Application.objects.filter(
        status='applied',
        applied_at__lte=seven_days_ago
    ).select_related(
        'job__recruiter',
        'applicant'
    )

    for application in pending:
        recruiter = application.job.recruiter
        send_mail(
            subject=f'Pending Application — {application.job.title}',
            message=f"""
Hi {recruiter.username},

{application.applicant.username} applied for
{application.job.title} over 7 days ago
and is still waiting for a response.

Please review on your JobHunt dashboard.

Team JobHunt
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recruiter.email],
            fail_silently=True,
        )