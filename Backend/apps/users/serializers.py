from rest_framework import serializers

from apps.users.models import ROLE_CHOICES, User


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    email = serializers.EmailField(required=True)

    password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
        error_messages={
            "min_length": "Password must be at least 8 characters long.",
        },
    )

    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)

    role = serializers.ChoiceField(
        required=True,
        choices=ROLE_CHOICES,
    )

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
        ]

    def validate_email(self, value):
        """Ensure the email address is unique (case-insensitive)."""
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized


class LoginSerializer(serializers.Serializer):
    """Serializer for user login.

    Accepts an email and password, performs field-level format/length
    validation, and leaves credential verification to the service layer.
    """

    email = serializers.EmailField(
        required=True,
        help_text="Registered email address of the user.",
    )

    password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
        error_messages={
            "required": "Password is required.",
            "blank": "Password may not be blank.",
            "min_length": "Password must be at least 8 characters long.",
        },
    )

    def validate_email(self, value: str) -> str:
        """Normalise the email to lowercase and strip surrounding whitespace."""
        return value.strip().lower()


class CurrentUserSerializer(serializers.ModelSerializer):
    """Read-only serializer that represents the currently authenticated user."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "is_email_verified",
        ]
        read_only_fields = fields


class LogoutSerializer(serializers.Serializer):
    """Serializer for user logout.

    Accepts the refresh token that should be blacklisted.
    """

    refresh = serializers.CharField(
        required=True,
        write_only=True,
        help_text="The refresh token to blacklist.",
        error_messages={
            "required": "Refresh token is required.",
            "blank": "Refresh token may not be blank.",
        },
    )
