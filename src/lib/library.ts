import type { LibraryState } from "@/types";

export function isCoverUrl(value: string) {
  if (!value) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
export function librarySummary(library: LibraryState, year = new Date().getFullYear()) {
  const completed = library.books.filter((book) => book.status === "concluido");
  const finishedThisYear = completed.filter((book) =>
    book.completedDate.startsWith(`${year}-`),
  ).length;
  const target = library.goals.find((goal) => goal.year === year)?.target ?? 0;
  return {
    total: library.books.length,
    completed: completed.length,
    reading: library.books.filter((book) => book.status === "lendo").length,
    wishlist: library.books.filter((book) => book.status === "quero-ler").length,
    finishedThisYear,
    target,
    percent: target ? (finishedThisYear / target) * 100 : 0,
  };
}
