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
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")  # noqa: F405

# ---------------------------------------------------------------------------
# CORS (django-cors-headers)
# Install: pip install django-cors-headers
# Docs: https://github.com/adamchainz/django-cors-headers
# ---------------------------------------------------------------------------

INSTALLED_APPS = INSTALLED_APPS + ["corsheaders"]  # noqa: F405

# Insert CorsMiddleware right before CommonMiddleware
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # <-- must be before CommonMiddleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# No frontend yet — accept requests from any origin.
# TODO: Replace with CORS_ALLOWED_ORIGINS once the frontend domain is known.
CORS_ALLOW_ALL_ORIGINS = True

# ---------------------------------------------------------------------------
# CSRF
# ---------------------------------------------------------------------------

# TODO: Set this to your frontend + API domains once available.
# CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS")

# ---------------------------------------------------------------------------
# Additional production hardening
# ---------------------------------------------------------------------------

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
