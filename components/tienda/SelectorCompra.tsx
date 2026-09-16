"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProductoPublico } from "@/lib/firebase/tipos";
import { useCarrito } from "@/lib/store/carrito";

function descVariante(v: { talla: string; color: string }): string {
  return [v.talla, v.color].filter(Boolean).join(" / ") || "Único";
}

export default function SelectorCompra({
  producto,
}: {
  producto: ProductoPublico;
}) {
  const agregar = useCarrito((s) => s.agregar);

  const activas = useMemo(
    () => producto.variantes.filter((v) => v.activo && v.stock > 0),
    [producto.variantes],
  );

  const [varianteId, setVarianteId] = useState(activas[0]?.id ?? "");
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  const variante = activas.find((v) => v.id === varianteId);

  if (activas.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center text-sm text-white/50">
        No hay existencia disponible ahora mismo.
      </div>
    );
  }

  function agregarAlCarrito() {
    if (!variante) return;
    agregar(
      {
        productoId: producto.id,
        varianteId: variante.id,
        nombre: producto.nombre,
        marca: producto.marca,
        varianteDesc: descVariante(variante),
        slug: producto.slug,
        imagenUrl: producto.imagenes[0]?.url ?? null,
      },
      cantidad,
    );
    setAgregado(true);
    setCantidad(1);
    setTimeout(() => setAgregado(false), 2500);
  }

  return (
    <div className="mt-6 space-y-3">
      {activas.length > 1 && (
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-white/50">
            Elige
          </span>
          <select
            value={varianteId}
            onChange={(e) => {
              setVarianteId(e.target.value);
              setCantidad(1);
            }}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-verde/60 focus:outline-none"
          >
            {activas.map((v) => (
              <option key={v.id} value={v.id}>
                {descVariante(v)} — {v.stock} disponibles
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-white/15">
          <button
            type="button"
            onClick={() => setCantidad((n) => Math.max(1, n - 1))}
            className="grid h-11 w-11 place-items-center text-lg text-white/70 hover:bg-white/5"
            aria-label="Restar"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold">
            {cantidad}
          </span>
          <button
            type="button"
            onClick={() =>
              setCantidad((n) => Math.min(variante?.stock ?? 1, n + 1))
            }
            className="grid h-11 w-11 place-items-center text-lg text-white/70 hover:bg-white/5"
            aria-label="Sumar"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={agregarAlCarrito}
          className="flex-1 rounded-lg bg-verde px-5 py-3 text-sm font-bold text-[#04140c] transition-transform hover:scale-[1.02]"
        >
          Agregar al carrito
        </button>
      </div>

      {agregado && (
        <div className="flex items-center justify-between rounded-lg border border-verde/30 bg-verde/10 px-3 py-2 text-sm text-verde">
          <span>Agregado al carrito.</span>
          <Link href="/tienda/carrito" className="font-semibold underline">
            Ver carrito →
          </Link>
        </div>
      )}
    </div>
  );
}
