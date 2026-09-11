"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { EstadoFactura, Factura } from "@/lib/firebase/tipos";
import { formatearRD, formatearRDCorto } from "@/lib/precios";

const ETIQUETA: Record<EstadoFactura, string> = {
  emitida: "Emitida",
  pagada: "Pagada",
  anulada: "Anulada",
};
const CLASE: Record<EstadoFactura, string> = {
  emitida: "bg-amber-400/15 text-amber-300",
  pagada: "bg-verde/15 text-verde",
  anulada: "bg-white/10 text-white/45",
};

function fecha(m: number) {
  if (!m) return "—";
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(m));
}

export default function TablaFacturas({ facturas }: { facturas: Factura[] }) {
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"" | EstadoFactura>("");

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return facturas.filter((f) => {
      if (estado && f.estado !== estado) return false;
      if (!t) return true;
      return `${f.numero} ${f.clienteNombre} ${f.clienteTelefono} ${f.clienteDocumento ?? ""}`
        .toLowerCase()
        .includes(t);
    });
  }, [facturas, q, estado]);

  const activas = facturas.filter((f) => f.estado !== "anulada");
  const facturado = activas.reduce((s, f) => s + f.total, 0);
  const cobrado = activas.reduce((s, f) => s + f.montoPagado, 0);
  const porCobrar = activas.reduce((s, f) => s + f.saldoFinal, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi etiqueta="Facturas" valor={String(activas.length)} />
        <Kpi etiqueta="Facturado" valor={formatearRDCorto(facturado)} ancho />
        <Kpi etiqueta="Cobrado" valor={formatearRDCorto(cobrado)} ancho />
        <Kpi etiqueta="Por cobrar" valor={formatearRDCorto(porCobrar)} ancho />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por número, cliente, teléfono…"
          className="w-full max-w-xs rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-verde/60 focus:outline-none"
        />
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as "" | EstadoFactura)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-verde/60 focus:outline-none"
        >
          <option value="">Todas</option>
          <option value="emitida">Emitidas</option>
          <option value="pagada">Pagadas</option>
          <option value="anulada">Anuladas</option>
        </select>
      </div>

      {lista.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-10 text-center text-sm text-white/40">
          {facturas.length === 0
            ? "Todavía no hay facturas."
            : "Nada coincide con el filtro."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-white/[0.03] text-left text-xs text-white/45">
              <tr>
                <th className="px-3 py-2.5 font-medium">Número</th>
                <th className="px-3 py-2.5 font-medium">Cliente</th>
                <th className="px-3 py-2.5 font-medium">Emisión</th>
                <th className="px-3 py-2.5 font-medium text-right">Total</th>
                <th className="px-3 py-2.5 font-medium text-right">Saldo</th>
                <th className="px-3 py-2.5 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lista.map((f) => (
                <tr key={f.id} className="hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/admin/facturas/${f.id}`}
                      className="font-semibold text-verde hover:underline"
                    >
                      {f.numero}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium">{f.clienteNombre}</p>
                    {f.clienteTelefono && (
                      <p className="text-xs text-white/40">{f.clienteTelefono}</p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-white/60">
                    {fecha(f.fechaEmision)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold">
                    {formatearRD(f.total)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-2.5 text-right ${
                      f.saldoFinal > 0 ? "text-amber-300" : "text-white/40"
                    }`}
                  >
                    {formatearRD(f.saldoFinal)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${CLASE[f.estado]}`}
                    >
                      {ETIQUETA[f.estado]}
                    </span>
                    {f.tieneDevolucion && (
                      <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/50">
                        devolución
                      </span>
                    )}
                  </td>
                </tr>
              ))}
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
      <p className="mt-1 truncate font-display text-xl font-extrabold tracking-tight md:text-2xl">
        {valor}
      </p>
    </div>
  );
}
