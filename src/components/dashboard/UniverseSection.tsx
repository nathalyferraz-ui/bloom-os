import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Heart, LibraryBig, Wallet } from "lucide-react";
import { currentMonth, financeSummary, formatBRL } from "@/lib/finance";
import type { BloomState } from "@/types";
import { formatDuration, studySummary } from "@/lib/study";
import { wellbeingSummary } from "@/lib/wellbeing";
import { fromKey } from "@/lib/dates";

export function UniverseSection({ data }: { data: BloomState }) {
  const latest = wellbeingSummary(data.wellbeing).latest;
  return (
    <section aria-labelledby="universe-title">
      <h2 id="universe-title" className="mb-4 text-xl font-semibold text-plum">
        Meu universo
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Link to="/financas" className="bloom-card block min-w-0 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 shrink-0 text-primary" />
            <h3 className="min-w-0 break-words text-base text-plum sm:text-lg">Finanças</h3>
          </div>
          <p className="break-words text-base font-semibold tabular-nums text-plum sm:text-lg">
            {formatBRL(financeSummary(data.finance, currentMonth()).result)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Resultado deste mês</p>
          <span className="mt-4 inline-flex items-center gap-1 text-xs text-primary">
            Abrir My Money <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
        <Link to="/estudos" className="bloom-card block min-w-0 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0 text-primary" />
            <h3 className="min-w-0 break-words text-base text-plum sm:text-lg">Estudos</h3>
          </div>
          <p className="break-words text-base font-semibold tabular-nums text-plum sm:text-lg">
            {formatDuration(studySummary(data.study).totalSeconds)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Estudados nesta semana</p>
          <span className="mt-4 inline-flex items-center gap-1 text-xs text-primary">
            Abrir Study Garden <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
        <Link to="/biblioteca" className="bloom-card block min-w-0 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <LibraryBig className="h-4 w-4 shrink-0 text-primary" />
            <h3 className="min-w-0 break-words text-base text-plum sm:text-lg">Biblioteca</h3>
          </div>
          <p className="break-words text-base font-semibold tabular-nums text-plum sm:text-lg">
            {data.library.books.filter((book) => book.status === "lendo").length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Livros em andamento</p>
          <span className="mt-4 inline-flex items-center gap-1 text-xs text-primary">
            Abrir My Little Library <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
        <Link to="/bem-estar" className="bloom-card block min-w-0 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 shrink-0 text-primary" />
            <h3 className="min-w-0 break-words text-base text-plum sm:text-lg">Bem-estar</h3>
          </div>
          <p className="break-words text-base font-semibold text-plum sm:text-lg">
            {latest ? fromKey(latest.date).toLocaleDateString("pt-BR") : "No seu ritmo"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {latest ? "Seu último check-in" : "Seu primeiro check-in espera por você"}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-xs text-primary">
            Abrir Inner Bloom <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </div>
    </section>
  );
}
