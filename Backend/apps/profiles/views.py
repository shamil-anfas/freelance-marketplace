from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated

from apps.common.permissions import IsProfileOwner
from apps.common.responses import SuccessResponse

from .serializers import ProfileSerializer
from .services import ProfileService


class ProfileView(GenericAPIView):
    """
    GET /profile/
    Retrieve the authenticated user's profile.
    """

    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = ProfileService.get_profile(user=request.user)
        serializer = self.get_serializer(profile)
        return SuccessResponse(
            data=serializer.data,
            message="Profile fetched successfully.",
            status=status.HTTP_200_OK,
        )


class ProfileUpdateView(GenericAPIView):
    """
    PATCH /profile/
    Partially update the authenticated user's profile.
    Recalculates `is_profile_completed` after every update.
    """

    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated, IsProfileOwner]
    throttle_scope = "profile-update"

    def patch(self, request):
        profile = request.user.profile

        # Object-level permission check (IsProfileOwner.has_object_permission)
        self.check_object_permissions(request, profile)

        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated_profile = ProfileService.update_profile(
            profile=profile,
            validated_data=serializer.validated_data,
        )

        response_serializer = self.get_serializer(
            updated_profile, context={"request": request}
        )
        return SuccessResponse(
            data=response_serializer.data,
            message="Profile updated successfully.",
            status=status.HTTP_200_OK,
        )
