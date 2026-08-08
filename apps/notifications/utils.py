from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification


def send_notification_to_user(
    recipient,
    notif_type,
    title,
    message
):
    notification = Notification.objects.create(
        recipient=recipient,
        notif_type=notif_type,
        title=title,
        message=message
    )

    channel_layer = get_channel_layer()
    group_name = f'notification_user_{recipient.id}'

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'send_notification',
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'notif_type': notification.notif_type,
            'created_at': str(notification.created_at),
        }
    )

    return notification