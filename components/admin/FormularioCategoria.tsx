"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { guardarCategoria } from "@/actions/categorias";
import type { Categoria } from "@/lib/firebase/tipos";

const entrada =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-verde/60 focus:outline-none";

export default function FormularioCategoria({
  categoria,
}: {
  categoria?: Categoria;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState(categoria?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(categoria?.descripcion ?? "");
  const [activa, setActiva] = useState(categoria?.activa ?? true);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    iniciar(async () => {
      const r = await guardarCategoria({
        id: categoria?.id,
        nombre,
        descripcion,
        activa,
      });
      if (r.ok) {
        router.push("/admin/categorias");
        router.refresh();
      } else {
        setError(r.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <form onSubmit={enviar} className="max-w-lg space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-white/50">
            Nombre <span className="text-verde">*</span>
          </span>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Ej. Perfumes"
            className={entrada}
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-medium text-white/50">
            Descripción
          </span>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            className={`${entrada} resize-y`}
          />
        </label>

        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={activa}
            onChange={(e) => setActiva(e.target.checked)}
            className="h-4 w-4 accent-verde"
          />
          Activa (visible en la tienda)
        </label>
      </div>

      {error && (
        <p className="text-sm font-semibold text-rose-400">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-lg bg-verde px-5 py-2 text-sm font-bold text-[#04140c] hover:brightness-105 disabled:opacity-60"
        >
          {pendiente ? "Guardando…" : "Guardar categoría"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/categorias")}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
