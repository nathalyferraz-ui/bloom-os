import { toast } from "sonner";
import { clearAll, resetDemo, setState } from "@/lib/store";
import { todayKey, uid } from "@/lib/dates";
import { focusElapsed } from "@/lib/study";
import type { BloomState, Book, Goal, Habit, JournalEntry, Profile, Task, Transaction, StudySubject, StudySession, StudyActivity, WellbeingCheckin } from "@/types";

function persist(action: () => void): boolean {
  try {
    action();
    return true;
  } catch (error) {
    toast.error(error instanceof Error && error.name !== "ZodError" ? error.message : "Confira os campos antes de salvar.");
    return false;
  }
}

const update = (updater: (state: BloomState) => BloomState) => persist(() => setState(updater));

export const dataActions = {
  resetDemo: () => persist(resetDemo),
  clearAll: () => persist(clearAll),
};

type Entity = { id: string };
const upsert = <T extends Entity>(list: T[], item: T) =>
  list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];

export const taskActions = {
  save: (t: Omit<Task, "id"> & { id?: string | undefined }) =>
    update((s) => {
      if (!t.title.trim()) throw new Error("Dê um nome para a tarefa.");
      const current = s.tasks.find((task) => task.id === t.id);
      if (t.id && !current) throw new Error("Esta tarefa foi excluída em outra janela. Feche o formulário para continuar.");
      // Completion is changed through toggle, so editing a stale form cannot undo it.
      const task: Task = { ...t, id: t.id ?? uid(), title: t.title.trim(), done: current?.done ?? t.done };
      return { ...s, tasks: upsert(s.tasks, task) };
    }),
  toggle: (id: string) =>
    update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
  remove: (id: string) => update((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),
  restore: (task: Task) => update((s) => ({ ...s, tasks: s.tasks.some((item) => item.id === task.id) ? s.tasks : [task, ...s.tasks] })),
};

export const habitActions = {
  save: (h: Omit<Habit, "id" | "log"> & { id?: string | undefined; log?: string[] | undefined }) =>
    update((s) => {
      const prev = s.habits.find((x) => x.id === h.id);
      return { ...s, habits: upsert(s.habits, { ...h, id: h.id ?? uid(), log: h.log ?? prev?.log ?? [] } as Habit) };
    }),
  toggleDay: (id: string, day: string) =>
    update((s) => ({
      ...s,
      habits: s.habits.map((h) =>
        h.id !== id ? h : { ...h, log: h.log.includes(day) ? h.log.filter((d) => d !== day) : [...h.log, day] },
      ),
    })),
  remove: (id: string) => update((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) })),
};

export const goalActions = {
  save: (g: Omit<Goal, "id"> & { id?: string | undefined }) =>
    update((s) => {
      const progress = g.status === "concluida" ? 100 : Math.min(100, Math.max(0, g.progress));
      return { ...s, goals: upsert(s.goals, { ...g, progress, status: progress === 100 ? "concluida" : g.status, id: g.id ?? uid() } as Goal) };
    }),
  setProgress: (id: string, progress: number) =>
    update((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id === id ? { ...g, progress: Math.min(100, Math.max(0, progress)), status: progress >= 100 ? "concluida" : g.status === "concluida" ? "ativa" : g.status } : g,
      ),
    })),
  remove: (id: string) => update((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) })),
};

export const entryActions = {
  save: (e: Omit<JournalEntry, "id"> & { id?: string | undefined }) => {
    const id = e.id ?? uid();
    return update((s) => ({ ...s, entries: upsert(s.entries, { ...e, id } as JournalEntry) })) ? id : undefined;
  },
  remove: (id: string) => update((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) })),
};

export const profileActions = {
  save: (p: Profile) => update((s) => ({ ...s, profile: p })),
};

