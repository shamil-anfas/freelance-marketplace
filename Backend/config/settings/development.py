"""
Development settings.

Inherits all common settings from base.py and overrides/adds
development-specific values. Never use these settings in production.
"""

from config.settings.base import *  # noqa: F403

# ---------------------------------------------------------------------------
# Security
# ---------------------------------------------------------------------------

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "web"]

CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS")  # noqa: F405

CORS_ALLOW_CREDENTIALS = True

# Relax rate limiting for local development testing
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {  # noqa: F405
    "login": "1000/min",
    "register": "1000/min",
    "project-create": "1000/min",
    "proposal-create": "1000/min",
    "profile-update": "1000/min",
    "saved-project": "1000/min",
}
