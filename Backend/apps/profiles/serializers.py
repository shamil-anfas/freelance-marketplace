from rest_framework import serializers

from apps.users.models import User

from .models import Profile

# ---------------------------------------------------------------------------
# Nested user serializer (read-only)
# ---------------------------------------------------------------------------


class UserSerializer(serializers.ModelSerializer):
    """
    Read-only snapshot of the owner's User record embedded inside
    ProfileSerializer via the `user` reverse OneToOne relation.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "role",
            "is_email_verified",
        ]
        read_only_fields = fields


# ---------------------------------------------------------------------------
# Profile serializer
# ---------------------------------------------------------------------------


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for reading and updating a user's Profile.

    - `user` is a read-only nested representation (reverse FK lookup via
      source="user") exposing the owner's basic user data.
    - All editable profile fields are optional (required=False).
    - `is_profile_completed` is read-only; calculated by the service layer.
    """

    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = [
            "user",
            "profile_image",
            "phone_number",
            "bio",
            "github_url",
            "portfolio_url",
            "location",
            "is_profile_completed",
        ]
        read_only_fields = ["is_profile_completed"]
        extra_kwargs = {
            "profile_image": {"required": False},
            "phone_number": {"required": False},
            "bio": {"required": False},
            "github_url": {"required": False},
            "portfolio_url": {"required": False},
            "location": {"required": False},
        }
