from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class DefaultPagination(PageNumberPagination):
    """Default pagination used across the project."""

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100
    default_message = "Data fetched successfully."

    def get_paginated_response(self, data):
        """Return a custom pagination response."""

        return Response(
            {
                "success": True,
                "message": self.default_message,
                "data": {
                    "results": data,
                    "count": self.page.paginator.count,
                    "total_pages": self.page.paginator.num_pages,
                    "current_page": self.page.number,
                    "page_size": self.get_page_size(self.request),
                    "has_next": self.page.has_next(),
                    "has_previous": self.page.has_previous(),
                    "next": self.get_next_link(),
                    "previous": self.get_previous_link(),
                },
            }
        )
