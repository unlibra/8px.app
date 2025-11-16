"""Ping response schema."""

from pydantic import BaseModel, Field


class PingResponse(BaseModel):
    """Ping response model."""

    message: str = Field(..., description='Pong message')
    version: str = Field(..., description='API version')
