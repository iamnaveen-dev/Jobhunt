from django.urls import path
from . import views

urlpatterns = [
    path('analytics/recruiter/', views.recruiter_dashboard_view, name='recruiter_dashboard'),
    path('analytics/jobseeker/', views.jobseeker_dashboard_view, name='jobseeker_dashboard'),
]