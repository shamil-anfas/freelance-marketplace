from django.urls import path

from .views import ProfileUpdateView, ProfileView

urlpatterns = [
    # GET   /profile/
    path("", ProfileView.as_view(), name="profile-detail"),
    # PATCH /profile/
    path("update/", ProfileUpdateView.as_view(), name="profile-update"),
]
