"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { INITIAL_SUGGESTIONS, WELCOME_MESSAGE, answer } from "@/lib/engine";
import type { ChatMessage, EngineReply, Segment, Word } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import SuggestionChips from "./SuggestionChips";
import TypingIndicator from "./TypingIndicator";

/* ---------- Helpers de streaming palabra por palabra ---------- */

/** Aplana los segmentos en palabras, conservando el link de cada una. */
function toWords(segments: Segment[]): Word[] {
  const words: Word[] = [];
  for (const seg of segments) {
    for (const text of seg.text.split(/\s+/).filter(Boolean)) {
      words.push({ text, href: seg.href });
    }
  }
  return words;
}

/** Reagrupa las primeras `count` palabras en segmentos renderizables. */
function wordsToSegments(words: Word[], count: number): Segment[] {
  const out: Segment[] = [];
  for (const w of words.slice(0, count)) {
    const last = out.length > 0 ? out[out.length - 1] : null;
    // La puntuación se pega a la palabra anterior sin espacio.
    const glue = /^[.,;:!?)]/.test(w.text) ? "" : " ";
    if (last && last.href === w.href) {
      last.text += glue + w.text;
    } else {
      // El espacio entre segmentos queda en el segmento anterior,
      // para no meter espacios subrayados dentro de un link.
      if (last && glue !== "") last.text += glue;
      out.push({ text: w.text, href: w.href });
    }
  }
  return out;
}

function nowTime(): string {
  return new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Estado del mensaje del asistente mientras se "streamea". */
interface StreamState {
  words: Word[];
  shown: number;
  /** Segmentos originales, para el mensaje final (espaciado perfecto). */
  segments: Segment[];
  followUps: string[];
}

/* ---------- Componente principal ---------- */

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [stream, setStream] = useState<StreamState | null>(null);
  const [input, setInput] = useState("");

  const nextId = useRef(1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const busy = typing || stream !== null;

  /** Entrega una respuesta con delay de tipeo + streaming palabra por palabra. */
  const deliver = useCallback((reply: EngineReply) => {
    setSuggestions([]);
    setTyping(true);

    const words = toWords(reply.segments);
    // Delay proporcional al largo de la respuesta, con techo razonable.
    const delay = Math.min(500 + words.length * 15, 1800);

    timeoutRef.current = setTimeout(() => {
      setTyping(false);
      setStream({
        words,
        shown: 1,
        segments: reply.segments,
        followUps: reply.followUps,
      });
      intervalRef.current = setInterval(() => {
        setStream((prev) =>
          prev && prev.shown < prev.words.length
            ? { ...prev, shown: prev.shown + 1 }
            : prev
        );
      }, 32);
    }, delay);
  }, []);

  /** Cuando el streaming llega al final, commitea el mensaje completo. */
  useEffect(() => {
    if (!stream || stream.shown < stream.words.length) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setMessages((prev) => [
      ...prev,
      {
        id: nextId.current++,
        author: "assistant",
        segments: stream.segments,
        time: nowTime(),
      },
    ]);
    setSuggestions(stream.followUps);
    setStream(null);
    inputRef.current?.focus();
  }, [stream]);

  /**
   * Mensaje de bienvenida al montar (en cliente, para timestamps consistentes).
   * El cleanup limpia los timers pendientes, así el doble montaje de
   * StrictMode en dev no deja una entrega colgada ni duplica el mensaje.
   */
  useEffect(() => {
    deliver({
      intentId: "welcome",
      segments: WELCOME_MESSAGE,
      followUps: INITIAL_SUGGESTIONS,
    });
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [deliver]);

  /** Auto-scroll al fondo con cada novedad. */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing, stream]);

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (text === "" || busy) return;
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          author: "user",
          segments: [{ text }],
          time: nowTime(),
        },
      ]);
      setInput("");
      deliver(answer(text));
    },
    [busy, deliver]
  );

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-borde bg-panel/60 shadow-2xl shadow-black/40 backdrop-blur">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-borde bg-panel px-4 py-3.5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-acento-2 to-acento text-sm font-bold text-white ${
            busy ? "animate-glow-pulse" : ""
          }`}
        >
          RM
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold text-tinta">
            Ramiro · CV interactivo
          </h1>
          <p className="truncate text-xs text-tinta-suave">
            Preguntame lo que le preguntarías a mi CV
          </p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 rounded-full border border-borde bg-panel-2 px-2.5 py-1 text-[10px] text-tinta-suave">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {busy ? "escribiendo..." : "en línea"}
        </span>
      </header>

      {/* Mensajes */}
      <div className="chat-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            author={m.author}
            segments={m.segments}
            time={m.time}
          />
        ))}

        {typing && <TypingIndicator />}

        {stream && (
          <MessageBubble
            author="assistant"
            segments={wordsToSegments(stream.words, stream.shown)}
            time=""
            streaming
          />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Chips + input */}
      <div className="space-y-3 border-t border-borde bg-panel px-4 py-3.5">
        <SuggestionChips
          suggestions={suggestions}
          disabled={busy}
          onPick={send}
        />
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            disabled={busy}
            onChange={(e) => setInput(e.target.value)}
            placeholder={busy ? "El CV está escribiendo..." : "Escribí tu pregunta..."}
            aria-label="Tu pregunta para el CV"
            className="min-w-0 flex-1 rounded-xl border border-borde bg-grafito px-4 py-2.5 text-sm text-tinta placeholder:text-tinta-suave/60 outline-none transition-colors focus:border-acento/70 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy || input.trim() === ""}
            className="rounded-xl bg-gradient-to-br from-acento-2 to-acento px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-acento/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            Enviar
          </button>
        </form>
      </div>
    </section>
  );
}
