"""Dependency injection for FastAPI endpoints.

This module provides lightweight dependency functions for future extensibility.
"""

from app.core.config import Settings, get_settings


def get_settings_dependency() -> Settings:
    """
    Get application settings as a dependency.

    This allows endpoints to access configuration through dependency injection,
    which makes testing easier by allowing settings to be overridden.

    Example in tests:
        app.dependency_overrides[get_settings_dependency] = lambda: Settings(...)

    Returns:
        Application settings instance
    """
    return get_settings()
