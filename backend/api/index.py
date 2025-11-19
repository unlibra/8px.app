"""Vercel serverless function entry point."""

from src.app.main import app

# Export app for Vercel
handler = app
