import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { taskActions } from "@/hooks/use-bloom-actions";
import { todayKey } from "@/lib/dates";
import type { Priority, Task, TaskCategory } from "@/types";

export const CATEGORIES: TaskCategory[] = ["Pessoal", "Trabalho", "Estudos", "Autocuidado"];
export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
];

export function TaskDialog({ open, onOpenChange, task, defaultDate }: { open: boolean; onOpenChange: (o: boolean) => void; task?: Task | null; defaultDate?: string }) {
  const [form, setForm] = useState({ title: "", date: todayKey(), time: "", priority: "media" as Priority, category: "Pessoal" as TaskCategory });

  useEffect(() => {
    if (open)
      setForm(
        task
          ? { title: task.title, date: task.date, time: task.time ?? "", priority: task.priority, category: task.category }
          : { title: "", date: defaultDate ?? todayKey(), time: "", priority: "media", category: "Pessoal" },
      );
  }, [open, task, defaultDate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Dê um nome para a tarefa."); return; }
    taskActions.save({ ...task, ...form, title: form.title.trim(), time: form.time || undefined, done: task?.done ?? false, demo: false, id: task?.id });
    toast.success(task ? "Tarefa atualizada" : "Tarefa criada");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-plum">{task ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="t-title">Título</Label>
            <Input id="t-title" autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="O que você quer fazer?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="t-date">Data</Label>
              <Input id="t-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="t-time">Horário</Label>
              <Input id="t-time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as TaskCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{task ? "Salvar" : "Criar tarefa"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
