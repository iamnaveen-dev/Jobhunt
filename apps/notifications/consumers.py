import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = self.scope.get('user')

        if not user or isinstance(user, AnonymousUser):
            await self.close()
            return

        self.user_id = user.id
        self.group_name = f'notification_user_{self.user_id}'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to JobHunt notifications.',
            'user_id': self.user_id
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'mark_read':
            notification_id = data.get('notification_id')
            await self.mark_notification_read(notification_id)

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'id': event['id'],
            'title': event['title'],
            'message': event['message'],
            'notif_type': event['notif_type'],
            'created_at': event['created_at'],
        }))

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        from apps.notifications.models import Notification
        try:
            notif = Notification.objects.get(
                id=notification_id,
                recipient_id=self.user_id
            )
            notif.is_read = True
            notif.save()
        except Notification.DoesNotExist:
            pass