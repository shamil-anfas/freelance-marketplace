from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Global exception handler for DRF.

    Converts all exceptions into a consistent response format.
    The message is derived from the exception detail when it is a plain
    string, otherwise falls back to the HTTP status phrase.
    """

    response = exception_handler(exc, context)

    if response is not None:
        # Use the exception's own detail if it's a readable string,
        # otherwise fall back to the HTTP status phrase (e.g. "Bad Request").
        if isinstance(exc, APIException) and isinstance(exc.detail, str):
            message = exc.detail
        else:
            message = response.status_text.capitalize()

        custom_response = {
            "success": False,
            "message": message,
            "errors": response.data,
        }

        response.data = custom_response

    return response
