# chatbot/bot_engine.py
"""
AIMO Chatbot Engine
-------------------
• Primary: Google Gemini AI (when GOOGLE_API_KEY is set)
• Fallback: Rule-based multilingual responses
• Languages supported: English, French, Arabic (auto-detected)
• Easily upgradeable: just set GOOGLE_API_KEY in .env
"""
import os
import re
import time
import random
import logging
import typing

from django.conf import settings

logger = logging.getLogger('apps.chatbot')


# ─── Multilingual System Prompt ─────────────────────────────────────────────
SYSTEM_PROMPT = """
You are AIMO — an intelligent assistant specialized exclusively in reservation and booking management.

## Your Role
You assist three types of users:
1. **Property Owners**: manage properties, apartments, bookings, workers, and view analytics
2. **Workers**: check assigned properties, today's arrivals/departures, booking queue
3. **Clients**: browse available services, make bookings, track reservations

## Personality
- Professional, warm, and concise
- Use emojis sparingly but effectively
- Always provide actionable, specific advice
- Never answer questions unrelated to property/booking management

## Language Detection
CRITICAL: Detect the user's language automatically:
- If the user writes in **Arabic** → respond entirely in Arabic
- If the user writes in **French** → respond entirely in French
- If the user writes in **English** → respond entirely in English
- Mixed input → use the dominant language

## Topics You Handle
- Booking creation, modification, cancellation
- Property and apartment management
- Availability and pricing questions
- Service recommendations and comparisons
- Maintenance and problem reporting
- Market trends and pricing advice
- Tips for better property management

## Topics You Must REFUSE
Politely decline any question not related to property/reservation management.
- Politics, religion, general chat → "I'm only able to help with reservations. 🏨"
- If unclear → ask for clarification

## Response Format
- Keep responses under 200 words
- Use bullet points for lists
- Bold key terms
- End with a call to action when possible
"""

