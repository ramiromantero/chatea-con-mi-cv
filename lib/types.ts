/** Un fragmento de texto de una respuesta. Si tiene `href`, se renderiza como link. */
export interface Segment {
  text: string;
  href?: string;
}

/** Respuesta que devuelve el motor para un input del usuario. */
export interface EngineReply {
  /** Id del intent que matcheó (o "fallback"). */
  intentId: string;
  /** La respuesta, en segmentos (texto plano + links). */
  segments: Segment[];
  /** Preguntas sugeridas para renovar los chips. */
  followUps: string[];
}

/** Un intent del motor: keywords que lo disparan + variantes de respuesta. */
export interface Intent {
  id: string;
  /** Keywords/sinónimos en español e inglés. Frases (con espacio) pesan más. */
  keywords: string[];
  /** Variantes de respuesta, para no repetir siempre la misma. */
  variants: Segment[][];
  followUps: string[];
}

/** Mensaje del chat en la UI. */
export interface ChatMessage {
  id: number;
  author: "user" | "assistant";
  segments: Segment[];
  /** Hora local formateada (HH:MM). */
  time: string;
}

/** Palabra individual para el efecto de streaming (conserva el link del segmento). */
export interface Word {
  text: string;
  href?: string;
}
