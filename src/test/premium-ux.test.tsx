import { useState } from "react";
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CheckDot, EmptyState, PageHeader } from "@/components/ui/bloom";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { Slider } from "@/components/ui/slider";
import { useIsMobile } from "@/hooks/use-mobile";

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("Fluxos de confirmação", () => {
  it("keeps the dialog open after a failed mutation and only closes after success", async () => {
    const remove = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
    render(<ConfirmAction title="Excluir este hábito?" description="Seu histórico será apagado." confirmLabel="Confirmar exclusão" onConfirm={remove}><button>Excluir hábito</button></ConfirmAction>);
    fireEvent.click(screen.getByRole("button", { name: "Excluir hábito" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
    expect(screen.getByRole("alertdialog")).toBeVisible();
    expect(remove).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(remove).toHaveBeenCalledTimes(2);
  });

  it("cancels without deleting and restores focus to the original control", async () => {
    const remove = vi.fn();
    render(<ConfirmAction title="Excluir entrada?" description="O registro será apagado." onConfirm={remove}><button>Excluir entrada</button></ConfirmAction>);
    const trigger = screen.getByRole("button", { name: "Excluir entrada" });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(remove).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});

describe("Componentes de experiência premium", () => {
  it("uses the CSS media query as the responsive source of truth and cleans up listeners", () => {
    let listener = () => {};
    const media = { matches: true, addEventListener: vi.fn((_event: string, callback: () => void) => { listener = callback; }), removeEventListener: vi.fn() };
    const match = vi.spyOn(window, "matchMedia").mockReturnValue(media as unknown as MediaQueryList);
    const { result, unmount } = renderHook(() => useIsMobile(1280));
    expect(match).toHaveBeenCalledWith("(max-width: 1279px)");
    expect(result.current).toBe(true);
    act(() => { media.matches = false; listener(); });
    expect(result.current).toBe(false);
    unmount();
    expect(media.removeEventListener).toHaveBeenCalledWith("change", listener);
  });

  it("does not animate checks on initial load, but gives accessible feedback after a toggle", () => {
    vi.useFakeTimers();
    const { unmount } = render(<CheckDot checked onClick={() => {}} label="Hábito já realizado" />);
    expect(document.querySelector(".animate-pop")).toBeNull();
    unmount();
    function Toggle() {
      const [checked, setChecked] = useState(false);
      return <CheckDot checked={checked} onClick={() => setChecked((value) => !value)} label="Realizar hábito" />;
    }
    render(<Toggle />);
    fireEvent.click(screen.getByRole("button", { name: "Realizar hábito" }));
    expect(screen.getByRole("button", { name: "Realizar hábito" })).toHaveAttribute("aria-pressed", "true");
    expect(document.querySelector(".animate-pop")).not.toBeNull();
    act(() => { vi.advanceTimersByTime(300); });
    expect(document.querySelector(".animate-pop")).toBeNull();
  });

  it("renders the requested empty-state copy and a working creation action", () => {
    const create = vi.fn();
    render(<EmptyState message="Um novo começo merece um bom planejamento." description="Adicione sua primeira tarefa e comece a organizar seu dia." actionLabel="Criar primeira tarefa" onAction={create} />);
    expect(screen.getByText("Um novo começo merece um bom planejamento.")).toBeVisible();
    expect(screen.getByText("Adicione sua primeira tarefa e comece a organizar seu dia.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Criar primeira tarefa" }));
    expect(create).toHaveBeenCalledOnce();
  });

  it("keeps page artwork decorative and responsive without replacing the page heading", () => {
    const { container } = render(<PageHeader art="planning" title="Planejamento" subtitle="Organize seu dia." action={<button>Nova tarefa</button>} />);
    expect(screen.getByRole("heading", { level: 1, name: "Planejamento" })).toBeVisible();
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute("srcset", "/images/bloom-planning-400.webp 400w, /images/bloom-planning.webp 800w");
    expect(screen.getByRole("button", { name: "Nova tarefa" })).toBeVisible();
  });

  it("labels the actual slider thumb and supports keyboard progress changes", () => {
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    const change = vi.fn();
    render(<Slider aria-label="Progresso da meta" defaultValue={[50]} min={0} max={100} step={5} onValueChange={change} />);
    const slider = screen.getByRole("slider", { name: "Progresso da meta" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(change).toHaveBeenLastCalledWith([55]);
  });
});
