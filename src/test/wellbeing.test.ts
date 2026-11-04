import { beforeEach, expect, it, vi } from "vitest";
import { wellbeingSummary } from "@/lib/wellbeing";
import type { WellbeingCheckin } from "@/types";
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
const KEY = "bloom-os:v1";
const checkin: WellbeingCheckin = {
  date: "2026-11-04",
  mood: "Bem",
  energy: 4,
  sleepMinutes: 450,
  activities: ["Leitura"],
  reflection: "Meu momento",
};
beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  localStorage.clear();
});
it("upserts one record per date, deduplicates activities, and persists edits and deletions", async () => {
  const { wellbeingActions: actions } = await import("@/hooks/use-bloom-actions");
  const store = await import("@/lib/store");
  expect(actions.saveCheckin(checkin)).toBe(true);
  expect(
    actions.saveCheckin({
      ...checkin,
      mood: "Neutra",
      activities: ["Leitura", " Leitura ", "Descanso"],
    }),
  ).toBe(true);
  expect(store.getState().wellbeing.checkins).toEqual([
    { ...checkin, mood: "Neutra", activities: ["Leitura", "Descanso"] },
  ]);
  vi.resetModules();
  const restored = await import("@/lib/store");
  expect(restored.getState().wellbeing.checkins).toHaveLength(1);
  const reloaded = (await import("@/hooks/use-bloom-actions")).wellbeingActions;
  reloaded.removeCheckin(checkin.date);
  vi.resetModules();
  expect((await import("@/lib/store")).getState().wellbeing.checkins).toEqual([]);
});
it("keeps missing days blank and derives all three flower stages from days with selfcare, not mood", () => {
  const now = new Date(2026, 10, 4);
  expect(wellbeingSummary({ checkins: [] }, now).flowerStage).toBe("bud");
  const checkins = ["02", "03", "04", "05", "06"].map((day) => ({
    ...checkin,
    date: `2026-11-${day}`,
    mood: "Triste" as const,
  }));
  expect(wellbeingSummary({ checkins: checkins.slice(0, 2) }, now).flowerStage).toBe("opening");
  expect(wellbeingSummary({ checkins }, now).flowerStage).toBe("open");
  expect(wellbeingSummary({ checkins }, now).days.filter((day) => !day.checkin)).toHaveLength(2);
  expect(
    wellbeingSummary({ checkins: checkins.map((item) => ({ ...item, activities: [] })) }, now)
      .selfcareDays,
  ).toBe(0);
  expect(
    wellbeingSummary({ checkins: [{ ...checkin, date: "2026-11-01" }] }, now).selfcareDays,
  ).toBe(0);
});
it("rejects invalid dates and scales while preserving the last valid state", async () => {
  const { wellbeingActions: actions } = await import("@/hooks/use-bloom-actions");
  const store = await import("@/lib/store");
  store.getState();
  const previous = localStorage.getItem(KEY);
  for (const invalid of [
    { date: "2026-02-30" },
    { energy: 6 },
    { energy: 1.5 },
    { sleepMinutes: 1441 },
    { sleepMinutes: -1 },
    { reflection: "x".repeat(1001) },
  ])
    expect(actions.saveCheckin({ ...checkin, ...invalid })).toBe(false);
  expect(localStorage.getItem(KEY)).toBe(previous);
});
