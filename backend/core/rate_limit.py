"""Small, deterministic rate-limit primitives for request middleware."""
from collections import defaultdict, deque
import time
from threading import Lock


class SlidingWindowLimiter:
    """Process-local limiter with a replaceable interface for shared storage."""

    def __init__(self, limit: int, window_seconds: float) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self._events: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def allow(self, key: str, now: float | None = None) -> tuple[bool, int]:
        current = time.monotonic() if now is None else now
        with self._lock:
            events = self._events[key]
            cutoff = current - self.window_seconds
            while events and events[0] <= cutoff:
                events.popleft()
            if len(events) >= self.limit:
                retry_after = max(1, int(events[0] + self.window_seconds - current))
                return False, retry_after
            events.append(current)
            return True, 0

    def reset(self) -> None:
        with self._lock:
            self._events.clear()


LOGIN_LIMITER = SlidingWindowLimiter(limit=5, window_seconds=60)
