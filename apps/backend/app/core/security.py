from typing import Any

from jose import JWTError, jwt

from app.core.config import get_settings


settings = get_settings()


def decode_supabase_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        return payload
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc
