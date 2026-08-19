from datetime import date, timedelta
from decimal import Decimal

import pytest
from django.utils.text import slugify
from rest_framework.exceptions import PermissionDenied

from apps.masters.factories import CategoryFactory, SkillFactory
from apps.projects.models import Project, ProjectStatus
from apps.projects.services import ProjectService
from apps.users.factories import UserFactory

# ── Shared helper ──────────────────────────────────────────────────────────────


def _make_validated_data(category, skills):
    """Return a minimal validated_data dict for ProjectService.create()."""
    return {
        "title": "Build a REST API for my SaaS app",
        "description": "Looking for an experienced Django developer.",
        "category": category,
        "budget_min": Decimal("500.00"),
        "budget_max": Decimal("1500.00"),
        "deadline": date.today() + timedelta(days=30),
        "skills": skills,
    }


@pytest.mark.django_db
class TestProjectService:
    """Unit tests for ProjectService.create() — one assertion per method."""

    # ── test_create_project_success ────────────────────────────────────────────

    def test_create_project_success(self):
        """Project is persisted to the database after creation."""
        # Arrange
        client_user = UserFactory(role="CLIENT")
        category = CategoryFactory()
        validated_data = _make_validated_data(category, skills=[])

        # Act
        project = ProjectService.create(validated_data, user=client_user)

        # Assert
        assert Project.objects.filter(pk=project.pk).exists()

    # ── test_create_project_assigns_client ─────────────────────────────────────

    def test_create_project_assigns_client(self):
        """The created project is owned by the requesting user."""
        # Arrange
        client_user = UserFactory(role="CLIENT")
        category = CategoryFactory()
        validated_data = _make_validated_data(category, skills=[])

        # Act
        project = ProjectService.create(validated_data, user=client_user)

        # Assert
        assert project.client == client_user

    # ── test_create_project_generates_slug ─────────────────────────────────────

    def test_create_project_generates_slug(self):
        """A non-empty slug is derived from the project title."""
        # Arrange
        client_user = UserFactory(role="CLIENT")
        category = CategoryFactory()
        validated_data = _make_validated_data(category, skills=[])

        # Act
        project = ProjectService.create(validated_data, user=client_user)

        # Assert
        assert project.slug
        assert project.slug == slugify(validated_data["title"])

    # ── test_create_project_assigns_skills ─────────────────────────────────────

    def test_create_project_assigns_skills(self):
        """All provided skills are linked to the project via M2M."""
        # Arrange
        client_user = UserFactory(role="CLIENT")
        category = CategoryFactory()
        skill_1 = SkillFactory()
        skill_2 = SkillFactory()
        validated_data = _make_validated_data(category, skills=[skill_1, skill_2])

        # Act
        project = ProjectService.create(validated_data, user=client_user)

        # Assert
        assert project.skills.count() == 2
        assert skill_1 in project.skills.all()
        assert skill_2 in project.skills.all()

    # ── test_create_project_sets_default_status ────────────────────────────────

    def test_create_project_sets_default_status(self):
        """A newly created project defaults to OPEN status."""
        # Arrange
        client_user = UserFactory(role="CLIENT")
        category = CategoryFactory()
        validated_data = _make_validated_data(category, skills=[])

        # Act
        project = ProjectService.create(validated_data, user=client_user)

        # Assert
        assert project.status == ProjectStatus.OPEN

    # ── test_update_project_success ────────────────────────────────────────────

    def test_update_project_success(self):
        """Scalar fields are persisted to the database after an update."""
        # Arrange
        client_user = UserFactory(role="CLIENT")
        category = CategoryFactory()
        project = ProjectService.create(
            _make_validated_data(category, skills=[]),
            user=client_user,
        )
        update_data = {"title": "Updated Project Title"}

        # Act
        updated_project = ProjectService.update(project, update_data, user=client_user)

        # Assert
        assert updated_project.title == "Updated Project Title"

    # ── test_update_project_updates_skills ─────────────────────────────────────

    def test_update_project_updates_skills(self):
        """Providing skills in update data replaces the existing M2M set."""
        # Arrange
        client_user = UserFactory(role="CLIENT")
        category = CategoryFactory()
        old_skill = SkillFactory()
        new_skill_1 = SkillFactory()
        new_skill_2 = SkillFactory()

        project = ProjectService.create(
            _make_validated_data(category, skills=[old_skill]),
            user=client_user,
        )
        update_data = {"skills": [new_skill_1, new_skill_2]}

        # Act
        updated_project = ProjectService.update(project, update_data, user=client_user)

        # Assert
        assert updated_project.skills.count() == 2
        assert new_skill_1 in updated_project.skills.all()
        assert new_skill_2 in updated_project.skills.all()
        assert old_skill not in updated_project.skills.all()

    # ── test_completed_project_cannot_be_updated ───────────────────────────────

    def test_completed_project_cannot_be_updated(self):
        """A COMPLETED project raises PermissionDenied on any update attempt."""
        # Arrange
        client_user = UserFactory(role="CLIENT")
        category = CategoryFactory()
        project = ProjectService.create(
            _make_validated_data(category, skills=[]),
            user=client_user,
        )
        project.status = ProjectStatus.COMPLETED
        project.save()

        # Act & Assert
        with pytest.raises(PermissionDenied):
            ProjectService.update(project, {"title": "New Title"}, user=client_user)

    # ── test_completed_project_cannot_be_deleted ───────────────────────────────

    def test_completed_project_cannot_be_deleted(self):
        """A COMPLETED project raises PermissionDenied on any delete attempt."""
        # Arrange
        client_user = UserFactory(role="CLIENT")
        category = CategoryFactory()
        project = ProjectService.create(
            _make_validated_data(category, skills=[]),
            user=client_user,
        )
        project.status = ProjectStatus.COMPLETED
        project.save()

        # Act & Assert
        with pytest.raises(PermissionDenied):
            ProjectService.delete(project, user=client_user)

    # ── test_non_owner_cannot_update_project ───────────────────────────────────

    def test_non_owner_cannot_update_project(self):
        """A user who is not the project owner raises PermissionDenied on update."""
        # Arrange
        owner = UserFactory(role="CLIENT")
        other_client = UserFactory(role="CLIENT")
        category = CategoryFactory()
        project = ProjectService.create(
            _make_validated_data(category, skills=[]),
            user=owner,
        )

        # Act & Assert
        with pytest.raises(PermissionDenied):
            ProjectService.update(
                project, {"title": "Hijacked Title"}, user=other_client
            )

    # ── test_non_owner_cannot_delete_project ───────────────────────────────────

    def test_non_owner_cannot_delete_project(self):
        """A user who is not the project owner raises PermissionDenied on delete."""
        # Arrange
        owner = UserFactory(role="CLIENT")
        other_client = UserFactory(role="CLIENT")
        category = CategoryFactory()
        project = ProjectService.create(
            _make_validated_data(category, skills=[]),
            user=owner,
        )

        # Act & Assert
        with pytest.raises(PermissionDenied):
            ProjectService.delete(project, user=other_client)
