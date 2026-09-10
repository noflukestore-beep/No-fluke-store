"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  alternarActivaCategoria,
  eliminarCategoria,
} from "@/actions/categorias";
import type { Categoria } from "@/lib/firebase/tipos";

export default function TablaCategorias({
  categorias,
  conteos,
}: {
  categorias: Categoria[];
  conteos: Record<string, number>;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(c: Categoria) {
    iniciar(async () => {
      await alternarActivaCategoria(c.id, !c.activa);
      router.refresh();
    });
  }

  function borrar(c: Categoria) {
    setError(null);
    iniciar(async () => {
      const r = await eliminarCategoria(c.id);
      if (!r.ok) {
        setError(r.error ?? `No se pudo eliminar "${c.nombre}".`);
      }
      setConfirmando(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-white/[0.03] text-left text-xs text-white/45">
            <tr>
              <th className="px-3 py-2.5 font-medium">Categoría</th>
              <th className="px-3 py-2.5 font-medium">Productos</th>
              <th className="px-3 py-2.5 font-medium">Estado</th>
              <th className="px-3 py-2.5 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {categorias.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-10 text-center text-white/40"
                >
                  Todavía no hay categorías.
                </td>
              </tr>
            )}
            {categorias.map((c) => {
              const enUso = (conteos[c.id] ?? 0) > 0;
              return (
                <tr key={c.id} className="hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5">
                    <span className="mr-2">{c.icono ?? "•"}</span>
                    <span className="font-medium">{c.nombre}</span>
                  </td>
                  <td className="px-3 py-2.5 text-white/70">
                    {conteos[c.id] ?? 0}
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => toggle(c)}
                      disabled={pendiente}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                        c.activa
                          ? "bg-verde/15 text-verde"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {c.activa ? "Activa" : "Oculta"}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {confirmando === c.id ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xs text-white/60">
                          ¿Eliminar?
                        </span>
                        <button
                          type="button"
                          onClick={() => borrar(c)}
                          disabled={pendiente}
                          className="rounded-md bg-rose-500/90 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-60"
                        >
                          {pendiente ? "Eliminando…" : "Sí, eliminar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmando(null)}
                          disabled={pendiente}
                          className="rounded-md px-2 py-1 text-xs font-semibold text-white/60 hover:bg-white/5"
                        >
                          Cancelar
                        </button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center">
                        <Link
                          href={`/admin/categorias/${c.id}`}
                          className="rounded-md px-2 py-1 text-verde hover:bg-white/5"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setError(null);
                            if (enUso) {
                              setError(
                                `"${c.nombre}" tiene ${conteos[c.id]} producto(s). Muévelos a otra categoría antes de eliminarla.`,
                              );
                              return;
                            }
                            setConfirmando(c.id);
                          }}
                          disabled={pendiente}
                          title={
                            enUso
                              ? "Tiene productos asignados"
                              : "Eliminar categoría"
                          }
                          className={`ml-1 rounded-md px-2 py-1 font-medium ${
                            enUso
                              ? "text-white/25"
                              : "text-white/55 hover:bg-white/5 hover:text-rose-400"
                          }`}
                        >
                          Eliminar
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
