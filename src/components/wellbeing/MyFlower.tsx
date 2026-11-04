import { BloomCard, CardHeading } from "@/components/ui/bloom";

export function MyFlower({ stage, days }: { stage: "bud" | "opening" | "open"; days: number }) {
  const label =
    stage === "open"
      ? "Flor desabrochada"
      : stage === "opening"
        ? "Flor se abrindo"
        : "Botão floral";
  return (
    <BloomCard className="relative overflow-hidden">
      <CardHeading title="Minha Flor" />
      <div className="mx-auto grid h-52 w-52 place-items-center rounded-full bg-blush/40">
        <svg
          viewBox="0 0 200 200"
          className="h-48 w-48"
          role="img"
          aria-label={`${label}. ${days} dias com autocuidado nesta semana.`}
        >
          <path
            d="M100 170V92M100 145Q65 145 62 118Q93 119 100 145M100 155Q134 153 138 129Q109 130 100 155"
            fill="var(--dusty)"
            stroke="var(--rose)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {stage === "open" ? (
            <g fill="var(--blush)" stroke="var(--rose)" strokeWidth="1.3">
              {[0, 60, 120, 180, 240, 300].map((rotation) => (
                <ellipse
                  key={rotation}
                  cx="100"
                  cy="63"
                  rx="18"
                  ry="35"
                  transform={`rotate(${rotation} 100 88)`}
                />
              ))}
              <circle cx="100" cy="88" r="14" fill="var(--champagne)" />
              <circle cx="100" cy="88" r="6" fill="var(--cream)" />
            </g>
          ) : stage === "opening" ? (
            <g fill="var(--blush)" stroke="var(--rose)" strokeWidth="1.5">
              <path d="M100 109Q58 91 64 57Q97 62 100 109Z" />
              <path d="M100 109Q141 91 136 57Q104 62 100 109Z" />
              <path d="M100 109Q78 64 100 38Q122 64 100 109Z" fill="var(--dusty)" />
            </g>
          ) : (
            <g fill="var(--dusty)" stroke="var(--rose)" strokeWidth="1.5">
              <path d="M100 111Q66 83 100 43Q134 83 100 111Z" />
              <path d="M100 111Q88 78 100 43" fill="none" />
            </g>
          )}
        </svg>
      </div>
      <p className="mt-4 text-center font-display text-xl text-plum">{label}</p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {days} {days === 1 ? "dia com autocuidado registrado" : "dias com autocuidado registrado"}{" "}
        nesta semana.
      </p>
      <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
        Um símbolo carinhoso da sua constância, sem cobrança. Seu ritmo tem espaço aqui.
      </p>
      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="cursor-pointer text-center underline underline-offset-4">
          Como a flor se transforma
        </summary>
        <p className="mt-2 leading-relaxed">
          De segunda a domingo: 0–1 dia com atividades, botão; 2–4 dias, flor se abrindo; 5–7 dias,
          flor desabrochada. É uma representação lúdica, sem avaliar sua saúde ou seu valor pessoal.
        </p>
      </details>
    </BloomCard>
  );
}
