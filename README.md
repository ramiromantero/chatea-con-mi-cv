# Chateá con mi CV

Un chat con estética de asistente de IA donde un recruiter puede hacerle preguntas al CV de **Ramiro Mantero** y recibir respuestas naturales: experiencia, stack, proyectos, visa para Europa, disponibilidad, lo que le preguntarías en una primera entrevista.

La gracia está en el motor: **acá no hay ningún LLM**. Todo corre 100% client-side con un motor de matching por keywords + scoring escrito a mano en TypeScript. Es una decisión de diseño deliberada: un **"RAG de juguete"** con **cero latencia, cero costo por token y cero backend** — el CV responde al instante, funciona sin conexión a ninguna API y se deploya como un sitio estático. La ironía de que un desarrollador que integra LLMs reales en producción publique un chat sin LLM es parte del chiste (preguntale al chat si es una IA de verdad).

## Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** estricto
- **Tailwind CSS 3.4**
- Sin backend, sin API routes, sin variables de entorno, sin dependencias extra

## Features

- 💬 Chat estilo asistente moderno: burbujas asimétricas, timestamps, auto-scroll, envío con Enter
- ⌨️ Indicador "escribiendo..." con delay proporcional al largo de la respuesta, y **streaming palabra por palabra** de la respuesta (con cursor)
- 🎯 **Chips de preguntas sugeridas** que se renuevan con los follow-ups de cada respuesta
- 🔗 Links reales (email, GitHub, LinkedIn) renderizados como `<a>` — nunca `dangerouslySetInnerHTML`
- 📋 **Ficha técnica**: panel lateral en desktop, sección colapsable en mobile
- 🥚 Easter egg si le preguntás si es una IA de verdad
- 🌑 Theme oscuro grafito con acento violeta/índigo, animaciones CSS y glow en el avatar mientras "escribe"
- 📱 Responsive (se ve bien de 375px a 1440px)

## Arquitectura del motor

```
lib/
  knowledge.ts   → base de conocimiento (datos públicos del CV)
  engine.ts      → intents, scoring, variantes, fallback
  types.ts       → tipos compartidos (Segment, Intent, EngineReply, ...)
```

### 1. Base de conocimiento (`lib/knowledge.ts`)

Datos estructurados del CV: experiencia (MADIC, EY, SHAKA, TDI), proyectos (Dashboard FCI, automatizaciones con la API de Anthropic, BAZAAR), educación (Ingeniería Informática en UBA/FIUBA, FCE de Cambridge), skills agrupadas, idiomas, ciudadanía UE y datos de contacto públicos. **Solo información apta para una página pública**: no hay teléfono, ni fecha de nacimiento, ni pretensiones salariales.

### 2. Motor de matching (`lib/engine.ts`)

El flujo de una pregunta:

1. **Normalización**: lowercase + eliminación de tildes (NFD + strip de diacríticos), para que "¿Cuántos AÑOS?" matchee igual que "cuantos anos".
2. **Scoring por intent**: cada *intent* (≈18: experiencia, React/frontend, Python/data, IA/LLMs, testing, seguridad, Europa/visa, idiomas, educación, proyectos, salario, contacto, disponibilidad, easter egg, etc.) tiene una lista de keywords y sinónimos en español e inglés.
   - Las **frases** (keywords con espacio, ej. `"sos una ia"`) suman **+3** si aparecen como substring — pesan más porque son más específicas.
   - Las **palabras sueltas** se matchean por **palabra completa** (word boundary, para que `"ey"` no matchee dentro de "hey") y suman 1.5 o 2 según su largo.
3. **Selección**: gana el intent con mayor puntaje. Si nadie supera el **umbral mínimo**, responde un *fallback* simpático que sugiere temas disponibles.
4. **Variantes**: cada intent tiene varias respuestas posibles y **rota entre ellas** (contador por intent), así repreguntar no devuelve exactamente lo mismo.
5. **Follow-ups**: cada respuesta trae preguntas sugeridas que renuevan los chips de la UI.

Las respuestas son arrays de **segmentos** `{ text, href? }`: el texto plano se renderiza como `<span>` y los segmentos con `href` como `<a>` reales (mailto, GitHub, LinkedIn). Cero HTML inyectado.

Casos especiales:

- **Salario**: responde con elegancia que los números se conversan en el proceso, con CTA de contacto.
- **Easter egg**: si le preguntás si es una IA de verdad, confiesa con humor cómo está hecho.

### 3. UI (`components/`)

| Componente | Rol |
|---|---|
| `ChatWindow.tsx` | Orquesta todo: estado de mensajes, delay de tipeo, streaming palabra por palabra (con cleanup de timers), auto-scroll y submit |
| `MessageBubble.tsx` | Burbuja de mensaje; renderiza segmentos y links |
| `TypingIndicator.tsx` | Tres puntos animados de "escribiendo..." |
| `SuggestionChips.tsx` | Chips clickeables de preguntas sugeridas |
| `SidePanel.tsx` | Ficha técnica (aside en desktop, `<details>` en mobile) |
| `Footer.tsx` | Créditos y links |

El streaming aplana la respuesta en palabras (cada una conserva su link), revela una por tick con `setInterval` y, al terminar, commitea el mensaje con los segmentos originales para un espaciado perfecto. Los timers se limpian en el cleanup del efecto.

## Correr localmente

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Deploy en Vercel

1. Subí el repo a GitHub.
2. En [vercel.com](https://vercel.com), **Import Project** → elegí el repo.
3. Deploy. No necesita ninguna configuración ni variable de entorno.

## Fuente de datos

Toda la información sale del CV real de Ramiro Mantero, curada a mano en `lib/knowledge.ts` con solo los datos públicos.

---

Hecho por Ramiro Mantero · [GitHub](https://github.com/ramiromantero) · [LinkedIn](https://linkedin.com/in/ramiro-mantero-319931186)
