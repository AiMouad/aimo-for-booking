import random
import string
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings


def generate_verification_code(length=6):
    """Generate a random numeric verification code."""
    return ''.join(random.choices(string.digits, k=length))


def send_verification_email(user):
    """Generate and send a verification code to the user's email."""
    code = generate_verification_code()
    expiry = timezone.now() + timedelta(minutes=15)

    user.verification_code = code
    user.verification_code_expires = expiry
    user.save(update_fields=['verification_code', 'verification_code_expires'])

    try:
        send_mail(
            subject='AIMO – Your Email Verification Code',
            message=(
                f'Hello {user.username},\n\n'
                f'Your AIMO verification code is: {code}\n\n'
                f'This code expires in 15 minutes.\n\n'
                f'If you did not request this, please ignore this email.\n\n'
                f'— The AIMO Team'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f'Failed to send verification email to {user.email}: {e}')
        return False


def verify_email_code(user, code):
    """Verify the given code against the user's stored code."""
    if not user.verification_code:
        return False, 'No verification code found. Please request a new one.'

    if timezone.now() > user.verification_code_expires:
        return False, 'Verification code has expired. Please request a new one.'

    if user.verification_code != code:
        return False, 'Invalid verification code.'

    # Mark as verified
    user.email_verified = True
    user.verification_code = None
    user.verification_code_expires = None
    user.save(update_fields=['email_verified', 'verification_code', 'verification_code_expires'])

    return True, 'Email verified successfully.'
