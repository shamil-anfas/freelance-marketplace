from apps.users.models import User

from .models import Profile


class ProfileService:
    """Handles profile-related business logic."""

    @staticmethod
    def get_profile(user: User) -> Profile:
        """
        Retrieve the profile for the given user.

        Args:
            user: The authenticated user.

        Returns:
            The user's Profile instance.
        """
        return user.profile

    @staticmethod
    def update_profile(profile: Profile, validated_data: dict) -> Profile:
        """
        Update a profile's fields and recalculate completion status.

        Flow:
            Loop through validated_data and apply each field value via setattr
                ↓
            Calculate completion: bio, phone_number, and location must all be filled
                ↓
            Save and return the updated Profile

        Args:
            profile:        The Profile instance to update.
            validated_data: Already-validated partial data from ProfileSerializer.

        Returns:
            The updated Profile instance.
        """
        # ── 1. Apply every field from validated data ──────────────────────────
        for field, value in validated_data.items():
            setattr(profile, field, value)

        # ── 2. Recalculate completion status ──────────────────────────────────
        # MVP: profile is complete when bio, phone_number, and location are filled.
        if all([profile.bio, profile.phone_number, profile.location]):
            profile.is_profile_completed = True
        else:
            profile.is_profile_completed = False

        # ── 3. Persist ────────────────────────────────────────────────────────
        profile.save()

        return profile
