from django.conf import settings
from django.db import models

from apps.common.models import BaseModel
from apps.projects.models import Project


class SavedProject(BaseModel):
    """
    Represents a freelancer's saved (wishlist) project.

    Constraints:
    - Only FREELANCER users may save projects.
    - A freelancer cannot save the same project twice.
    """

    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_projects",
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="saved_by",
    )

    class Meta:
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=["freelancer", "project"],
                name="unique_freelancer_saved_project",
            )
        ]

    def __str__(self):
        return f"{self.freelancer.email} → {self.project.title}"
