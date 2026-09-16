from django.urls import path
from . import views

urlpatterns = [
    path('ai/resume/upload/', views.upload_resume_view, name='upload_resume'),
    path('ai/resume/analysis/', views.resume_analysis_view, name='resume_analysis'),
    path('ai/match/<int:job_pk>/', views.job_match_score_view, name='job_match'),
    path('ai/interview-prep/<int:application_pk>/', views.interview_prep_view, name='interview_prep'),
    path('ai/cover-letter/<int:job_pk>/', views.generate_cover_letter_view, name='cover_letter'),
]