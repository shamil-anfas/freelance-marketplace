from django.urls import path

from .views import (
    SavedProjectCreateView,
    SavedProjectDeleteView,
    SavedProjectDetailView,
    SavedProjectListView,
)

# Mounted at /saved-projects/ in api_urls.py
saved_project_urlpatterns = [
    # POST   /saved-projects/
    path("", SavedProjectCreateView.as_view(), name="saved-project-create"),
    # GET    /saved-projects/
    path("list/", SavedProjectListView.as_view(), name="saved-project-list"),
    # DELETE /saved-projects/<saved_project_uuid>/
    path("<uuid:pk>/", SavedProjectDeleteView.as_view(), name="saved-project-delete"),
]

# Mounted at /projects/saved/ in api_urls.py (via projects urls)
project_saved_urlpatterns = [
    # GET    /projects/saved/<saved_project_uuid>/
    path("<uuid:pk>/", SavedProjectDetailView.as_view(), name="saved-project-detail"),
]

# Default export – used when included directly
urlpatterns = saved_project_urlpatterns
