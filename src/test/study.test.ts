import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { focusElapsed, studySummary, weekDays } from "@/lib/study";
import { toKey } from "@/lib/dates";
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
const KEY = "bloom-os:v1";
beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 4, 10));
  localStorage.clear();
  localStorage.setItem(
    KEY,
    JSON.stringify({
      profile: { name: "Marina", showFirstNameOnly: true },
      tasks: [],
      habits: [],
      goals: [],
      entries: [],
      finance: { transactions: [], budgets: [] },
    }),
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
async function setup() {
  const store = await import("@/lib/store");
  const { studyActions } = await import("@/hooks/use-bloom-actions");
  studyActions.saveSubject({
    name: "Matemática",
    description: "",
    color: "rose",
    weeklyMinutes: 120,
  });
  return { store, actions: studyActions, subject: store.getState().study.subjects[0]! };
}
describe("Study Garden", () => {
  it("migrates older data and calculates Monday-to-Sunday weekly totals", async () => {
    const { store, actions, subject } = await setup();
    actions.saveSession({
      subjectId: subject.id,
      date: "2026-11-02",
      durationSeconds: 3600,
      notes: "",
    });
    actions.saveSession({
      subjectId: subject.id,
      date: "2026-11-01",
      durationSeconds: 999,
      notes: "Fora desta semana",
    });
    const summary = studySummary(store.getState().study, new Date(2026, 10, 4));
    expect(summary.totalSeconds).toBe(3600);
    expect(summary.targetSeconds).toBe(7200);
    expect(summary.percent).toBe(50);
    expect(summary.days.reduce((sum, day) => sum + day.value, 0)).toBe(3600);
    expect(weekDays(new Date(2026, 10, 4)).map(toKey)).toEqual([
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
      "2026-11-08",
    ]);
  });
  it("persists the focus timer, excludes paused time, and records exactly one session", async () => {
    const context = await setup();
    let { store, actions } = context;
    const { subject } = context;
    actions.startFocus(subject.id);
    vi.advanceTimersByTime(75000);
    actions.pauseFocus();
    expect(store.getState().study.focus?.elapsedMs).toBe(75000);
    vi.advanceTimersByTime(120000);
    expect(focusElapsed(store.getState().study.focus)).toBe(75000);
    actions.startFocus(subject.id);
    const startedAt = store.getState().study.focus?.startedAt;
    actions.startFocus(subject.id);
    expect(store.getState().study.focus?.startedAt).toBe(startedAt);
    vi.advanceTimersByTime(15000);
    vi.resetModules();
    store = await import("@/lib/store");
    actions = (await import("@/hooks/use-bloom-actions")).studyActions;
    expect(focusElapsed(store.getState().study.focus)).toBe(90000);
    expect(actions.finishFocus()).toBe(true);
    expect(actions.finishFocus()).toBe(false);
    expect(store.getState().study.sessions).toHaveLength(1);
    expect(store.getState().study.sessions[0]?.durationSeconds).toBe(90);
    expect(store.getState().study.focus).toBeNull();
  });
  it("preserves completion when editing an activity and cascades an explicitly confirmed subject deletion", async () => {
    const { store, actions, subject } = await setup();
    actions.saveActivity({
      subjectId: subject.id,
      title: "Revisão",
      kind: "Revisão",
      dueDate: "2026-11-06",
    });
    const activity = store.getState().study.activities[0]!;
    actions.toggleActivity(activity.id);
    actions.saveActivity({ ...activity, title: "Revisão final" });
    expect(store.getState().study.activities[0]).toMatchObject({
      done: true,
      title: "Revisão final",
    });
    actions.saveSession({
      subjectId: subject.id,
      date: "2026-11-04",
      durationSeconds: 60,
      notes: "",
    });
    actions.startFocus(subject.id);
    actions.removeSubject(subject.id);
    expect(store.getState().study).toEqual({
      subjects: [],
      sessions: [],
      activities: [],
      focus: null,
    });
    vi.resetModules();
    expect((await import("@/lib/store")).getState().study.subjects).toEqual([]);
  });
  it("rejects sessions with missing subjects or invalid durations", async () => {
    const { store, actions, subject } = await setup();
    expect(
      actions.saveSession({
        subjectId: "missing",
        date: "2026-11-04",
        durationSeconds: 60,
        notes: "",
      }),
    ).toBe(false);
    expect(
      actions.saveSession({
        subjectId: subject.id,
        date: "2026-11-04",
        durationSeconds: 0,
        notes: "",
      }),
    ).toBe(false);
    expect(store.getState().study.sessions).toEqual([]);
  });
});
