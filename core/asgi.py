import os
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault(
    'DJANGO_SETTINGS_MODULE',
    'core.settings.development'
)

django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from apps.notifications.routing import websocket_urlpatterns
from apps.notifications.middleware import JWTAuthMiddleware

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    
    'websocket': JWTAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})