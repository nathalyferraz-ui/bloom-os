import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { financeActions } from "@/hooks/use-bloom-actions";
import { isDateKey, todayKey } from "@/lib/dates";
import { currentMonth, formatMonth, moneyInput, parseBRL } from "@/lib/finance";
import {
  FINANCE_CATEGORIES,
  type FinanceCategory,
  type Transaction,
  type TransactionType,
} from "@/types";

export function TransactionDialog({
  open,
  onOpenChange,
  month,
  transaction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: string;
  transaction?: Transaction | undefined;
}) {
  const [type, setType] = useState<TransactionType>("despesa");
  const [category, setCategory] = useState<FinanceCategory>("Outros");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayKey());
  const [description, setDescription] = useState("");
  useEffect(() => {
    if (!open) return;
    setType(transaction?.type ?? "despesa");
    setCategory(transaction?.category ?? "Outros");
    setAmount(transaction ? moneyInput(transaction.amountCents) : "");
    setDate(transaction?.date ?? (month === currentMonth() ? todayKey() : `${month}-01`));
    setDescription(transaction?.description ?? "");
  }, [open, transaction, month]);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const amountCents = parseBRL(amount);
    if (amountCents === null) {
      toast.error("Informe um valor positivo com até duas casas decimais.");
      return;
    }
    if (!isDateKey(date)) {
      toast.error("Escolha uma data válida.");
      return;
    }
    if (
      !financeActions.saveTransaction({
        id: transaction?.id,
        type,
        category,
        amountCents,
        date,
        description,
        demo: false,
      })
    )
      return;
    toast.success(
      transaction
        ? "Transação atualizada"
        : type === "receita"
          ? "Receita cadastrada"
          : "Despesa cadastrada",
    );
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar transação" : "Nova transação"}</DialogTitle>
          <DialogDescription>
            Um registro de cada vez para acompanhar seu dinheiro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div role="group" aria-label="Tipo de transação" className="flex gap-2">
            {(["receita", "despesa"] as const).map((item) => (
              <button
                type="button"
                key={item}
                aria-pressed={type === item}
                className="bloom-chip"
                onClick={() => setType(item)}
              >
                {item === "receita" ? "Receita" : "Despesa"}
              </button>
            ))}
          </div>
          <div className="grid gap-3 min-[400px]:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="f-value">Valor (R$)</Label>
              <Input
                id="f-value"
                inputMode="decimal"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="f-date">Data</Label>
              <Input
                id="f-date"
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="f-category">Categoria</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as FinanceCategory)}
            >
              <SelectTrigger id="f-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FINANCE_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="f-description">Descrição (opcional)</Label>
            <Input
              id="f-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex.: compras da semana"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{transaction ? "Salvar alterações" : "Salvar transação"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function BudgetDialog({
  open,
  onOpenChange,
  month,
  budget,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: string;
  budget: number;
}) {
  const [amount, setAmount] = useState("");
  useEffect(() => {
    if (open) setAmount(budget ? moneyInput(budget) : "");
  }, [open, budget]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Orçamento mensal</DialogTitle>
          <DialogDescription>
            Defina seu limite de despesas para {formatMonth(month)}.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const cents = parseBRL(amount);
            if (cents === null) {
              toast.error("Informe um limite positivo com até duas casas decimais.");
              return;
            }
            if (financeActions.saveBudget(month, cents)) {
              toast.success("Orçamento salvo");
              onOpenChange(false);
            }
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="f-budget">Limite de despesas (R$)</Label>
            <Input
              id="f-budget"
              required
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0,00"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar orçamento</Button>
          </DialogFooter>
        </form>
        {budget > 0 && (
          <Button
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              if (financeActions.removeBudget(month)) {
                toast("Orçamento removido");
                onOpenChange(false);
              }
            }}
          >
            Remover orçamento deste mês
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
