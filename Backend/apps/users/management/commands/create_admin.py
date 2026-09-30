import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create a superuser from environment variables (idempotent)."

    def handle(self, *args, **options):
        User = get_user_model()

        email = os.environ.get("ADMIN_EMAIL")
        password = os.environ.get("ADMIN_PASSWORD")

        if not email or not password:
            self.stderr.write(
                self.style.ERROR("ADMIN_EMAIL and ADMIN_PASSWORD env vars must be set.")
            )
            return

        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f"Admin user '{email}' already exists — skipping.")
            )
            return

        User.objects.create_superuser(
            email=email,
            password=password,
            is_email_verified=True,
        )
        self.stdout.write(
            self.style.SUCCESS(f"Superuser '{email}' created successfully.")
        )
