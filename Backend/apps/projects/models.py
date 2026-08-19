from django.conf import settings
from django.db import models

from apps.common.models import BaseModel
from apps.masters.models import Category, Skill


class ProjectStatus(models.TextChoices):
    OPEN = "OPEN", "Open"
    IN_PROGRESS = "IN_PROGRESS", "In Progress"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"


class Project(BaseModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(
        unique=True,
        editable=False,
    )
    description = models.TextField()
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="projects",
    )
    skills = models.ManyToManyField(Skill, related_name="projects", blank=True)
    budget_min = models.DecimalField(max_digits=10, decimal_places=2)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2)
    deadline = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=ProjectStatus.choices,
        default=ProjectStatus.OPEN,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class ProjectAttachment(BaseModel):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="attachments",
    )
    file = models.FileField(upload_to="projects/attachments/")

    def __str__(self):
        return self.file.name
