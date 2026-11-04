import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BloomState } from "@/types";
import { isDateKey } from "@/lib/dates";
import { compareTasks, filterTasks } from "@/lib/tasks";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const KEY = "bloom-os:v1";
const empty = (): BloomState => ({
  profile: { name: "Marina Silva", showFirstNameOnly: false },
  tasks: [], habits: [], goals: [], entries: [], finance: { transactions: [], budgets: [] }, study: { subjects: [], sessions: [], activities: [], focus: null }, library: { books: [], goals: [] }, wellbeing: { checkins: [] },
});
const task = { title: "Ler", date: "2026-11-04", priority: "media", category: "Pessoal", done: false } as const;

async function load() {
  return { store: await import("@/lib/store"), actions: await import("@/hooks/use-bloom-actions") };
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  localStorage.clear();
  localStorage.setItem(KEY, JSON.stringify(empty()));
});
afterEach(() => vi.restoreAllMocks());

describe("Persistência e ações do Bloom OS", () => {
  it("creates demo data only on first access and keeps cleared collections after reloading", async () => {
    localStorage.removeItem(KEY);
    const { store, actions } = await load();
    expect(store.getState().tasks.length).toBeGreaterThan(0);
    actions.profileActions.save(empty().profile);
    expect(actions.dataActions.clearAll()).toBe(true);
    vi.resetModules();
    expect((await load()).store.getState()).toEqual(empty());
  });

  it("creates, edits, completes and deletes a task, persisting each operation", async () => {
    const { store, actions } = await load();
    expect(actions.taskActions.save(task)).toBe(true);
    const saved = store.getState().tasks[0]!;
    expect(actions.taskActions.save({ ...saved, title: "Ler 20 minutos", time: "08:30" })).toBe(true);
    expect(actions.taskActions.toggle(saved.id)).toBe(true);
    vi.resetModules();
    const reloaded = await load();
    expect(reloaded.store.getState().tasks).toEqual([{ ...saved, title: "Ler 20 minutos", time: "08:30", done: true }]);
    expect(reloaded.actions.taskActions.remove(saved.id)).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEY)!).tasks).toEqual([]);
  });

  it("preserves memory and stored data on write failure, then allows retry", async () => {
    const { store, actions } = await load();
    const before = store.getState();
    const raw = localStorage.getItem(KEY);
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Full", "QuotaExceededError"); });
    expect(actions.taskActions.save(task)).toBe(false);
    expect(store.getState()).toBe(before);
    expect(localStorage.getItem(KEY)).toBe(raw);
    const { toast } = await import("sonner");
    expect(toast.error).toHaveBeenCalled();
    write.mockRestore();
    expect(actions.taskActions.save(task)).toBe(true);
    expect(store.getState().tasks).toHaveLength(1);
  });

  it("merges the latest stored changes before saving, even when the other tab's event is still queued", async () => {
    const { store, actions } = await load();
    store.getState();
    localStorage.setItem(KEY, JSON.stringify({ ...empty(), tasks: [{ ...task, id: "another-tab", title: "Criada em outra aba" }] }));
    actions.taskActions.save(task);
    expect(store.getState().tasks).toHaveLength(2);
    expect(store.getState().tasks.some((item) => item.id === "another-tab")).toBe(true);
  });

  it("does not revert completion when an older task form is saved", async () => {
    const { store, actions } = await load();
    actions.taskActions.save(task);
    const editing = store.getState().tasks[0]!;
    actions.taskActions.toggle(editing.id);
    actions.taskActions.save({ ...editing, title: "Título atualizado" });
    expect(store.getState().tasks[0]).toMatchObject({ title: "Título atualizado", done: true });
  });

  it("does not recreate a deleted task when an older form is submitted", async () => {
    const { store, actions } = await load();
    actions.taskActions.save(task);
    const editing = store.getState().tasks[0]!;
    actions.taskActions.remove(editing.id);
    expect(actions.taskActions.save({ ...editing, title: "Edição antiga" })).toBe(false);
    expect(store.getState().tasks).toEqual([]);
  });

  it("restores a deleted task without changing its identifier, duplicating it, or replacing newer edits", async () => {
    const { store, actions } = await load();
    actions.taskActions.save(task);
    const deleted = store.getState().tasks[0]!;
    actions.taskActions.remove(deleted.id);
    expect(actions.taskActions.restore(deleted)).toBe(true);
    actions.taskActions.save({ ...deleted, title: "Uma edição mais recente" });
    actions.taskActions.restore(deleted);
    expect(store.getState().tasks).toEqual([{ ...deleted, title: "Uma edição mais recente" }]);
    vi.resetModules();
    expect((await load()).store.getState().tasks).toEqual([{ ...deleted, title: "Uma edição mais recente" }]);
  });

  it("validates and trims task titles at the mutation boundary", async () => {
    const { store, actions } = await load();
    expect(actions.taskActions.save({ ...task, title: "   " })).toBe(false);
    expect(store.getState().tasks).toEqual([]);
    actions.taskActions.save({ ...task, title: "  Ler com calma  " });
    expect(store.getState().tasks[0]?.title).toBe("Ler com calma");
  });

  it.each(["{broken", "null", JSON.stringify({ ...empty(), tasks: [{ ...task, id: "bad", date: "2026-02-30" }] })])(
    "preserves unreadable data instead of overwriting it: %s", async (raw) => {
      localStorage.setItem(KEY, raw);
      const { store, actions } = await load();
      expect(store.getState().tasks).toEqual([]);
      expect(actions.taskActions.save(task)).toBe(false);
      expect(localStorage.getItem(KEY)).toBe(raw);
      expect(actions.dataActions.resetDemo()).toBe(true);
      expect(store.getState().tasks.length).toBeGreaterThan(0);
    },
  );

  it("does not crash or overwrite storage when read access is denied", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Denied", "SecurityError"); });
    const write = vi.spyOn(Storage.prototype, "setItem");
    const { store, actions } = await load();
    expect(() => store.getState()).not.toThrow();
    expect(actions.taskActions.save(task)).toBe(false);
    expect(write).not.toHaveBeenCalled();
  });

  it("loads older data with missing collections without recreating examples", async () => {
    localStorage.setItem(KEY, JSON.stringify({ profile: empty().profile }));
    expect((await load()).store.getState()).toEqual(empty());
  });

  it("keeps dated habit history when editing and only toggles the requested day", async () => {
    const { store, actions } = await load();
    actions.habitActions.save({ name: "Ler", timesPerWeek: 3 });
    const habit = store.getState().habits[0]!;
    actions.habitActions.toggleDay(habit.id, "2026-11-03");
    actions.habitActions.toggleDay(habit.id, "2026-11-04");
    actions.habitActions.save({ id: habit.id, name: "Ler com calma", timesPerWeek: 4 });
    expect(store.getState().habits[0]?.log).toEqual(["2026-11-03", "2026-11-04"]);
    actions.habitActions.toggleDay(habit.id, "2026-11-04");
    expect(store.getState().habits[0]?.log).toEqual(["2026-11-03"]);
    expect(actions.habitActions.remove(habit.id)).toBe(true);
    expect(store.getState().habits).toEqual([]);
  });

  it("keeps goal status and percentage consistent on save, completion and reopening", async () => {
    const { store, actions } = await load();
    actions.goalActions.save({ title: "Meu objetivo", category: "Pessoal", targetDate: "2026-12-31", progress: 20, status: "concluida", color: "rose" });
    const goal = store.getState().goals[0]!;
    expect(goal.progress).toBe(100);
    actions.goalActions.setProgress(goal.id, 65);
    expect(store.getState().goals[0]).toMatchObject({ progress: 65, status: "ativa" });
    actions.goalActions.setProgress(goal.id, 150);
    expect(store.getState().goals[0]).toMatchObject({ progress: 100, status: "concluida" });
    actions.goalActions.setProgress(goal.id, -10);
    expect(store.getState().goals[0]).toMatchObject({ progress: 0, status: "ativa" });
    actions.goalActions.remove(goal.id);
    expect(store.getState().goals).toEqual([]);
  });

  it("creates and edits a journal entry under the same identifier across reloads", async () => {
    const { actions } = await load();
    const id = actions.entryActions.save({ date: "2026-11-04", title: "Meu dia", mood: "tranquila", content: "Um momento de calma." });
    expect(id).toBeTruthy();
    actions.entryActions.save({ id, date: "2026-11-04", title: "Meu dia", mood: "feliz", content: "Uma pequena conquista." });
    vi.resetModules();
    const reloaded = await load();
    expect(reloaded.store.getState().entries).toEqual([{ id, date: "2026-11-04", title: "Meu dia", mood: "feliz", content: "Uma pequena conquista." }]);
    reloaded.actions.entryActions.remove(id!);
    expect(reloaded.store.getState().entries).toEqual([]);
  });
});

