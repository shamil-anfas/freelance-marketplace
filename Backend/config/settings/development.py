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
