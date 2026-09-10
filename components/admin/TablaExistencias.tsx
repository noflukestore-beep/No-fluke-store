"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Producto } from "@/lib/firebase/tipos";
import { formatearRD, formatearRDCorto } from "@/lib/precios";

function fechaCorta(millis: number) {
  if (!millis) return "—";
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(millis));
}

function ofertaVigente(p: Producto) {
  return (
    p.precioOferta != null &&
    (p.ofertaHasta == null || p.ofertaHasta > Date.now())
  );
}

export default function TablaExistencias({
  productos,
}: {
  productos: Producto[];
}) {
  const [q, setQ] = useState("");

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    const base = t
      ? productos.filter((p) =>
          `${p.nombre} ${p.descripcion} ${p.marca} ${p.categoriaNombre} ${p.sku ?? ""} ${p.id}`
            .toLowerCase()
            .includes(t),
        )
      : productos;
    return [...base].sort((a, b) => b.creadoEn - a.creadoEn);
  }, [productos, q]);

  const unidades = productos.reduce((s, p) => s + p.stockTotal, 0);
  const valorCosto = productos.reduce(
    (s, p) => s + p.stockTotal * (p.precioCompra ?? 0),
    0,
  );
  const valorVenta = productos.reduce(
    (s, p) => s + p.stockTotal * p.precio,
    0,
  );

  function descargarCSV() {
    const encabezado = [
      "Producto",
      "Marca",
      "Categoria",
      "Registrado",
      "Existencia",
      "Costo",
      "Precio venta",
      "Precio mayor",
      "Cantidad mayor",
      "Precio oferta",
      "Oferta hasta",
    ];
    const filas = lista.map((p) => [
      p.nombre,
      p.marca,
      p.categoriaNombre,
      fechaCorta(p.creadoEn),
      p.stockTotal,
      p.precioCompra ?? "",
      p.precio,
      p.precioMayor ?? "",
      p.cantidadMayor ?? "",
      p.precioOferta ?? "",
      p.ofertaHasta ? fechaCorta(p.ofertaHasta) : "",
    ]);
    const csv = [encabezado, ...filas]
      .map((f) =>
        f
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `existencias-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi etiqueta="Productos" valor={String(productos.length)} />
        <Kpi etiqueta="Unidades" valor={String(unidades)} />
        <Kpi
          etiqueta="Valor a costo"
          valor={formatearRDCorto(valorCosto)}
          ancho
        />
        <Kpi
          etiqueta="Valor a venta"
          valor={formatearRDCorto(valorVenta)}
          ancho
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, descripción, ID, SKU…"
          className="w-full max-w-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-verde/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={descargarCSV}
          disabled={lista.length === 0}
          className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/5 disabled:opacity-50"
        >
          Descargar CSV
        </button>
      </div>

      {lista.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-10 text-center text-sm text-white/40">
          {productos.length === 0
            ? "No hay productos. Créalos en la sección Productos."
            : "Nada coincide con la búsqueda."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-white/[0.03] text-left text-xs text-white/45">
              <tr>
                <th className="px-3 py-2.5 font-medium">Producto</th>
                <th className="px-3 py-2.5 font-medium">Categoría</th>
                <th className="px-3 py-2.5 font-medium">Registrado</th>
                <th className="px-3 py-2.5 font-medium text-right">Existencia</th>
                <th className="px-3 py-2.5 font-medium text-right">Costo</th>
                <th className="px-3 py-2.5 font-medium text-right">P. venta</th>
                <th className="px-3 py-2.5 font-medium text-right">Mayor</th>
                <th className="px-3 py-2.5 font-medium text-right">Oferta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lista.map((p) => {
                const vigente = ofertaVigente(p);
                const gana =
                  p.precioCompra != null ? p.precio - p.precioCompra : null;
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="font-medium hover:text-verde"
                      >
                        {p.nombre}
                      </Link>
                      <p className="text-xs text-white/40">
                        {p.marca || "—"}
                        {!p.activo && " · oculto"}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 text-white/70">
                      {p.categoriaNombre || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-white/60">
                      {fechaCorta(p.creadoEn)}
                    </td>
                    <td
                      className={`px-3 py-2.5 text-right font-semibold ${
                        p.stockTotal <= 0
                          ? "text-rose-400"
                          : p.stockTotal <= p.stockMinimo
                            ? "text-amber-400"
                            : "text-white"
                      }`}
                    >
                      {p.stockTotal}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right text-white/70">
                      {p.precioCompra != null ? formatearRD(p.precioCompra) : "—"}
                      {gana != null && gana > 0 && (
                        <span className="block text-[11px] text-verde/70">
                          +{formatearRDCorto(gana)}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold">
                      {formatearRD(p.precio)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right text-white/70">
                      {p.precioMayor != null ? (
                        <>
                          {formatearRD(p.precioMayor)}
                          {p.cantidadMayor != null && (
                            <span className="block text-[11px] text-white/35">
                              desde {p.cantidadMayor}
                            </span>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right">
                      {p.precioOferta != null ? (
                        <>
                          <span
                            className={vigente ? "text-verde" : "text-white/40"}
                          >
                            {formatearRD(p.precioOferta)}
                          </span>
                          <span
                            className={`block text-[11px] ${
                              vigente ? "text-white/40" : "text-rose-300/70"
                            }`}
                          >
                            {vigente ? "vigente" : "vencida"}
                            {p.ofertaHasta
                              ? ` · ${fechaCorta(p.ofertaHasta)}`
                              : ""}
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Kpi({
  etiqueta,
  valor,
  ancho,
}: {
  etiqueta: string;
  valor: string;
  ancho?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-3 ${
        ancho ? "col-span-2 md:col-span-1" : ""
      }`}
    >
      <p className="text-xs text-white/50">{etiqueta}</p>
      <p className="mt-1 truncate font-display text-xl font-extrabold leading-tight tracking-tight md:text-2xl">
        {valor}
      </p>
    </div>
  );
}
