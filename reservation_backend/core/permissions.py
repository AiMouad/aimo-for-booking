from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwner(BasePermission):
    """Allow access only to users with OWNER role."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'OWNER')


class IsWorker(BasePermission):
    """Allow access only to users with WORKER role."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'WORKER')


class IsClient(BasePermission):
    """Allow access only to users with CLIENT role."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'CLIENT')


class IsOwnerOrWorker(BasePermission):
    """Allow access to OWNER or WORKER."""

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in ('OWNER', 'WORKER')
        )


class IsOwnerOrReadOnly(BasePermission):
    """Allow read-only for authenticated users; write only for OWNER."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return bool(request.user and request.user.is_authenticated and request.user.role == 'OWNER')


class IsOwnerOfObject(BasePermission):
    """Object-level: the authenticated user must be the resource owner."""

    def has_object_permission(self, request, view, obj):
        return obj == request.user or request.user.role == 'OWNER'


class IsGuestOrOwner(BasePermission):
    """Allow access to guests (clients) for their own data, or owners for all data."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Owners can access everything
        if user.role == 'OWNER':
            return True
        
        # Clients can only access their own objects
        if hasattr(obj, 'guest'):
            return obj.guest == user
        elif hasattr(obj, 'user'):
            return obj.user == user
        elif hasattr(obj, 'owner'):
            return obj.owner == user
        elif hasattr(obj, 'property'):
            return obj.property.owner == user
        
        return False


class IsBookingOwnerOrWorker(BasePermission):
    """Allow access to booking owner or property owner/worker."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Booking owner can access
        if hasattr(obj, 'guest') and obj.guest == user:
            return True
        
        # Property owner/worker can access
        if hasattr(obj, 'property') and obj.property.owner == user:
            return True
        
        # Workers can access if they're assigned to the property
        if user.role == 'WORKER' and hasattr(obj, 'property'):
            # This would need to be implemented based on your worker assignment logic
            return True
        
        return False


class IsPropertyOwnerOrWorker(BasePermission):
    """Allow access to property owner or assigned worker."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Property owner can access
        if hasattr(obj, 'owner') and obj.owner == user:
            return True
        elif hasattr(obj, 'property') and obj.property.owner == user:
            return True
        
        # Workers can access if they're assigned to the property
        if user.role == 'WORKER':
            # This would need to be implemented based on your worker assignment logic
            if hasattr(obj, 'property'):
                return True
            elif hasattr(obj, 'owner'):
                return True
        
        return False


class IsReviewOwnerOrPropertyOwner(BasePermission):
    """Allow access to review author or property owner."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Review author can access
        if hasattr(obj, 'reviewer') and obj.reviewer == user:
            return True
        
        # Property owner can access
        if hasattr(obj, 'property') and obj.property.owner == user:
            return True
        
        return False


class IsPaymentOwnerOrPropertyOwner(BasePermission):
    """Allow access to payment owner or property owner."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Payment owner can access
        if hasattr(obj, 'user') and obj.user == user:
            return True
        
        # Property owner can access
        if hasattr(obj, 'booking') and obj.booking.property.owner == user:
            return True
        
        return False


class IsAuthenticatedOrCreateOnly(BasePermission):
    """Allow authenticated users to read, anyone to create (for registration)."""

    def has_permission(self, request, view):
        if request.method == 'POST':
            return True
        return request.user and request.user.is_authenticated
