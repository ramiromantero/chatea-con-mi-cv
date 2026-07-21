/**
 * Base de conocimiento del CV de Ramiro Mantero.
 *
 * Construida a partir de `base_resume.json`, pero SOLO con datos aptos para
 * una página pública: acá no hay teléfono, ni fecha de nacimiento, ni
 * pretensiones salariales, ni notas internas.
 */

export const PROFILE = {
  nombre: "Ramiro Mantero",
  titulo: "Full Stack Developer · React/Next.js + Node/Python · IA aplicada",
  ubicacion: "Buenos Aires, Argentina",
  zonaHoraria: "ART (UTC-3)",
  email: "manteroramiro@gmail.com",
  github: "https://github.com/ramiromantero",
  githubLabel: "github.com/ramiromantero",
  repoDestacado: "https://github.com/ramiromantero/FCI-dashboard",
  linkedin: "https://linkedin.com/in/ramiro-mantero-319931186",
  linkedinLabel: "linkedin.com/in/ramiro-mantero",
  aniosExperiencia: 3,
  nacionalidad: "Argentino e italiano (ciudadanía UE)",
  autorizacionTrabajo:
    "Habilitado para trabajar en Argentina y en la Unión Europea sin necesidad de sponsorship",
  idiomas: [
    "Español (nativo)",
    "Inglés avanzado (FCE Cambridge) — fluidez en reuniones técnicas",
  ],
  modalidad: "Remoto o híbrido, con disponibilidad para solapar husos horarios de Europa y América",
} as const;

export interface ExperienceItem {
  empresa: string;
  rol: string;
  periodo: string;
  resumen: string;
  logros: string[];
  stack: string[];
}

export const EXPERIENCE: ExperienceItem[] = [
  {
    empresa: "MADIC (Independiente)",
    rol: "Desarrollador Full Stack",
    periodo: "2025 — Actualidad",
    resumen:
      "Desarrollo end-to-end de una plataforma financiera web en producción para un cliente real.",
    logros: [
      "Pipelines de importación y normalización de datos de brokers desde múltiples fuentes, estructurados en JSON y persistidos en PostgreSQL con Prisma ORM",
      "Frontend con Next.js 15 + TypeScript y visualización de datos en tiempo real con Recharts",
      "Generación automática de reportes PDF",
      "Suite de más de 1800 tests con Vitest, observabilidad con Sentry, rate limiting y arquitectura limpia por capas",
    ],
    stack: [
      "Next.js 15",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Prisma ORM",
      "Recharts",
      "Vitest",
      "Sentry",
    ],
  },
  {
    empresa: "EY",
    rol: "Technology Risk Assistant",
    periodo: "Noviembre 2025 — Actualidad",
    resumen:
      "Trabajo diario en una estructura corporativa multinacional, coordinando con equipos regionales y con reuniones técnicas en inglés.",
    logros: [
      "Extracción, validación y análisis de integridad de datos financieros desde sistemas ERP",
      "Reportes y dashboards de analítica (campañas DV360) para clientes de la región",
      "Auditorías ITGC sobre gestión de identidades y accesos; cumplimiento SOX e ISO 27001",
    ],
    stack: ["SQL", "ERP", "Dashboards de analítica", "DV360", "SOX", "ISO 27001"],
  },
  {
    empresa: "SHAKA",
    rol: "Analista E-Commerce",
    periodo: "Marzo 2025 — Octubre 2025",
    resumen: "Automatización de operaciones de e-commerce y análisis de ventas.",
    logros: [
      "Scripts en Python para automatización de stock y pedidos consumiendo la API REST de TiendaNube (datos JSON)",
      "Panel interno de análisis de ventas",
    ],
    stack: ["Python", "REST APIs", "JSON", "TiendaNube API"],
  },
  {
    empresa: "TDI SRL",
    rol: "Fullstack Developer Jr",
    periodo: "Mayo 2023 — Agosto 2024",
    resumen: "Desarrollo y mantenimiento de aplicaciones en producción.",
    logros: [
      "Aplicaciones en producción con Java, PHP y SQL",
      "Queries complejas para validación de grandes bases de datos",
      "Nexo técnico-funcional con áreas de negocio",
    ],
    stack: ["Java", "PHP", "SQL"],
  },
];

