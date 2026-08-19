from django.urls import path

from .views import (
    ProjectCreateView,
    ProjectDeleteView,
    ProjectDetailView,
    ProjectListView,
    ProjectUpdateView,
)

urlpatterns = [
    # POST   /projects/
    path("", ProjectCreateView.as_view(), name="project-create"),
    # GET    /projects/
    path("list/", ProjectListView.as_view(), name="project-list"),
    # GET    /projects/<uuid>/
    path("<uuid:pk>/", ProjectDetailView.as_view(), name="project-detail"),
    # PATCH  /projects/<uuid>/
    path("update/<uuid:pk>/", ProjectUpdateView.as_view(), name="project-update"),
    # DELETE /projects/<uuid>/
    path("delete/<uuid:pk>/", ProjectDeleteView.as_view(), name="project-delete"),
]
