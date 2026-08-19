from rest_framework import serializers

from .models import Proposal

# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------


class ProposalCreateSerializer(serializers.ModelSerializer):
    """
    Used for POST (create) requests.

    - `freelancer` is automatically set to the authenticated user via
      HiddenField so it is never exposed in the request/response.
    - `status` is intentionally excluded; it always starts as PENDING.
    """

    freelancer = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Proposal
        fields = [
            "project",
            "freelancer",
            "cover_letter",
            "bid_amount",
            "estimated_days",
        ]
        # Suppress DRF's auto-generated UniqueTogetherValidator for
        # (project, freelancer). The friendly duplicate check lives in
        # ProposalService.create_proposal() and produces a proper message.
        validators = []

    # ------------------------------------------------------------------
    # Field-level validations
    # ------------------------------------------------------------------

    def validate_cover_letter(self, value: str) -> str:
        """Trim whitespace and reject empty values."""
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "Cover letter cannot be empty or whitespace."
            )
        return value

    def validate_estimated_days(self, value: int) -> int:
        """Estimated days must be greater than 0."""
        if value <= 0:
            raise serializers.ValidationError("Estimated days must be greater than 0.")
        return value

    def validate_bid_amount(self, value):
        """Bid amount must be greater than 0."""
        if value <= 0:
            raise serializers.ValidationError("Bid amount must be greater than 0.")
        return value


# ---------------------------------------------------------------------------
# Nested — Project summary (used inside ProposalListSerializer)
# ---------------------------------------------------------------------------


class ProposalProjectSerializer(serializers.Serializer):
    """
    Read-only snapshot of the project attached to a proposal.
    Only the fields relevant in a proposal context are included.
    """

    id = serializers.UUIDField()
    title = serializers.CharField()
    slug = serializers.SlugField()
    status = serializers.CharField()
    budget_min = serializers.DecimalField(max_digits=10, decimal_places=2)
    budget_max = serializers.DecimalField(max_digits=10, decimal_places=2)
    deadline = serializers.DateField()


# ---------------------------------------------------------------------------
# Nested — Freelancer summary (used inside ProposalListSerializer)
# ---------------------------------------------------------------------------


class ProposalFreelancerSerializer(serializers.Serializer):
    """
    Read-only snapshot of the freelancer who submitted the proposal.
    Uses reverse-lookup (source="profile.*") to pull profile fields
    through the OneToOne relation on the User model.
    """

    id = serializers.UUIDField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    # Reverse-lookup through the OneToOne Profile → User relation
    profile_image = serializers.ImageField(source="profile.profile_image", default=None)
    bio = serializers.CharField(source="profile.bio", default=None)
    location = serializers.CharField(source="profile.location", default=None)
    github_url = serializers.URLField(source="profile.github_url", default=None)
    linkedin_url = serializers.URLField(source="profile.linkedin_url", default=None)
    portfolio_url = serializers.URLField(source="profile.portfolio_url", default=None)


# ---------------------------------------------------------------------------
# List / Retrieve
# ---------------------------------------------------------------------------


class ProposalListSerializer(serializers.ModelSerializer):
    """
    Read-only serializer used for list and retrieve endpoints.
    Nests full project and freelancer detail objects instead of bare UUIDs.
    """

    project = ProposalProjectSerializer(read_only=True)
    freelancer = ProposalFreelancerSerializer(read_only=True)

    class Meta:
        model = Proposal
        fields = [
            "id",
            "project",
            "freelancer",
            "cover_letter",
            "bid_amount",
            "estimated_days",
            "status",
            "created_at",
            "updated_at",
        ]
