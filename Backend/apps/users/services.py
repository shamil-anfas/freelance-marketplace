import logging

from django.contrib.auth import authenticate
from django.db import transaction
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

from apps.profiles.models import Profile
from apps.users.models import User
from apps.users.tasks import send_welcome_email

logger = logging.getLogger(__name__)


class UserService:
    """Handles user-related business logic (registration, login, etc.)."""

    @staticmethod
    @transaction.atomic
    def register_user(validated_data: dict) -> User:
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )

        Profile.objects.create(user=user)

        # Queue the welcome email only after the transaction is committed.
        # This guarantees the worker can find the user row in the DB.
        transaction.on_commit(lambda: send_welcome_email.delay(user.id))

        logger.info("User '%s' registered successfully.", user.email)

        return user

    @staticmethod
    def login_user(validated_data: dict) -> dict:
        """Authenticate a user and return JWT tokens.

        Args:
            validated_data: Already-validated data from LoginSerializer,
                            containing 'email' and 'password'.

        Returns:
            A dict with keys 'user', 'access', and 'refresh'.

        Raises:
            AuthenticationFailed: If the credentials are invalid or the
                                  account is inactive.
        """
        email = validated_data.get("email")
        password = validated_data.get("password")

        user = authenticate(username=email, password=password)

        if user is None:
            raise AuthenticationFailed("Invalid email or password. Please try again.")

        refresh = RefreshToken.for_user(user)

        return {
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

    @staticmethod
    def logout_user(refresh_token: str) -> None:
        """Blacklist a refresh token to log the user out.

        Args:
            refresh_token: The raw refresh token string from the request.

        Raises:
            rest_framework.exceptions.ValidationError: If the token is
                invalid, expired, or already blacklisted.
        """
        token = RefreshToken(refresh_token)
        token.blacklist()
