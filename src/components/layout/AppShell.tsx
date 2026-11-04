import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BookHeart, CalendarDays, Flower2, Home, Settings, Target } from "lucide-react";
import { FloralMark } from "@/components/ui/bloom";
import { useBloom } from "@/lib/store";
import { initials } from "@/hooks/use-bloom-actions";

export const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/planejamento", label: "Planejamento", icon: CalendarDays },
  { to: "/habitos", label: "Hábitos", icon: Flower2 },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/diario", label: "Diário", icon: BookHeart },
] as const;

const future = ["Finanças", "Estudos", "Biblioteca", "Bem-estar"];

export function AppShell({ children }: { children: ReactNode }) {
  const data = useBloom();
  const name = data?.profile.name ?? "";

  return (
    <div className="min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2 text-plum">
          <FloralMark className="h-8 w-8 text-rose" />
          <span className="font-display text-2xl font-semibold italic">Bloom OS</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-plum/80 transition-colors hover:bg-sidebar-accent data-[status=active]:bg-plum-gradient data-[status=active]:text-primary-foreground data-[status=active]:shadow-soft"
            >
              <Icon className="h-4 w-4" strokeWidth={1.6} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 px-3">
          <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">Em breve</p>
          {future.map((f) => (
            <p key={f} className="py-1 text-sm text-muted-foreground/70">{f}</p>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-dusty text-xs font-semibold text-plum">{initials(name)}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-plum">{name || "Você"}</p>
            <p className="text-xs text-muted-foreground">Seu espaço</p>
          </div>
          <Link to="/configuracoes" aria-label="Configurações" className="rounded-lg p-1.5 text-rose hover:bg-blush data-[status=active]:bg-blush">
            <Settings className="h-4 w-4" strokeWidth={1.6} />
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="glass sticky top-0 z-30 flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
        <Link to="/" className="flex items-center gap-2 text-plum">
          <FloralMark className="h-6 w-6 text-rose" />
          <span className="font-display text-lg font-semibold italic">Bloom OS</span>
        </Link>
        <Link to="/configuracoes" aria-label="Configurações" className="grid h-9 w-9 place-items-center rounded-full bg-dusty text-xs font-semibold text-plum">
          {initials(name)}
        </Link>
      </header>

      <main className="px-4 pb-28 pt-5 sm:px-6 lg:ml-64 lg:px-10 lg:pb-12 lg:pt-8">
        <div className="mx-auto max-w-6xl animate-fade-up">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="glass fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border pb-[env(safe-area-inset-bottom)] lg:hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground data-[status=active]:text-rose"
          >
            <Icon className="h-5 w-5" strokeWidth={1.6} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
