import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  expenseCategories,
  financeHistory,
  financeSummary,
  formatBRL,
  parseBRL,
  shiftMonth,
} from "@/lib/finance";
import type { FinanceState, Transaction } from "@/types";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
const KEY = "bloom-os:v1";
const emptyFinance = (): FinanceState => ({ transactions: [], budgets: [] });
const tx = (
  id: string,
  type: "receita" | "despesa",
  amountCents: number,
  date = "2026-11-04",
): Transaction => ({ id, type, amountCents, date, category: "Outros", description: id });
const oldData = () => ({
  profile: { name: "Marina", showFirstNameOnly: true },
  tasks: [
    {
      id: "old-task",
      title: "Preservar",
      date: "2026-11-04",
      priority: "media",
      category: "Pessoal",
      done: false,
    },
  ],
  habits: [],
  goals: [],
  entries: [],
});
beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  localStorage.clear();
  localStorage.setItem(KEY, JSON.stringify(oldData()));
});
afterEach(() => vi.restoreAllMocks());

describe("Valores monetários em centavos", () => {
  it.each([
    ["0,01", 1],
    ["0,10", 10],
    ["1234,56", 123456],
    ["R$ 1.234,56", 123456],
    ["1.234", 123400],
    ["12.50", 1250],
    [" 25 ", 2500],
  ] as const)("parses %s without floating-point rounding", (value, expected) =>
    expect(parseBRL(value)).toBe(expected),
  );
  it.each(["", "0", "-10", "1,234", "1.23,45", "1e3", "Infinity", "9.999.999.999,99"])(
    "rejects invalid or unsupported input %s",
    (value) => expect(parseBRL(value)).toBeNull(),
  );
  it("adds 0,10 and 0,20 exactly", () => expect(parseBRL("0,10")! + parseBRL("0,20")!).toBe(30));
});

describe("Indicadores financeiros", () => {
  it("calculates period totals, accumulated balance and the actual budget overrun", () => {
    const finance: FinanceState = {
      transactions: [
        tx("old", "receita", 1000, "2026-10-01"),
        tx("in", "receita", 20000),
        tx("out", "despesa", 5000),
        tx("future", "despesa", 999, "2026-12-01"),
      ],
      budgets: [{ month: "2026-11", amountCents: 4000 }],
    };
    expect(financeSummary(finance, "2026-11")).toMatchObject({
      income: 20000,
      expenses: 5000,
      result: 15000,
      balance: 16000,
      remaining: -1000,
      budgetPercent: 125,
    });
    expect(financeSummary(finance, "2026-10").budget).toBe(0);
  });
  it("builds six real calendar months across year boundaries and groups only expenses", () => {
    const finance = {
      ...emptyFinance(),
      transactions: [
        tx("a", "receita", 1000, "2026-01-01"),
        tx("b", "despesa", 10, "2026-01-02"),
        tx("c", "despesa", 20, "2026-01-03"),
      ],
    };
    const history = financeHistory(finance, "2026-01");
    expect(history.map((item) => item.month)).toEqual([
      "2025-08",
      "2025-09",
      "2025-10",
      "2025-11",
      "2025-12",
      "2026-01",
    ]);
    expect(history.at(-1)).toMatchObject({ income: 1000, expenses: 30, result: 970 });
    expect(expenseCategories(finance.transactions)).toEqual([{ name: "Outros", value: 30 }]);
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(formatBRL(30)).toMatch(/0,30/);
  });
});

describe("Persistência de Finanças e compatibilidade", () => {
  it("loads older app data with an empty finance module and preserves the original entities on save", async () => {
    const store = await import("@/lib/store");
    const { financeActions } = await import("@/hooks/use-bloom-actions");
    expect(store.getState().finance).toEqual(emptyFinance());
    expect(store.getState().tasks).toEqual(oldData().tasks);
    expect(
      financeActions.saveTransaction({
        type: "despesa",
        amountCents: 30,
        date: "2026-11-04",
        category: "Alimentação",
        description: "Café",
      }),
    ).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEY)!).tasks).toEqual(oldData().tasks);
    vi.resetModules();
    const reloaded = await import("@/lib/store");
    expect(reloaded.getState().finance.transactions[0]?.amountCents).toBe(30);
  });
  it("edits and deletes transactions, replaces monthly budgets and persists intentional emptiness", async () => {
    const store = await import("@/lib/store");
    const { financeActions } = await import("@/hooks/use-bloom-actions");
    financeActions.saveTransaction({
      type: "receita",
      amountCents: 1000,
      date: "2026-11-04",
      category: "Salário",
      description: " Receita ",
    });
    const transaction = store.getState().finance.transactions[0]!;
    financeActions.saveTransaction({ ...transaction, amountCents: 2000 });
    expect(store.getState().finance.transactions).toHaveLength(1);
    expect(store.getState().finance.transactions[0]).toMatchObject({
      amountCents: 2000,
      description: "Receita",
    });
    financeActions.saveBudget("2026-11", 1000);
    financeActions.saveBudget("2026-11", 3000);
    financeActions.saveBudget("2026-12", 5000);
    expect(store.getState().finance.budgets).toHaveLength(2);
    financeActions.removeBudget("2026-11");
    expect(store.getState().finance.budgets).toEqual([{ month: "2026-12", amountCents: 5000 }]);
    financeActions.removeTransaction(transaction.id);
    expect(financeActions.saveTransaction(transaction)).toBe(false);
    vi.resetModules();
    expect((await import("@/lib/store")).getState().finance.transactions).toEqual([]);
  });
  it("rejects fractions of a cent and preserves the previous state on storage failure", async () => {
    const store = await import("@/lib/store");
    const { financeActions } = await import("@/hooks/use-bloom-actions");
    const before = store.getState();
    expect(
      financeActions.saveTransaction({
        type: "receita",
        amountCents: 0.5,
        date: "2026-11-04",
        category: "Outros",
        description: "",
      }),
    ).toBe(false);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Full", "QuotaExceededError");
    });
    expect(financeActions.saveBudget("2026-11", 10000)).toBe(false);
    expect(store.getState()).toBe(before);
  });
});
