import logging
from datetime import datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from gmail_service import fetch_debit_transactions
from models import Transaction

logger = logging.getLogger("zero_vault.gmail_sync")


def sync_gmail_once(db: Session) -> dict:
    """Fetch, parse, and import recent Gmail transaction notifications."""
    email_transactions = fetch_debit_transactions(max_results=100)
    imported = 0
    skipped = 0

    try:
        for item in email_transactions:
            message_id = item.get("gmail_message_id")
            if not message_id:
                skipped += 1
                continue

            existing_id = db.scalar(
                select(Transaction.id).where(
                    Transaction.gmail_message_id == message_id
                )
            )
            if existing_id is not None:
                skipped += 1
                continue

            transaction = Transaction(
                merchant=item["merchant"],
                amount=Decimal(str(item["amount"])),
                currency=item.get("currency", "JPY"),
                transaction_type="expense",
                category=item.get("category", "Uncategorized"),
                transaction_date=datetime.fromisoformat(item["transaction_date"]),
                payment_method=item.get("payment_method", "JP Bank Debit"),
                notes=("Imported from Gmail: " + item.get("email_subject", ""))[:1000],
                gmail_message_id=message_id,
                authorization_number=item.get("authorization_number"),
                status="pending_confirmation",
            )
            db.add(transaction)
            imported += 1

        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Failed while saving Gmail transactions.")
        raise

    result = {
        "status": "success",
        "emails_parsed": len(email_transactions),
        "transactions_imported": imported,
        "transactions_skipped": skipped,
        "completed_at": datetime.now().astimezone().isoformat(),
    }
    logger.info(
        "Gmail sync complete: parsed=%s imported=%s skipped=%s",
        len(email_transactions), imported, skipped
    )
    return result
