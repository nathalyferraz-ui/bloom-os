import { setState } from "@/lib/store";
import { uid } from "@/lib/dates";
import type { Goal, Habit, JournalEntry, Profile, Task } from "@/types";

type Entity = { id: string };
const upsert = <T extends Entity>(list: T[], item: T) =>
  list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];

export const taskActions = {
  save: (t: Omit<Task, "id"> & { id?: string | undefined }) =>
    setState((s) => ({ ...s, tasks: upsert(s.tasks, { ...t, id: t.id ?? uid() } as Task) })),
  toggle: (id: string) =>
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
  remove: (id: string) => setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),
};

export const habitActions = {
  save: (h: Omit<Habit, "id" | "log"> & { id?: string | undefined; log?: string[] | undefined }) =>
    setState((s) => {
      const prev = s.habits.find((x) => x.id === h.id);
      return { ...s, habits: upsert(s.habits, { ...h, id: h.id ?? uid(), log: h.log ?? prev?.log ?? [] } as Habit) };
    }),
  toggleDay: (id: string, day: string) =>
    setState((s) => ({
      ...s,
      habits: s.habits.map((h) =>
        h.id !== id ? h : { ...h, log: h.log.includes(day) ? h.log.filter((d) => d !== day) : [...h.log, day] },
      ),
    })),
  remove: (id: string) => setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) })),
};

export const goalActions = {
  save: (g: Omit<Goal, "id"> & { id?: string | undefined }) =>
    setState((s) => ({ ...s, goals: upsert(s.goals, { ...g, id: g.id ?? uid() } as Goal) })),
  setProgress: (id: string, progress: number) =>
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id === id ? { ...g, progress, status: progress >= 100 ? "concluida" : g.status === "concluida" ? "ativa" : g.status } : g,
      ),
    })),
  remove: (id: string) => setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) })),
};

export const entryActions = {
  save: (e: Omit<JournalEntry, "id"> & { id?: string | undefined }) => {
    const id = e.id ?? uid();
    setState((s) => ({ ...s, entries: upsert(s.entries, { ...e, id } as JournalEntry) }));
    return id;
  },
  remove: (id: string) => setState((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) })),
};

export const profileActions = {
  save: (p: Profile) => setState((s) => ({ ...s, profile: p })),
};

export function displayName(p: Profile) {
  const n = p.name.trim() || "você";
  return p.showFirstNameOnly ? n.split(/\s+/)[0] : n;
}
export function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "B"
  );
}
