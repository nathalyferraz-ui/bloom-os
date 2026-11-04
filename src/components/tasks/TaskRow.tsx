import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CheckDot, DemoBadge } from "@/components/ui/bloom";
import { taskActions } from "@/hooks/use-bloom-actions";
import { fmtShort } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

const prio = { alta: "bg-rose", media: "bg-champagne", baixa: "bg-beige" } as const;

export function TaskRow({ task, onEdit, showDate, compact }: { task: Task; onEdit?: (t: Task) => void; showDate?: boolean; compact?: boolean }) {
  return (
    <li className={cn("group flex items-center gap-3 rounded-xl px-2 transition-colors hover:bg-blush/50", compact ? "py-1.5" : "py-2.5")}>
      <CheckDot size="sm" checked={task.done} onClick={() => taskActions.toggle(task.id)} label={task.done ? "Marcar como pendente" : "Concluir tarefa"} />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm transition-colors", task.done ? "text-muted-foreground line-through" : "text-plum")}>{task.title}</p>
        {!compact && (
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full", prio[task.priority])} aria-label={`Prioridade ${task.priority}`} />
            <span>{task.category}</span>
            {showDate && <span>· {fmtShort(task.date)}</span>}
            {task.demo && <DemoBadge />}
          </div>
        )}
      </div>
      {task.time && <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{task.time}</span>}
      {onEdit && (
        <div className="flex shrink-0 gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
          <button onClick={() => onEdit(task)} aria-label="Editar" className="rounded-md p-1.5 text-rose hover:bg-blush"><Pencil className="h-3.5 w-3.5" /></button>
          <button
            onClick={() => { taskActions.remove(task.id); toast("Tarefa excluída"); }}
            aria-label="Excluir"
            className="rounded-md p-1.5 text-rose hover:bg-blush"
          ><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      )}
    </li>
  );
}
