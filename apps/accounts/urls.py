from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', views.me_view, name='me'),
    path('profile/jobseeker/', views.jobseeker_profile_view, name='jobseeker_profile'),
    path('profile/recruiter/', views.recruiter_profile_view, name='recruiter_profile'),
    path('change-password/', views.change_password_view, name='change_password'),
]