# ─── Multilingual Responses (Fallback) ──────────────────────────────────────
RESPONSES = {
    'greeting': {
        'en': "👋 Hi! I'm AIMO, your intelligent booking assistant. I can help you with:\n• Finding & booking properties\n• Managing reservations\n• Property management tips\n\nHow can I help you today?",
        'fr': "👋 Bonjour ! Je suis AIMO, votre assistant de réservation intelligent. Je peux vous aider avec :\n• Trouver et réserver des propriétés\n• Gérer vos réservations\n• Conseils de gestion immobilière\n\nComment puis-je vous aider ?",
        'ar': "👋 مرحباً! أنا AIMO، مساعدك الذكي للحجز. يمكنني مساعدتك في:\n• البحث عن وحجز العقارات\n• إدارة الحجوزات\n• نصائح إدارة العقارات\n\nكيف يمكنني مساعدتك اليوم؟",
    },
    'booking_help': {
        'en': "📅 **To make a booking:**\n1. Go to **Services** and browse properties\n2. Click on a property you like\n3. Select your dates and number of nights\n4. Fill in guest details and confirm\n\nNeed help finding a specific type of property?",
        'fr': "📅 **Pour effectuer une réservation :**\n1. Allez dans **Services** et parcourez les propriétés\n2. Cliquez sur une propriété qui vous plaît\n3. Sélectionnez vos dates et le nombre de nuits\n4. Complétez les détails et confirmez\n\nVoulez-vous que je vous recommande une propriété ?",
        'ar': "📅 **لإجراء حجز:**\n1. انتقل إلى **الخدمات** وتصفح العقارات\n2. انقر على العقار الذي يعجبك\n3. حدد تواريخك وعدد الليالي\n4. أدخل بيانات الضيف وأكّد\n\nهل تريد أن أوصي لك بعقار مناسب؟",
    },
    'cancel_help': {
        'en': "❌ **To cancel a booking:**\n• Go to **My Reservations**\n• Find the booking with **Pending** status\n• Click **Cancel Booking**\n\n⚠️ Only *pending* bookings can be self-cancelled. For confirmed bookings, contact staff.",
        'fr': "❌ **Pour annuler une réservation :**\n• Allez dans **Mes Réservations**\n• Trouvez la réservation avec le statut **En attente**\n• Cliquez sur **Annuler la réservation**\n\n⚠️ Seules les réservations *en attente* peuvent être annulées. Pour les confirmées, contactez le personnel.",
        'ar': "❌ **لإلغاء حجز:**\n• انتقل إلى **حجوزاتي**\n• ابحث عن الحجز بحالة **قيد الانتظار**\n• انقر على **إلغاء الحجز**\n\n⚠️ يمكن إلغاء الحجوزات *المعلقة* فقط بنفسك. للمؤكدة، تواصل مع الموظفين.",
    },
    'availability': {
        'en': "✅ **Checking availability:**\n• Browse the **Services** page to see all properties\n• Each property shows available date ranges\n• Click a property → check its calendar\n\nDo you have specific dates in mind?",
        'fr': "✅ **Vérifier la disponibilité :**\n• Parcourez la page **Services** pour voir toutes les propriétés\n• Chaque propriété affiche ses plages de dates disponibles\n• Cliquez sur une propriété → consultez son calendrier\n\nAvez-vous des dates précises en tête ?",
        'ar': "✅ **التحقق من التوفر:**\n• تصفح صفحة **الخدمات** لرؤية جميع العقارات\n• كل عقار يعرض نطاقات التواريخ المتاحة\n• انقر على عقار → راجع تقويمه\n\nهل لديك تواريخ محددة في ذهنك؟",
    },
    'price_help': {
        'en': "💰 **Pricing information:**\nPrices vary by property, apartment type, and season.\n• Check the **Services** page for current rates\n• Each apartment listing shows the price per night\n\nWould you like me to suggest properties in a certain price range?",
        'fr': "💰 **Informations sur les prix :**\nLes prix varient selon la propriété, le type d'appartement et la saison.\n• Consultez la page **Services** pour les tarifs actuels\n• Chaque appartement indique le prix par nuit\n\nVoulez-vous que je suggère des propriétés dans une certaine gamme de prix ?",
        'ar': "💰 **معلومات الأسعار:**\nتتفاوت الأسعار حسب العقار ونوع الشقة والموسم.\n• راجع صفحة **الخدمات** لمعرفة الأسعار الحالية\n• كل شقة تعرض السعر لكل ليلة\n\nهل تريد أن أقترح عقارات في نطاق سعري معين؟",
    },
    'owner_tips': {
        'en': "💡 **Property Management Tips:**\n• 📅 _Availability_: Keep your calendar up-to-date\n• ✅ _Response Time_: Confirm/refuse bookings within 24h\n• 📊 _Analytics_: Review monthly reports to optimize pricing\n• 🧹 _Turnover_: Schedule cleaning between check-out and check-in\n• ⭐ _Reviews_: Encourage guests to leave reviews for visibility",
        'fr': "💡 **Conseils de gestion :**\n• 📅 _Disponibilité_ : Maintenez votre calendrier à jour\n• ✅ _Réactivité_ : Confirmez/refusez les réservations sous 24h\n• 📊 _Analytique_ : Examinez les rapports mensuels pour optimiser les prix\n• 🧹 _Rotation_ : Planifiez le nettoyage entre départ et arrivée\n• ⭐ _Avis_ : Encouragez les clients à laisser des avis",
        'ar': "💡 **نصائح إدارة العقارات:**\n• 📅 _التوفر_: حافظ على تحديث تقويمك\n• ✅ _وقت الاستجابة_: أكّد/ارفض الحجوزات خلال 24 ساعة\n• 📊 _التحليلات_: راجع التقارير الشهرية لتحسين الأسعار\n• 🧹 _التنظيف_: جدول التنظيف بين كل مغادرة ووصول\n• ⭐ _التقييمات_: شجّع الضيوف على ترك تقييمات",
    },
    'off_topic': {
        'en': "🏨 I'm specialized exclusively in reservation management. I can't help with that topic.\n\nHere's what I *can* help with:\n• Finding & booking properties\n• Managing reservations\n• Property management advice\n\nWhat would you like to know?",
        'fr': "🏨 Je suis spécialisé uniquement dans la gestion des réservations. Je ne peux pas vous aider sur ce sujet.\n\nVoici ce que je *peux* faire :\n• Trouver et réserver des propriétés\n• Gérer les réservations\n• Conseils de gestion immobilière\n\nQue souhaitez-vous savoir ?",
        'ar': "🏨 أنا متخصص حصراً في إدارة الحجوزات. لا يمكنني المساعدة في هذا الموضوع.\n\nإليك ما يمكنني فعله:\n• البحث عن وحجز العقارات\n• إدارة الحجوزات\n• نصائح إدارة العقارات\n\nماذا تريد أن تعرف؟",
    },
    'fallback': {
        'en': "🤔 I didn't quite understand that. Could you rephrase?\n\nI can help you with bookings, properties, and reservation management.",
        'fr': "🤔 Je n'ai pas bien compris. Pourriez-vous reformuler ?\n\nJe peux vous aider avec les réservations, les propriétés et la gestion des réservations.",
        'ar': "🤔 لم أفهم ذلك تماماً. هل يمكنك إعادة الصياغة؟\n\nيمكنني مساعدتك في الحجوزات والعقارات وإدارة الحجوزات.",
    },
}

