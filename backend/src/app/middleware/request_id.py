"""Request ID middleware for request tracking."""

import uuid
from collections.abc import Awaitable, Callable

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.logging import set_request_id


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware that generates a unique ID for each request.

    The request ID is:
    - Stored in request.state.request_id for use in dependencies
    - Set in logging context for automatic inclusion in all logs
    - Added to response headers as X-Request-ID
    - Useful for logging, debugging, and distributed tracing

    Example:
        Request:  GET /api/ping
        Response: X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
        Logs:     ... [550e8400-e29b-41d4-a716-446655440000] - Processing request
    """

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """
        Generate request ID and add to request state, logging context, and response headers.

        Args:
            request: Incoming request
            call_next: Next middleware/endpoint in chain

        Returns:
            Response with X-Request-ID header
        """
        # Generate unique request ID
        request_id = str(uuid.uuid4())

        # Store in request state for access in endpoints
        request.state.request_id = request_id

        # Set in logging context so all logs include this ID
        set_request_id(request_id)

        # Process request
        response = await call_next(request)

        # Add request ID to response headers
        response.headers['X-Request-ID'] = request_id

        return response
