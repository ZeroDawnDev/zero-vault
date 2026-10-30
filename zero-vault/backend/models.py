from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    __table_args__ = (
        CheckConstraint(
            "amount > 0",
            name="ck_transaction_amount_positive",
        ),
        UniqueConstraint(
            "gmail_message_id",
            name="uq_transaction_gmail_message_id",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    merchant: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    currency: Mapped[str] = mapped_column(
        String(3),
        nullable=False,
        default="JPY",
    )

    transaction_type: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="expense",
        index=True,
    )

    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Uncategorized",
        index=True,
    )

    transaction_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    payment_method: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Cash",
    )

    notes: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Gmail integration fields

    gmail_message_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    authorization_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="confirmed",
        index=True,
    )
