from django.urls import include, path

from apps.wishlist.urls import project_saved_urlpatterns, saved_project_urlpatterns

urlpatterns = [
    path("auth/", include("apps.users.urls")),
    path("masters/", include("apps.masters.urls")),
    path("profile/", include("apps.profiles.urls")),
    path("projects/", include("apps.projects.urls")),
    path("proposals/", include("apps.proposals.urls")),
    # Wishlist
    path("saved-projects/", include(saved_project_urlpatterns)),
    path("projects/saved/", include(project_saved_urlpatterns)),
]
