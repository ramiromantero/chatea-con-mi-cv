/**
 * Motor de respuestas de "Chateá con mi CV".
 *
 * No hay ningún LLM acá: es matching por keywords + scoring, 100% client-side.
 * - Se normaliza el input (lowercase, sin tildes).
 * - Cada intent tiene keywords/sinónimos en español e inglés. Las frases
 *   (keywords con espacios) pesan más que las palabras sueltas.
 * - Gana el intent con mayor puntaje por encima de un umbral mínimo;
 *   si nadie llega, responde un fallback que sugiere temas.
 * - Cada intent tiene varias variantes de respuesta y rota entre ellas
 *   para no repetir siempre lo mismo.
 */

import { EXPERIENCE, PROFILE, PROJECTS, SKILLS } from "./knowledge";
import type { EngineReply, Intent, Segment } from "./types";

/* ---------- Helpers de armado de respuestas ---------- */

/** Segmento de texto plano. */
const t = (text: string): Segment => ({ text });
/** Segmento con link. */
const a = (text: string, href: string): Segment => ({ text, href });

/* ---------- Normalización y scoring ---------- */

/** Lowercase + sin tildes/diacríticos, para matchear "años" con "anos", etc. */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Puntaje de un intent contra el input normalizado.
 * Frases: +3 por substring. Palabras: match por palabra completa
 * (word boundary, para que "ey" no matchee dentro de "hey").
 */
function scoreIntent(input: string, intent: Intent): number {
  let score = 0;
  for (const raw of intent.keywords) {
    const kw = normalize(raw);
    if (kw.includes(" ")) {
      if (input.includes(kw)) score += 3;
    } else {
      const re = new RegExp(`\\b${escapeRegExp(kw)}\\b`);
      if (re.test(input)) score += kw.length >= 6 ? 2 : 1.5;
    }
  }
  return score;
}

/** Umbral mínimo: por debajo de esto, fallback. */
const MIN_SCORE = 1.5;

/* ---------- Rotación de variantes (para no repetir) ---------- */

const variantCounter = new Map<string, number>();

function pickVariant(intent: Intent): Segment[] {
  const count = variantCounter.get(intent.id) ?? 0;
  variantCounter.set(intent.id, count + 1);
  return intent.variants[count % intent.variants.length];
}

/* ---------- Datos derivados de la base de conocimiento ---------- */

const madic = EXPERIENCE[0];
const stackFrontend = SKILLS.frontend.slice(0, 6).join(", ");
const stackBackend = SKILLS.backend.slice(0, 6).join(", ");

/* ---------- Intents ---------- */

