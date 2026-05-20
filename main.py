"""Root ASGI entrypoint.

This lets beginners run:
    uvicorn main:app --reload

from the project root while the real application code stays in backend/.
"""

from backend.main import app
