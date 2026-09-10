"use client";

import { useMemo, useState } from "react";
import type { MovimientoInventario, TipoMovimiento } from "@/lib/firebase/tipos";

const ETIQUETA: Record<TipoMovimiento, string> = {
  entrada: "Entrada",
  salida: "Salida",
  ajuste: "Ajuste",
  venta: "Venta",
};
const CLASE: Record<TipoMovimiento, string> = {
  entrada: "bg-verde/15 text-verde",
  salida: "bg-rose-500/15 text-rose-300",
  ajuste: "bg-amber-400/15 text-amber-300",
  venta: "bg-sky-400/15 text-sky-300",
};

function fecha(millis: number) {
  if (!millis) return "—";
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(millis));
}

export default function TablaMovimientos({
  movimientos,
}: {
  movimientos: MovimientoInventario[];
}) {
  const [q, setQ] = useState("");

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return movimientos;
    return movimientos.filter((m) =>
      `${m.productoNombre} ${m.varianteDesc} ${m.motivo ?? ""} ${m.productoId}`
        .toLowerCase()
        .includes(t),
    );
  }, [movimientos, q]);

  return (
    <div className="space-y-4">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por artículo, motivo, ID…"
        className="w-full max-w-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-verde/60 focus:outline-none"
      />

      {lista.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-10 text-center text-sm text-white/40">
          {movimientos.length === 0
            ? "Todavía no hay movimientos de inventario."
            : "Nada coincide con la búsqueda."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-white/[0.03] text-left text-xs text-white/45">
              <tr>
                <th className="px-3 py-2.5 font-medium">Fecha</th>
                <th className="px-3 py-2.5 font-medium">Artículo</th>
                <th className="px-3 py-2.5 font-medium">Tipo</th>
                <th className="px-3 py-2.5 font-medium text-right">Cambio</th>
                <th className="px-3 py-2.5 font-medium text-right">Resultado</th>
                <th className="px-3 py-2.5 font-medium">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lista.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-3 py-2.5 text-white/60">
                    {fecha(m.creadoEn)}
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium">{m.productoNombre}</p>
                    <p className="text-xs text-white/40">{m.varianteDesc}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${CLASE[m.tipo]}`}
                    >
                      {ETIQUETA[m.tipo]}
                    </span>
                  </td>
                  <td
                    className={`px-3 py-2.5 text-right font-semibold ${
                      m.cantidad >= 0 ? "text-verde" : "text-rose-300"
                    }`}
                  >
                    {m.cantidad >= 0 ? `+${m.cantidad}` : m.cantidad}
                  </td>
                  <td className="px-3 py-2.5 text-right text-white/70">
                    {m.stockAntes} → {m.stockDespues}
                  </td>
                  <td className="px-3 py-2.5 text-white/60">{m.motivo ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
