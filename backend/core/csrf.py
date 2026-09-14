"""CSRF primitives for cookie-authenticated browser requests."""
import hashlib
import hmac
import secrets

CSRF_COOKIE_NAME = "unisynapse_csrf"
CSRF_HEADER_NAME = "X-CSRF-Token"


def generate_csrf_token() -> str:
    """Return an unguessable token suitable for a browser-readable cookie."""
    return secrets.token_urlsafe(32)


def token_matches(cookie_token: str | None, header_token: str | None) -> bool:
    """Compare CSRF values without leaking token equality through timing."""
    if not cookie_token or not header_token:
        return False
    cookie_digest = hashlib.sha256(cookie_token.encode("utf-8")).digest()
    header_digest = hashlib.sha256(header_token.encode("utf-8")).digest()
    return hmac.compare_digest(cookie_digest, header_digest)
