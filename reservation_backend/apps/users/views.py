from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.db import IntegrityError

from .serializers import (
    UserSerializer, UserCreateSerializer, UserPublicSerializer,
    ChangePasswordSerializer, EmailVerificationSerializer,
)
from .permissions import IsSelfOrOwner, IsOwnerRole, IsAdminRole
from .email_utils import send_verification_email, verify_email_code

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD for users + custom auth actions.
    """
    queryset = User.objects.all().order_by('-created_at')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'username', 'role']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ['list', 'workers', 'clients']:
            # Public listing: return limited fields
            return UserPublicSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        if self.action == 'list':
            return [IsAdminRole()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsSelfOrOwner()]
        if self.action in ['verify_email', 'resend_verification']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = serializer.save()
        except IntegrityError:
            return Response(
                {'error': 'A user with this email or username already exists.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Send verification email if email is provided
        if user.email:
            send_verification_email(user)

        return Response(
            {
                'message': 'Account created successfully. '
                           + ('Please verify your email.' if user.email else ''),
                'user_id': str(user.id),
                'username': user.username,
                'role': user.role,
            },
            status=status.HTTP_201_CREATED,
        )

    # ── Custom actions ──────────────────────────────────────────────────────────

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get the currently authenticated user."""
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_me(self, request):
        """Partial-update the current user's profile."""
        serializer = UserSerializer(
            request.user, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        """Change own password."""
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])
        return Response({'message': 'Password changed successfully.'})

    @action(detail=False, methods=['get'], permission_classes=[IsOwnerRole])
    def workers(self, request):
        """List all workers (owner only)."""
        workers = User.objects.filter(role='worker', status='active')
        serializer = UserPublicSerializer(workers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def clients(self, request):
        """List all clients (owner or worker)."""
        if request.user.role not in ('owner', 'worker', 'admin'):
            return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        clients = User.objects.filter(role='client', status='active')
        serializer = UserPublicSerializer(clients, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def verify_email(self, request):
        """Verify email with a code."""
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'No account found with this email.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.email_verified:
            return Response({'message': 'Email is already verified.'})

        success, message = verify_email_code(user, code)
        if success:
            return Response({'message': message})
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def resend_verification(self, request):
        """Resend email verification code."""
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'No account with this email.'}, status=status.HTTP_404_NOT_FOUND)

        if user.email_verified:
            return Response({'message': 'Email is already verified.'})

        if send_verification_email(user):
            return Response({'message': 'Verification code sent.'})
        return Response(
            {'error': 'Could not send email. Try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
