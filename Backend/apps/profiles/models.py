from django.conf import settings
from django.db import models

from apps.common.models import BaseModel


class Profile(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    profile_image = models.ImageField(
        upload_to="profile_images/",
        null=True,
        blank=True,
    )
    bio = models.TextField(
        null=True,
        blank=True,
    )
    phone_number = models.CharField(
        max_length=20,
        null=True,
        blank=True,
    )
    location = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )
    state = models.CharField(
        max_length=100,
        null=True,
        blank=True,
    )
    city = models.CharField(
        max_length=100,
        null=True,
        blank=True,
    )
    address = models.TextField(
        null=True,
        blank=True,
    )
    pincode = models.CharField(
        max_length=20,
        null=True,
        blank=True,
    )
    is_profile_completed = models.BooleanField(default=False)
    github_url = models.URLField(
        null=True,
        blank=True,
    )
    linkedin_url = models.URLField(
        null=True,
        blank=True,
    )
    portfolio_url = models.URLField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"{self.user.email}'s Profile"
