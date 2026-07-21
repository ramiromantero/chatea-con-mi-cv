"use client";

interface Props {
  suggestions: string[];
  disabled: boolean;
  onPick: (question: string) => void;
}

/** Chips de preguntas sugeridas. Se renuevan con los follow-ups de cada respuesta. */
export default function SuggestionChips({ suggestions, disabled, onPick }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 animate-fade-in-up">
      {suggestions.map((q) => (
        <button
          key={q}
          type="button"
          disabled={disabled}
          onClick={() => onPick(q)}
          className="rounded-full border border-borde bg-panel-2 px-3.5 py-1.5 text-xs text-tinta-suave transition-all hover:-translate-y-0.5 hover:border-acento/60 hover:text-tinta hover:shadow-md hover:shadow-acento/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