export const financeActions = {
  saveTransaction: (transaction: Omit<Transaction, "id"> & { id?: string | undefined }) =>
    update((state) => {
      if (transaction.id && !state.finance.transactions.some((item) => item.id === transaction.id))
        throw new Error("Esta transação já foi excluída. Feche o formulário para continuar.");
      const item: Transaction = {
        ...transaction,
        id: transaction.id ?? uid(),
        description: transaction.description.trim(),
      };
      return {
        ...state,
        finance: { ...state.finance, transactions: upsert(state.finance.transactions, item) },
      };
    }),
  removeTransaction: (id: string) =>
    update((state) => ({
      ...state,
      finance: {
        ...state.finance,
        transactions: state.finance.transactions.filter((item) => item.id !== id),
      },
    })),
  saveBudget: (month: string, amountCents: number) =>
    update((state) => ({
      ...state,
      finance: {
        ...state.finance,
        budgets: [
          ...state.finance.budgets.filter((item) => item.month !== month),
          { month, amountCents },
        ],
      },
    })),
  removeBudget: (month: string) =>
    update((state) => ({
      ...state,
      finance: {
        ...state.finance,
        budgets: state.finance.budgets.filter((item) => item.month !== month),
      },
    })),
};

export const studyActions = {
  saveSubject: (subject: Omit<StudySubject, "id"> & { id?: string | undefined }) =>
    update((state) => {
      if (!subject.name.trim()) throw new Error("Dê um nome para a matéria.");
      if (subject.id && !state.study.subjects.some((item) => item.id === subject.id))
        throw new Error("Esta matéria já foi excluída.");
      return {
        ...state,
        study: {
          ...state.study,
          subjects: upsert(state.study.subjects, {
            ...subject,
            id: subject.id ?? uid(),
            name: subject.name.trim(),
          }),
        },
      };
    }),
  removeSubject: (id: string) =>
    update((state) => ({
      ...state,
      study: {
        ...state.study,
        subjects: state.study.subjects.filter((item) => item.id !== id),
        sessions: state.study.sessions.filter((item) => item.subjectId !== id),
        activities: state.study.activities.filter((item) => item.subjectId !== id),
        focus: state.study.focus?.subjectId === id ? null : state.study.focus,
      },
    })),
  saveSession: (session: Omit<StudySession, "id"> & { id?: string | undefined }) =>
    update((state) => {
      if (!state.study.subjects.some((item) => item.id === session.subjectId))
        throw new Error("Selecione uma matéria cadastrada.");
      if (session.id && !state.study.sessions.some((item) => item.id === session.id))
        throw new Error("Esta sessão já foi excluída.");
      return {
        ...state,
        study: {
          ...state.study,
          sessions: upsert(state.study.sessions, { ...session, id: session.id ?? uid() }),
        },
      };
    }),
  removeSession: (id: string) =>
    update((state) => ({
      ...state,
      study: { ...state.study, sessions: state.study.sessions.filter((item) => item.id !== id) },
    })),
  saveActivity: (
    activity: Omit<StudyActivity, "id" | "done"> & { id?: string | undefined; done?: boolean },
  ) =>
    update((state) => {
      if (!activity.title.trim()) throw new Error("Dê um título para a atividade.");
      if (!state.study.subjects.some((item) => item.id === activity.subjectId))
        throw new Error("Selecione uma matéria cadastrada.");
      const current = state.study.activities.find((item) => item.id === activity.id);
      if (activity.id && !current) throw new Error("Esta atividade já foi excluída.");
      return {
        ...state,
        study: {
          ...state.study,
          activities: upsert(state.study.activities, {
            ...activity,
            id: activity.id ?? uid(),
            title: activity.title.trim(),
            done: current?.done ?? activity.done ?? false,
          }),
        },
      };
    }),
  toggleActivity: (id: string) =>
    update((state) => ({
      ...state,
      study: {
        ...state.study,
        activities: state.study.activities.map((item) =>
          item.id === id ? { ...item, done: !item.done } : item,
        ),
      },
    })),
  removeActivity: (id: string) =>
    update((state) => ({
      ...state,
      study: {
        ...state.study,
        activities: state.study.activities.filter((item) => item.id !== id),
      },
    })),
  startFocus: (subjectId: string) =>
    update((state) => {
      if (!state.study.subjects.some((subject) => subject.id === subjectId))
        throw new Error("Selecione uma matéria para começar.");
      if (state.study.focus?.startedAt != null) return state;
      if (state.study.focus && state.study.focus.subjectId !== subjectId)
        throw new Error("Finalize ou descarte o cronômetro atual antes de trocar de matéria.");
      return {
        ...state,
        study: {
          ...state.study,
          focus: {
            subjectId,
            date: state.study.focus?.date ?? todayKey(),
            elapsedMs: state.study.focus?.elapsedMs ?? 0,
            startedAt: Date.now(),
          },
        },
      };
    }),
  pauseFocus: () =>
    update((state) =>
      state.study.focus
        ? {
            ...state,
            study: {
              ...state.study,
              focus: {
                ...state.study.focus,
                elapsedMs: focusElapsed(state.study.focus),
                startedAt: null,
              },
            },
          }
        : state,
    ),
  finishFocus: () =>
    update((state) => {
      const focus = state.study.focus;
      const seconds = Math.floor(focusElapsed(focus) / 1000);
      if (!focus || seconds < 1) throw new Error("Inicie o cronômetro antes de finalizar.");
      if (!state.study.subjects.some((item) => item.id === focus.subjectId))
        throw new Error("A matéria deste cronômetro foi excluída.");
      return {
        ...state,
        study: {
          ...state.study,
          focus: null,
          sessions: [
            {
              id: uid(),
              subjectId: focus.subjectId,
              date: focus.date,
              durationSeconds: seconds,
              notes: "Sessão registrada pelo cronômetro de foco.",
            },
            ...state.study.sessions,
          ],
        },
      };
    }),
  discardFocus: () => update((state) => ({ ...state, study: { ...state.study, focus: null } })),
};

