"use client";

import { PROFILE, STACK_PRINCIPAL } from "@/lib/knowledge";

/** Contenido de la ficha técnica (compartido entre desktop y mobile). */
function Ficha() {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-tinta-suave">
          Stack principal
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {STACK_PRINCIPAL.map((s) => (
            <span
              key={s}
              className="rounded-md border border-borde bg-panel-2 px-2 py-0.5 font-mono text-[11px] text-acento"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <dl className="space-y-2.5">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-widest text-tinta-suave">
            Experiencia
          </dt>
          <dd className="text-tinta">
            {PROFILE.aniosExperiencia} años construyendo software en producción
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-widest text-tinta-suave">
            Ubicación
          </dt>
          <dd className="text-tinta">
            {PROFILE.ubicacion} · {PROFILE.zonaHoraria}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-widest text-tinta-suave">
            Idiomas
          </dt>
          <dd className="text-tinta">
            {PROFILE.idiomas.map((idioma) => (
              <span key={idioma} className="block">
                {idioma}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-widest text-tinta-suave">
            Ciudadanía UE
          </dt>
          <dd className="text-tinta">
            Italiana — trabaja en la UE sin sponsorship
          </dd>
        </div>
      </dl>

      <div className="border-t border-borde pt-3">
        <a
          href={`mailto:${PROFILE.email}`}
          className="block truncate text-acento underline decoration-acento/40 underline-offset-2 transition-colors hover:text-white"
        >
          {PROFILE.email}
        </a>
      </div>
    </div>
  );
}

/**
 * Ficha técnica: panel lateral fijo en desktop, sección colapsable en mobile.
 */
export default function SidePanel() {
  return (
    <div className="lg:w-72 lg:shrink-0">
      {/* Mobile: colapsable */}
      <details className="group rounded-2xl border border-borde bg-panel p-4 lg:hidden">
        <summary className="cursor-pointer select-none list-none text-sm font-semibold text-tinta">
          <span className="mr-2 inline-block text-acento transition-transform group-open:rotate-90">
            ▸
          </span>
          Ficha técnica
        </summary>
        <div className="mt-4">
          <Ficha />
        </div>
      </details>

      {/* Desktop: panel fijo */}
      <div className="hidden rounded-2xl border border-borde bg-panel p-5 lg:block">
        <h2 className="mb-4 text-sm font-bold text-tinta">Ficha técnica</h2>
        <Ficha />
      </div>
    </div>
  );
}
