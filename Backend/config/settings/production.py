"""
Production settings.

Inherits all common settings from base.py and adds production-hardened
security configuration: ALLOWED_HOSTS, CORS, and CSRF trusted origins
are all sourced from environment variables so nothing is hard-coded.

Required environment variables (add to .env.production):
    ALLOWED_HOSTS          — comma-separated list of production domain(s)
    CORS_ALLOWED_ORIGINS   — comma-separated list of allowed frontend origins
    CSRF_TRUSTED_ORIGINS   — comma-separated list of trusted origins for CSRF
"""

from config.settings.base import *  # noqa: F403

# ---------------------------------------------------------------------------
# Security
# ---------------------------------------------------------------------------

DEBUG = False

# e.g. ALLOWED_HOSTS=api.example.com,www.example.com
ALLOWED_HOSTS = env.list(  # noqa: F405
    "ALLOWED_HOSTS", default=[".onrender.com", "localhost", "127.0.0.1"]
)

# ---------------------------------------------------------------------------
# CORS (django-cors-headers)
# Docs: https://github.com/adamchainz/django-cors-headers
# ---------------------------------------------------------------------------

# No frontend yet — accept requests from any origin.
# TODO: Replace with CORS_ALLOWED_ORIGINS once the frontend domain is known.
CORS_ALLOW_ALL_ORIGINS = True

# ---------------------------------------------------------------------------
# CSRF
# ---------------------------------------------------------------------------

CSRF_TRUSTED_ORIGINS = env.list(  # noqa: F405
    "CSRF_TRUSTED_ORIGINS",
    default=["https://*.onrender.com"],
)

# ---------------------------------------------------------------------------
# Additional production hardening
# ---------------------------------------------------------------------------

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
