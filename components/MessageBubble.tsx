"use client";

import type { Segment } from "@/lib/types";

interface Props {
  author: "user" | "assistant";
  segments: Segment[];
  time: string;
  /** Si el mensaje se está "streameando", muestra el cursor al final. */
  streaming?: boolean;
}

/**
 * Burbuja de mensaje. Renderiza los segmentos como texto plano o <a> reales
 * (nunca dangerouslySetInnerHTML). Bordes redondeados asimétricos según autor.
 */
export default function MessageBubble({ author, segments, time, streaming }: Props) {
  const isUser = author === "user";

  return (
    <div
      className={`flex animate-fade-in-up ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] ${
          isUser
            ? "rounded-2xl rounded-br-md bg-gradient-to-br from-acento-2 to-acento text-white shadow-lg shadow-acento/20"
            : "rounded-2xl rounded-bl-md border border-borde bg-panel text-tinta"
        }`}
      >
        <p className={streaming ? "stream-cursor" : undefined}>
          {segments.map((seg, i) =>
            seg.href ? (
              <a
                key={i}
                href={seg.href}
                target={seg.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className={`font-medium underline decoration-2 underline-offset-2 transition-colors ${
                  isUser
                    ? "text-white decoration-white/50 hover:decoration-white"
                    : "text-acento decoration-acento/40 hover:text-white hover:decoration-acento"
                }`}
              >
                {seg.text}
              </a>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )}
        </p>
        {time !== "" && (
          <p
            className={`mt-1.5 text-[10px] tabular-nums ${
              isUser ? "text-white/60" : "text-tinta-suave/70"
            }`}
          >
            {time}
          </p>
        )}
      </div>
    </div>
  );
}
