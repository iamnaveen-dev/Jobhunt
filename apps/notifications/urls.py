from django.urls import path
from . import views

urlpatterns = [
    path('notifications/', views.notification_list_view, name='notifications'),

    path('notifications/<int:pk>/read/', views.mark_read_view, name='mark_read'),
    
    path('notifications/mark-all-read/', views.mark_all_read_view, name='mark_all_read'),
    path('notifications/<int:pk>/delete/', views.delete_notification_view, name='delete_notification'),
]