import pytest

pytestmark = pytest.mark.django_db


def test_project_fixture(project):
    assert project.pk is not None

    assert project.client is not None

    assert project.category is not None

    assert project.skills.count() == 3