export const libraryActions = {
  saveBook: (book: Omit<Book, "id"> & { id?: string | undefined }) =>
    update((state) => {
      const current = state.library.books.find((item) => item.id === book.id);
      if (book.id && !current)
        throw new Error("Este livro já foi excluído. Feche o formulário para continuar.");
      if (!book.title.trim()) throw new Error("Informe o título do livro.");
      if (
        !Number.isInteger(book.currentPage) ||
        book.currentPage < 0 ||
        book.currentPage > book.totalPages
      )
        throw new Error("A página atual deve estar entre zero e o total de páginas.");
      const item: Book = {
        ...book,
        id: book.id ?? uid(),
        title: book.title.trim(),
        author: book.author.trim(),
        genre: book.genre.trim(),
        coverUrl: book.coverUrl.trim(),
        currentPage: book.status === "concluido" ? book.totalPages : book.currentPage,
        completedDate:
          book.status === "concluido"
            ? book.completedDate || current?.completedDate || todayKey()
            : "",
      };
      return { ...state, library: { ...state.library, books: upsert(state.library.books, item) } };
    }),
  removeBook: (id: string) =>
    update((state) => ({
      ...state,
      library: { ...state.library, books: state.library.books.filter((book) => book.id !== id) },
    })),
  saveGoal: (year: number, target: number) =>
    update((state) => ({
      ...state,
      library: {
        ...state.library,
        goals: [...state.library.goals.filter((goal) => goal.year !== year), { year, target }],
      },
    })),
  removeGoal: (year: number) =>
    update((state) => ({
      ...state,
      library: {
        ...state.library,
        goals: state.library.goals.filter((goal) => goal.year !== year),
      },
    })),
};

export const wellbeingActions = {
  saveCheckin: (checkin: WellbeingCheckin) =>
    update((state) => ({
      ...state,
      wellbeing: {
        ...state.wellbeing,
        checkins: [
          {
            ...checkin,
            activities: [...new Set(checkin.activities.map((item) => item.trim()).filter(Boolean))],
            reflection: checkin.reflection.trim(),
          },
          ...state.wellbeing.checkins.filter((item) => item.date !== checkin.date),
        ],
      },
    })),
  removeCheckin: (date: string) =>
    update((state) => ({
      ...state,
      wellbeing: {
        ...state.wellbeing,
        checkins: state.wellbeing.checkins.filter((item) => item.date !== date),
      },
    })),
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
