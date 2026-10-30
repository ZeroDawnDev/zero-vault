import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import Depends, FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from gmail_sync import sync_gmail_once
from scheduler import sync_status, SYNC_INTERVAL_SECONDS
from models import Transaction
from schemas import (
    DashboardSummary,
    TransactionCreate,
    TransactionResponse,
    TransactionUpdate,
)


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("zero_vault")


# ============================================================
# APPLICATION LIFESPAN
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio
    from scheduler import gmail_sync_loop

    Base.metadata.create_all(bind=engine)
    scheduler_task = asyncio.create_task(gmail_sync_loop())
    logger.info("ZeroDawn Vault API started.")
    try:
        yield
    finally:
        scheduler_task.cancel()
        try:
            await scheduler_task
        except asyncio.CancelledError:
            pass
        logger.info("ZeroDawn Vault API stopped.")


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="ZeroDawn Vault API",
    description="Personal finance and expense tracking API.",
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "application": "ZeroDawn Vault API",
        "version": "1.0.0",
    }


# ============================================================
# GMAIL TRANSACTION SYNCHRONIZATION
# ============================================================

@app.post("/api/gmail/sync")
def sync_gmail_transactions(db: Session = Depends(get_db)):
    """Manually trigger the same safe sync used by the background scheduler."""
    try:
        from datetime import datetime, timezone
        result = sync_gmail_once(db)
        sync_status["state"] = "idle"
        sync_status["last_attempt_at"] = datetime.now(timezone.utc).isoformat()
        sync_status["last_success_at"] = result["completed_at"]
        sync_status["last_result"] = result
        sync_status["last_error"] = None
        return result
    except FileNotFoundError:
        sync_status["state"] = "error"
        sync_status["last_error"] = "Gmail credentials file is missing."
        logger.exception("Gmail credentials file is missing.")
        raise HTTPException(status_code=500, detail="Gmail credentials file is missing.")
    except Exception:
        sync_status["state"] = "error"
        sync_status["last_error"] = "Unable to retrieve or import Gmail transactions."
        logger.exception("Unable to retrieve or import Gmail transactions.")
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve or import Gmail transactions. Check Gmail authorization and backend logs.",
        )


@app.get("/api/gmail/status")
def gmail_sync_status():
    """Expose current automatic-sync configuration and recent result."""
    return {**sync_status, "interval_seconds": SYNC_INTERVAL_SECONDS}


# ============================================================
# CREATE TRANSACTION
# ============================================================

@app.post(
    "/api/transactions",
    response_model=TransactionResponse,
    status_code=201,
)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
):
    transaction_data = payload.model_dump()

    if transaction_data["transaction_date"] is None:
        transaction_data["transaction_date"] = datetime.now(
            timezone.utc
        )

    transaction = Transaction(**transaction_data)

    try:
        db.add(transaction)
        db.commit()
        db.refresh(transaction)

    except Exception:
        db.rollback()
        logger.exception("Failed to create transaction.")

        raise HTTPException(
            status_code=500,
            detail="Failed to create transaction.",
        )

    return transaction


# ============================================================
# LIST TRANSACTIONS
# ============================================================

@app.get(
    "/api/transactions",
    response_model=list[TransactionResponse],
)
def list_transactions(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    transaction_type: str | None = Query(
        default=None,
        pattern="^(income|expense)$",
    ),
    category: str | None = None,
    db: Session = Depends(get_db),
):
    statement = select(Transaction)

    if transaction_type:
        statement = statement.where(
            Transaction.transaction_type == transaction_type
        )

    if category:
        statement = statement.where(
            Transaction.category == category
        )

    statement = (
        statement
        .order_by(
            Transaction.transaction_date.desc(),
            Transaction.id.desc(),
        )
        .offset(skip)
        .limit(limit)
    )

    return db.scalars(statement).all()


# ============================================================
# GET SINGLE TRANSACTION
# ============================================================

@app.get(
    "/api/transactions/{transaction_id}",
    response_model=TransactionResponse,
)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
):
    transaction = db.get(Transaction, transaction_id)

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found.",
        )

    return transaction


# ============================================================
# UPDATE TRANSACTION
# ============================================================

@app.put(
    "/api/transactions/{transaction_id}",
    response_model=TransactionResponse,
)
def update_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
):
    transaction = db.get(Transaction, transaction_id)

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found.",
        )

    updates = payload.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(transaction, field, value)

    try:
        db.commit()
        db.refresh(transaction)

    except Exception:
        db.rollback()
        logger.exception("Failed to update transaction.")

        raise HTTPException(
            status_code=500,
            detail="Failed to update transaction.",
        )

    return transaction


# ============================================================
# DELETE TRANSACTION
# ============================================================

@app.delete(
    "/api/transactions/{transaction_id}",
    status_code=204,
)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
):
    transaction = db.get(Transaction, transaction_id)

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found.",
        )

    try:
        db.delete(transaction)
        db.commit()

    except Exception:
        db.rollback()
        logger.exception("Failed to delete transaction.")

        raise HTTPException(
            status_code=500,
            detail="Failed to delete transaction.",
        )

    return Response(status_code=204)


# ============================================================
# DASHBOARD SUMMARY
# ============================================================

@app.get(
    "/api/dashboard/summary",
    response_model=DashboardSummary,
)
def dashboard_summary(
    currency: str = Query(
        default="JPY",
        min_length=3,
        max_length=3,
    ),
    db: Session = Depends(get_db),
):
    currency = currency.strip().upper()

    income = db.scalar(
        select(
            func.coalesce(
                func.sum(Transaction.amount),
                0,
            )
        ).where(
            Transaction.transaction_type == "income",
            Transaction.currency == currency,
        )
    )

    expenses = db.scalar(
        select(
            func.coalesce(
                func.sum(Transaction.amount),
                0,
            )
        ).where(
            Transaction.transaction_type == "expense",
            Transaction.currency == currency,
        )
    )

    count = db.scalar(
        select(func.count(Transaction.id)).where(
            Transaction.currency == currency,
        )
    )

    total_income = Decimal(str(income))
    total_expenses = Decimal(str(expenses))

    return DashboardSummary(
        currency=currency,
        total_income=total_income,
        total_expenses=total_expenses,
        balance=total_income - total_expenses,
        transaction_count=count or 0,
    )

