"""Ping endpoint for testing dependency injection."""

from fastapi import APIRouter, Depends, HTTPException

from app.core.config import Settings
from app.core.logging import get_logger
from app.dependencies import get_settings_dependency
from app.schemas.ping import PingResponse

router = APIRouter()
logger = get_logger(__name__)


@router.get('', response_model=PingResponse)
async def ping(
    settings: Settings = Depends(get_settings_dependency),
    echo: str | None = None,
) -> PingResponse:
    """
    Simple ping endpoint demonstrating dependency injection and error handling.

    This endpoint showcases:
    - Dependency injection with Settings
    - Request ID logging (automatic via middleware)
    - HTTPException usage for expected errors (example for future endpoints)

    Query Parameters:
        echo: Optional message to echo back (max 100 characters)

    Example:
        GET /api/ping              -> {"message": "pong", "version": "1.0.0"}
        GET /api/ping?echo=hello   -> {"message": "hello", "version": "1.0.0"}

    Note: This is a sample endpoint and will be removed in production.
    """
    logger.info('Ping endpoint called')
    logger.debug('API version: %s', settings.API_VERSION)

    # Example of handling expected errors with HTTPException
    # (demonstrates best practice for actual tool endpoints)
    if echo is not None and len(echo) > 100:
        logger.warning('Echo message too long: %d characters', len(echo))
        raise HTTPException(
            status_code=400,
            detail='Echo message too long (max 100 characters)',
        )

    return PingResponse(
        message=echo or 'pong',
        version=settings.API_VERSION,
    )
