export const FINANCE_CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Educação",
  "Saúde",
  "Lazer",
  "Compras",
  "Salário",
  "Freelance",
  "Outros",
] as const;
export type FinanceCategory = (typeof FINANCE_CATEGORIES)[number];
export type TransactionType = "receita" | "despesa";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: FinanceCategory;
  /** Integer BRL cents. Never store floating-point currency amounts. */
  amountCents: number;
  date: string;
  description: string;
  demo?: boolean | undefined;
}

export interface MonthlyBudget {
  month: string;
  amountCents: number;
}

export interface FinanceState {
  transactions: Transaction[];
  budgets: MonthlyBudget[];
}
