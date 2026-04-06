from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, CustomTokenObtainPairView, MeView, UserDetailView,
    LogoutView, ChangePasswordView, ForgotPasswordView, ResetPasswordView,
    VerifyEmailView, ResendVerificationView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='user-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('logout/', LogoutView.as_view(), name='token-logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # User profile
    path('me/', MeView.as_view(), name='user-me'),
    path('<uuid:pk>/', UserDetailView.as_view(), name='user-detail'),
    
    # Password management
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    
    # Email verification
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
]
