"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { alternarActivo, eliminarProducto } from "@/actions/productos";
import type { Producto } from "@/lib/firebase/tipos";
import { formatearRDCorto } from "@/lib/precios";

export default function TablaProductos({
  productos,
}: {
  productos: Producto[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [pendiente, iniciar] = useTransition();
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    iniciar(async () => {
      const r = await eliminarProducto(p.id);
      if (!r.ok) setError(r.error ?? `No se pudo eliminar "${p.nombre}".`);
      setConfirmando(null);
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

      {error && (
        <p className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-white/[0.03] text-left text-xs text-white/45">
            <tr>
              <th className="px-3 py-2.5 font-medium">Producto</th>
              <th className="px-3 py-2.5 font-medium">Categoría</th>
              <th className="px-3 py-2.5 font-medium">Precio de venta</th>
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
                    <span className="font-semibold">
                      {formatearRDCorto(p.precio)}
                    </span>
                    {p.precioOferta != null && (
                      <span className="block text-[11px] font-medium text-verde/80">
                        oferta {formatearRDCorto(p.precioOferta)}
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
                    {confirmando === p.id ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xs text-white/60">¿Eliminar?</span>
                        <button
                          type="button"
                          onClick={() => borrar(p)}
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
                          href={`/admin/productos/${p.id}`}
                          className="rounded-md px-2 py-1 text-verde hover:bg-white/5"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setError(null);
                            setConfirmando(p.id);
                          }}
                          disabled={pendiente}
                          className="ml-1 rounded-md px-2 py-1 text-white/55 hover:bg-white/5 hover:text-rose-400"
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
