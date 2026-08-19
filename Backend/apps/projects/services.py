import uuid

from django.db import transaction
from rest_framework.exceptions import PermissionDenied

from apps.users.models import User

from .models import Project, ProjectAttachment, ProjectStatus


class ProjectService:
    """Handles project-related business logic."""

    @staticmethod
    def _generate_unique_slug(title: str) -> str:
        """
        Build a slug from the full title without using slugify:
          - Lowercase the title
          - Replace whitespace with hyphens
          - Keep only alphanumeric characters and hyphens
          - Append a short UUID suffix only if the slug already exists
        """
        base_slug = "-".join(
            "".join(ch for ch in word if ch.isalnum())
            for word in title.strip().lower().split()
        )
        slug = base_slug
        while Project.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{uuid.uuid4().hex[:8]}"
        return slug

    @staticmethod
    @transaction.atomic
    def create(validated_data: dict, user: User) -> Project:
        """
        Create a Project along with its attachments.

        Flow:
            Receive validated data
                ↓
            Generate unique slug
                ↓
            Pop attachments
                ↓
            Pop skills
                ↓
            Create Project
                ↓
            Assign ManyToMany skills
                ↓
            Loop attachments → Create ProjectAttachment rows
                ↓
            Return Project

        Args:
            validated_data: Already-validated data from ProjectCreateSerializer.
            user:           The authenticated user making the request.

        Returns:
            The newly created Project instance.
        """
        # ── 1. Generate unique slug ─────────────────────────────────────────
        slug = ProjectService._generate_unique_slug(validated_data["title"])

        # ── 3. Pop attachments ──────────────────────────────────────────────
        attachments = validated_data.pop("attachments", [])

        # ── 4. Pop skills ───────────────────────────────────────────────────
        skills = validated_data.pop("skills", [])

        # Pop client — HiddenField puts it in validated_data; we assign explicitly
        validated_data.pop("client", None)

        # ── 5. Create Project ───────────────────────────────────────────────
        project = Project.objects.create(
            slug=slug,
            client=user,
            **validated_data,
        )

        # ── 6. Assign ManyToMany skills ─────────────────────────────────────
        project.skills.set(skills)

        # ── 7. Loop attachments → Create ProjectAttachment rows ─────────────
        for file in attachments:
            ProjectAttachment.objects.create(project=project, file=file)

        # ── 8. Return Project ───────────────────────────────────────────────
        return project

    # -----------------------------------------------------------------------
    # List
    # -----------------------------------------------------------------------

    @staticmethod
    def list(user: User):
        """
        Return a queryset of projects.

        - CLIENTs see only their own projects.
        - FREELANCERs see all OPEN projects.

        Args:
            user: The authenticated user making the request.

        Returns:
            A filtered Project queryset.
        """
        if user.role == "CLIENT":
            return (
                Project.objects.filter(client=user)
                .prefetch_related("skills", "attachments")
                .select_related("category", "client")
            )

        # FREELANCER — visible open projects
        return (
            Project.objects.filter(status="OPEN")
            .prefetch_related("skills", "attachments")
            .select_related("category", "client")
        )

    # -----------------------------------------------------------------------
    # Get (single)
    # -----------------------------------------------------------------------

    @staticmethod
    def get(project_id: str, user: User) -> Project:
        """
        Retrieve a single project by its UUID primary key.

        - CLIENTs can only view their own projects.
        - FREELANCERs can only view OPEN projects.

        Args:
            project_id: UUID (string) of the project.
            user:       The authenticated user making the request.

        Returns:
            The matching Project instance.

        Raises:
            Project.DoesNotExist: If no matching project is found.
            PermissionDenied:     If the user is not allowed to view it.
        """
        project = (
            Project.objects.prefetch_related("skills", "attachments")
            .select_related("category", "client")
            .get(pk=project_id)
        )

        if user.role == "CLIENT" and project.client != user:
            raise PermissionDenied("You do not have permission to view this project.")

        if user.role == "FREELANCER" and project.status != "OPEN":
            raise PermissionDenied("This project is not available.")

        return project

    # -----------------------------------------------------------------------
    # Update (PATCH)
    # -----------------------------------------------------------------------

    @staticmethod
    @transaction.atomic
    def update(project: Project, validated_data: dict, user: User) -> Project:
        """
        Partially update a project (PATCH semantics).

        Only the CLIENT who owns the project may update it.
        - If `skills` is present it replaces the existing M2M set.
        - If `attachments` is present the new files are appended (existing
          attachments are NOT deleted).

        Args:
            project:        The Project instance to update.
            validated_data: Already-validated partial data from the serializer.
            user:           The authenticated user making the request.

        Returns:
            The updated Project instance.

        """
        # ── 1. Ownership guard ───────────────────────────────────────────────
        if project.client != user:
            raise PermissionDenied("You do not have permission to update this project.")

        # ── 2. Status guard — completed projects are immutable ───────────────
        if project.status == ProjectStatus.COMPLETED:
            raise PermissionDenied("A completed project cannot be updated.")

        # ── 3. Pop M2M / related data ────────────────────────────────────────
        attachments = validated_data.pop("attachments", None)
        skills = validated_data.pop("skills", None)

        # ── 4. Update scalar fields ──────────────────────────────────────────
        for field, value in validated_data.items():
            setattr(project, field, value)
        project.save()

        # ── 5. Replace skills if provided ────────────────────────────────────
        if skills is not None:
            project.skills.set(skills)

        # ── 6. Append new attachments if provided ────────────────────────────
        if attachments:
            for file in attachments:
                ProjectAttachment.objects.create(project=project, file=file)

        return project

    # -----------------------------------------------------------------------
    # Delete
    # -----------------------------------------------------------------------

    @staticmethod
    def delete(project: Project, user: User) -> None:
        """
        Delete a project and all its attachments (CASCADE).

        Only the CLIENT who owns the project may delete it.

        Args:
            project: The Project instance to delete.
            user:    The authenticated user making the request.

        """
        # ── 1. Ownership guard ───────────────────────────────────────────────
        if project.client != user:
            raise PermissionDenied("You do not have permission to delete this project.")

        # ── 2. Status guard — completed projects are immutable ───────────────
        if project.status == ProjectStatus.COMPLETED:
            raise PermissionDenied("A completed project cannot be deleted.")

        # ── 3. Delete (attachments cascade via on_delete=CASCADE) ────────────
        project.delete()
