import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  BloomCard,
  CardHeading,
  DemoBadge,
  EmptyState,
  PageHeader,
  ProgressBar,
} from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/ui/module";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { FinanceCharts } from "@/components/finance/FinanceCharts";
import { BudgetDialog, TransactionDialog } from "@/components/finance/FinanceDialogs";
import { financeActions } from "@/hooks/use-bloom-actions";
import { useLocalNow } from "@/hooks/use-local-now";
import { useBloom } from "@/lib/store";
import { fmtShort, toKey } from "@/lib/dates";
import { financeSummary, formatBRL, formatMonth, isMonthKey, shiftMonth } from "@/lib/finance";
import type { Transaction, TransactionType } from "@/types";

export const Route = createFileRoute("/financas")({
  validateSearch: (search: Record<string, unknown>): { month?: string } =>
    isMonthKey(search["month"]) ? { month: search["month"] } : {},
  head: () => ({
    meta: [
      { title: "My Money — Bloom OS" },
      { name: "description", content: "Receitas, despesas e orçamento pessoal em um só lugar." },
    ],
  }),
  component: Finance,
});

function Finance() {
  const data = useBloom();
  const { month: selected } = Route.useSearch();
  const navigate = Route.useNavigate();
  const now = useLocalNow();
  const month = selected ?? toKey(now).slice(0, 7);
  const [type, setType] = useState<"todas" | TransactionType>("todas");
  const [dialog, setDialog] = useState<{ open: boolean; transaction?: Transaction }>({
    open: false,
  });
  const [budgetOpen, setBudgetOpen] = useState(false);
  if (!data) return null;
  const summary = financeSummary(data.finance, month);
  const previous = financeSummary(data.finance, shiftMonth(month, -1));
  const transactions = summary.transactions
    .filter((item) => type === "todas" || item.type === type)
    .sort((a, b) => b.date.localeCompare(a.date));
  const selectMonth = (value: string) => {
    if (isMonthKey(value)) void navigate({ search: { month: value }, replace: true });
  };
  return (
    <div className="space-y-5">
      <PageHeader
        art="finance"
        title="My Money"
        subtitle="Seu dinheiro, com clareza e leveza."
        action={
          <Button aria-label="Nova transação" onClick={() => setDialog({ open: true })}>
            <Plus /> <span className="hidden sm:inline">Nova transação</span>
          </Button>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl capitalize text-plum">{formatMonth(month)}</h2>
        <div className="flex w-full items-center gap-1 sm:w-auto">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mês anterior"
            onClick={() => selectMonth(shiftMonth(month, -1))}
          >
            <ChevronLeft />
          </Button>
          <Input
            aria-label="Mês financeiro"
            type="month"
            className="min-w-0 flex-1 sm:w-52"
            value={month}
            onChange={(event) => selectMonth(event.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Próximo mês"
            onClick={() => selectMonth(shiftMonth(month, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Saldo até este mês"
          value={formatBRL(summary.balance)}
          note="Resultado acumulado dos registros até o período."
          icon={<Wallet className="h-4 w-4" />}
        />
        <MetricCard
          label="Receitas do mês"
          value={formatBRL(summary.income)}
          icon={<ArrowDownLeft className="h-4 w-4" />}
        />
        <MetricCard
          label="Despesas do mês"
          value={formatBRL(summary.expenses)}
          icon={<ArrowUpRight className="h-4 w-4" />}
        />
        <MetricCard
          label="Resultado mensal"
          value={formatBRL(summary.result)}
          note="Receitas menos despesas do mês selecionado."
        />
      </div>
      <BloomCard>
        <CardHeading
          title="Seu orçamento"
          action={
            <Button size="sm" variant="outline" onClick={() => setBudgetOpen(true)}>
              {summary.budget ? "Editar limite" : "Definir limite"}
            </Button>
          }
        />
        {summary.budget ? (
          <>
            <div className="mb-3 flex flex-wrap justify-between gap-2 text-sm">
              <span>
                {formatBRL(summary.expenses)} de {formatBRL(summary.budget)}
              </span>
              <span className="font-medium text-plum">
                {new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(
                  summary.budgetPercent,
                )}
                % utilizado
              </span>
            </div>
            <ProgressBar value={summary.budgetPercent} label="Orçamento mensal utilizado" />
            <p className="mt-3 text-sm text-muted-foreground">
              {summary.remaining >= 0
                ? `${formatBRL(summary.remaining)} disponíveis no limite deste mês.`
                : `As despesas ultrapassaram o limite em ${formatBRL(-summary.remaining)}.`}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Você pode definir um limite mensal para acompanhar suas despesas. Cada mês tem seu
            próprio orçamento.
          </p>
        )}
      </BloomCard>
      <FinanceCharts finance={data.finance} month={month} transactions={summary.transactions} />
      {previous.income || previous.expenses ? (
        <p className="text-xs text-muted-foreground">
          Em relação ao mês anterior, o resultado variou{" "}
          {formatBRL(summary.result - previous.result)}. Comparação baseada apenas nos registros
          cadastrados.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          A comparação mensal aparece quando houver registros no mês anterior.
        </p>
      )}
      <BloomCard>
        <CardHeading
          title="Transações"
          action={
            <span role="status" className="text-xs text-muted-foreground">
              {transactions.length} registros
            </span>
          }
        />
        <div role="group" aria-label="Filtrar transações" className="mb-4 flex flex-wrap gap-2">
          {(["todas", "receita", "despesa"] as const).map((item) => (
            <button
              key={item}
              className="bloom-chip"
              aria-pressed={type === item}
              onClick={() => setType(item)}
            >
              {item === "todas" ? "Todas" : item === "receita" ? "Receitas" : "Despesas"}
            </button>
          ))}
        </div>
        {transactions.length ? (
          <ul className="divide-y divide-border/60">
            {transactions.map((item) => (
              <li key={item.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2 py-4">
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-plum">
                    {item.description || item.category}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.type === "receita" ? "Receita" : "Despesa"}</span>
                    <span>{item.category}</span>
                    <time dateTime={item.date}>{fmtShort(item.date)}</time>
                    {item.demo && <DemoBadge />}
                  </p>
                </div>
                <p className="text-right text-sm font-semibold tabular-nums text-plum">
                  {item.type === "receita" ? "+" : "−"} {formatBRL(item.amountCents)}
                </p>
                <div className="col-span-2 flex justify-end">
                  <button
                    className="bloom-icon-button"
                    aria-label={`Editar transação: ${item.description || item.category}`}
                    onClick={() => setDialog({ open: true, transaction: item })}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <ConfirmAction
                    title="Excluir esta transação?"
                    description={`${item.description || item.category}: ${formatBRL(item.amountCents)}. Os totais serão recalculados.`}
                    onConfirm={() => {
                      const removed = financeActions.removeTransaction(item.id);
                      if (removed) toast("Transação excluída");
                      return removed;
                    }}
                  >
                    <button
                      className="bloom-icon-button"
                      aria-label={`Excluir transação: ${item.description || item.category}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </ConfirmAction>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            message="Seu jardim financeiro começa com o primeiro registro."
            description="Cadastre uma receita ou despesa neste mês para começar."
            actionLabel="Adicionar transação"
            onAction={() => setDialog({ open: true })}
          />
        )}
      </BloomCard>
      <TransactionDialog
        open={dialog.open}
        transaction={dialog.transaction}
        month={month}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
      />
      <BudgetDialog
        open={budgetOpen}
        onOpenChange={setBudgetOpen}
        month={month}
        budget={summary.budget}
      />
    </div>
  );
}
