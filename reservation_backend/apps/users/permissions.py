from rest_framework import permissions


class IsOwnerRole(permissions.BasePermission):
    """Only users with role='owner' can access."""
    message = 'Only property owners can perform this action.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'owner'
        )


class IsWorkerOrOwner(permissions.BasePermission):
    """Workers and owners can access."""
    message = 'Only workers or owners can perform this action.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ('owner', 'worker', 'admin')
        )


class IsOwnerWorkerOrClient(permissions.BasePermission):
    """Any authenticated non-guest user."""
    message = 'You must be a registered client, worker, or owner.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ('owner', 'worker', 'client', 'admin')
        )

    def has_object_permission(self, request, view, obj):
        # Owners, workers, and admins can access everything
        if request.user.role in ('owner', 'worker', 'admin'):
            return True
        # Clients can only access their own objects
        from apps.bookings.models import Booking
        if isinstance(obj, Booking):
            return obj.user == request.user
        return False


class IsSelfOrOwner(permissions.BasePermission):
    """User can only update/delete themselves; owners can manage all."""
    message = 'You can only manage your own account.'

    def has_object_permission(self, request, view, obj):
        # Safe methods for authenticated
        if request.method in permissions.SAFE_METHODS:
            return True
        # Owner/admin can manage everyone
        if request.user.role in ('owner', 'admin'):
            return True
        # User can manage themselves
        return obj.id == request.user.id


class IsAdminRole(permissions.BasePermission):
    """Only admin users."""
    message = 'Admin access required.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'admin' or request.user.is_staff)
        )
