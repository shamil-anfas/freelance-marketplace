from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from apps.users.models import User

from .models import SavedProject


class SavedProjectService:
    """Handles saved-project (wishlist) business logic."""

    # -----------------------------------------------------------------------
    # Save (create)
    # -----------------------------------------------------------------------

    @staticmethod
    def save_project(validated_data: dict, user: User) -> SavedProject:
        """
        Save a project to the authenticated freelancer's wishlist.

        Flow:
            Receive validated data
                ↓
            Verify user role is FREELANCER
                ↓
            Fetch the target Project
                ↓
            Check for a duplicate saved entry (unique constraint guard)
                ↓
            Create & return the SavedProject

        Args:
            validated_data: Already-validated data from SavedProjectCreateSerializer.
            user:           The authenticated user making the request.

        Returns:
            The newly created SavedProject instance.

        Raises:
            PermissionDenied: Role is not FREELANCER.
            ValidationError:  Duplicate saved project.
        """

        # ── 1. Verify user role is FREELANCER ───────────────────────────────
        if user.role != "FREELANCER":
            raise PermissionDenied("Only freelancers are allowed to save projects.")

        # ── 2. Fetch the target Project ──────────────────────────────────────
        project = validated_data["project"]

        # ── 3. Check for duplicate ────────────────────────────────────────────
        if SavedProject.objects.filter(freelancer=user, project=project).exists():
            raise ValidationError(
                {"project": "You have already saved this project to your wishlist."}
            )

        # ── 4. Pop the hidden freelancer field injected by the serializer ─────
        validated_data.pop("freelancer", None)

        # ── 5. Create and return the SavedProject ─────────────────────────────
        saved = SavedProject.objects.create(
            freelancer=user,
            **validated_data,
        )

        return saved

    # -----------------------------------------------------------------------
    # List
    # -----------------------------------------------------------------------

    @staticmethod
    def list_saved_projects(user: User):
        """
        Return a queryset of saved projects for the authenticated freelancer.

        - FREELANCER : their own saved projects only.
        - Admin      : all saved projects.

        Args:
            user: The authenticated user making the request.

        Returns:
            A filtered SavedProject queryset.

        Raises:
            PermissionDenied: Role is CLIENT (clients have no wishlist).
        """
        if not (user.is_staff or user.is_superuser) and user.role != "FREELANCER":
            raise PermissionDenied("Only freelancers can view their saved projects.")

        base_qs = SavedProject.objects.select_related("project", "freelancer")

        if user.is_staff or user.is_superuser:
            return base_qs.all()

        return base_qs.filter(freelancer=user)

    # -----------------------------------------------------------------------
    # Get (single)
    # -----------------------------------------------------------------------

    @staticmethod
    def get_saved_project(saved_project_id: str, user: User) -> SavedProject:
        """
        Retrieve a single saved project by its UUID primary key.

        Permission rules:
        - FREELANCER : may only view their own saved projects.
        - Admin      : no restrictions.

        Args:
            saved_project_id: UUID (string) of the SavedProject.
            user:             The authenticated user making the request.

        Returns:
            The matching SavedProject instance.

        Raises:
            SavedProject.DoesNotExist: If no matching record is found.
            PermissionDenied:          If the user is not allowed to view it.
        """
        saved = SavedProject.objects.select_related("project", "freelancer").get(
            pk=saved_project_id
        )

        if user.is_staff or user.is_superuser:
            return saved

        if user.role != "FREELANCER" or saved.freelancer != user:
            raise PermissionDenied(
                "You do not have permission to view this saved project."
            )

        return saved

    # -----------------------------------------------------------------------
    # Delete
    # -----------------------------------------------------------------------

    @staticmethod
    def delete_saved_project(saved_project_id: str, user: User) -> None:
        """
        Hard-delete a saved project entry from the freelancer's wishlist.

        Permission rules:
        - Only the freelancer who saved the project may delete it.
        - Admins may delete any entry.

        Args:
            saved_project_id: UUID (string) of the SavedProject to delete.
            user:             The authenticated user making the request.

        Raises:
            SavedProject.DoesNotExist: If no matching record is found.
            PermissionDenied:          If the user does not own the entry.
        """
        try:
            saved = SavedProject.objects.get(pk=saved_project_id)
        except SavedProject.DoesNotExist:
            raise NotFound("Saved project not found.")

        if not (user.is_staff or user.is_superuser):
            if user.role != "FREELANCER" or saved.freelancer != user:
                raise PermissionDenied(
                    "You do not have permission to remove this saved project."
                )

        saved.delete()
