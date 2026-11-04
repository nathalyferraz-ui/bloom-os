export const BOOK_STATUSES = ["quero-ler", "lendo", "concluido", "pausado"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];
export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  "quero-ler": "Quero ler",
  lendo: "Lendo",
  concluido: "Concluído",
  pausado: "Pausado",
};
export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  genre: string;
  totalPages: number;
  currentPage: number;
  status: BookStatus;
  rating: number; // 0 means not rated
  notes: string;
  completedDate: string; // empty until finished
}
export interface LibraryState {
  books: Book[];
  goals: { year: number; target: number }[];
}
