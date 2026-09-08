"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CATEGORIAS } from "@/lib/tienda/demo";

const OPCIONES = [{ nombre: "Todas las categorías", slug: "" }, ...CATEGORIAS];

export default function Buscador() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
  const etiquetaCat =
    seleccionada.slug === "" ? "Todo" : seleccionada.nombre;

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
        className="flex items-stretch overflow-hidden rounded-full border-2 border-verde/60 bg-white shadow-[0_0_24px_-6px_rgba(22,219,101,0.7)] focus-within:border-verde"
      >
        {/* Selector de categoría */}
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          className="flex shrink-0 items-center gap-1 border-r border-neutral-200 bg-neutral-100 px-2.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-200 sm:px-3 sm:text-sm"
        >
          <span className="max-w-[72px] truncate sm:max-w-[150px]">
            {etiquetaCat}
          </span>
          <svg
            viewBox="0 0 24 24"
            className={`h-3.5 w-3.5 shrink-0 transition-transform ${
              abierto ? "rotate-180" : ""
            }`}
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
          placeholder="Buscar perfumes, ropa, tenis…"
          className="min-w-0 flex-1 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />

        <button
          type="submit"
          aria-label="Buscar"
          className="grid shrink-0 place-items-center bg-verde px-3.5 text-[#04140c] transition-[filter] hover:brightness-105"
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </form>

      {/* Panel de categorías */}
      {abierto && (
        <ul className="absolute left-0 top-full z-50 mt-1.5 w-60 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 text-neutral-800 shadow-2xl">
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
                      ? "bg-verde/10 font-semibold text-neutral-900"
                      : "hover:bg-neutral-100"
                  }`}
                >
                  {o.nombre}
                  {activa && <span className="text-verde-oscuro">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
