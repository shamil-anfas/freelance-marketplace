from rest_framework.permissions import BasePermission


class IsAdminOnly(BasePermission):
    """Allow access only to admin users (is_staff or is_superuser)."""

    message = (
        "You do not have permission to perform this action. Admin access required."
    )

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or request.user.is_superuser)
        )


class IsClient(BasePermission):
    """Allow access only to authenticated users whose role is CLIENT."""

    message = "Only clients are allowed to perform this action."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "CLIENT"
        )


class IsFreelancer(BasePermission):
    """Allow access only to authenticated users whose role is FREELANCER."""

    message = "Only freelancers are allowed to perform this action."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "FREELANCER"
        )


class IsOwner(BasePermission):
    """
    Object-level permission that allows access only to the client
    who owns the project (project.client == request.user).
    """

    message = "You do not have permission to modify this project."

    def has_object_permission(self, request, view, obj) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and obj.client == request.user
        )


class IsProposalOwner(BasePermission):
    """
    Object-level permission: only the freelancer who submitted the proposal
    can modify (update / withdraw) it.
    Checks: proposal.freelancer == request.user
    """

    message = "Only the freelancer who submitted this proposal can modify it."

    def has_object_permission(self, request, view, obj) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and obj.freelancer == request.user
        )


class IsProposalProjectOwner(BasePermission):
    """
    Object-level permission: only the client who owns the project that
    the proposal belongs to can accept or reject the proposal.
    Checks: proposal.project.client == request.user
    """

    message = "Only the project owner can accept or reject this proposal."

    def has_object_permission(self, request, view, obj) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and obj.project.client == request.user
        )


class IsProfileOwner(BasePermission):
    """
    Object-level permission: only the user who owns the profile
    can update it.
    Checks: profile.user == request.user
    """

    message = "You do not have permission to modify this profile."

    def has_object_permission(self, request, view, obj) -> bool:
        return bool(
            request.user and request.user.is_authenticated and obj.user == request.user
        )
