import { Toaster as Sonner } from "sonner";
import { CircleCheck, CircleX, Info } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      closeButton
      containerAriaLabel="Notificações do Bloom OS"
      mobileOffset={{ top: "max(1rem, env(safe-area-inset-top))", left: "1rem", right: "1rem", bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      icons={{ success: <CircleCheck className="h-4 w-4 text-rose" />, error: <CircleX className="h-4 w-4 text-destructive" />, info: <Info className="h-4 w-4 text-rose" /> }}
      style={{ "--normal-bg": "var(--card)", "--normal-border": "var(--border)", "--normal-text": "var(--plum)", "--border-radius": "16px" } as React.CSSProperties}
      toastOptions={{
        duration: 3500,
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-soft",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
