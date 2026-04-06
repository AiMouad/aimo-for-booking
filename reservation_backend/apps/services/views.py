from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg
from .models import Category, Service
from .serializers import CategorySerializer, ServiceSerializer, ServiceListSerializer
from core.permissions import IsOwnerOrReadOnly


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsOwnerOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == 'OWNER':
            return Category.objects.all()
        return Category.objects.filter(is_active=True)


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.select_related('category').filter(is_active=True)
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active', 'duration_minutes']
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['price', 'duration_minutes', 'created_at', 'name']
    ordering = ['name']

    def get_queryset(self):
        qs = Service.objects.select_related('category').prefetch_related('reservations')
        
        # Owner sees all (including inactive)
        if self.request.user.is_authenticated and self.request.user.role == 'OWNER':
            return qs
        
        qs = qs.filter(is_active=True)
        
        # Price range filtering
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
            
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return ServiceListSerializer
        return ServiceSerializer

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Return featured/highly rated services"""
        services = self.get_queryset().filter(
            reservations__status='COMPLETED'
        ).annotate(
            avg_rating=Avg('reservations__rating')
        ).order_by('-avg_rating')[:6]
        
        serializer = self.get_serializer(services, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced search with semantic matching"""
        query = request.query_params.get('q', '')
        if not query:
            return Response({'error': 'Search query is required'}, status=400)
        
        services = self.get_queryset().filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(category__name__icontains=query)
        )
        
        serializer = self.get_serializer(services, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        """Check availability for a service"""
        service = self.get_object()
        date = request.query_params.get('date')
        
        if not date:
            return Response({'error': 'Date parameter is required'}, status=400)
        
        # TODO: Implement availability checking logic
        return Response({
            'service_id': service.id,
            'date': date,
            'available_slots': []  # Placeholder
        })
