import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookHeart, BookOpen, CalendarDays, Flower2, Heart, Home, LayoutGrid, LibraryBig, Settings, Target, Wallet } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FloralMark } from "@/components/ui/bloom";
import { useBloom, useStorageIssue } from "@/lib/store";
import { initials } from "@/hooks/use-bloom-actions";

export const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/planejamento", label: "Planejamento", icon: CalendarDays },
  { to: "/habitos", label: "Hábitos", icon: Flower2 },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/diario", label: "Diário", icon: BookHeart },
  { to: "/financas", label: "Finanças", icon: Wallet },
  { to: "/estudos", label: "Estudos", icon: BookOpen },
  { to: "/biblioteca", label: "Biblioteca", icon: LibraryBig },
  { to: "/bem-estar", label: "Bem-estar", icon: Heart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const data = useBloom();
  const storageIssue = useStorageIssue();
  const name = data?.profile.name ?? "";
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const moreActive = navItems.slice(4).some((item) => item.to === pathname) || pathname === "/configuracoes";

  return (
    <div className="min-h-dvh w-full">
      <a href="#bloom-content" className="sr-only z-[100] rounded-xl bg-card px-4 py-3 text-sm text-plum shadow-soft focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Pular para o conteúdo</a>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2 text-plum">
          <FloralMark className="h-8 w-8 text-rose" />
          <span className="font-display text-2xl font-semibold italic">Bloom OS</span>
        </Link>
        <nav aria-label="Navegação principal" className="flex flex-col gap-1">
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
        <div className="mt-auto flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-dusty text-xs font-semibold text-plum">{initials(name)}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-plum">{name || "Você"}</p>
            <p className="text-xs text-muted-foreground">Seu espaço</p>
          </div>
          <Link to="/configuracoes" aria-label="Configurações" className="bloom-icon-button data-[status=active]:bg-blush">
            <Settings className="h-4 w-4" strokeWidth={1.6} />
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="glass sticky top-0 z-30 flex items-center justify-between border-b border-border pb-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[calc(0.75rem+env(safe-area-inset-top))] lg:hidden">
        <Link to="/" className="flex items-center gap-2 text-plum">
          <FloralMark className="h-6 w-6 text-rose" />
          <span className="font-display text-lg font-semibold italic">Bloom OS</span>
        </Link>
        <Link to="/configuracoes" aria-label="Configurações" className="grid h-11 w-11 place-items-center rounded-full bg-dusty text-xs font-semibold text-plum transition-colors hover:bg-blush">
          {initials(name)}
        </Link>
      </header>

      <main id="bloom-content" tabIndex={-1} className="pb-[calc(6rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-5 outline-none sm:px-6 lg:ml-64 lg:px-10 lg:pb-12 lg:pt-8">
        <div className="mx-auto min-w-0 max-w-6xl animate-fade-up">
          {storageIssue && (
            <div role="alert" className="mb-5 rounded-xl border border-rose/40 bg-blush p-4 text-sm text-plum">
              <p>{storageIssue}</p>
              <Link to="/configuracoes" className="mt-2 inline-block font-medium underline underline-offset-4">Abrir configurações</Link>
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav aria-label="Navegação inferior" className="glass fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] lg:hidden">
        {navItems.slice(0, 4).map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="group flex min-h-16 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-[10px] text-muted-foreground transition-colors duration-200 data-[status=active]:text-plum min-[400px]:text-[11px]"
          >
            <span className="grid h-8 w-11 place-items-center rounded-xl transition-colors duration-200 group-data-[status=active]:bg-blush"><Icon className="h-5 w-5" strokeWidth={1.6} /></span>
            {label}
          </Link>
        ))}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild><button type="button" aria-label="Abrir mais módulos" aria-pressed={moreActive} className="flex min-h-16 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-[10px] text-muted-foreground aria-pressed:text-plum min-[400px]:text-[11px]"><span className={moreActive ? "grid h-8 w-11 place-items-center rounded-xl bg-blush" : "grid h-8 w-11 place-items-center rounded-xl"}><LayoutGrid className="h-5 w-5" strokeWidth={1.6} /></span>Mais</button></SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-3xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <SheetHeader className="pr-10 text-left"><SheetTitle className="font-display text-2xl">Seu universo</SheetTitle><SheetDescription>Mais espaços para organizar a sua vida.</SheetDescription></SheetHeader>
            <nav aria-label="Mais módulos" className="mt-5 grid grid-cols-2 gap-3">{navItems.slice(4).map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setMoreOpen(false)} className="flex min-h-20 items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-plum hover:bg-blush data-[status=active]:border-primary data-[status=active]:bg-blush"><Icon className="h-5 w-5 shrink-0 text-primary" />{label}</Link>)}<Link to="/configuracoes" onClick={() => setMoreOpen(false)} className="flex min-h-20 items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-plum hover:bg-blush"><Settings className="h-5 w-5 shrink-0 text-primary" />Configurações</Link></nav>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
