from rest_framework.response import Response


class SuccessResponse(Response):
    """
    Standard success response for all APIs.
    """

    def __init__(
        self,
        data=None,
        message="Success",
        status=200,
        **kwargs,
    ):
        response = {
            "success": True,
            "message": message,
            "data": data,
        }

        super().__init__(
            data=response,
            status=status,
            **kwargs,
        )
