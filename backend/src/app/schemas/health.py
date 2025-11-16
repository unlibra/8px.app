"""Health check response schema."""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str = Field(..., description='Service health status')
    timestamp: str = Field(..., description='Current UTC timestamp in ISO format')
    version: str = Field(..., description='API version')
    environment: str = Field(..., description='Current environment (development/production)')
