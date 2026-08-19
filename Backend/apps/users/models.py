# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.common.models import BaseModel
from apps.users.managers import UserManager

ROLE_CHOICES = (
    ("CLIENT", "Client"),
    ("FREELANCER", "Freelancer"),
)


class User(BaseModel, AbstractUser):
    username = None

    email = models.EmailField(
        unique=True,
    )

    is_email_verified = models.BooleanField(
        default=False,
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="CLIENT",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email
