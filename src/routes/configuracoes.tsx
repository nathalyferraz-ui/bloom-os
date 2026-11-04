import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useBloom } from "@/lib/store";
import { BloomCard, CardHeading, PageHeader } from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { dataActions, profileActions } from "@/hooks/use-bloom-actions";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Bloom OS" },
      { name: "description", content: "Personalize seu nome e gerencie seus dados locais." },
      { property: "og:title", content: "Configurações — Bloom OS" },
      { property: "og:description", content: "Personalize seu nome e gerencie seus dados locais." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const data = useBloom();
  const [name, setName] = useState("");
  const [first, setFirst] = useState(true);
  const profileName = data?.profile.name;
  const showFirstName = data?.profile.showFirstNameOnly;
  useEffect(() => {
    if (profileName !== undefined) setName(profileName);
    if (showFirstName !== undefined) setFirst(showFirstName);
  }, [profileName, showFirstName]);
  if (!data) return null;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Configurações" subtitle="Deixe o Bloom OS com a sua cara." />
      <div className="space-y-5">
        <BloomCard>
          <CardHeading title="Perfil" />
          <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); if (profileActions.save({ name: name.trim(), showFirstNameOnly: first })) toast.success("Alterações salvas"); }}>
            <div className="grid gap-1.5"><Label htmlFor="s-name">Seu nome</Label><Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="s-first">Exibir apenas o primeiro nome na saudação</Label>
              <Switch id="s-first" checked={first} onCheckedChange={setFirst} />
            </div>
            <Button type="submit" className="justify-self-start">Salvar</Button>
          </form>
        </BloomCard>
        <BloomCard>
          <CardHeading title="Dados" />
          <p className="mb-4 text-sm text-muted-foreground">Seus dados ficam salvos apenas neste navegador.</p>
          <div className="flex flex-wrap gap-3">
            <ConfirmAction title="Restaurar dados de exemplo?" description="Isso substitui os dados de todos os módulos pelos exemplos iniciais. Finanças, Estudos, Biblioteca e Bem-estar voltarão a ficar vazios." confirmLabel="Restaurar exemplos" onConfirm={() => { const saved = dataActions.resetDemo(); if (saved) toast.success("Dados de exemplo restaurados"); return saved; }}>
              <Button variant="outline">Restaurar exemplos</Button>
            </ConfirmAction>
            <ConfirmAction title="Limpar todos os dados?" description="Todos os registros de todos os módulos do Bloom OS serão apagados. Essa ação não pode ser desfeita." confirmLabel="Limpar dados" onConfirm={() => { const cleared = dataActions.clearAll(); if (cleared) toast("Dados apagados"); return cleared; }}>
              <Button variant="destructive">Limpar dados locais</Button>
            </ConfirmAction>
          </div>
        </BloomCard>
      </div>
    </div>
  );
}