const INTENTS: Intent[] = [
  // Easter egg primero: sus frases pesan más que las keywords sueltas de "ia".
  {
    id: "easter-egg",
    keywords: [
      "sos una ia",
      "sos un bot",
      "sos real",
      "eres una ia",
      "eres un bot",
      "ia de verdad",
      "de verdad",
      "are you an ai",
      "are you real",
      "como estas hecho",
      "como funcionas",
      "como funciona este chat",
      "que modelo",
      "que modelo usas",
      "chatgpt",
      "gpt",
      "openai",
      "usa un llm",
      "es un llm",
    ],
    variants: [
      [
        t(
          "Confesión total: no, no soy una IA de verdad. Soy un motor de matching por keywords con scoring, escrito a mano en TypeScript, corriendo 100% en tu navegador. Cero API de LLM, cero backend, cero costo por token. Ramiro lo hizo así a propósito: es un RAG de juguete con latencia nula. Lo irónico es que él sí integra LLMs reales (API de Anthropic, Claude Code) en producción — para eso preguntame por su trabajo con IA."
        ),
      ],
      [
        t(
          "Me descubriste: soy if/else con buena onda. Normalizo tu pregunta (minúsculas, sin tildes), la comparo contra listas de keywords, sumo puntajes y elijo la respuesta con mayor score. Todo client-side, sin ningún modelo detrás. El que sí trabaja con modelos de verdad es Ramiro: integra la API de Claude en producción y construye agentes con Claude Code. Podés ver el código de este chat en su "
        ),
        a("GitHub", PROFILE.github),
        t("."),
      ],
    ],
    followUps: [
      "¿Qué hace con IA/LLMs?",
      "¿Cómo lo contacto?",
      "¿Qué proyectos tiene?",
    ],
  },
  {
    id: "saludo",
    keywords: ["hola", "buenas", "buen dia", "buenos dias", "buenas tardes", "hello", "hi", "hey", "que tal"],
    variants: [
      [
        t(
          "¡Hola! Soy el CV interactivo de Ramiro Mantero: Full Stack Developer con 3 años de experiencia (React/Next.js, Node, Python) y foco en llevar integraciones de IA a producción. Preguntame lo que le preguntarías a él en una entrevista."
        ),
      ],
      [
        t(
          "¡Buenas! Acá el CV de Ramiro, listo para responder. Podés preguntarme por su experiencia, su stack, sus proyectos, o cosas prácticas como visa para Europa o disponibilidad."
        ),
      ],
    ],
    followUps: [
      "¿Qué experiencia tiene con React?",
      "¿Qué es MADIC?",
      "¿Puede trabajar en Europa?",
    ],
  },
  {
    id: "experiencia",
    keywords: [
      "experiencia",
      "anos de experiencia",
      "cuantos anos",
      "trayectoria",
      "recorrido",
      "background",
      "years",
      "experience",
      "carrera profesional",
      "donde trabajo",
      "donde trabaja",
      "trabajos",
      "empleos",
      "seniority",
    ],
    variants: [
      [
        t(
          `Ramiro tiene ${PROFILE.aniosExperiencia} años de experiencia construyendo software en producción. Hoy desarrolla MADIC, una plataforma financiera end-to-end para un cliente real (Next.js 15, PostgreSQL, 1800+ tests), y trabaja en EY como Technology Risk Assistant (datos financieros de ERP, auditorías ITGC, SOX/ISO 27001). Antes: automatización e-commerce en SHAKA (Python + API de TiendaNube) y desarrollo fullstack en TDI SRL (Java, PHP, SQL, 2023-2024).`
        ),
      ],
      [
        t(
          "Su recorrido en corto: TDI SRL (2023-2024, fullstack Jr con Java/PHP/SQL) → SHAKA (2025, automatización Python de e-commerce) → hoy en paralelo MADIC (plataforma financiera propia en producción, Next.js + TypeScript) y EY (Technology Risk, datos ERP y auditorías de accesos). Son 3 años de experiencia, con producto real en producción y ambiente corporativo multinacional a la vez."
        ),
      ],
    ],
    followUps: ["¿Qué es MADIC?", "¿Qué hace en EY?", "¿Qué stack maneja?"],
  },
  {
    id: "madic",
    keywords: [
      "madic",
      "plataforma financiera",
      "cliente real",
      "producto en produccion",
      "fintech",
    ],
    variants: [
      [
        t(
          `MADIC es su proyecto principal: una plataforma financiera web en producción para un cliente real, desarrollada end-to-end por él. Incluye pipelines de importación y normalización de datos de brokers (JSON → PostgreSQL con Prisma), frontend en Next.js 15 + TypeScript con visualización en tiempo real (Recharts), generación automática de reportes PDF, y una suite de más de 1800 tests con Vitest, con observabilidad en Sentry y rate limiting. No es un side project de portfolio: está en producción desde 2025.`
        ),
      ],
      [
        t(
          `Lo importante de MADIC: es software real con usuarios reales. Ramiro lo construyó solo, de punta a punta — modelado de datos, ingesta de múltiples brokers, API, frontend con dashboards en vivo y reportes PDF automáticos. Stack: ${madic.stack.join(", ")}. El detalle que más habla de cómo trabaja: 1800+ tests automatizados y monitoreo con Sentry en producción.`
        ),
      ],
    ],
    followUps: [
      "¿Qué experiencia tiene con testing?",
      "¿Qué hace con IA/LLMs?",
      "¿Qué otros proyectos tiene?",
    ],
  },
  {
    id: "react-frontend",
    keywords: [
      "con react",
      "en react",
      "with react",
      "usando react",
      "react",
      "nextjs",
      "next.js",
      "next",
      "frontend",
      "front end",
      "typescript",
      "javascript",
      "tailwind",
      "ui",
      "interfaz",
      "interfaces",
      "css",
      "recharts",
      "componentes",
    ],
    variants: [
      [
        t(
          `Con React trabaja a diario y en producción: el frontend completo de MADIC está hecho con Next.js 15 + TypeScript + Tailwind, incluyendo dashboards financieros en tiempo real con Recharts y generación de reportes. También construyó apps móviles con React Native + Expo (proyecto BAZAAR) y el frontend de su tesis (React + Node). Su stack frontend: ${stackFrontend}.`
        ),
      ],
      [
        t(
          "React y TypeScript son su terreno más fuerte del lado del cliente. Ejemplos concretos: interfaces de datos complejas en MADIC (visualización en vivo con Recharts, Next.js 15 con App Router), componentes tipados y reutilizables, testing con Vitest, y React Native + Expo para mobile. Este mismo chat que estás usando está hecho con Next.js + TypeScript + Tailwind."
        ),
      ],
    ],
    followUps: ["¿Qué es MADIC?", "¿Hace testing?", "¿Qué maneja de backend?"],
  },
  {
    id: "backend",
    keywords: [
      "backend",
      "back end",
      "node",
      "nodejs",
      "express",
      "apis",
      "api rest",
      "rest",
      "postgresql",
      "postgres",
      "sql",
      "base de datos",
      "bases de datos",
      "database",
      "prisma",
      "microservicios",
      "servidor",
      "mongodb",
    ],
    variants: [
      [
        t(
          `Del lado del servidor combina Node.js/Express y Python/FastAPI. En MADIC diseñó los pipelines de ingesta de datos de brokers y la persistencia en PostgreSQL con Prisma ORM; en BAZAAR armó microservicios con FastAPI detrás de un API Gateway en AWS con JWT, usando PostgreSQL y MongoDB. Sabe SQL en serio: en EY y TDI validó integridad de grandes bases con queries complejas. Stack backend: ${stackBackend}.`
        ),
      ],
      [
        t(
          "Backend con dos lenguajes según el problema: Node.js + Express para APIs que conviven con frontends TypeScript, y Python + FastAPI para microservicios y procesamiento de datos. PostgreSQL como base principal (con Prisma ORM en producción), MongoDB donde aplica, JWT/OAuth para auth, Docker y CI/CD con GitHub Actions para deployar."
        ),
      ],
    ],
    followUps: [
      "¿Qué experiencia tiene con Python?",
      "¿Qué es BAZAAR?",
      "¿Usa Docker y CI/CD?",
    ],
  },
  {
    id: "python-data",
    keywords: [
      "con python",
      "en python",
      "with python",
      "usando python",
      "python",
      "pandas",
      "datos",
      "data",
      "etl",
      "pipelines",
      "pipeline",
      "fastapi",
      "automatizacion",
      "automatizaciones",
      "scripts",
      "dash",
      "plotly",
      "scraping",
      "data engineer",
    ],
    variants: [
      [
        t(
          "Python es su herramienta para datos y automatización: construyó el Dashboard FCI (pipeline con Pandas sobre la API de ArgentinaDatos + tablero Dash/Plotly en producción en Render), automatizó stock y pedidos en SHAKA consumiendo la API REST de TiendaNube, y desarrolla microservicios con FastAPI. En EY trabaja a diario con extracción y validación de datos financieros desde sistemas ERP. El código del dashboard es público: "
        ),
        a("FCI-dashboard en GitHub", PROFILE.repoDestacado),
        t("."),
      ],
      [
        t(
          "Tres años usando Python para que las cosas se hagan solas: ETL de datos financieros (Pandas, JSON, PostgreSQL), tableros interactivos con Dash + Plotly, APIs con FastAPI y scripts de automatización de e-commerce. Su repo público más completo es el "
        ),
        a("Dashboard FCI Argentina", PROFILE.repoDestacado),
        t(", un pipeline + dashboard de fondos de inversión que corre en producción."),
      ],
    ],
    followUps: [
      "¿Qué hace con IA/LLMs?",
      "¿Qué hace en EY?",
      "¿Qué proyectos públicos tiene?",
    ],
  },
  {
    id: "ia-llm",
    keywords: [
      "con ia",
      "con llms",
      "con claude",
      "ia",
      "ai",
      "llm",
      "llms",
      "claude",
      "anthropic",
      "inteligencia artificial",
      "agentes",
      "agents",
      "prompt",
      "prompting",
      "claude code",
      "generativa",
      "machine learning",
      "copilot",
      "automatizacion con ia",
    ],
    variants: [
      [
        t(
          "Su diferencial con IA no es entrenar modelos: es llevar integraciones de LLM a producción y que sobrevivan. Integra la API de Anthropic (Claude) en flujos de trabajo reales y desarrolla skills y agentes propios sobre Claude Code — por ejemplo, un pipeline de captura de pantallas a PDF y un generador automático de wireframes en Figma a partir de apps web. Todo con lo que una integración necesita para vivir en producción: monitoreo (Sentry), rate limiting, versionado y tests."
        ),
      ],
      [
        t(
          "Trabaja del lado de la integración: API de Anthropic en producción, agentes y skills custom de Claude Code que automatizan procesos de punta a punta, y prototipado asistido por IA como parte de su flujo diario. Dato de color: este chat NO usa un LLM — es un motor de keywords hecho a mano, decisión deliberada para que el CV responda con cero latencia y cero costo. La ironía le pareció divertida."
        ),
      ],
    ],
    followUps: [
      "¿Sos una IA de verdad?",
      "¿Qué proyectos tiene?",
      "¿Qué experiencia tiene con Python?",
    ],
  },
  {
    id: "testing",
    keywords: [
      "testing",
      "tests",
      "test",
      "vitest",
      "tdd",
      "calidad",
      "quality",
      "qa",
      "coverage",
      "sentry",
      "observabilidad",
      "monitoreo",
      "buenas practicas",
    ],
    variants: [
      [
        t(
          "El testing no es un checkbox para él: MADIC tiene una suite de más de 1800 tests con Vitest, corriendo en CI con GitHub Actions. A eso le suma observabilidad con Sentry en producción, rate limiting y una arquitectura limpia por capas que hace que los tests sean posibles. Es la parte del CV que más le gusta mostrar."
        ),
      ],
      [
        t(
          "Números concretos: 1800+ tests automatizados (Vitest) sobre una plataforma financiera en producción, con monitoreo de errores vía Sentry y CI/CD en GitHub Actions. Su postura: si el código mueve datos financieros de un cliente real, se testea — no hay debate."
        ),
      ],
    ],
    followUps: ["¿Qué es MADIC?", "¿Usa Docker y CI/CD?", "¿Qué stack maneja?"],
  },
  {
    id: "devops",
    keywords: [
      "docker",
      "aws",
      "cloud",
      "ci",
      "cd",
      "ci/cd",
      "deploy",
      "deployment",
      "devops",
      "infraestructura",
      "github actions",
      "vercel",
      "render",
    ],
    variants: [
      [
        t(
          "Maneja el ciclo completo hasta producción: Docker para contenerizar, AWS (API Gateway, servicios administrados) en BAZAAR, GitHub Actions para CI/CD, y despliegues reales en Render (Dashboard FCI) y plataformas tipo Vercel. Más lo que producción exige: Sentry para observabilidad, rate limiting y gestión de secretos."
        ),
      ],
      [
        t(
          "No se queda en el localhost: sus proyectos están deployados y monitoreados. Docker + GitHub Actions como base de CI/CD, AWS con JWT en el API Gateway de BAZAAR, el dashboard de FCI corriendo en Render, y Sentry vigilando MADIC en producción."
        ),
      ],
    ],
    followUps: ["¿Qué es BAZAAR?", "¿Hace testing?", "¿Qué maneja de backend?"],
  },
  {
    id: "seguridad",
    keywords: [
      "seguridad",
      "security",
      "iam",
      "sox",
      "iso",
      "iso 27001",
      "compliance",
      "auditoria",
      "auditorias",
      "itgc",
      "accesos",
      "identidades",
      "jwt",
      "oauth",
      "ey",
      "ernst",
      "riesgos",
    ],
    variants: [
      [
        t(
          "Tiene un perfil poco común: seguridad desde los dos lados. En EY (Technology Risk) ejecuta auditorías ITGC sobre gestión de identidades y accesos, con cumplimiento SOX e ISO 27001, y valida integridad de datos financieros desde sistemas ERP. Y como developer implementa esa seguridad en código: autenticación y autorización con JWT/OAuth, rate limiting, gestión de secretos y hardening de APIs en producción."
        ),
      ],
      [
        t(
          "En EY trabaja como Technology Risk Assistant desde fines de 2025: auditorías de controles de accesos (ITGC), marcos SOX e ISO 27001, análisis de datos de ERP y dashboards para clientes de la región, coordinando con equipos regionales en inglés. Sabe dónde se rompe un control — y del lado del código, cómo prevenirlo con JWT, OAuth y rate limiting."
        ),
      ],
    ],
    followUps: [
      "¿Qué experiencia tiene?",
      "¿Habla inglés?",
      "¿Qué stack maneja?",
    ],
  },
  {
    id: "europa-visa",
    keywords: [
      "europa",
      "europe",
      "visa",
      "sponsorship",
      "sponsor",
      "ciudadania",
      "italiana",
      "italiano",
      "ue",
      "eu",
      "union europea",
      "work permit",
      "permiso de trabajo",
      "autorizacion de trabajo",
      "relocate",
      "relocacion",
      "espana",
      "work authorization",
    ],
    variants: [
      [
        t(
          "Sí, y sin fricción: Ramiro tiene ciudadanía italiana, así que está habilitado para trabajar en cualquier país de la Unión Europea sin necesidad de visa ni sponsorship. También está habilitado en Argentina, donde vive (zona horaria UTC-3, cómoda para solapar con horarios europeos por la mañana y con América todo el día)."
        ),
      ],
      [
        t(
          "Respuesta corta: sí. Es ciudadano argentino e italiano — pasaporte de la UE — por lo que puede firmar contrato en Europa sin sponsorship ni trámites de visa. Trabaja desde Buenos Aires (UTC-3) con disponibilidad para solapar husos horarios europeos, y su inglés es avanzado (FCE), con fluidez en reuniones técnicas."
        ),
      ],
    ],
    followUps: ["¿Habla inglés?", "¿Trabaja remoto?", "¿Cómo lo contacto?"],
  },
  {
    id: "remoto-ubicacion",
    keywords: [
      "remoto",
      "remote",
      "hibrido",
      "ubicacion",
      "donde vive",
      "donde esta",
      "location",
      "zona horaria",
      "timezone",
      "huso horario",
      "argentina",
      "buenos aires",
      "presencial",
      "oficina",
    ],
    variants: [
      [
        t(
          `Vive en ${PROFILE.ubicacion}, zona horaria ${PROFILE.zonaHoraria}. Busca trabajo remoto o híbrido, y tiene experiencia real trabajando distribuido: en EY coordina a diario con equipos regionales de varios países. UTC-3 solapa bien tanto con América como con las tardes de Europa.`
        ),
      ],
      [
        t(
          "Base: Buenos Aires, Argentina (UTC-3). Modalidad preferida: remoto o híbrido. Para equipos de Europa, su franja horaria coincide con la tarde europea; para América, el solapamiento es total. Y si el rol es en la UE, su ciudadanía italiana elimina el tema visa."
        ),
      ],
    ],
    followUps: [
      "¿Puede trabajar en Europa?",
      "¿Cuándo puede empezar?",
      "¿Habla inglés?",
    ],
  },
  {
    id: "idiomas",
    keywords: [
      "ingles",
      "english",
      "idioma",
      "idiomas",
      "languages",
      "fce",
      "cambridge",
      "bilingue",
      "habla ingles",
      "nivel de ingles",
    ],
    variants: [
      [
        t(
          "Español nativo e inglés avanzado, certificado con el FCE de Cambridge. No es solo el papel: en EY sostiene reuniones técnicas en inglés con equipos regionales e interlocutores internacionales como parte de su día a día."
        ),
      ],
      [
        t(
          "Inglés avanzado (First Certificate de Cambridge) con uso profesional real: reuniones técnicas, documentación y coordinación con equipos internacionales en EY. Español nativo, obviamente — este chat te está hablando en rioplatense."
        ),
      ],
    ],
    followUps: [
      "¿Puede trabajar en Europa?",
      "¿Dónde estudió?",
      "¿Qué experiencia tiene?",
    ],
  },
  {
    id: "educacion",
    keywords: [
      "educacion",
      "estudios",
      "universidad",
      "uba",
      "fiuba",
      "tesis",
      "carrera",
      "titulo",
      "degree",
      "ingenieria",
      "recibido",
      "graduado",
      "intercambio",
      "upv",
      "estudio",
      "formacion",
    ],
    variants: [
      [
        t(
          "Estudia Ingeniería Informática en la Universidad de Buenos Aires (FIUBA), donde ya defendió su tesis de grado — una plataforma web escalable para detección temprana de trastornos infantiles (React, Node.js, PostgreSQL) — y está finalizando la última materia. Hizo un intercambio académico en la UPV (País Vasco, España) y tiene el FCE de Cambridge en inglés."
        ),
      ],
      [
        t(
          "Formación: Ingeniería Informática en la UBA (FIUBA, 2019-2026), con tesis defendida y una sola materia pendiente. La tesis no fue teórica: construyó una plataforma web real de detección temprana de trastornos infantiles con React, Node y PostgreSQL. Bonus: un semestre de intercambio en la UPV, en el País Vasco."
        ),
      ],
    ],
    followUps: [
      "¿Qué experiencia tiene?",
      "¿Habla inglés?",
      "¿Qué proyectos tiene?",
    ],
  },
  {
    id: "proyectos",
    keywords: [
      "proyectos",
      "proyecto",
      "portfolio",
      "github",
      "repos",
      "repositorio",
      "side projects",
      "codigo",
      "fci",
      "bazaar",
      "dashboard",
      "que construyo",
      "que hizo",
      "open source",
    ],
    variants: [
      [
        t(`Tres para destacar: (1) ${PROJECTS[0].nombre}: `),
        a("repo público en GitHub", PROFILE.repoDestacado),
        t(
          `, pipeline Pandas + tablero Dash/Plotly en producción. (2) ${PROJECTS[1].nombre}: skills de Claude Code y flujos con la API de Anthropic. (3) BAZAAR: e-commerce mobile con React Native + Expo, microservicios FastAPI, AWS y CI/CD. Y el proyecto madre es MADIC, la plataforma financiera en producción. Más en su `
        ),
        a("GitHub", PROFILE.github),
        t("."),
      ],
      [
        t(
          "Su GitHub tiene más de mil contribuciones en el último año. Lo más visible: el "
        ),
        a("Dashboard FCI Argentina", PROFILE.repoDestacado),
        t(
          " (análisis de fondos de inversión, Python + Dash, deployado en Render), las automatizaciones con la API de Anthropic y Claude Code (wireframes automáticos en Figma, pipelines de screenshots a PDF), y BAZAAR, una plataforma e-commerce mobile universitaria con arquitectura de microservicios. Su trabajo comercial más grande (MADIC) es de un cliente, por eso el repo es privado."
        ),
      ],
    ],
    followUps: ["¿Qué es MADIC?", "¿Qué hace con IA/LLMs?", "¿Cómo lo contacto?"],
  },
  {
    id: "mobile",
    keywords: [
      "mobile",
      "movil",
      "react native",
      "expo",
      "app movil",
      "android",
      "ios",
      "celular",
    ],
    variants: [
      [
        t(
          "Sí, hizo mobile: BAZAAR es una plataforma e-commerce multiplataforma construida con React Native + Expo, respaldada por microservicios en Python + FastAPI, API Gateway en AWS con JWT, PostgreSQL + MongoDB y CI/CD con GitHub Actions. Al venir de React web, el salto a React Native le resultó natural."
        ),
      ],
      [
        t(
          "Su experiencia mobile viene por React Native + Expo (proyecto BAZAAR, e-commerce multiplataforma con backend de microservicios propio). No es su foco principal — su día a día es web con Next.js — pero el stack React se lo lleva puesto a mobile sin fricción."
        ),
      ],
    ],
    followUps: [
      "¿Qué experiencia tiene con React?",
      "¿Qué maneja de backend?",
      "¿Qué otros proyectos tiene?",
    ],
  },
  {
    id: "salario",
    keywords: [
      "salario",
      "sueldo",
      "salary",
      "pretension",
      "pretensiones",
      "compensacion",
      "cuanto cobra",
      "cuanto cobras",
      "cuanto pide",
      "cuanto gana",
      "remuneracion",
      "rate",
      "honorarios",
      "expectativa salarial",
      "banda salarial",
      "pagar",
      "presupuesto",
    ],
    variants: [
      [
        t(
          "Buena pregunta, pero esa conversación la tiene Ramiro en persona: la expectativa depende del rol, la modalidad y el alcance, y merece algo mejor que un número suelto en un chat. Lo que sí te adelanto: es flexible y razonable. Escribile a "
        ),
        a(PROFILE.email, `mailto:${PROFILE.email}`),
        t(" o por "),
        a("LinkedIn", PROFILE.linkedin),
        t(" y lo resuelven en una llamada."),
      ],
      [
        t(
          "Ese dato no vive en este chat — los números se conversan en el proceso, con el contexto completo del rol sobre la mesa. Si tenés una búsqueda concreta, mandale el rango y la descripción a "
        ),
        a(PROFILE.email, `mailto:${PROFILE.email}`),
        t(": responde rápido y sin vueltas."),
      ],
    ],
    followUps: [
      "¿Cómo lo contacto?",
      "¿Cuándo puede empezar?",
      "¿Trabaja remoto?",
    ],
  },
  {
    id: "disponibilidad",
    keywords: [
      "disponibilidad",
      "disponible",
      "cuando puede empezar",
      "cuando empieza",
      "empezar",
      "incorporacion",
      "start date",
      "notice",
      "preaviso",
      "arrancar",
      "inicio",
    ],
    variants: [
      [
        t(
          "Disponibilidad inmediata para iniciar un proceso, y busca roles junior/semi-senior en modalidad remota o híbrida. Si el proceso avanza, los tiempos concretos de incorporación se coordinan directamente con él — lo más rápido es escribirle a "
        ),
        a(PROFILE.email, `mailto:${PROFILE.email}`),
        t("."),
      ],
      [
        t(
          "Está en búsqueda activa: puede sumarse a un proceso de selección de inmediato. Para coordinar entrevistas, contactalo por "
        ),
        a("LinkedIn", PROFILE.linkedin),
        t(" o al mail "),
        a(PROFILE.email, `mailto:${PROFILE.email}`),
        t(" — la zona horaria es ART (UTC-3)."),
      ],
    ],
    followUps: ["¿Cómo lo contacto?", "¿Trabaja remoto?", "¿Puede trabajar en Europa?"],
  },
  {
    id: "contacto",
    keywords: [
      "contacto",
      "contactar",
      "contact",
      "email",
      "mail",
      "correo",
      "linkedin",
      "entrevista",
      "entrevistar",
      "contratar",
      "hire",
      "hiring",
      "reunion",
      "llamada",
      "cv completo",
      "curriculum",
      "resume",
      "hablar con el",
    ],
    variants: [
      [
        t("Directo al grano: su mail es "),
        a(PROFILE.email, `mailto:${PROFILE.email}`),
        t(", su LinkedIn es "),
        a(PROFILE.linkedinLabel, PROFILE.linkedin),
        t(" y su código está en "),
        a(PROFILE.githubLabel, PROFILE.github),
        t(". Responde rápido — está en búsqueda activa."),
      ],
      [
        t("Tenés tres puertas: "),
        a("email", `mailto:${PROFILE.email}`),
        t(" (la más rápida), "),
        a("LinkedIn", PROFILE.linkedin),
        t(" para lo formal, y "),
        a("GitHub", PROFILE.github),
        t(
          " si primero querés ver código. Vive en Buenos Aires (UTC-3) y tiene disponibilidad inmediata para entrevistas."
        ),
      ],
    ],
    followUps: [
      "¿Cuándo puede empezar?",
      "¿Qué proyectos tiene?",
      "¿Puede trabajar en Europa?",
    ],
  },
];

