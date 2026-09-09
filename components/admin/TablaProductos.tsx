"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { alternarActivo, eliminarProducto } from "@/actions/productos";
import type { Producto } from "@/lib/firebase/tipos";
import { formatearRDCorto, precioEfectivo } from "@/lib/precios";

export default function TablaProductos({
  productos,
}: {
  productos: Producto[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [pendiente, iniciar] = useTransition();

  const lista = productos.filter((p) => {
    const t = `${p.nombre} ${p.marca} ${p.sku ?? ""} ${p.categoriaNombre}`.toLowerCase();
    return t.includes(q.trim().toLowerCase());
  });

  function toggle(p: Producto) {
    iniciar(async () => {
      await alternarActivo(p.id, !p.activo);
      router.refresh();
    });
  }
  function borrar(p: Producto) {
    if (!confirm(`¿Eliminar "${p.nombre}"? No se puede deshacer.`)) return;
    iniciar(async () => {
      await eliminarProducto(p.id);
      router.refresh();
    });
  }

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nombre, marca, SKU…"
        className="mb-3 w-full max-w-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-verde/60 focus:outline-none"
      />

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-white/[0.03] text-left text-xs text-white/45">
            <tr>
              <th className="px-3 py-2.5 font-medium">Producto</th>
              <th className="px-3 py-2.5 font-medium">Categoría</th>
              <th className="px-3 py-2.5 font-medium">Precio</th>
              <th className="px-3 py-2.5 font-medium">Stock</th>
              <th className="px-3 py-2.5 font-medium">Estado</th>
              <th className="px-3 py-2.5 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {lista.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-white/40">
                  {productos.length === 0
                    ? "Todavía no hay productos."
                    : "Nada coincide con la búsqueda."}
                </td>
              </tr>
            )}
            {lista.map((p) => {
              const { valor, tipo } = precioEfectivo(p, 1);
              return (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5">
                    <p className="font-medium">{p.nombre}</p>
                    <p className="text-xs text-white/40">{p.marca || "—"}</p>
                  </td>
                  <td className="px-3 py-2.5 text-white/70">
                    {p.categoriaNombre || "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-semibold">{formatearRDCorto(valor)}</span>
                    {tipo === "oferta" && (
                      <span className="ml-1 text-xs text-white/35 line-through">
                        {formatearRDCorto(p.precio)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={
                        p.stockTotal <= 0
                          ? "text-rose-400"
                          : p.stockTotal <= p.stockMinimo
                            ? "text-amber-400"
                            : "text-white/70"
                      }
                    >
                      {p.stockTotal}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => toggle(p)}
                      disabled={pendiente}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                        p.activo
                          ? "bg-verde/15 text-verde"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {p.activo ? "Activo" : "Oculto"}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Link
                      href={`/admin/productos/${p.id}`}
                      className="rounded-md px-2 py-1 text-verde hover:bg-white/5"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => borrar(p)}
                      disabled={pendiente}
                      className="ml-1 rounded-md px-2 py-1 text-white/40 hover:bg-white/5 hover:text-rose-400"
                    >
                      Eliminar
                    </button>
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
