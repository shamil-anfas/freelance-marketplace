from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.projects.models import Project
from apps.users.models import User

from .models import Proposal


class ProposalService:
    """Handles proposal-related business logic."""

    @staticmethod
    @transaction.atomic
    def create_proposal(validated_data: dict, user: User) -> Proposal:
        """
        Create a Proposal after running a series of business-rule guards.

        Flow:
            Receive validated data
                ↓
            Verify freelancer profile is complete
                ↓
            Fetch the target Project
                ↓
            Prevent freelancer from submitting to their own project
                ↓
            Verify project status is OPEN
                ↓
            Check for a duplicate proposal (unique constraint guard)
                ↓
            Create & return the Proposal

        Args:
            validated_data: Already-validated data from ProposalCreateSerializer.
            user:           The authenticated user making the request.

        Returns:
            The newly created Proposal instance.

        Raises:
            PermissionDenied: Freelancer owns the project they are proposing on.
            ValidationError:  Profile incomplete, project not OPEN,
                or duplicate proposal.
        """

        # ── 1. Verify freelancer profile is complete ─────────────────────────
        # A profile is considered complete when bio, phone and country are filled.
        try:
            profile = user.profile
        except Exception:
            raise ValidationError(
                {
                    "profile": (
                        "You must complete your profile before submitting a proposal."
                    )
                }
            )

        if not all([profile.bio, profile.phone_number, profile.location]):
            raise ValidationError(
                {
                    "profile": (
                        "Your profile is incomplete. "
                        "Please fill in your bio, phone, and country"
                        " before submitting a proposal."
                    )
                }
            )

        # ── 2. Fetch the target Project ──────────────────────────────────────
        project: Project = validated_data["project"]

        # ── 3. Prevent freelancer from proposing on their own project ─────────
        if project.client == user:
            raise PermissionDenied("You cannot submit a proposal for your own project.")

        # ── 4. Verify project status is OPEN ─────────────────────────────────
        if project.status != "OPEN":
            raise ValidationError(
                {"project": "Proposals can only be submitted to open projects."}
            )

        # ── 5. Check for duplicate proposal ──────────────────────────────────
        if Proposal.objects.filter(project=project, freelancer=user).exists():
            raise ValidationError(
                {"project": "You have already submitted a proposal for this project."}
            )

        # ── 6. Pop the hidden freelancer field injected by the serializer ─────
        validated_data.pop("freelancer", None)

        # ── 7. Create and return the Proposal ────────────────────────────────
        proposal = Proposal.objects.create(
            freelancer=user,
            **validated_data,
        )

        return proposal

    # -----------------------------------------------------------------------
    # List
    # -----------------------------------------------------------------------

    @staticmethod
    def list_proposals(user: User):
        """
        Return a queryset of proposals scoped to the logged-in user's role.

        - FREELANCER : their own proposals only.
        - CLIENT     : proposals submitted to their projects only.
        - Admin      : all proposals.

        Args:
            user: The authenticated user making the request.

        Returns:
            A filtered Proposal queryset.
        """
        base_qs = Proposal.objects.select_related(
            "project", "freelancer", "freelancer__profile"
        )

        if user.is_staff or user.is_superuser:
            return base_qs.all()

        if user.role == "FREELANCER":
            return base_qs.filter(freelancer=user)

        # CLIENT
        return base_qs.filter(project__client=user)

    # -----------------------------------------------------------------------
    # Get (single)
    # -----------------------------------------------------------------------

    @staticmethod
    def get_proposal(proposal_id: str, user: User) -> Proposal:
        """
        Retrieve a single proposal by its UUID primary key.

        Permission rules:
        - FREELANCER : may only view proposals they submitted.
        - CLIENT     : may only view proposals on their own projects.
        - Admin      : no restrictions.

        Args:
            proposal_id: UUID (string) of the proposal.
            user:        The authenticated user making the request.

        Returns:
            The matching Proposal instance.

        Raises:
            Proposal.DoesNotExist: If no matching proposal is found.
            PermissionDenied:      If the user is not allowed to view it.
        """
        proposal = Proposal.objects.select_related(
            "project", "freelancer", "freelancer__profile"
        ).get(pk=proposal_id)

        if user.is_staff or user.is_superuser:
            return proposal

        if user.role == "FREELANCER" and proposal.freelancer != user:
            raise PermissionDenied("You do not have permission to view this proposal.")

        if user.role == "CLIENT" and proposal.project.client != user:
            raise PermissionDenied("You do not have permission to view this proposal.")

        return proposal

    # -----------------------------------------------------------------------
    # Update (PATCH)
    # -----------------------------------------------------------------------

    @staticmethod
    @transaction.atomic
    def update_proposal(
        proposal: Proposal, validated_data: dict, user: User
    ) -> Proposal:
        """
        Partially update a proposal (PATCH semantics).

        Rules:
        - Only the freelancer who owns the proposal may update it.
        - Update is only allowed while the proposal is PENDING.
        - Only cover_letter, bid_amount, and estimated_days can be changed.

        Flow:
            Verify ownership
                ↓
            Verify status == PENDING
                ↓
            Update allowed fields
                ↓
            Save & return

        Args:
            proposal:       The Proposal instance to update.
            validated_data: Already-validated partial data from the serializer.
            user:           The authenticated user making the request.

        Returns:
            The updated Proposal instance.

        """
        # ── 1. Status guard ───────────────────────────────────────────────────
        if proposal.status != "PENDING":
            raise ValidationError({"status": "Only pending proposals can be updated."})

        # ── 3. Apply allowed fields only ──────────────────────────────────────
        ALLOWED_FIELDS = {"cover_letter", "bid_amount", "estimated_days"}
        for field, value in validated_data.items():
            if field in ALLOWED_FIELDS:
                setattr(proposal, field, value)

        # ── 4. Save & return ──────────────────────────────────────────────────
        proposal.save()
        return proposal

    # -----------------------------------------------------------------------
    # Withdraw (soft delete)
    # -----------------------------------------------------------------------

    @staticmethod
    def withdraw_proposal(proposal: Proposal, user: User) -> Proposal:
        """
        Withdraw a proposal by setting its status to WITHDRAWN.

        Records are never hard-deleted. Withdrawal is a status transition.

        Rules:
        - Only the freelancer who owns the proposal may withdraw it.
        - Only PENDING proposals can be withdrawn.

        Args:
            proposal: The Proposal instance to withdraw.
            user:     The authenticated user making the request.

        Returns:
            The updated Proposal instance.

        """
        # ── 1. Status guard ───────────────────────────────────────────────────
        if proposal.status != "PENDING":
            raise ValidationError(
                {"status": "Only pending proposals can be withdrawn."}
            )

        # ── 3. Soft status transition ─────────────────────────────────────────
        from .models import ProposalStatus

        proposal.status = ProposalStatus.WITHDRAWN
        proposal.save(update_fields=["status"])

        return proposal

    # -----------------------------------------------------------------------
    # Accept
    # -----------------------------------------------------------------------

    @staticmethod
    @transaction.atomic
    def accept_proposal(proposal: Proposal, user: User) -> Proposal:
        """
        Accept a pending proposal on behalf of the project's client.

        Side-effects (all inside a single DB transaction):
        - Sets the accepted proposal's status to ACCEPTED.
        - Moves the project to IN_PROGRESS.
        - Bulk-rejects every other PENDING proposal on the same project
          (already-WITHDRAWN proposals are left untouched).

        Args:
            proposal: The Proposal instance to accept.
            user:     The authenticated user making the request (must be client).

        Returns:
            The updated (accepted) Proposal instance.

        """
        from apps.projects.models import ProjectStatus

        from .models import ProposalStatus

        # ── 1. Check project status ───────────────────────────────────────────
        if proposal.project.status != ProjectStatus.OPEN:
            raise ValidationError("This project is no longer accepting proposals.")

        # ── 3. Check proposal status ──────────────────────────────────────────
        if proposal.status != ProposalStatus.PENDING:
            raise ValidationError("Only pending proposals can be accepted.")

        # ── 4. Accept proposal ────────────────────────────────────────────────
        proposal.status = ProposalStatus.ACCEPTED
        proposal.save(update_fields=["status"])

        # ── 5. Update project ─────────────────────────────────────────────────
        project = proposal.project
        project.status = ProjectStatus.IN_PROGRESS
        project.save(update_fields=["status"])

        # ── 6. Reject remaining pending proposals ─────────────────────────────
        Proposal.objects.filter(
            project=project,
            status=ProposalStatus.PENDING,
        ).exclude(
            pk=proposal.pk,
        ).update(
            status=ProposalStatus.REJECTED,
        )

        # ── 7. Return ─────────────────────────────────────────────────────────
        return proposal

    # -----------------------------------------------------------------------
    # Reject
    # -----------------------------------------------------------------------

    @staticmethod
    def reject_proposal(proposal: Proposal, user: User) -> Proposal:
        """
        Reject a single pending proposal on behalf of the project's client.

        Args:
            proposal: The Proposal instance to reject.
            user:     The authenticated user making the request (must be client).

        Returns:
            The updated (rejected) Proposal instance.

        """
        from .models import ProposalStatus

        # ── 1. Status guard ───────────────────────────────────────────────────
        if proposal.status != ProposalStatus.PENDING:
            raise ValidationError("Only pending proposals can be rejected.")

        # ── 3. Reject ─────────────────────────────────────────────────────────
        proposal.status = ProposalStatus.REJECTED
        proposal.save(update_fields=["status"])

        return proposal