/* ---------- Fallback ---------- */

const FALLBACK_VARIANTS: Segment[][] = [
  [
    t(
      "Mmm, esa no la tengo en mi base de conocimiento (soy un motor de keywords, no un oráculo). Probá preguntarme por su experiencia, React, Python, IA/LLMs, testing, educación, Europa/visa o cómo contactarlo. Y si tu pregunta era importante, escribile directo a "
    ),
    a(PROFILE.email, `mailto:${PROFILE.email}`),
    t(" — él sí entiende todo."),
  ],
  [
    t(
      "No encontré con qué matchear eso — mis límites son los de un CV, no los de una IA de verdad. Los temas donde brillo: MADIC, su stack (React/Next, Node, Python), proyectos con Claude, seguridad/compliance, idiomas y disponibilidad. ¿Te tiento con alguno?"
    ),
  ],
  [
    t(
      "Esa pregunta me superó — y lo admito sin vergüenza porque soy if/else con estilo. Reformulala o elegí un chip de abajo: experiencia, proyectos, IA, Europa, contacto... De todo eso sé bastante."
    ),
  ],
];

const FALLBACK_FOLLOWUPS = [
  "¿Qué experiencia tiene con React?",
  "¿Qué hace con IA/LLMs?",
  "¿Puede trabajar en Europa?",
  "¿Cómo lo contacto?",
];

