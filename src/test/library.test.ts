import { beforeEach, expect, it, vi } from "vitest";
import { isCoverUrl, librarySummary } from "@/lib/library";
import type { Book } from "@/types";
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
const KEY = "bloom-os:v1";
const book: Omit<Book, "id"> = {
  title: "Uma história",
  author: "Autora",
  coverUrl: "",
  genre: "Romance",
  totalPages: 200,
  currentPage: 50,
  status: "lendo",
  rating: 0,
  notes: "Minhas notas",
  completedDate: "",
};
beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  localStorage.clear();
});
it("preserves older data and persists the full book lifecycle, completion date and annual goal", async () => {
  localStorage.setItem(
    KEY,
    JSON.stringify({ profile: { name: "Ana" }, tasks: [], habits: [], goals: [], entries: [] }),
  );
  const { libraryActions: actions } = await import("@/hooks/use-bloom-actions");
  const store = await import("@/lib/store");
  expect(store.getState().library).toEqual({ books: [], goals: [] });
  expect(actions.saveBook(book)).toBe(true);
  const id = store.getState().library.books[0]!.id;
  expect(
    actions.saveBook({ ...book, id, status: "concluido", completedDate: "2025-12-31", rating: 5 }),
  ).toBe(true);
  expect(store.getState().library.books[0]!.currentPage).toBe(200);
  actions.saveGoal(2025, 12);
  actions.saveGoal(2025, 2);
  expect(store.getState().library.goals).toHaveLength(1);
  expect(librarySummary(store.getState().library, 2025)).toMatchObject({
    finishedThisYear: 1,
    percent: 50,
  });
  expect(librarySummary(store.getState().library, 2026).finishedThisYear).toBe(0);
  vi.resetModules();
  const restored = await import("@/lib/store");
  expect(restored.getState().library.books[0]).toMatchObject({ id, rating: 5, notes: book.notes });
  const reloadedActions = (await import("@/hooks/use-bloom-actions")).libraryActions;
  reloadedActions.saveBook({
    ...restored.getState().library.books[0]!,
    status: "pausado",
    currentPage: 80,
  });
  expect(restored.getState().library.books[0]!.completedDate).toBe("");
  reloadedActions.removeBook(id);
  expect(restored.getState().library.books).toEqual([]);
  expect(reloadedActions.saveBook({ ...book, id })).toBe(false);
  vi.resetModules();
  expect((await import("@/lib/store")).getState().library.books).toEqual([]);
});
it("rejects invalid page ranges, ratings and executable cover URLs without changing stored data", async () => {
  const { libraryActions: actions } = await import("@/hooks/use-bloom-actions");
  const store = await import("@/lib/store");
  store.getState();
  const previous = localStorage.getItem(KEY);
  for (const invalid of [
    { currentPage: 201 },
    { totalPages: 0 },
    { currentPage: 1.5 },
    { rating: 6 },
    { coverUrl: "javascript:alert(1)" },
    { coverUrl: "data:image/png;base64,x" },
  ])
    expect(actions.saveBook({ ...book, ...invalid })).toBe(false);
  expect(localStorage.getItem(KEY)).toBe(previous);
  expect(isCoverUrl("https://example.com/cover.webp")).toBe(true);
  expect(isCoverUrl("")).toBe(true);
});
