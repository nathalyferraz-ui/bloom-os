import { useSyncExternalStore } from "react";
import { z } from "zod";
import type { BloomState } from "@/types";
import { addDays, isDateKey, lastNDays, toKey, uid } from "./dates";
import { ACTIVITY_KINDS, BOOK_STATUSES, CHECKIN_MOODS, FINANCE_CATEGORIES, SUBJECT_COLORS } from "@/types";
import { isMonthKey, MAX_MONEY_CENTS } from "./finance";
import { isCoverUrl } from "./library";

const KEY = "bloom-os:v1";
const dateSchema = z.string().refine(isDateKey);
const entitySchema = z.object({ id: z.string().min(1), demo: z.boolean().optional() });
const moneySchema = z.number().int().positive().max(MAX_MONEY_CENTS);
const financeSchema = z
  .object({
    transactions: z
      .array(
        entitySchema.extend({
          type: z.enum(["receita", "despesa"]),
          category: z.enum(FINANCE_CATEGORIES),
          amountCents: moneySchema,
          date: dateSchema,
          description: z.string().default(""),
        }),
      )
      .default([]),
    budgets: z
      .array(z.object({ month: z.string().refine(isMonthKey), amountCents: moneySchema }))
      .default([]),
  })
  .default({});
const studySchema = z
  .object({
    subjects: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          color: z.enum(SUBJECT_COLORS),
          weeklyMinutes: z.number().int().min(0).max(10080),
        }),
      )
      .default([]),
    sessions: z
      .array(
        z.object({
          id: z.string(),
          subjectId: z.string(),
          date: dateSchema,
          durationSeconds: z.number().int().positive().max(31536000),
          notes: z.string(),
        }),
      )
      .default([]),
    activities: z
      .array(
        z.object({
          id: z.string(),
          subjectId: z.string(),
          title: z.string(),
          kind: z.enum(ACTIVITY_KINDS),
          dueDate: z.union([dateSchema, z.literal("")]),
          done: z.boolean(),
        }),
      )
      .default([]),
    focus: z
      .object({
        subjectId: z.string(),
        date: dateSchema,
        elapsedMs: z.number().nonnegative().int(),
        startedAt: z.number().nonnegative().int().nullable(),
      })
      .nullable()
      .default(null),
  })
  .default({});
const librarySchema = z
  .object({
    books: z
      .array(
        z
          .object({
            id: z.string(),
            title: z.string().min(1),
            author: z.string(),
            coverUrl: z.string().refine(isCoverUrl),
            genre: z.string(),
            totalPages: z.number().int().positive().max(1000000),
            currentPage: z.number().int().nonnegative(),
            status: z.enum(BOOK_STATUSES),
            rating: z.number().int().min(0).max(5),
            notes: z.string(),
            completedDate: z.union([dateSchema, z.literal("")]),
          })
          .refine((book) => book.currentPage <= book.totalPages),
      )
      .default([]),
    goals: z
      .array(
        z.object({
          year: z.number().int().min(1000).max(9999),
          target: z.number().int().positive().max(10000),
        }),
      )
      .default([]),
  })
  .default({});
const wellbeingSchema = z
  .object({
    checkins: z
      .array(
        z.object({
          date: dateSchema,
          mood: z.enum(CHECKIN_MOODS),
          energy: z.number().int().min(1).max(5),
          sleepMinutes: z.number().int().min(0).max(1440),
          activities: z.array(z.string().trim().min(1).max(100)).max(20),
          reflection: z.string().max(1000),
        }),
      )
      .refine((checkins) => new Set(checkins.map((item) => item.date)).size === checkins.length)
      .default([]),
  })
  .default({});