TIPS = {
    'en': [
        "📅 Keep your availability calendar updated to avoid missed bookings.",
        "✅ Respond to booking requests within 24 hours to improve guest satisfaction.",
        "💳 Always verify payment before confirming a long-term booking.",
        "🧹 Schedule cleaning at least 2 hours between checkout and next check-in.",
        "📊 Review your monthly analytics every Monday to stay on top of trends.",
        "🔒 Update security codes between every guest stay.",
        "⭐ Send a polite message to guests after checkout asking for a review.",
        "📸 High-quality photos can increase bookings by up to 30%.",
        "🌐 Keep your property descriptions in multiple languages for more reach.",
        "💬 Enable the AI assistant for 24/7 guest support.",
    ],
    'fr': [
        "📅 Maintenez votre calendrier de disponibilité à jour pour ne pas manquer des réservations.",
        "✅ Répondez aux demandes de réservation dans les 24 heures.",
        "💳 Vérifiez toujours le paiement avant de confirmer un long séjour.",
        "🧹 Planifiez le nettoyage au moins 2 heures entre chaque séjour.",
        "📊 Consultez vos analyses mensuelles chaque lundi.",
        "⭐ Encouragez vos clients à laisser un avis après leur séjour.",
    ],
    'ar': [
        "📅 حافظ على تحديث تقويم التوفر لتجنب فقدان الحجوزات.",
        "✅ استجب لطلبات الحجز خلال 24 ساعة لتحسين رضا الضيوف.",
        "💳 تحقق دائماً من الدفع قبل تأكيد إقامة طويلة.",
        "🧹 جدول التنظيف لمدة ساعتين على الأقل بين كل إقامة.",
        "📊 راجع تحليلاتك الشهرية كل أسبوع.",
        "⭐ أرسل رسالة مهذبة للضيوف بعد المغادرة تطلب فيها تقييماً.",
    ],
}


# ─── Language Detector ───────────────────────────────────────────────────────
class LanguageDetector:
    ARABIC_PATTERN = re.compile(r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+')
    FRENCH_KEYWORDS = {
        'bonjour', 'salut', 'merci', 'oui', 'non', 'comment', 'pourquoi',
        'où', 'quand', 'réservation', 'propriété', 'appartement', 'annuler',
        'disponible', 'prix', 'nuit', 'séjour', 'chambre', 'confirmer',
    }

    @staticmethod
    def detect(text: str) -> str:
        """Return 'ar', 'fr', or 'en'."""
        if not text:
            return 'en'
        # Arabic unicode block
        if LanguageDetector.ARABIC_PATTERN.search(text):
            return 'ar'
        # French keywords
        words = set(text.lower().split())
        if words & LanguageDetector.FRENCH_KEYWORDS:
            return 'fr'
        return 'en'


# ─── Intent Matcher ──────────────────────────────────────────────────────────
class IntentMatcher:
    INTENTS = {
        'greeting': {
            'en': ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'greetings', 'start'],
            'fr': ['bonjour', 'salut', 'bonsoir', 'coucou', 'allô'],
            'ar': ['مرحبا', 'السلام', 'أهلا', 'سلام', 'صباح', 'مساء'],
        },
        'booking_help': {
            'en': ['book', 'reserve', 'how to book', 'make reservation', 'booking'],
            'fr': ['réserver', 'réservation', 'comment réserver', 'faire une réservation'],
            'ar': ['حجز', 'كيف أحجز', 'أريد أن أحجز', 'عمل حجز'],
        },
        'cancel_help': {
            'en': ['cancel', 'cancellation', 'how to cancel'],
            'fr': ['annuler', 'annulation', 'comment annuler'],
            'ar': ['إلغاء', 'كيف ألغي', 'إلغاء الحجز'],
        },
        'availability': {
            'en': ['available', 'availability', 'free dates', 'when is', 'check availability'],
            'fr': ['disponible', 'disponibilité', 'dates libres', 'vérifier'],
            'ar': ['متاح', 'متاحة', 'توفر', 'متى يتوفر'],
        },
        'price_help': {
            'en': ['price', 'cost', 'how much', 'rate', 'fee', 'tariff'],
            'fr': ['prix', 'coût', 'combien', 'tarif', 'frais'],
            'ar': ['سعر', 'تكلفة', 'كم يكلف', 'تعريفة', 'رسوم'],
        },
        'owner_tips': {
            'en': ['tip', 'advice', 'suggestion', 'how to manage', 'best practices'],
            'fr': ['conseil', 'astuce', 'recommandation', 'comment gérer'],
            'ar': ['نصيحة', 'اقتراح', 'نصائح', 'كيف أدير'],
        },
    }

    OFF_TOPIC = ['politics', 'religion', 'sport', 'weather', 'food', 'movie', 'game',
                 'سياسة', 'دين', 'طعام', 'رياضة', 'politique', 'religion', 'nourriture']

    @staticmethod
    def match(text: str, lang: str) -> typing.Optional[str]:
        q = text.lower()
        # Check off-topic first
        for word in IntentMatcher.OFF_TOPIC:
            if word in q:
                return 'off_topic'
        # Match intents
        for intent, lang_map in IntentMatcher.INTENTS.items():
            keywords = lang_map.get(lang, []) + lang_map.get('en', [])
            if any(kw in q for kw in keywords):
                return intent
        return None


