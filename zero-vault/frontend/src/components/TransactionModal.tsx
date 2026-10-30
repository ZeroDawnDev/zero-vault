import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, LoaderCircle, Plus, X } from "lucide-react";
import type { TransactionCreate, TransactionType } from "../types/transaction";
import {
  expenseCategories,
  incomeCategories,
  paymentMethods,
} from "../utils/categories";

interface TransactionModalProps {
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: TransactionCreate) => void | Promise<void>;
}

function createInitialForm() {
  return {
    merchant: "",
    amount: "",
    transaction_type: "expense" as TransactionType,
    category: expenseCategories[0],
    transaction_date: new Date().toISOString().slice(0, 10),
    payment_method: paymentMethods[0],
    notes: "",
  };
}

export function TransactionModal({
  saving,
  onClose,
  onSubmit,
}: TransactionModalProps) {
  const [form, setForm] = useState(createInitialForm);

  const categories =
    form.transaction_type === "income" ? incomeCategories : expenseCategories;

  function setType(type: TransactionType) {
    setForm({
      ...form,
      transaction_type: type,
      category: (type === "income" ? incomeCategories : expenseCategories)[0],
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void onSubmit({
      merchant: form.merchant.trim(),
      amount: Number(form.amount),
      currency: "JPY",
      transaction_type: form.transaction_type,
      category: form.category,
      transaction_date: new Date(`${form.transaction_date}T12:00:00`).toISOString(),
      payment_method: form.payment_method,
      notes: form.notes.trim() || null,
    });
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="transaction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-line" />
              YOUR FINANCES
            </span>
            <h2 id="modal-title">Add transaction</h2>
            <p>Record a new movement of money.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="type-switch">
            <button
              type="button"
              className={form.transaction_type === "expense" ? "type-selected" : ""}
              onClick={() => setType("expense")}
            >
              <ArrowUpRight size={17} />
              Expense
            </button>
            <button
              type="button"
              className={form.transaction_type === "income" ? "type-selected" : ""}
              onClick={() => setType("income")}
            >
              <ArrowDownRight size={17} />
              Income
            </button>
          </div>

          <label className="form-label">
            Amount <span>JPY</span>
            <div className="amount-input-wrap">
              <span>¥</span>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                required
              />
            </div>
          </label>

          <label className="form-label">
            Merchant or description
            <input
              type="text"
              placeholder="e.g. McDonald's, Part-time salary"
              value={form.merchant}
              onChange={(event) => setForm({ ...form, merchant: event.target.value })}
              required
              maxLength={150}
            />
          </label>

          <div className="form-row">
            <label className="form-label">
              Category
              <select
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              Date
              <input
                type="date"
                value={form.transaction_date}
                onChange={(event) =>
                  setForm({ ...form, transaction_date: event.target.value })
                }
                required
              />
            </label>
          </div>

          <label className="form-label">
            Payment method
            <select
              value={form.payment_method}
              onChange={(event) =>
                setForm({ ...form, payment_method: event.target.value })
              }
            >
              {paymentMethods.map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Notes <span>Optional</span>
            <textarea
              placeholder="Add a note..."
              rows={2}
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              maxLength={500}
            />
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary modal-submit"
              disabled={
                saving ||
                !form.merchant.trim() ||
                !form.amount ||
                Number(form.amount) <= 0
              }
            >
              {saving ? <LoaderCircle size={17} className="spin" /> : <Plus size={17} />}
              {saving ? "Saving…" : "Save transaction"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
