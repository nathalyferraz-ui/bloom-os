import { useState } from "react";
import { FloralMark } from "@/components/ui/bloom";
import { cn } from "@/lib/utils";
import type { Book } from "@/types";

export function BookCover({ book, className }: { book: Book; className?: string }) {
  const [failedUrl, setFailedUrl] = useState("");
  return (
    <div
      className={cn(
        "relative flex aspect-[2/3] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dusty/70 bg-gradient-to-br from-blush via-cream to-dusty/80 p-4 text-center shadow-soft",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-2 rounded-lg border border-rose/20"
        aria-hidden="true"
      />
      <FloralMark className="mb-3 h-9 w-9 shrink-0 text-rose" />
      <p className="line-clamp-4 break-words font-display text-xl leading-snug text-plum">
        {book.title}
      </p>
      <p className="mt-3 line-clamp-2 break-words text-xs text-plum/80">
        {book.author || "Autor não informado"}
      </p>
      {book.coverUrl && failedUrl !== book.coverUrl && (
        <img
          src={book.coverUrl}
          alt=""
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          onError={() => setFailedUrl(book.coverUrl)}
          className="absolute inset-0 h-full w-full bg-cream object-cover"
        />
      )}
    </div>
  );
}
