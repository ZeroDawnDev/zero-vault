from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TransactionBase(BaseModel):
    merchant: str = Field(min_length=1, max_length=200)

    amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    currency: str = Field(
        default="JPY",
        min_length=3,
        max_length=3,
    )

    transaction_type: Literal["income", "expense"] = "expense"

    category: str = Field(
        default="Uncategorized",
        min_length=1,
        max_length=100,
    )

    transaction_date: datetime | None = None

    payment_method: str = Field(
        default="Cash",
        min_length=1,
        max_length=100,
    )

    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("merchant", "category", "payment_method")
    @classmethod
    def strip_required_strings(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("This field cannot be empty.")

        return value

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        value = value.strip().upper()

        if not value.isalpha():
            raise ValueError("Currency must contain three letters.")

        return value

    @field_validator("notes")
    @classmethod
    def normalize_notes(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    merchant: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    currency: str | None = Field(
        default=None,
        min_length=3,
        max_length=3,
    )

    transaction_type: Literal["income", "expense"] | None = None

    category: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    transaction_date: datetime | None = None

    payment_method: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    notes: str | None = Field(default=None, max_length=1000)


class TransactionResponse(TransactionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    transaction_date: datetime
    created_at: datetime


class DashboardSummary(BaseModel):
    currency: str
    total_income: Decimal
    total_expenses: Decimal
    balance: Decimal
    transaction_count: int