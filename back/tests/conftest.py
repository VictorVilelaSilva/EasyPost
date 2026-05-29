import pytest

from app.firebase.dependencies import get_current_user
from app.main import app


@pytest.fixture(autouse=True)
def _override_auth():
    app.dependency_overrides[get_current_user] = lambda: {
        "uid": "test-uid",
        "email": "test@example.com",
    }
    yield
    app.dependency_overrides.pop(get_current_user, None)
