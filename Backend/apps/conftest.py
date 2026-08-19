import pytest

from apps.users.models import User


@pytest.fixture
def user():
    return User.objects.create_user(
        email="client@test.com",
        password="Password@123",
        role="CLIENT",
    )
