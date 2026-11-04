import type { Task, TaskCategory } from "@/types";

export type TaskStatusFilter = "todas" | "pendentes" | "concluidas";
export const TASK_PERIODS = ["todas", "hoje", "atrasadas", "proximas"] as const;
export type TaskPeriod = typeof TASK_PERIODS[number];

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();

export function filterTasks(tasks: Task[], filters: {
  status: TaskStatusFilter;
  category: TaskCategory | "todas";
  period: TaskPeriod;
  query: string;
  today: string;
}): Task[] {
  const query = normalize(filters.query);
  return tasks.filter((task) =>
    (filters.status === "todas" || (filters.status === "concluidas" ? task.done : !task.done))
    && (filters.category === "todas" || task.category === filters.category)
    && (filters.period === "todas" || (filters.period === "hoje" ? task.date === filters.today
      : filters.period === "atrasadas" ? !task.done && task.date < filters.today : task.date > filters.today))
    && (!query || normalize(task.title).includes(query)),
  ).sort(compareTasks);
}

/** Pending tasks first, then date and time; untimed tasks follow scheduled ones. */
export function compareTasks(a: Task, b: Task): number {
  return Number(a.done) - Number(b.done)
    || a.date.localeCompare(b.date)
    || (a.time || "99:99").localeCompare(b.time || "99:99")
    || a.title.localeCompare(b.title, "pt-BR");
}
