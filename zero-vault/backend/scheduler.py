import asyncio
import logging
import os
from datetime import datetime, timezone

from database import SessionLocal
from gmail_sync import sync_gmail_once

logger = logging.getLogger("zero_vault.gmail_scheduler")

SYNC_ENABLED = os.getenv("ZERO_VAULT_GMAIL_SYNC_ENABLED", "true").lower() in {
    "1", "true", "yes", "on"
}
SYNC_INTERVAL_SECONDS = max(
    60, int(os.getenv("ZERO_VAULT_GMAIL_SYNC_INTERVAL_SECONDS", "300"))
)

sync_status = {
    "enabled": SYNC_ENABLED,
    "interval_seconds": SYNC_INTERVAL_SECONDS,
    "state": "starting" if SYNC_ENABLED else "disabled",
    "last_attempt_at": None,
    "last_success_at": None,
    "last_result": None,
    "last_error": None,
}


def _run_sync_once():
    sync_status["state"] = "syncing"
    sync_status["last_attempt_at"] = datetime.now(timezone.utc).isoformat()
    db = SessionLocal()
    try:
        result = sync_gmail_once(db)
        sync_status["state"] = "idle"
        sync_status["last_success_at"] = result["completed_at"]
        sync_status["last_result"] = result
        sync_status["last_error"] = None
        return result
    except Exception as exc:
        sync_status["state"] = "error"
        sync_status["last_error"] = str(exc)
        logger.exception("Automatic Gmail sync failed.")
        return None
    finally:
        db.close()


async def gmail_sync_loop():
    """Run an initial sync, then repeat at the configured interval."""
    if not SYNC_ENABLED:
        logger.info("Automatic Gmail sync is disabled by configuration.")
        return

    logger.info("Automatic Gmail sync enabled; interval=%s seconds.", SYNC_INTERVAL_SECONDS)
    while True:
        await asyncio.to_thread(_run_sync_once)
        await asyncio.sleep(SYNC_INTERVAL_SECONDS)
