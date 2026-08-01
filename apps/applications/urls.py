from django.urls import path
from . import views

urlpatterns = [
    path('applications/apply/', views.apply_view, name='apply'),
    path('applications/my-applications/', views.my_applications_view, name='my_applications'),
    path('applications/<int:pk>/', views.application_detail_view, name='application_detail'),
    path('applications/job/<int:job_pk>/applicants/', views.job_applicants_view, name='job_applicants'),
    path('applications/<int:pk>/status/', views.update_application_status_view, name='update_status'),
    path('applications/<int:pk>/withdraw/', views.withdraw_application_view, name='withdraw'),
    path('applications/saved-jobs/', views.saved_jobs_view, name='saved_jobs'),
    path('applications/saved-jobs/<int:pk>/remove/', views.remove_saved_job_view, name='remove_saved_job'),
]