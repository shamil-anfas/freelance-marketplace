from django.utils import timezone
from rest_framework import serializers

from apps.masters.serializers import CategorySerializer, SkillSerializer

from .models import Project, ProjectAttachment

# ---------------------------------------------------------------------------
# Attachment
# ---------------------------------------------------------------------------


class ProjectAttachmentSerializer(serializers.ModelSerializer):
    """Read-only representation of a single attachment."""

    class Meta:
        model = ProjectAttachment
        fields = ["id", "file", "created_at"]


# ---------------------------------------------------------------------------
# Create / Update
# ---------------------------------------------------------------------------


class ProjectCreateSerializer(serializers.ModelSerializer):
    """
    Used for POST (create) requests.

    - `client` is automatically set to the authenticated user.
    - `slug` is auto-generated from `title` and never exposed as writable.
    - `attachments` accepts a list of uploaded files (multipart).
    """

    # Write-only list of files; not a model field – handled in create()
    attachments = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False,
        allow_empty=True,
    )

    # Read-only base fields
    id = serializers.UUIDField(read_only=True)
    slug = serializers.SlugField(read_only=True)
    client = serializers.HiddenField(default=serializers.CurrentUserDefault())
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "client",
            "category",
            "skills",
            "budget_min",
            "budget_max",
            "deadline",
            "status",
            "attachments",
            "created_at",
            "updated_at",
        ]

    # ------------------------------------------------------------------
    # Field-level validations
    # ------------------------------------------------------------------

    def validate_title(self, value: str) -> str:
        """Strip whitespace and reject blank titles."""
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title cannot be empty or whitespace.")
        return value

    def validate_skills(self, value):
        """At least one skill must be provided."""
        if not value:
            raise serializers.ValidationError("At least one skill is required.")
        return value

    def validate_deadline(self, value):
        """Deadline must be a future date."""
        if value <= timezone.now().date():
            raise serializers.ValidationError("Deadline must be after today.")
        return value

    def validate_attachments(self, value):
        """A maximum of 5 files may be uploaded per project, none may be empty,
        each must not exceed 10 MB, and only allowed file types are accepted."""
        MAX_ATTACHMENT_SIZE_MB = 10
        MAX_ATTACHMENT_SIZE_BYTES = MAX_ATTACHMENT_SIZE_MB * 1024 * 1024  # 10 MB
        ALLOWED_EXTENSIONS = frozenset(["pdf", "doc", "docx", "jpg", "jpeg", "png"])
        ALLOWED_MIME_TYPES = frozenset(
            [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "image/jpeg",
                "image/png",
            ]
        )

        if len(value) > 5:
            raise serializers.ValidationError(
                "You can upload a maximum of 5 attachments per project."
            )

        for file in value:
            if file.size == 0:
                raise serializers.ValidationError("Uploaded files cannot be empty.")

            if file.size > MAX_ATTACHMENT_SIZE_BYTES:
                raise serializers.ValidationError(
                    f"Each attachment must not exceed {MAX_ATTACHMENT_SIZE_MB} MB. "
                    f"'{file.name}' is too large."
                )

            ext = file.name.rsplit(".", 1)[-1].lower() if "." in file.name else ""
            if ext not in ALLOWED_EXTENSIONS:
                raise serializers.ValidationError(
                    f"'{file.name}' has an unsupported file type. "
                    f"Allowed types: {', '.join(ALLOWED_EXTENSIONS)}."
                )

            if file.content_type not in ALLOWED_MIME_TYPES:
                raise serializers.ValidationError(
                    f"'{file.name}' has an invalid MIME type '{file.content_type}'. "
                    f"Allowed MIME types: {', '.join(ALLOWED_MIME_TYPES)}."
                )

        return value

    # ------------------------------------------------------------------
    # Object-level validation
    # ------------------------------------------------------------------

    def validate(self, attrs):
        budget_min = attrs.get("budget_min")
        budget_max = attrs.get("budget_max")

        if budget_min is not None and budget_max is not None:
            if budget_min > budget_max:
                raise serializers.ValidationError(
                    {"budget_min": "Minimum budget cannot exceed maximum budget."}
                )

        return attrs


# ---------------------------------------------------------------------------
# List / Retrieve
# ---------------------------------------------------------------------------


class ProjectListSerializer(serializers.ModelSerializer):
    """
    Lightweight read-only serializer used for list and retrieve endpoints.
    Nested representations for category and skills.
    """

    category = CategorySerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    attachments = ProjectAttachmentSerializer(many=True, read_only=True)
    client_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "client",
            "client_name",
            "category",
            "skills",
            "budget_min",
            "budget_max",
            "deadline",
            "status",
            "status_display",
            "attachments",
            "created_at",
            "updated_at",
        ]

    def get_client_name(self, obj) -> str:
        return obj.client.get_full_name() or obj.client.email
