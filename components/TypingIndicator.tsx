"use client";

/** Indicador "escribiendo...": tres puntos con rebote desfasado. */
export default function TypingIndicator() {
  return (
    <div className="flex animate-fade-in-up justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-borde bg-panel px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-dot-bounce rounded-full bg-acento"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
        <span className="sr-only">Escribiendo...</span>
      </div>
    </div>
  );
}
