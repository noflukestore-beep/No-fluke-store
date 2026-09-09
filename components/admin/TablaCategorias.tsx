"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
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

  function toggle(c: Categoria) {
    iniciar(async () => {
      await alternarActivaCategoria(c.id, !c.activa);
      router.refresh();
    });
  }
  function borrar(c: Categoria) {
    if ((conteos[c.id] ?? 0) > 0) {
      alert(
        `"${c.nombre}" tiene ${conteos[c.id]} productos. Muévelos a otra categoría primero.`,
      );
      return;
    }
    if (!confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;
    iniciar(async () => {
      const r = await eliminarCategoria(c.id);
      if (!r.ok && r.error) alert(r.error);
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="bg-white/[0.03] text-left text-xs text-white/45">
          <tr>
            <th className="px-3 py-2.5 font-medium">Categoría</th>
            <th className="px-3 py-2.5 font-medium">Productos</th>
            <th className="px-3 py-2.5 font-medium">Orden</th>
            <th className="px-3 py-2.5 font-medium">Estado</th>
            <th className="px-3 py-2.5 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {categorias.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-10 text-center text-white/40">
                Todavía no hay categorías.
              </td>
            </tr>
          )}
          {categorias.map((c) => (
            <tr key={c.id} className="hover:bg-white/[0.02]">
              <td className="px-3 py-2.5">
                <span className="mr-2">{c.icono ?? "•"}</span>
                <span className="font-medium">{c.nombre}</span>
              </td>
              <td className="px-3 py-2.5 text-white/70">
                {conteos[c.id] ?? 0}
              </td>
              <td className="px-3 py-2.5 text-white/70">{c.orden}</td>
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
                <Link
                  href={`/admin/categorias/${c.id}`}
                  className="rounded-md px-2 py-1 text-verde hover:bg-white/5"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => borrar(c)}
                  disabled={pendiente}
                  className="ml-1 rounded-md px-2 py-1 text-white/40 hover:bg-white/5 hover:text-rose-400"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
