from rest_framework import serializers

from .models import SavedProject

# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------


class SavedProjectCreateSerializer(serializers.ModelSerializer):
    """
    Used for POST (create) requests.

    - `freelancer` is automatically set to the authenticated user via
      HiddenField so it is never exposed in the request/response.
    - Duplicate guard lives in SavedProjectService.save_project().
    """

    freelancer = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = SavedProject
        fields = [
            "project",
            "freelancer",
        ]
        # Suppress DRF's auto-generated UniqueTogetherValidator for
        # (freelancer, project). The friendly duplicate check lives in
        # SavedProjectService.save_project() and produces a proper message.
        validators = []


# ---------------------------------------------------------------------------
# Nested — Project summary (used inside SavedProjectListSerializer)
# ---------------------------------------------------------------------------


class SavedProjectNestedProjectSerializer(serializers.Serializer):
    """
    Read-only snapshot of the project attached to a saved entry.
    Only the fields relevant in a wishlist context are included.
    """

    id = serializers.UUIDField()
    title = serializers.CharField()
    slug = serializers.SlugField()
    status = serializers.CharField()
    budget_min = serializers.DecimalField(max_digits=10, decimal_places=2)
    budget_max = serializers.DecimalField(max_digits=10, decimal_places=2)
    deadline = serializers.DateField()


# ---------------------------------------------------------------------------
# Nested — Freelancer summary (used inside SavedProjectListSerializer)
# ---------------------------------------------------------------------------


class SavedProjectNestedFreelancerSerializer(serializers.Serializer):
    """
    Read-only snapshot of the freelancer who saved the project.
    """

    id = serializers.UUIDField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()


# ---------------------------------------------------------------------------
# List / Retrieve
# ---------------------------------------------------------------------------


class SavedProjectListSerializer(serializers.ModelSerializer):
    """
    Read-only serializer used for list and retrieve endpoints.
    Nests full project and freelancer detail objects instead of bare UUIDs.
    """

    project = SavedProjectNestedProjectSerializer(read_only=True)
    freelancer = SavedProjectNestedFreelancerSerializer(read_only=True)

    class Meta:
        model = SavedProject
        fields = [
            "id",
            "project",
            "freelancer",
            "created_at",
            "updated_at",
        ]
