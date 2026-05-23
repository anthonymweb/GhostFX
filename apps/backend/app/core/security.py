from typing import Any

import httpx
from jose import JWTError, jwt
from jose.constants import Algorithms
from jose import jwk as jose_jwk

from app.core.config import get_settings


settings = get_settings()

JWKS_CACHE: list[dict[str, Any]] = []


async def _fetch_jwks() -> list[dict[str, Any]]:
    if JWKS_CACHE:
        return JWKS_CACHE
    if not settings.supabase_url:
        raise RuntimeError("SUPABASE_URL is not configured")
    url = settings.supabase_url.rstrip("/")
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{url}/auth/v1/.well-known/jwks.json")
        resp.raise_for_status()
        keys = resp.json().get("keys", [])
        JWKS_CACHE.extend(keys)
        return keys


async def decode_supabase_token(token: str) -> dict[str, Any]:
    try:
        header = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise ValueError("Invalid token header") from exc

    alg = header.get("alg", "")

    # HS256 — verify with JWT secret
    if alg == "HS256":
        try:
            return jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        except JWTError as exc:
            raise ValueError("Invalid or expired token") from exc

    # ES256 / RS256 — verify via JWKS
    if alg in ("ES256", "RS256"):
        kid = header.get("kid", "")
        try:
            keys = await _fetch_jwks()
        except Exception as exc:
            raise ValueError(f"Failed to fetch JWKS: {exc}") from exc
        key_data = next((k for k in keys if k.get("kid") == kid), None)
        if not key_data:
            raise ValueError(f"JWK key not found for kid {kid}")
        public_key = jose_jwk.construct(key_data)
        try:
            return jwt.decode(token, public_key, algorithms=[alg], options={"verify_aud": False})
        except JWTError as exc:
            raise ValueError("Invalid or expired token") from exc

    raise ValueError(f"Unsupported algorithm: {alg}")
