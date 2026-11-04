import type { ReactNode } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

/** Keep the confirmation open when a mutation fails so its error can be retried. */
export function ConfirmAction({ title, description, onConfirm, children, confirmLabel = "Excluir", destructive = true }: {
  title: string;
  description: string;
  onConfirm: () => boolean | void;
  children: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined} onClick={(event) => { if (onConfirm() === false) event.preventDefault(); }}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