# ─── ChatbotEngine ───────────────────────────────────────────────────────────
class ChatbotEngine:
    """
    Main AI engine.
    - Uses Google Gemini when GOOGLE_API_KEY is configured
    - Falls back to multilingual rule-based responses otherwise
    - Easily upgradeable: set GOOGLE_API_KEY in .env
    """

    def __init__(self):
        self.api_key = getattr(settings, 'GOOGLE_API_KEY', '') or os.environ.get('GOOGLE_API_KEY', '')
        self.model = None
        self.ai_available = False
        self._try_init_gemini()

    def _try_init_gemini(self):
        if not self.api_key:
            logger.info('ChatbotEngine: No GOOGLE_API_KEY set → using multilingual fallback mode.')
            return
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(
                model_name='gemini-2.0-flash-exp',
                system_instruction=SYSTEM_PROMPT,
            )
            self.ai_available = True
            logger.info('ChatbotEngine: ✅ Google Gemini AI initialized successfully.')
        except ImportError:
            logger.warning('ChatbotEngine: google-generativeai not installed.')
        except Exception as e:
            logger.error(f'ChatbotEngine: Failed to initialize Gemini: {e}')

    def generate_response(self, question: str, user=None, session=None) -> dict:
        """Generate a response using Gemini AI or rule-based fallback."""
        start = time.time()
        lang = LanguageDetector.detect(question)

        if self.ai_available and self.model:
            try:
                # Get conversation history for context
                history = self._get_history(session) if session else []
                chat = self.model.start_chat(history=history)
                response = chat.send_message(question)
                answer = response.text
                elapsed = round(time.time() - start, 3)
                self._save_message(session, 'user', question)
                self._save_message(session, 'assistant', answer, elapsed)
                return {'answer': answer, 'response_time': elapsed, 'success': True, 'ai_powered': True, 'lang': lang}
            except Exception as e:
                logger.error(f'ChatbotEngine: Gemini error: {e}')
                return self._rule_based(question, lang, session, start)

        return self._rule_based(question, lang, session, start)

    def _rule_based(self, question: str, lang: str, session=None, start=None) -> dict:
        """Multilingual rule-based response engine."""
        if start is None:
            start = time.time()

        intent = IntentMatcher.match(question, lang)
        response_pool = RESPONSES.get(intent, RESPONSES['fallback'])
        answer = response_pool.get(lang, response_pool.get('en', ''))

        elapsed = round(time.time() - start, 3)
        self._save_message(session, 'user', question)
        self._save_message(session, 'assistant', answer, elapsed)

        return {'answer': answer, 'response_time': elapsed, 'success': True, 'ai_powered': False, 'lang': lang}

    def process_command(self, question: str, user=None) -> typing.Optional[dict]:
        """
        Check for structured data commands before sending to AI.
        Returns structured result or None to fall through to AI.
        """
        q = question.lower()
        lang = LanguageDetector.detect(question)

        # My properties
        if any(k in q for k in ['my properties', 'mes propriétés', 'عقاراتي', 'show properties', 'afficher propriétés']):
            return self._get_owner_properties(user, lang)

        # My bookings
        if any(k in q for k in ['my bookings', 'mes réservations', 'حجوزاتي', 'show bookings', 'liste réservations']):
            return self._get_user_bookings(user, lang)

        # Suggest services
        if any(k in q for k in ['suggest', 'recommend', 'best property', 'recommande', 'اقترح', 'يوصي']):
            return self.suggest_services(lang=lang)

        return None  # Fall through to AI/fallback

    def _get_owner_properties(self, user, lang='en') -> dict:
        try:
            from apps.properties.models import Property
            qs = Property.objects.filter(owner=user) if user and hasattr(user, 'role') and user.role == 'owner' else Property.objects.all()
            props = list(qs.values('property_id', 'name', 'location', 'type', 'rating')[:20])
            if props:
                labels = {'en': 'properties', 'fr': 'propriétés', 'ar': 'عقارات'}
                intro = {
                    'en': f"🏡 You have **{len(props)} {labels.get(lang, 'properties')}**:",
                    'fr': f"🏡 Vous avez **{len(props)} {labels.get(lang, 'propriétés')}** :",
                    'ar': f"🏡 لديك **{len(props)} {labels.get(lang, 'عقارات')}**:",
                }
                return {
                    'answer': intro.get(lang, intro['en']),
                    'data': [{'id': str(p['property_id']), 'name': p['name'], 'location': p['location'], 'type': p['type'], 'rating': p['rating']} for p in props],
                    'data_type': 'properties', 'success': True,
                }
            no_props = {'en': "You don't have any properties yet. Create your first one! 🏡", 'fr': "Vous n'avez pas encore de propriétés. Créez la première ! 🏡", 'ar': "ليس لديك عقارات بعد. أنشئ أول عقار! 🏡"}
            return {'answer': no_props.get(lang, no_props['en']), 'success': True}
        except Exception as e:
            return {'answer': f'❌ Error: {e}', 'success': False}

    def _get_user_bookings(self, user, lang='en') -> dict:
        try:
            from apps.bookings.models import Booking
            if user and user.role in ('owner', 'worker', 'admin'):
                qs = Booking.objects.filter(property__owner=user).select_related('property', 'apartment').order_by('-created_at')[:15]
            else:
                qs = Booking.objects.filter(user=user).select_related('property', 'apartment').order_by('-created_at')[:15]

            items = [{'id': str(b.id), 'property': b.property.name, 'date_in': str(b.date_in), 'date_out': str(b.date_out), 'status': b.status, 'nights': b.num_nights} for b in qs]
            if items:
                intro = {'en': f"📋 Found **{len(items)} bookings**:", 'fr': f"📋 **{len(items)} réservations** trouvées :", 'ar': f"📋 تم العثور على **{len(items)} حجوزات**:"}
                return {'answer': intro.get(lang, intro['en']), 'data': items, 'data_type': 'bookings', 'success': True}
            no_b = {'en': "📋 No bookings found.", 'fr': "📋 Aucune réservation trouvée.", 'ar': "📋 لا توجد حجوزات."}
            return {'answer': no_b.get(lang, no_b['en']), 'success': True}
        except Exception as e:
            return {'answer': f'❌ Error: {e}', 'success': False}

    def suggest_services(self, user=None, lang='en') -> dict:
        try:
            from apps.properties.models import Property
            props = Property.objects.filter(is_public=True).order_by('-rating')[:5].values('property_id', 'name', 'location', 'type', 'rating', 'media')
            items = [{'id': str(p['property_id']), 'name': p['name'], 'location': p['location'], 'type': p['type'], 'rating': p['rating'], 'thumbnail': p['media'][0] if p.get('media') else None} for p in props]
            if items:
                intro = {'en': '✨ **Top rated properties for you:**', 'fr': '✨ **Meilleures propriétés pour vous :**', 'ar': '✨ **أفضل العقارات لك:**'}
                return {'answer': intro.get(lang, intro['en']), 'data': items, 'data_type': 'suggestions', 'success': True}
            none = {'en': 'No properties available at the moment. 🏡', 'fr': 'Aucune propriété disponible pour le moment. 🏡', 'ar': 'لا توجد عقارات متاحة في الوقت الحالي. 🏡'}
            return {'answer': none.get(lang, none['en']), 'success': True}
        except Exception as e:
            return {'answer': f'❌ Error: {e}', 'success': False}

    def get_tips(self, lang='en') -> list:
        return TIPS.get(lang, TIPS['en'])

    def get_random_tip(self, lang='en') -> str:
        return random.choice(self.get_tips(lang))

    def _get_history(self, session) -> list:
        """Build Gemini-compatible conversation history from session."""
        try:
            from .models import ChatMessage
            msgs = ChatMessage.objects.filter(session=session).order_by('created_at')[:10]
            history = []
            for msg in msgs:
                role = 'user' if msg.role == 'user' else 'model'
                history.append({'role': role, 'parts': [msg.content]})
            return history
        except Exception:
            return []

    def _save_message(self, session, role: str, content: str, response_time=None):
        if not session:
            return
        try:
            from .models import ChatMessage
            ChatMessage.objects.create(session=session, role=role, content=content, response_time=response_time)
        except Exception as e:
            logger.error(f'ChatbotEngine: Failed to save message: {e}')
