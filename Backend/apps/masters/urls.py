from django.urls import path

from apps.masters.views import (
    CategoryCreateView,
    CategoryDeleteView,
    CategoryDetailView,
    CategoryListView,
    CategoryUpdateView,
    SkillCreateView,
    SkillDeleteView,
    SkillDetailView,
    SkillListView,
    SkillUpdateView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("categories/create/", CategoryCreateView.as_view(), name="category-create"),
    path(
        "categories/<slug:slug>/", CategoryDetailView.as_view(), name="category-detail"
    ),
    path(
        "categories/<slug:slug>/update/",
        CategoryUpdateView.as_view(),
        name="category-update",
    ),
    path(
        "categories/<slug:slug>/delete/",
        CategoryDeleteView.as_view(),
        name="category-delete",
    ),
    # Skill endpoints
    path("skills/", SkillListView.as_view(), name="skill-list"),
    path("skills/create/", SkillCreateView.as_view(), name="skill-create"),
    path("skills/<slug:slug>/", SkillDetailView.as_view(), name="skill-detail"),
    path("skills/<slug:slug>/update/", SkillUpdateView.as_view(), name="skill-update"),
    path("skills/<slug:slug>/delete/", SkillDeleteView.as_view(), name="skill-delete"),
]
