"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CategoriaNav } from "@/components/tienda/MarcoTienda";

function Lupa({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default function Buscador({
  categorias,
}: {
  categorias: CategoriaNav[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const OPCIONES = useMemo(
    () => [{ nombre: "Todas las categorías", slug: "" }, ...categorias],
    [categorias],
  );

  useEffect(() => {
    if (!abierto) return;
    const alClic = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", alClic);
    return () => document.removeEventListener("mousedown", alClic);
  }, [abierto]);

  const seleccionada = OPCIONES.find((o) => o.slug === cat) ?? OPCIONES[0];
  const etiquetaCat = seleccionada.slug === "" ? "Todo" : seleccionada.nombre;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (cat) params.set("cat", cat);
    const cadena = params.toString();
    router.push(cadena ? `/tienda/buscar?${cadena}` : "/tienda/buscar");
  }

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-xl min-w-0">
      <form
        onSubmit={enviar}
        className="flex items-center gap-2 rounded-full border-2 border-verde/70 bg-black/80 py-1.5 pl-1.5 pr-1.5 shadow-[0_0_26px_-6px_rgba(22,219,101,0.75)] backdrop-blur focus-within:border-verde"
      >
        {/* Selector de categoría */}
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          className="flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:text-sm"
        >
          <span className="max-w-[68px] truncate sm:max-w-[130px]">
            {etiquetaCat}
          </span>
          <svg
            viewBox="0 0 24 24"
            className={`h-3.5 w-3.5 shrink-0 transition-transform ${abierto ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="search"
          placeholder="Buscar perfumes, ropa, tenis, accesorios…"
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
        />

        <button
          type="submit"
          aria-label="Buscar"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-verde text-[#04140c] transition-[filter] hover:brightness-110"
        >
          <Lupa className="h-[18px] w-[18px]" />
        </button>
      </form>

      {/* Panel de categorías */}
      {abierto && (
        <ul className="absolute left-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-white/12 bg-[#0c130f] py-1 shadow-2xl">
          {OPCIONES.map((o) => {
            const activa = o.slug === cat;
            return (
              <li key={o.slug || "todas"}>
                <button
                  type="button"
                  onClick={() => {
                    setCat(o.slug);
                    setAbierto(false);
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-sm transition-colors ${
                    activa
                      ? "bg-verde/15 font-semibold text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {o.nombre}
                  {activa && <span className="text-verde">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
