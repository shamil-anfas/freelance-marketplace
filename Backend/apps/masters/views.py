from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated

from apps.common.permissions import IsAdminOnly
from apps.common.responses import SuccessResponse

from .serializers import CategorySerializer, SkillSerializer
from .services import CategoryService, SkillService


class CategoryListView(GenericAPIView):
    """Return all categories. Accessible by any authenticated user."""

    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # list_categories() returns a pre-serialized list[dict] (Redis cache hit)
        # or a freshly serialized list[dict] (PostgreSQL + Redis write).
        categories = CategoryService.list_categories()

        page = self.paginate_queryset(categories)
        if page is not None:
            return self.get_paginated_response(page)

        return SuccessResponse(data=categories, status=status.HTTP_200_OK)


class CategoryCreateView(GenericAPIView):
    """Create a new category. Admin only."""

    serializer_class = CategorySerializer
    permission_classes = [IsAdminOnly]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        category = CategoryService.create_category(serializer.validated_data)
        response_serializer = self.get_serializer(category)

        return SuccessResponse(
            data=response_serializer.data,
            message="Category created successfully.",
            status=status.HTTP_201_CREATED,
        )


class CategoryDetailView(GenericAPIView):
    """Retrieve a single category by slug. Accessible by any authenticated user."""

    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        category = CategoryService.get_category(slug=slug)
        serializer = self.get_serializer(category)
        return SuccessResponse(
            data=serializer.data,
            message="Category fetched successfully.",
            status=status.HTTP_200_OK,
        )


class CategoryUpdateView(GenericAPIView):
    """Update an existing category by slug. Admin only."""

    serializer_class = CategorySerializer
    permission_classes = [IsAdminOnly]

    def patch(self, request, slug):
        category = CategoryService.get_category(slug=slug)
        serializer = self.get_serializer(category, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated_category = CategoryService.update_category(
            instance=category,
            validated_data=serializer.validated_data,
        )
        response_serializer = self.get_serializer(updated_category)

        return SuccessResponse(
            data=response_serializer.data,
            message="Category updated successfully.",
            status=status.HTTP_200_OK,
        )


class CategoryDeleteView(GenericAPIView):
    """Soft-delete a category by slug. Admin only."""

    serializer_class = CategorySerializer
    permission_classes = [IsAdminOnly]

    def delete(self, request, slug):
        category = CategoryService.get_category(slug=slug)
        CategoryService.delete_category(instance=category)

        return SuccessResponse(
            message="Category deleted successfully.",
            status=status.HTTP_200_OK,
        )


# ── Skill Views ──────────────────────────────────────────────────────────────


class SkillListView(GenericAPIView):
    """Return all skills. Accessible by any authenticated user."""

    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        skills = SkillService.list_skills()

        page = self.paginate_queryset(skills)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(skills, many=True)
        return SuccessResponse(data=serializer.data, status=status.HTTP_200_OK)


class SkillCreateView(GenericAPIView):
    """Create a new skill. Admin only."""

    serializer_class = SkillSerializer
    permission_classes = [IsAdminOnly]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        skill = SkillService.create_skill(serializer.validated_data)
        response_serializer = self.get_serializer(skill)

        return SuccessResponse(
            data=response_serializer.data,
            message="Skill created successfully.",
            status=status.HTTP_201_CREATED,
        )


class SkillDetailView(GenericAPIView):
    """Retrieve a single skill by slug. Accessible by any authenticated user."""

    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        skill = SkillService.get_skill(slug=slug)
        serializer = self.get_serializer(skill)
        return SuccessResponse(
            data=serializer.data,
            message="Skill fetched successfully.",
            status=status.HTTP_200_OK,
        )


class SkillUpdateView(GenericAPIView):
    """Update an existing skill by slug. Admin only."""

    serializer_class = SkillSerializer
    permission_classes = [IsAdminOnly]

    def patch(self, request, slug):
        skill = SkillService.get_skill(slug=slug)
        serializer = self.get_serializer(skill, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated_skill = SkillService.update_skill(
            instance=skill,
            validated_data=serializer.validated_data,
        )
        response_serializer = self.get_serializer(updated_skill)

        return SuccessResponse(
            data=response_serializer.data,
            message="Skill updated successfully.",
            status=status.HTTP_200_OK,
        )


class SkillDeleteView(GenericAPIView):
    """Soft-delete a skill by slug. Admin only."""

    serializer_class = SkillSerializer
    permission_classes = [IsAdminOnly]

    def delete(self, request, slug):
        skill = SkillService.get_skill(slug=slug)
        SkillService.delete_skill(instance=skill)

        return SuccessResponse(
            message="Skill deleted successfully.",
            status=status.HTTP_200_OK,
        )
