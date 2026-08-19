import logging
import smtplib
from socket import gaierror

from celery import shared_task
from django.core.mail import EmailMessage
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)

# Maximum number of times the task will be retried before giving up.
MAX_RETRIES = 5


@shared_task(bind=True, max_retries=MAX_RETRIES)
def send_welcome_email(self, user_id: int) -> None:
    """
    Celery task to send a welcome email to a newly registered user.

    Flow:
        1. Receive user_id
        2. Fetch User from DB
        3. Build context dict
        4. Render HTML template
        5. Create EmailMessage
        6. Send email
        7. Log success
    """
    # -- 1. Fetch User --------------------------------------------------------
    from apps.users.models import User  # local import to avoid circular deps

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logger.error("send_welcome_email: User with id=%s does not exist.", user_id)
        return

    # -- 2. Build Context -----------------------------------------------------
    context = {
        "first_name": user.first_name or user.email.split("@")[0],
    }

    # -- 3. Render HTML Template ----------------------------------------------
    html_body = render_to_string("emails/welcome.html", context)

    # -- 4. Create & Send Email -----------------------------------------------
    try:
        email = EmailMessage(
            subject="Welcome to Freelance Marketplace!",
            body=html_body,
            to=[user.email],
        )
        email.content_subtype = "html"  # send as HTML, not plain text
        email.send(fail_silently=False)
    except (smtplib.SMTPException, gaierror, ConnectionError, TimeoutError) as exc:
        # Transient network/SMTP error — retry with exponential backoff.
        # Attempt  0 → wait  60s
        # Attempt  1 → wait 120s
        # Attempt  2 → wait 240s
        # Attempt  3 → wait 480s
        # Attempt  4 → wait 960s  (final attempt, then task fails)
        backoff = 2**self.request.retries * 60
        logger.warning(
            "send_welcome_email: Transient error sending to %s (attempt %d/%d). "
            "Retrying in %ds. Error: %s",
            user.email,
            self.request.retries + 1,
            MAX_RETRIES,
            backoff,
            exc,
        )
        raise self.retry(exc=exc, countdown=backoff)
    except Exception as exc:
        # Unexpected, non-retriable error — log and let the task fail immediately.
        logger.exception(
            "send_welcome_email: Unexpected error sending to %s. "
            "Task will not retry. Error: %s",
            user.email,
            exc,
        )
        raise

    # -- 5. Log Success -------------------------------------------------------
    logger.info(
        "send_welcome_email: Welcome email successfully sent to %s (user_id=%s).",
        user.email,
        user_id,
    )