let fallbackCount = 0;

/* ---------- API pública del motor ---------- */

/** Preguntas sugeridas para el arranque del chat. */
export const INITIAL_SUGGESTIONS = [
  "¿Qué experiencia tiene con React?",
  "¿Puede trabajar en Europa?",
  "¿Qué es MADIC?",
  "¿Qué hace con IA/LLMs?",
  "¿Sos una IA de verdad?",
];

/** Mensaje de bienvenida del asistente. */
export const WELCOME_MESSAGE: Segment[] = [
  t(
    `¡Hola! Soy el CV interactivo de ${PROFILE.nombre} — Full Stack Developer (React/Next.js + Node/Python) con ${PROFILE.aniosExperiencia} años de experiencia y foco en llevar IA a producción. Preguntame lo que le preguntarías a él: experiencia, stack, proyectos, visa para Europa, lo que sea. Los chips de abajo son un buen punto de partida.`
  ),
];

/**
 * Responde a un input del usuario: normaliza, puntúa todos los intents
 * y devuelve la mejor respuesta (o el fallback si nadie supera el umbral).
 */
export function answer(rawInput: string): EngineReply {
  const input = normalize(rawInput);

  let best: Intent | null = null;
  let bestScore = 0;

  for (const intent of INTENTS) {
    const score = scoreIntent(input, intent);
    // Empate: gana el primero de la lista (orden = prioridad).
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }

  if (!best || bestScore < MIN_SCORE) {
    const segments = FALLBACK_VARIANTS[fallbackCount % FALLBACK_VARIANTS.length];
    fallbackCount += 1;
    return { intentId: "fallback", segments, followUps: FALLBACK_FOLLOWUPS };
  }

  return {
    intentId: best.id,
    segments: pickVariant(best),
    followUps: best.followUps,
  };
}
