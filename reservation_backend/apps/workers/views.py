from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Availability
from .serializers import AvailabilitySerializer
from django.contrib.auth import get_user_model
from apps.users.serializers import UserSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

User = get_user_model()


class AvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['worker', 'is_recurring']

    def get_queryset(self):
        user = self.request.user
        qs = Availability.objects.all()
        # Non-owners can only manage their own availability
        if user.role in ['OWNER', 'CLIENT']:
            # Clients can see all (for booking), Owners can see all
            return qs
        else:
            return qs.filter(worker=user)

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        user = request.user
        if request.method not in permissions.SAFE_METHODS:
            if user.role != 'OWNER' and obj.worker != user:
                self.permission_denied(request, "You can only manage your own availability.")


class WorkerProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """Viewset for listing and retrieving workers (read-only for clients/workers)."""
    queryset = User.objects.filter(role='WORKER', is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def availabilities(self, request, pk=None):
        worker = self.get_object()
        availabilities = Availability.objects.filter(worker=worker)
        serializer = AvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data)
