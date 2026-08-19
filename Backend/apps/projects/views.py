from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status
from rest_framework.exceptions import NotFound
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated

from apps.common.permissions import IsClient, IsOwner
from apps.common.responses import SuccessResponse

from .filter import ProjectFilter
from .models import Project
from .serializers import ProjectCreateSerializer, ProjectListSerializer
from .services import ProjectService


class ProjectCreateView(GenericAPIView):
    """
    POST /projects/
    Create a new project. Only authenticated CLIENTs are allowed.
    Validated data is passed to ProjectService.create() which handles
    slug generation, skills M2M, and attachment persistence.
    """

    serializer_class = ProjectCreateSerializer
    permission_classes = [IsAuthenticated, IsClient]
    throttle_scope = "project-create"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        project = ProjectService.create(
            validated_data=serializer.validated_data,
            user=request.user,
        )

        response_serializer = ProjectListSerializer(
            project, context={"request": request}
        )
        return SuccessResponse(
            data=response_serializer.data,
            message="Project created successfully.",
            status=status.HTTP_201_CREATED,
        )


class ProjectListView(GenericAPIView):
    """
    GET /projects/
    Return projects for the authenticated user.
    - CLIENTs see only their own projects.
    - FREELANCERs see all OPEN projects.

    Query Parameters:
      Filter  : category, status, budget_min, budget_max  (via ProjectFilter)
      Search  : ?search=<term>  searches title and description
      Ordering: ?ordering=budget_min|budget_max|deadline|created_at
                (prefix with '-' for descending, e.g. ?ordering=-created_at)
    """

    serializer_class = ProjectListSerializer
    permission_classes = [IsAuthenticated]

    # Backends active for this view
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    # django-filter
    filterset_class = ProjectFilter

    # SearchFilter — searches across title and description
    search_fields = ["title", "description"]

    # OrderingFilter — allowed sort fields
    ordering_fields = ["budget_min", "budget_max", "deadline", "created_at"]
    ordering = ["-created_at"]  # default ordering

    def get_queryset(self):
        """Return the role-aware queryset from ProjectService."""
        return ProjectService.list(user=self.request.user)

    def get(self, request):
        queryset = self.get_queryset()
        # Apply filter + search + ordering backends
        queryset = self.filter_queryset(queryset)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(data=serializer.data, status=status.HTTP_200_OK)


class ProjectDetailView(GenericAPIView):
    """
    GET /projects/<uuid>/
    Retrieve a single project by UUID.
    - CLIENTs can only view their own projects.
    - FREELANCERs can only view OPEN projects.
    """

    serializer_class = ProjectListSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            project = ProjectService.get(project_id=pk, user=request.user)
        except Project.DoesNotExist:
            raise NotFound("Project not found.")

        serializer = self.get_serializer(project)
        return SuccessResponse(
            data=serializer.data,
            message="Project fetched successfully.",
            status=status.HTTP_200_OK,
        )


class ProjectUpdateView(GenericAPIView):
    """
    PATCH /projects/<uuid>/
    Partially update a project. Only the owning CLIENT may update.
    """

    serializer_class = ProjectCreateSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def patch(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            raise NotFound("Project not found.")

        # Object-level permission check (IsOwner.has_object_permission)
        self.check_object_permissions(request, project)

        serializer = self.get_serializer(project, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated_project = ProjectService.update(
            project=project,
            validated_data=serializer.validated_data,
            user=request.user,
        )

        response_serializer = ProjectListSerializer(
            updated_project, context={"request": request}
        )
        return SuccessResponse(
            data=response_serializer.data,
            message="Project updated successfully.",
            status=status.HTTP_200_OK,
        )


class ProjectDeleteView(GenericAPIView):
    """
    DELETE /projects/<uuid>/
    Delete a project. Only the owning CLIENT may delete.
    """

    serializer_class = ProjectListSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def delete(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            raise NotFound("Project not found.")

        # Object-level permission check (IsOwner.has_object_permission)
        self.check_object_permissions(request, project)

        ProjectService.delete(project=project, user=request.user)

        return SuccessResponse(
            message="Project deleted successfully.",
            status=status.HTTP_200_OK,
        )
