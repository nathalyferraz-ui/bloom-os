import { toKey } from "@/lib/dates";
import type { FinanceState, Transaction } from "@/types";

export const MAX_MONEY_CENTS = 99_999_999_999;
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const decimal = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export const formatBRL = (cents: number) => brl.format(cents / 100);
export const moneyInput = (cents: number) => decimal.format(cents / 100);
export const currentMonth = () => toKey(new Date()).slice(0, 7);
export const isMonthKey = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
export const monthDate = (month: string) => {
  const [year, number] = month.split("-").map(Number);
  return new Date(year!, number! - 1, 1);
};
export const shiftMonth = (month: string, offset: number) => {
  const date = monthDate(month);
  date.setMonth(date.getMonth() + offset);
  return toKey(date).slice(0, 7);
};
export const formatMonth = (month: string) =>
  monthDate(month).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

/** Accept Brazilian currency and a decimal dot from mobile numeric keyboards. */
export function parseBRL(input: string): number | null {
  const raw = input.trim().replace(/^R\$\s*/, "");
  let integer: string;
  let fraction: string;
  if (/^\d+\.\d{1,2}$/.test(raw)) {
    [integer = "", fraction = ""] = raw.split(".");
  } else if (/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(raw)) {
    const [whole = "", cents = ""] = raw.split(",");
    integer = whole.replace(/\./g, "");
    fraction = cents;
  } else return null;
  const amount = Number(integer) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(amount) && amount > 0 && amount <= MAX_MONEY_CENTS ? amount : null;
}

export function financeSummary(finance: FinanceState, month: string) {
  const transactions = finance.transactions.filter((item) => item.date.startsWith(month));
  const income = transactions
    .filter((item) => item.type === "receita")
    .reduce((total, item) => total + item.amountCents, 0);
  const expenses = transactions
    .filter((item) => item.type === "despesa")
    .reduce((total, item) => total + item.amountCents, 0);
  const balance = finance.transactions
    .filter((item) => item.date.slice(0, 7) <= month)
    .reduce(
      (total, item) => total + (item.type === "receita" ? item.amountCents : -item.amountCents),
      0,
    );
  const budget = finance.budgets.find((item) => item.month === month)?.amountCents ?? 0;
  return {
    transactions,
    income,
    expenses,
    result: income - expenses,
    balance,
    budget,
    remaining: budget - expenses,
    budgetPercent: budget ? (expenses / budget) * 100 : 0,
  };
}

export function financeHistory(finance: FinanceState, month: string) {
  return Array.from({ length: 6 }, (_, index) => {
    const key = shiftMonth(month, index - 5);
    const summary = financeSummary(finance, key);
    return {
      month: key,
      label: monthDate(key).toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      income: summary.income,
      expenses: summary.expenses,
      result: summary.result,
    };
  });
}

export function expenseCategories(transactions: Transaction[]) {
  const categories = new Map<string, number>();
  for (const item of transactions)
    if (item.type === "despesa")
      categories.set(item.category, (categories.get(item.category) ?? 0) + item.amountCents);
  return [...categories]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
