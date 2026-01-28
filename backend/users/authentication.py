"""Custom authentication backend for email-based authentication."""

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailBackend(ModelBackend):
    """Custom authentication backend that uses email instead of username."""
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate user using email and password.
        
        This backend accepts 'username' parameter but treats it as email
        since the User model uses email as USERNAME_FIELD.
        """
        try:
            # Treat 'username' parameter as email
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            return None
        
        # Check password
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        
        return None
    
    def get_user(self, user_id):
        """Get user by ID."""
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
