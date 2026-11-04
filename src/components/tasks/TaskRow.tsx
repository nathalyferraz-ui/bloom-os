import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CheckDot, DemoBadge } from "@/components/ui/bloom";
import { taskActions } from "@/hooks/use-bloom-actions";
import { fmtShort, todayKey } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

const prio = { alta: "bg-rose", media: "bg-champagne", baixa: "bg-beige" } as const;
const priorityLabel = { alta: "Alta", media: "Média", baixa: "Baixa" } as const;
const actionClass = "bloom-icon-button";

export function TaskRow({ task, onEdit, showDate, compact }: { task: Task; onEdit?: (t: Task) => void; showDate?: boolean; compact?: boolean }) {
  const overdue = !task.done && task.date < todayKey();
  const remove = () => {
    if (!taskActions.remove(task.id)) return;
    toast("Tarefa excluída", {
      duration: 7000,
      action: { label: "Desfazer", onClick: () => { if (taskActions.restore(task)) toast.success("Tarefa restaurada"); } },
    });
  };
  return (
    <li className={cn("group grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1 rounded-xl px-2 transition-colors hover:bg-blush/50 sm:flex sm:items-center", compact ? "py-1.5" : "py-2.5")}>
      <CheckDot size="sm" checked={task.done} onClick={() => taskActions.toggle(task.id)} label={`${task.done ? "Marcar como pendente" : "Concluir tarefa"}: ${task.title}`} />
      <div className="min-w-0 flex-1">
        <p title={task.title} className={cn("break-words text-sm transition-colors", task.done ? "text-muted-foreground line-through" : "text-plum")}>{task.title}</p>
        {!compact && (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1" title={`Prioridade ${priorityLabel[task.priority]}`}><span className={cn("h-1.5 w-1.5 rounded-full", prio[task.priority])} aria-hidden />{priorityLabel[task.priority]}</span>
            <span>{task.category}</span>
            {showDate && <time dateTime={task.date}>{fmtShort(task.date)}</time>}
            {task.time && <time dateTime={`${task.date}T${task.time}`} className="tabular-nums">{task.time}</time>}
            {overdue && <span className="rounded-full bg-blush px-2 py-0.5 font-medium text-plum">Atrasada</span>}
            {task.demo && <DemoBadge />}
          </div>
        )}
        {compact && task.time && <p className="mt-1 text-xs tabular-nums text-muted-foreground">{task.time}</p>}
      </div>
      {onEdit && (
        <div className="col-start-2 flex shrink-0 justify-self-end gap-0.5">
          <button onClick={() => onEdit(task)} aria-label={`Editar tarefa: ${task.title}`} className={actionClass}><Pencil className="h-4 w-4" /></button>
          <button
            onClick={remove}
            aria-label={`Excluir tarefa: ${task.title}`}
            className={actionClass}
          ><Trash2 className="h-4 w-4" /></button>
        </div>
      )}
    </li>
  );
}
