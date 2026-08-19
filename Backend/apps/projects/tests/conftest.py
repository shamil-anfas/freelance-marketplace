import pytest

from apps.projects.factories import ProjectFactory
from apps.projects.models import ProjectStatus


@pytest.fixture
def project():
    return ProjectFactory()


@pytest.fixture
def open_project():
    return ProjectFactory(status=ProjectStatus.OPEN)


@pytest.fixture
def completed_project():
    return ProjectFactory(status=ProjectStatus.COMPLETED)


@pytest.fixture
def client_project(client_user):
    return ProjectFactory(client=client_user)