// Validate before using browser data, while accepting missing collections from older versions.
const stateSchema = z.object({
  profile: z.object({ name: z.string(), showFirstNameOnly: z.boolean().default(true) }),
  tasks: z.array(entitySchema.extend({
    title: z.string(), date: dateSchema, time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
    priority: z.enum(["baixa", "media", "alta"]), category: z.enum(["Pessoal", "Trabalho", "Estudos", "Autocuidado"]), done: z.boolean(),
  })).default([]),
  habits: z.array(entitySchema.extend({
    name: z.string(), timesPerWeek: z.number().int().min(1).max(7), log: z.array(dateSchema),
  })).default([]),
  goals: z.array(entitySchema.extend({
    title: z.string(), description: z.string().optional(), category: z.string(), targetDate: dateSchema,
    progress: z.number().min(0).max(100), status: z.enum(["ativa", "pausada", "concluida"]), color: z.enum(["rose", "plum", "champagne", "dusty"]),
  })).default([]),
  entries: z.array(entitySchema.extend({
    date: dateSchema, title: z.string(), mood: z.enum(["feliz", "tranquila", "motivada", "cansada", "triste"]), content: z.string(),
  })).default([]),
  finance: financeSchema,
  study: studySchema,
  library: librarySchema,
  wellbeing: wellbeingSchema,
});

export function createDemoData(): BloomState {
  const t = (n: number) => toKey(addDays(new Date(), n));
  const past = lastNDays(7).map(toKey) as [string, string, string, string, string, string, string];
  return {
    profile: { name: "Nathaly Ferraz", showFirstNameOnly: true },
    tasks: [
      { id: uid(), title: "Planejar a semana", date: t(0), time: "09:00", priority: "alta", category: "Pessoal", done: true, demo: true },
      { id: uid(), title: "Responder e-mails", date: t(0), time: "10:30", priority: "media", category: "Trabalho", done: false, demo: true },
      { id: uid(), title: "Estudar 1h", date: t(0), time: "14:00", priority: "media", category: "Estudos", done: false, demo: true },
      { id: uid(), title: "Rotina de skincare", date: t(0), time: "21:00", priority: "baixa", category: "Autocuidado", done: false, demo: true },
      { id: uid(), title: "Reunião de alinhamento", date: t(1), time: "11:00", priority: "alta", category: "Trabalho", done: false, demo: true },
      { id: uid(), title: "Aula de pilates", date: t(2), time: "07:30", priority: "media", category: "Autocuidado", done: false, demo: true },
      { id: uid(), title: "Revisar capítulo 3", date: t(4), priority: "media", category: "Estudos", done: false, demo: true },
    ],
    habits: [
      { id: uid(), name: "Beber água", timesPerWeek: 7, log: past.slice(1), demo: true },
      { id: uid(), name: "Ler 20 minutos", timesPerWeek: 7, log: [past[2], past[4], past[5]], demo: true },
      { id: uid(), name: "Praticar exercícios", timesPerWeek: 4, log: [past[1], past[3], past[5]], demo: true },
      { id: uid(), name: "Organizar o dia", timesPerWeek: 7, log: [past[3], past[4], past[5], past[6]], demo: true },
      { id: uid(), name: "Fazer skincare", timesPerWeek: 7, log: [past[0], past[2], past[4], past[5]], demo: true },
    ],
    goals: [
      { id: uid(), title: "Minha evolução profissional", description: "Desenvolver novas habilidades e conquistar meus objetivos.", category: "Carreira", targetDate: t(120), progress: 65, status: "ativa", color: "rose", demo: true },
      { id: uid(), title: "Ler 12 livros no ano", description: "Um livro por mês, com calma e prazer.", category: "Pessoal", targetDate: t(200), progress: 40, status: "ativa", color: "champagne", demo: true },
      { id: uid(), title: "Rotina de bem-estar", description: "Movimento, sono e alimentação em equilíbrio.", category: "Saúde", targetDate: t(60), progress: 25, status: "ativa", color: "plum", demo: true },
    ],
    entries: [
      { id: uid(), date: t(-1), title: "Um dia leve", mood: "tranquila", content: "Hoje consegui desacelerar e aproveitar um café com calma. Quero lembrar de fazer isso mais vezes.", demo: true },
    ],
    finance: { transactions: [], budgets: [] },
    study: { subjects: [], sessions: [], activities: [], focus: null },
    library: { books: [], goals: [] },
    wellbeing: { checkins: [] },
  };
}

