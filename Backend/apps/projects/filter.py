from django_filters import rest_framework as filters

from .models import Project


class ProjectFilter(filters.FilterSet):
    category = filters.UUIDFilter(field_name="category")

    status = filters.CharFilter(field_name="status")

    budget_min = filters.NumberFilter(
        field_name="budget_min",
        lookup_expr="gte",
    )

    budget_max = filters.NumberFilter(
        field_name="budget_max",
        lookup_expr="lte",
    )

    class Meta:
        model = Project
        fields = []
