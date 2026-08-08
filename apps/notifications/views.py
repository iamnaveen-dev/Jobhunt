from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list_view(request):
    notifications = Notification.objects.filter(
        recipient=request.user
    ).order_by('-created_at')

    unread_count = notifications.filter(is_read=False).count()

    serializer = NotificationSerializer(
        notifications,
        many=True
    )
    return Response({
        'unread_count': unread_count,
        'notifications': serializer.data
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_read_view(request, pk):
    try:
        notification = Notification.objects.get(
            pk=pk,
            recipient=request.user
        )
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    notification.is_read = True
    notification.save()

    return Response(
        {'message': 'Notification marked as read.'}
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read_view(request):
    updated = Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).update(is_read=True)

    return Response({
        'message': f'{updated} notifications marked as read.'
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification_view(request, pk):
    try:
        notification = Notification.objects.get(
            pk=pk,
            recipient=request.user
        )
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    notification.delete()
    return Response(
        {'message': 'Notification deleted.'},
        status=status.HTTP_204_NO_CONTENT
    )