describe("Datas e ordenação das tarefas", () => {
  it("validates real local calendar dates, including leap days", () => {
    expect(isDateKey("2024-02-29")).toBe(true);
    expect(isDateKey("2026-02-29")).toBe(false);
    expect(isDateKey("2026-13-01")).toBe(false);
    expect(isDateKey("04/11/2026")).toBe(false);
  });

  it("shows pending timed tasks before untimed and completed tasks", () => {
    const tasks = [
      { ...task, id: "done", time: "07:00", done: true },
      { ...task, id: "untimed" },
      { ...task, id: "later", time: "14:00" },
      { ...task, id: "early", time: "09:00" },
    ];
    expect(tasks.sort(compareTasks).map((item) => item.id)).toEqual(["early", "later", "untimed", "done"]);
  });

  it("combines text, category, status and period filters without counting completed tasks as overdue", () => {
    const tasks = [
      { ...task, id: "overdue", title: "Reunião com a equipe", date: "2026-11-03" },
      { ...task, id: "completed", title: "Reunião encerrada", date: "2026-11-03", done: true },
      { ...task, id: "today", title: "Ler hoje" },
      { ...task, id: "future", title: "Reunião futura", date: "2026-11-05" },
    ];
    const filters = { status: "todas", category: "Pessoal", period: "atrasadas", query: "REUNIAO", today: "2026-11-04" } as const;
    expect(filterTasks(tasks, filters).map((item) => item.id)).toEqual(["overdue"]);
    expect(filterTasks(tasks, { ...filters, period: "hoje", query: "" }).map((item) => item.id)).toEqual(["today"]);
    expect(filterTasks(tasks, { ...filters, period: "proximas" }).map((item) => item.id)).toEqual(["future"]);
    expect(filterTasks(tasks, { ...filters, category: "Trabalho" })).toEqual([]);
  });
});
