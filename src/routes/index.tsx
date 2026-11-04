import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Heart } from "lucide-react";
import { useBloom } from "@/lib/store";
import { displayName, initials } from "@/hooks/use-bloom-actions";
import { fmtLong, greeting } from "@/lib/dates";
import { GoalsWidget, HabitsWidget, HeroBanner, MyDayWidget, SummaryStrip, WeekWidget } from "@/components/dashboard/Widgets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bloom OS — Your space to bloom" },
      { name: "description", content: "Seu espaço pessoal para organizar tarefas, hábitos, metas e pensamentos." },
      { property: "og:title", content: "Bloom OS — Your space to bloom" },
      { property: "og:description", content: "Seu espaço pessoal para organizar tarefas, hábitos, metas e pensamentos." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const data = useBloom();
  if (!data) return null;
  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-3xl font-semibold text-plum md:text-4xl">
            <span className="truncate">{greeting()}, {displayName(data.profile)}!</span>
            <Heart className="h-5 w-5 shrink-0 text-rose" strokeWidth={1.6} />
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Um novo dia para florescer.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm capitalize text-plum shadow-soft sm:flex">
            <CalendarDays className="h-4 w-4 text-rose" strokeWidth={1.6} /> {fmtLong(new Date())}
          </span>
          <Link to="/configuracoes" aria-label="Perfil" className="hidden h-10 w-10 place-items-center rounded-full bg-dusty text-sm font-semibold text-plum lg:grid">
            {initials(data.profile.name)}
          </Link>
        </div>
      </header>
      <p className="-mt-4 text-xs capitalize text-muted-foreground sm:hidden">{fmtLong(new Date())}</p>

      <HeroBanner />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <MyDayWidget data={data} />
        <HabitsWidget data={data} />
        <div className="md:col-span-2 xl:col-span-1"><GoalsWidget data={data} /></div>
      </div>
      <WeekWidget data={data} />
      <SummaryStrip data={data} />
    </div>
  );
}
