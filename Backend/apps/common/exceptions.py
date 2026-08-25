from rest_framework.views import exception_handler


def _extract_error_message(detail):
    if isinstance(detail, str):
        return str(detail)
    if isinstance(detail, (list, tuple)) and detail:
        return _extract_error_message(detail[0])
    if isinstance(detail, dict) and detail:
        first_val = next(iter(detail.values()))
        return _extract_error_message(first_val)
    return None


def custom_exception_handler(exc, context):
    """
    Global exception handler for DRF.

    Converts all exceptions into a consistent response format.
    The message is derived from the exception detail when it is a plain
    string or nested dict/list, otherwise falls back to the HTTP status phrase.
    """

    response = exception_handler(exc, context)

    if response is not None:
        message = None
        if hasattr(exc, "detail"):
            message = _extract_error_message(exc.detail)

        if not message:
            message = response.status_text.capitalize()

        custom_response = {
            "success": False,
            "message": message,
            "errors": response.data,
        }

        response.data = custom_response

    return response
