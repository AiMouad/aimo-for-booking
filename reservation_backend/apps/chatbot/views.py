from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter

from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer, ChatQuestionSerializer
from .bot_engine import ChatbotEngine, LanguageDetector


class ChatbotView(APIView):
    """
    POST /api/chatbot/chat/
    Main chat endpoint — supports EN/FR/AR with AI + fallback.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChatQuestionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        question = serializer.validated_data['question']
        session_id = serializer.validated_data.get('session_id')
        user = request.user

        # Detect language early for hints
        lang = LanguageDetector.detect(question)

        # Get or create session
        session = None
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=user)
            except ChatSession.DoesNotExist:
                pass

        if not session:
            session = ChatSession.objects.create(user=user, title=question[:80])

        engine = ChatbotEngine()

        # 1. Try structured command first
        result = engine.process_command(question, user)

        # 2. Fall back to AI / rule-based
        if not result:
            result = engine.generate_response(question, user, session)
        else:
            # Save command messages manually (not done inside process_command)
            try:
                ChatMessage.objects.create(session=session, role='user', content=question)
                ChatMessage.objects.create(session=session, role='assistant', content=result.get('answer', ''))
            except Exception:
                pass

        return Response({
            'session_id': str(session.id),
            'answer': result.get('answer', ''),
            'data': result.get('data'),
            'data_type': result.get('data_type'),
            'action_required': result.get('action_required'),
            'response_time': result.get('response_time', 0),
            'ai_powered': result.get('ai_powered', False),
            'lang': result.get('lang', lang),
            'success': result.get('success', True),
        })


class ChatbotSuggestView(APIView):
    """GET /api/chatbot/suggest/ — property suggestions (public)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        lang = request.query_params.get('lang', 'en')
        engine = ChatbotEngine()
        user = request.user if request.user.is_authenticated else None
        result = engine.suggest_services(user=user, lang=lang)
        return Response(result)


class ChatbotTipsView(APIView):
    """GET /api/chatbot/tips/?lang=en — multilingual tips."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        lang = request.query_params.get('lang', 'en')
        engine = ChatbotEngine()
        tips = engine.get_tips(lang=lang)
        return Response({'tips': tips, 'lang': lang})


class ChatSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """Chat session history for the current user."""
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering = ['-updated_at']

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user).prefetch_related('messages')

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        session = self.get_object()
        msgs = session.messages.all().order_by('created_at')
        return Response(ChatMessageSerializer(msgs, many=True).data)

    @action(detail=False, methods=['delete'])
    def clear_history(self, request):
        ChatSession.objects.filter(user=request.user).delete()
        return Response({'message': 'Chat history cleared.'})