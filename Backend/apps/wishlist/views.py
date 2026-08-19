from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated

from apps.common.responses import SuccessResponse

from .models import SavedProject
from .serializers import SavedProjectCreateSerializer, SavedProjectListSerializer
from .services import SavedProjectService


class SavedProjectCreateView(GenericAPIView):
    """
    POST /saved-projects/
    Save a project to the authenticated freelancer's wishlist.
    Only authenticated FREELANCERs may save projects.
    All business-rule guards run inside the service.
    """

    serializer_class = SavedProjectCreateSerializer
    permission_classes = [IsAuthenticated]
    throttle_scope = "saved-project"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        saved = SavedProjectService.save_project(
            validated_data=serializer.validated_data,
            user=request.user,
        )

        response_serializer = SavedProjectListSerializer(
            saved, context={"request": request}
        )
        return SuccessResponse(
            data=response_serializer.data,
            message="Project saved to wishlist successfully.",
            status=status.HTTP_201_CREATED,
        )


class SavedProjectListView(GenericAPIView):
    """
    GET /saved-projects/
    Return the authenticated freelancer's wishlist.
    Admins see all entries.
    """

    serializer_class = SavedProjectListSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        saved_projects = SavedProjectService.list_saved_projects(user=request.user)

        page = self.paginate_queryset(saved_projects)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(saved_projects, many=True)
        return SuccessResponse(data=serializer.data, status=status.HTTP_200_OK)


class SavedProjectDeleteView(GenericAPIView):
    """
    DELETE /saved-projects/<saved_project_uuid>/
    Remove a saved project from the freelancer's wishlist.
    Only the owning FREELANCER (or admin) may delete the entry.
    """

    serializer_class = SavedProjectListSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        SavedProjectService.delete_saved_project(
            saved_project_id=pk,
            user=request.user,
        )
        return SuccessResponse(
            message="Project removed from wishlist successfully.",
            status=status.HTTP_200_OK,
        )


class SavedProjectDetailView(GenericAPIView):
    """
    GET /projects/saved/<saved_project_uuid>/
    Retrieve a single saved-project entry by UUID.
    Only the owning FREELANCER (or admin) may view the entry.
    """

    serializer_class = SavedProjectListSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            saved = SavedProjectService.get_saved_project(
                saved_project_id=pk,
                user=request.user,
            )
        except SavedProject.DoesNotExist:
            raise NotFound("Saved project not found.")

        serializer = self.get_serializer(saved)
        return SuccessResponse(
            data=serializer.data,
            message="Saved project fetched successfully.",
            status=status.HTTP_200_OK,
        )
