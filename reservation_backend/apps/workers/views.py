from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from .models import WorkerProfile, WorkerSchedule
from .serializers import WorkerProfileSerializer, WorkerScheduleSerializer
from apps.users.permissions import IsOwnerRole, IsWorkerOrOwner


class WorkerViewSet(viewsets.ModelViewSet):
    """
    Worker profile management.
    - Owner: full CRUD, can assign properties
    - Worker: read own profile, update schedule/bio
    """
    serializer_class = WorkerProfileSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_available']

    def get_queryset(self):
        user = self.request.user
        if user.role in ('owner', 'admin'):
            return WorkerProfile.objects.prefetch_related(
                'schedules', 'assigned_properties', 'user'
            ).all()
        # Worker sees only their own profile
        return WorkerProfile.objects.filter(user=user)

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy', 'assign_properties']:
            return [IsOwnerRole()]
        return [IsWorkerOrOwner()]

    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Worker's own profile."""
        try:
            profile = WorkerProfile.objects.get(user=request.user)
            return Response(WorkerProfileSerializer(profile).data)
        except WorkerProfile.DoesNotExist:
            return Response({'error': 'Worker profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        """Bookings at properties assigned to this worker."""
        from apps.bookings.models import Booking
        from apps.bookings.serializers import BookingSerializer
        try:
            profile = WorkerProfile.objects.get(user=request.user)
            assigned_props = profile.assigned_properties.values_list('property_id', flat=True)
            bookings = Booking.objects.filter(
                property__in=assigned_props
            ).select_related('property', 'apartment', 'user').order_by('date_in')
            return Response(BookingSerializer(bookings, many=True).data)
        except WorkerProfile.DoesNotExist:
            return Response([])

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerRole])
    def assign_properties(self, request, pk=None):
        """Assign properties to a worker."""
        worker = self.get_object()
        property_ids = request.data.get('property_ids', [])
        from apps.properties.models import Property
        props = Property.objects.filter(property_id__in=property_ids, owner=request.user)
        worker.assigned_properties.set(props)
        return Response({'message': f'Assigned {props.count()} properties to {worker.user.username}.'})


class WorkerScheduleViewSet(viewsets.ModelViewSet):
    """Worker schedule management."""
    serializer_class = WorkerScheduleSerializer
    permission_classes = [IsWorkerOrOwner]

    def get_queryset(self):
        user = self.request.user
        if user.role in ('owner', 'admin'):
            return WorkerSchedule.objects.all()
        try:
            profile = WorkerProfile.objects.get(user=user)
            return WorkerSchedule.objects.filter(worker=profile)
        except WorkerProfile.DoesNotExist:
            return WorkerSchedule.objects.none()

    def perform_create(self, serializer):
        profile = WorkerProfile.objects.get(user=self.request.user)
        serializer.save(worker=profile)
