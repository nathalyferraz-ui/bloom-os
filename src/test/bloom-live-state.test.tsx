import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dataActions, taskActions } from "@/hooks/use-bloom-actions";
import { useLocalNow } from "@/hooks/use-local-now";
import { toKey } from "@/lib/dates";
import { getState, useBloom, useStorageIssue } from "@/lib/store";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const KEY = "bloom-os:v1";
const task = { id: "remote-task", title: "Outra aba", date: "2026-11-04", priority: "media", category: "Pessoal", done: false } as const;
const receive = (raw: string) => {
  localStorage.setItem(KEY, raw);
  window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: raw, storageArea: localStorage }));
};

beforeEach(() => { dataActions.clearAll(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("Atualizações do armazenamento entre abas", () => {
  it("updates mounted consumers when another tab changes the stored data", () => {
    const { result } = renderHook(useBloom);
    act(() => receive(JSON.stringify({ ...getState(), tasks: [task] })));
    expect(result.current?.tasks).toEqual([task]);
  });

  it("preserves the last valid state when another tab writes invalid data and recovers after repair", () => {
    const { result } = renderHook(() => ({ data: useBloom(), issue: useStorageIssue() }));
    act(() => receive(JSON.stringify({ ...getState(), tasks: [task] })));
    const valid = JSON.stringify(getState());
    act(() => receive("invalid json"));
    expect(result.current.data?.tasks).toEqual([task]);
    expect(result.current.issue).toBeTruthy();
    act(() => { expect(taskActions.toggle(task.id)).toBe(false); });
    expect(localStorage.getItem(KEY)).toBe("invalid json");
    act(() => receive(valid));
    expect(result.current.issue).toBeNull();
    act(() => { expect(taskActions.toggle(task.id)).toBe(true); });
    expect(result.current.data?.tasks[0]?.done).toBe(true);
  });

  it("ignores unrelated storage events", () => {
    const { result } = renderHook(useBloom);
    const before = result.current;
    act(() => window.dispatchEvent(new StorageEvent("storage", { key: "other-app", storageArea: localStorage })));
    expect(result.current).toBe(before);
  });

  it("updates mounted views after storage is cleared externally without seeding demo records", () => {
    const { result } = renderHook(useBloom);
    act(() => receive(JSON.stringify({ ...getState(), tasks: [task] })));
    act(() => {
      localStorage.removeItem(KEY);
      window.dispatchEvent(new StorageEvent("storage", { key: null, storageArea: localStorage }));
    });
    expect(result.current?.tasks).toEqual([]);
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});

describe("Data local das telas", () => {
  it("updates an open view after midnight and cleans up its timer on unmount", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 4, 23, 59, 30));
    const { result, unmount } = renderHook(useLocalNow);
    expect(toKey(result.current)).toBe("2026-11-04");
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(toKey(result.current)).toBe("2026-11-05");
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("refreshes immediately when returning to a suspended tab", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 4, 20));
    const { result } = renderHook(useLocalNow);
    vi.setSystemTime(new Date(2026, 10, 5, 8));
    act(() => { window.dispatchEvent(new Event("focus")); });
    expect(toKey(result.current)).toBe("2026-11-05");
  });
});
