from django.urls import path
from . import views

urlpatterns = [
    path('jobs/', views.job_list_view, name='job_list'),
    path('jobs/create/', views.job_create_view, name='job_create'),
    path('jobs/my-jobs/', views.my_jobs_view, name='my_jobs'),
    path('jobs/semantic-search/', views.semantic_search_view, name='semantic_search'),
    path('jobs/<int:pk>/', views.job_detail_view, name='job_detail'),
    path('jobs/<int:pk>/update/', views.job_update_view, name='job_update'),
    path('jobs/<int:pk>/delete/', views.job_delete_view, name='job_delete'),
    path('jobs/<int:pk>/toggle/', views.job_toggle_active_view, name='job_toggle'),
    path('skills/', views.skill_list_view, name='skill_list'),
]