from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
import openai
from django.conf import settings
from apps.services.models import Service
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer, ChatRequestSerializer

class ChatSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing chat sessions"""
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ChatInteractView(APIView):
    """AI Chatbot for service recommendations"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        user_message = serializer.validated_data['message'].strip()
        session_id = serializer.validated_data.get('session_id')
        
        # Get or create session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=request.user)
            except ChatSession.DoesNotExist:
                return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            session = ChatSession.objects.create(user=request.user)
            
        # Save user message to database
        ChatMessage.objects.create(
            session=session,
            role=ChatMessage.Role.USER,
            content=user_message
        )
        
        # Build system prompt
        system_prompt = self._build_system_prompt(request.user)
        
        # Prepare messages for OpenAI
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history from database
        history = session.messages.order_by('created_at')
        # We limit to last 10 messages for context, excluding the one we just added
        # Wait, the one we just added is already in history, so up to 11
        history_msgs = list(history.order_by('-created_at')[:11])
        history_msgs.reverse()
        for msg in history_msgs:
            # we need to append them in chronological order
            if msg.role != ChatMessage.Role.SYSTEM:
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        try:
            # Call OpenAI API
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                temperature=0.3,
                max_tokens=500
            )
            
            assistant_message = response.choices[0].message.content
            
            # Save assistant message to database
            ChatMessage.objects.create(
                session=session,
                role=ChatMessage.Role.ASSISTANT,
                content=assistant_message
            )
            
            # Extract service recommendations if applicable
            recommendations = self._extract_service_recommendations(
                user_message,
                assistant_message
            )
            
            return Response({
                'reply': assistant_message,
                'recommendations': recommendations,
                'session_id': session.id,
                'usage': {
                    'prompt_tokens': response.usage.prompt_tokens,
                    'completion_tokens': response.usage.completion_tokens
                }
            })
        
        except Exception as e:
            return Response(
                {'error': f'AI service error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _build_system_prompt(self, user):
        """Build context-aware system prompt"""
        services = Service.objects.filter(status=Service.Status.ACTIVE)
        service_list = "\n".join([
            f"- {s.name}: {s.description} (€{s.price}, {s.duration_minutes}min)"
            for s in services[:20]
        ])
        
        prompt = f"""Vous êtes un assistant virtuel pour une application de réservation de services.
        
Votre rôle:
- Aider l'utilisateur ({user.get_full_name()}) à trouver et réserver le bon service
- Répondre en français de manière professionnelle et amicale
- Suggérer des services pertinents basés sur les besoins de l'utilisateur
- Poser des questions de clarification si nécessaire
- Ne jamais demander d'informations personnelles sensibles

Services disponibles:
{service_list}

Instructions:
- Soyez concis et clair
- Proposez 2-3 options maximum à la fois
- Guidez l'utilisateur étape par étape
- Si vous ne trouvez pas de service adapté, proposez des alternatives ou suggérez de contacter le support
"""
        
        return prompt
    
    def _extract_service_recommendations(self, user_msg, ai_response):
        """Extract service IDs mentioned in AI response"""
        services = Service.objects.filter(status=Service.Status.ACTIVE)
        recommendations = []
        
        for service in services:
            if service.name.lower() in ai_response.lower():
                recommendations.append({
                    'id': service.id,
                    'name': service.name,
                    'price': str(service.price),
                    'slug': service.slug
                })
        
        return recommendations[:3]


class SmartSearchView(APIView):
    """AI-powered smart search"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        query = request.data.get('query', '').strip()
        
        if not query:
            return Response(
                {'error': 'Query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            
            prompt = f"""Analysez cette requête de recherche et extrayez les filtres pertinents:
            
Requête: "{query}"

Retournez UNIQUEMENT un JSON avec ces champs (valeurs null si non applicable):
{{
    "category": "nom de catégorie ou null",
    "min_price": nombre ou null,
    "max_price": nombre ou null,
    "keywords": ["mot-clé1", "mot-clé2"],
    "intent": "description courte de l'intention"
}}
"""
            
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a search query analyzer. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=200,
                response_format={"type": "json_object"}
            )
            
            import json
            filters = json.loads(response.choices[0].message.content)
            
            queryset = Service.objects.filter(status=Service.Status.ACTIVE)
            
            if filters.get('min_price'):
                queryset = queryset.filter(price__gte=filters['min_price'])
            if filters.get('max_price'):
                queryset = queryset.filter(price__lte=filters['max_price'])
            
            if filters.get('keywords'):
                from django.db.models import Q
                keyword_query = Q()
                for keyword in filters['keywords']:
                    keyword_query |= Q(name__icontains=keyword) | Q(description__icontains=keyword)
                queryset = queryset.filter(keyword_query)
            
            from apps.services.serializers import ServiceListSerializer
            results = ServiceListSerializer(queryset[:10], many=True).data
            
            return Response({
                'results': results,
                'filters': filters,
                'count': queryset.count()
            })
        
        except Exception as e:
            return Response(
                {'error': f'Search error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )