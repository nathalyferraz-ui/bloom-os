import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { clearAll, resetDemo, useBloom } from "@/lib/store";
import { BloomCard, CardHeading, PageHeader } from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { profileActions } from "@/hooks/use-bloom-actions";

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
  useEffect(() => { if (data) { setName(data.profile.name); setFirst(data.profile.showFirstNameOnly); } }, [data?.profile]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!data) return null;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Configurações" subtitle="Deixe o Bloom OS com a sua cara." />
      <div className="space-y-5">
        <BloomCard>
          <CardHeading title="Perfil" />
          <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); profileActions.save({ name: name.trim(), showFirstNameOnly: first }); toast.success("Alterações salvas"); }}>
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
            <Confirm title="Restaurar dados de exemplo?" desc="Isso substitui todos os seus dados atuais pelos exemplos iniciais." onConfirm={() => { resetDemo(); toast.success("Dados de exemplo restaurados"); }}>
              <Button variant="outline">Restaurar exemplos</Button>
            </Confirm>
            <Confirm title="Limpar todos os dados?" desc="Tarefas, hábitos, metas e diário serão apagados. Essa ação não pode ser desfeita." onConfirm={() => { clearAll(); toast("Dados apagados"); }}>
              <Button variant="destructive">Limpar dados locais</Button>
            </Confirm>
          </div>
        </BloomCard>
      </div>
    </div>
  );
}

function Confirm({ title, desc, onConfirm, children }: { title: string; desc: string; onConfirm: () => void; children: React.ReactNode }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl text-plum">{title}</AlertDialogTitle>
          <AlertDialogDescription>{desc}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
