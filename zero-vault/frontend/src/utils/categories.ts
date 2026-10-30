import {
  BriefcaseBusiness,
  CreditCard,
  ShoppingBag,
  TrainFront,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Transaction } from "../types/transaction";

export const categoryColors = [
  "#B6F09C",
  "#9BB8FF",
  "#D6B3FF",
  "#FFCB99",
  "#8DE0D2",
  "#F2A7BB",
];

export const expenseCategories = [
  "Food",
  "Transport",
  "Shopping",
  "Housing",
  "Utilities",
  "Health",
  "Entertainment",
  "Education",
  "Other",
];

export const incomeCategories = ["Salary", "Work", "Scholarship", "Other income"];

export const paymentMethods = [
  "JP Bank Debit",
  "Cash",
  "Credit Card",
  "ICOCA",
  "Bank Transfer",
  "Other",
];

export function getTransactionIcon(transaction: Transaction): LucideIcon {
  const category = transaction.category?.toLowerCase() ?? "";

  if (category.includes("food") || category.includes("dining")) {
    return Utensils;
  }

  if (category.includes("transport")) return TrainFront;
  if (category.includes("shopping")) return ShoppingBag;
  if (category.includes("work") || category.includes("salary")) {
    return BriefcaseBusiness;
  }

  return transaction.transaction_type === "income" ? Wallet : CreditCard;
}