export interface ProjectItem {
  nombre: string;
  anio: string;
  descripcion: string;
  stack: string[];
}

export const PROJECTS: ProjectItem[] = [
  {
    nombre: "Dashboard FCI Argentina — Análisis de Fondos de Inversión",
    anio: "2025",
    descripcion:
      "Pipeline de datos en Python (Pandas) consumiendo la API de ArgentinaDatos: ingesta, transformación y estructuración JSON de grandes volúmenes; tablero interactivo con Dash + Plotly en producción (Render).",
    stack: ["Python", "Pandas", "Dash", "Plotly", "REST APIs", "Render"],
  },
  {
    nombre: "Automatizaciones con IA — Anthropic API + Claude Code",
    anio: "2025 — 2026",
    descripcion:
      "Integración de la API de Anthropic (Claude) en flujos propios y desarrollo de skills de Claude Code: pipelines de captura de pantallas a PDF y generación automática de wireframes en Figma a partir de apps web.",
    stack: ["Anthropic API", "Claude Code", "Python", "Automatización"],
  },
  {
    nombre: "BAZAAR — Plataforma E-Commerce Mobile (Proyecto Universitario)",
    anio: "2026",
    descripcion:
      "App multiplataforma con React Native + Expo; microservicios en Python + FastAPI, API Gateway en AWS con JWT, PostgreSQL + MongoDB, Docker y CI/CD con GitHub Actions.",
    stack: [
      "React Native",
      "Expo",
      "Python",
      "FastAPI",
      "AWS",
      "JWT",
      "PostgreSQL",
      "MongoDB",
      "Docker",
      "GitHub Actions",
    ],
  },
];

export interface EducationItem {
  titulo: string;
  institucion: string;
  periodo: string;
  detalles: string[];
}

export const EDUCATION: EducationItem[] = [
  {
    titulo: "Ingeniería Informática",
    institucion: "Universidad de Buenos Aires (FIUBA)",
    periodo: "2019 — 2026",
    detalles: [
      "Estudiante avanzado: tesis de grado defendida, finalizando la última materia",
      "Tesis: plataforma web escalable para detección temprana de trastornos infantiles (React, Node.js, PostgreSQL)",
      "Intercambio académico en la UPV (País Vasco, España)",
    ],
  },
  {
    titulo: "FCE — First Certificate in English",
    institucion: "Cambridge Assessment English",
    periodo: "2018",
    detalles: ["Inglés avanzado, fluidez en reuniones técnicas"],
  },
];

/** Skills agrupadas para respuestas y ficha técnica. */
export const SKILLS = {
  frontend: [
    "React",
    "Next.js 15",
    "TypeScript",
    "JavaScript",
    "Tailwind CSS",
    "Recharts",
    "React Native + Expo",
    "HTML",
    "CSS",
  ],
  backend: [
    "Node.js",
    "Express",
    "Python",
    "FastAPI",
    "PostgreSQL",
    "Prisma ORM",
    "Supabase",
    "MongoDB",
    "REST APIs",
    "JWT",
    "Microservicios",
  ],
  data: ["Pandas", "Plotly", "Dash", "ETL / automatización", "JSON", "SQL", "ReportLab"],
  ia: [
    "Anthropic API (Claude)",
    "Claude Code (skills y agentes)",
    "Integración de LLMs",
    "Prototipado asistido por IA",
  ],
  devops: ["Docker", "AWS", "GitHub Actions (CI/CD)", "Vitest", "Sentry"],
  seguridad: ["Auditoría ITGC", "IAM", "SOX", "ISO 27001", "JWT / OAuth", "Rate limiting"],
  otros: ["Java", "PHP"],
} as const;

/** Lista corta para la ficha técnica del panel lateral. */
export const STACK_PRINCIPAL = [
  "React / Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "PostgreSQL",
  "Anthropic API",
];