function emptyData(profile: BloomState["profile"] = { name: "", showFirstNameOnly: true }): BloomState {
  return { profile, tasks: [], habits: [], goals: [], entries: [], finance: { transactions: [], budgets: [] }, study: { subjects: [], sessions: [], activities: [], focus: null }, library: { books: [], goals: [] }, wellbeing: { checkins: [] } };
}

let state: BloomState | null = null;
let storageIssue: string | null = null;
let unreadableStorage = false;
let storedRaw: string | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function load(): BloomState {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
    storedRaw = raw;
  } catch {
    unreadableStorage = true;
    storageIssue = "Não foi possível acessar os dados deste navegador. Libere o armazenamento e recarregue a página.";
    return emptyData();
  }
  if (raw !== null) {
    try {
      return stateSchema.parse(JSON.parse(raw));
    } catch {
      unreadableStorage = true;
      storageIssue = "Os dados salvos não puderam ser lidos e foram preservados. Você pode restaurar os exemplos ou limpar os dados nas configurações.";
      return emptyData();
    }
  }
  const demo = createDemoData();
  try {
    localStorage.setItem(KEY, JSON.stringify(demo));
    storedRaw = JSON.stringify(demo);
  } catch {
    storageIssue = "Não foi possível salvar os exemplos. Verifique o espaço disponível e a permissão de armazenamento do navegador.";
  }
  return demo;
}

export function getState(): BloomState {
  if (!state) state = load();
  return state;
}

// Refresh from storage before a mutation too: another tab's event may still be queued.
function refreshStorage() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === storedRaw && !unreadableStorage) return;
    const next = raw === null ? emptyData(state?.profile) : stateSchema.parse(JSON.parse(raw));
    state = next;
    storedRaw = raw;
    storageIssue = null;
    unreadableStorage = false;
  } catch {
    unreadableStorage = true;
    storageIssue = "Não foi possível ler os dados mais recentes. Suas alterações anteriores foram mantidas. Confira o armazenamento ou restaure os dados nas configurações.";
  }
  notify();
}

function onStorage(event: StorageEvent) {
  if (event.storageArea === window.localStorage && (event.key === KEY || event.key === null)) refreshStorage();
}

export function setState(updater: (s: BloomState) => BloomState, replaceUnreadable = false) {
  getState();
  if (!replaceUnreadable) refreshStorage();
  const current = getState();
  if (unreadableStorage && !replaceUnreadable) {
    throw new Error("Os dados salvos precisam ser recuperados nas configurações antes de continuar.");
  }
  const next = stateSchema.parse(updater(current));
  try {
    const raw = JSON.stringify(next);
    localStorage.setItem(KEY, raw);
    storedRaw = raw;
  } catch {
    storageIssue = "Não foi possível salvar a alteração. Seus dados anteriores foram mantidos. Verifique o armazenamento do navegador e tente novamente.";
    notify();
    throw new Error(storageIssue);
  }
  state = next;
  storageIssue = null;
  unreadableStorage = false;
  notify();
}

export const resetDemo = () => setState(() => createDemoData(), true);
export const clearAll = () => setState((s) => emptyData(s.profile), true);

const subscribe = (l: () => void) => {
  if (listeners.size === 0) {
    window.addEventListener("storage", onStorage);
    // A tab can have changed while this store had no mounted consumers.
    if (state) refreshStorage();
  }
  listeners.add(l);
  return () => {
    listeners.delete(l);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
};

/** Returns null during SSR / before hydration. */
export function useBloom(): BloomState | null {
  return useSyncExternalStore(subscribe, getState, () => null);
}

export function useStorageIssue(): string | null {
  return useSyncExternalStore(subscribe, () => { getState(); return storageIssue; }, () => null);
}
