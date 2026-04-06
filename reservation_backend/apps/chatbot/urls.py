from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatSessionViewSet, ChatInteractView, SmartSearchView

router = DefaultRouter()
router.register('sessions', ChatSessionViewSet, basename='chat-session')

urlpatterns = [
    path('', include(router.urls)),
    path('interact/', ChatInteractView.as_view(), name='chat-interact'),
    path('smart-search/', SmartSearchView.as_view(), name='smart-search'),
]
