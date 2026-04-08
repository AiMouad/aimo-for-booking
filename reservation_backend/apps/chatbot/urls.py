from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatbotView, ChatbotSuggestView, ChatbotTipsView, ChatSessionViewSet

router = DefaultRouter()
router.register(r'conversations', ChatSessionViewSet, basename='chat-session')

urlpatterns = [
    path('chat/', ChatbotView.as_view(), name='chatbot-chat'),
    path('suggest/', ChatbotSuggestView.as_view(), name='chatbot-suggest'),
    path('tips/', ChatbotTipsView.as_view(), name='chatbot-tips'),
    path('', include(router.urls)),
]
