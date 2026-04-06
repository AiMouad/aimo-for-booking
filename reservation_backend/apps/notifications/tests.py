from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()


class NotificationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_notification_creation(self):
        notification = Notification.objects.create(
            recipient=self.user,
            type=Notification.Type.RESERVATION_CREATED,
            title='Test Notification',
            message='Test message'
        )
        self.assertEqual(notification.recipient, self.user)
        self.assertFalse(notification.is_read)
        self.assertEqual(str(notification), 'Test Notification - testuser')
