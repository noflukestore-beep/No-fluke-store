"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  anularFactura,
  registrarDevolucion,
  registrarPago,
} from "@/actions/facturas";
import type { EstadoFactura, Factura } from "@/lib/firebase/tipos";
import { formatearRD } from "@/lib/precios";

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

function fechaHora(m: number | null) {
  if (!m) return "—";
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(m));
}

type Panel = "pago" | "devolucion" | "anular" | null;

export default function DetalleFactura({ factura }: { factura: Factura }) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [panel, setPanel] = useState<Panel>(null);
  const [error, setError] = useState<string | null>(null);

  const [pagoMonto, setPagoMonto] = useState(String(factura.saldoFinal || ""));
  const [pagoMetodo, setPagoMetodo] = useState(factura.metodoPago ?? "");
  const [devMotivo, setDevMotivo] = useState("");
  const [devCant, setDevCant] = useState<Record<string, string>>({});
  const [anularMotivo, setAnularMotivo] = useState("");

  const anulada = factura.estado === "anulada";
  const liquidada = factura.saldoFinal <= 0;

  function correr(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    iniciar(async () => {
      const r = await fn();
      if (r.ok) {
        setPanel(null);
        router.refresh();
      } else {
        setError(r.error ?? "No se pudo completar la acción.");
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
              {factura.numero}
            </h1>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${CLASE[factura.estado]}`}
            >
              {ETIQUETA[factura.estado]}
            </span>
          </div>
          <p className="mt-1 text-sm text-white/50">
            {factura.clienteNombre}
            {factura.clienteTelefono ? ` · ${factura.clienteTelefono}` : ""}
            {factura.clienteDocumento ? ` · ${factura.clienteDocumento}` : ""}
          </p>
          <p className="text-xs text-white/35">
            Emitida {fechaHora(factura.fechaEmision)}
            {factura.fechaPago ? ` · Pagada ${fechaHora(factura.fechaPago)}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/factura/${factura.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/5"
          >
            Imprimir / PDF
          </a>
          {!anulada && !liquidada && (
            <button
              type="button"
              onClick={() => {
                setPagoMonto(String(factura.saldoFinal));
                setError(null);
                setPanel(panel === "pago" ? null : "pago");
              }}
              className="rounded-lg bg-verde px-3 py-2 text-sm font-bold text-[#04140c] hover:brightness-105"
            >
              Registrar pago
            </button>
          )}
          {!anulada && (
            <button
              type="button"
              onClick={() =>
                setPanel(panel === "devolucion" ? null : "devolucion")
              }
              className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/5"
            >
              Devolución
            </button>
          )}
          {!anulada && (
            <button
              type="button"
              onClick={() => setPanel(panel === "anular" ? null : "anular")}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white/55 hover:bg-white/5 hover:text-rose-400"
            >
              Anular
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="whitespace-pre-line rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300">
          {error}
        </p>
      )}

      {/* Panel: pago */}
      {panel === "pago" && (
        <Panelito titulo="Registrar pago">
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-[11px] text-white/40">Monto</span>
              <input
                type="number"
                min={0}
                value={pagoMonto}
                onChange={(e) => setPagoMonto(e.target.value)}
                className="w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-verde/60 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] text-white/40">Método</span>
              <select
                value={pagoMetodo}
                onChange={(e) => setPagoMetodo(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-verde/60 focus:outline-none"
              >
                <option value="">—</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </label>
            <button
              type="button"
              disabled={pendiente}
              onClick={() =>
                correr(() =>
                  registrarPago({
                    facturaId: factura.id,
                    monto: Number(pagoMonto) || 0,
                    metodo: pagoMetodo,
                  }),
                )
              }
              className="rounded-lg bg-verde px-4 py-2 text-sm font-bold text-[#04140c] disabled:opacity-60"
            >
              {pendiente ? "Guardando…" : "Confirmar pago"}
            </button>
            <p className="text-xs text-white/50">
              Saldo pendiente: {formatearRD(factura.saldoFinal)}
            </p>
          </div>
        </Panelito>
      )}

      {/* Panel: devolución */}
      {panel === "devolucion" && (
        <Panelito titulo="Devolución">
          <div className="space-y-2">
            {factura.items.map((it) => {
              const disp = it.cantidad - it.devuelto;
              return (
                <div
                  key={it.varianteId}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {it.descripcion}
                    <span className="text-white/40"> · quedan {disp}</span>
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={disp}
                    disabled={disp <= 0}
                    value={devCant[it.varianteId] ?? ""}
                    onChange={(e) =>
                      setDevCant((p) => ({
                        ...p,
                        [it.varianteId]: e.target.value,
                      }))
                    }
                    placeholder="0"
                    className="w-20 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-right text-sm text-white focus:border-verde/60 focus:outline-none disabled:opacity-40"
                  />
                </div>
              );
            })}
            <label className="block pt-1">
              <span className="mb-1 block text-[11px] text-white/40">
                Motivo
              </span>
              <input
                value={devMotivo}
                onChange={(e) => setDevMotivo(e.target.value)}
                placeholder="Ej. talla equivocada, defecto…"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-verde/60 focus:outline-none"
              />
            </label>
            <button
              type="button"
              disabled={pendiente}
              onClick={() =>
                correr(() =>
                  registrarDevolucion({
                    facturaId: factura.id,
                    motivo: devMotivo,
                    lineas: Object.entries(devCant).map(([varianteId, v]) => ({
                      varianteId,
                      cantidad: Number(v) || 0,
                    })),
                  }),
                )
              }
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5 disabled:opacity-60"
            >
              {pendiente ? "Guardando…" : "Registrar devolución"}
            </button>
            <p className="text-xs text-white/40">
              Las unidades devueltas vuelven al inventario.
            </p>
          </div>
        </Panelito>
      )}

      {/* Panel: anular */}
      {panel === "anular" && (
        <Panelito titulo="Anular factura">
          <div className="flex flex-wrap items-end gap-3">
            <label className="block flex-1">
              <span className="mb-1 block text-[11px] text-white/40">
                Motivo
              </span>
              <input
                value={anularMotivo}
                onChange={(e) => setAnularMotivo(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-verde/60 focus:outline-none"
              />
            </label>
            <button
              type="button"
              disabled={pendiente}
              onClick={() =>
                correr(() =>
                  anularFactura({
                    facturaId: factura.id,
                    motivo: anularMotivo,
                  }),
                )
              }
              className="rounded-lg bg-rose-500/90 px-4 py-2 text-sm font-bold text-white hover:bg-rose-500 disabled:opacity-60"
            >
              {pendiente ? "Anulando…" : "Anular"}
            </button>
          </div>
          <p className="mt-2 text-xs text-white/40">
            Repone al inventario lo que no se haya devuelto y deja el saldo en 0.
          </p>
        </Panelito>
      )}

      {/* Detalle */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-white/[0.03] text-left text-xs text-white/45">
            <tr>
              <th className="px-3 py-2.5 font-medium">Artículo</th>
              <th className="px-3 py-2.5 font-medium text-right">Cant.</th>
              <th className="px-3 py-2.5 font-medium text-right">Precio</th>
              <th className="px-3 py-2.5 font-medium text-right">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {factura.items.map((it) => (
              <tr key={it.varianteId}>
                <td className="px-3 py-2.5">
                  {it.descripcion}
                  {it.devuelto > 0 && (
                    <span className="block text-[11px] text-white/40">
                      {it.devuelto} devuelto(s)
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right">{it.cantidad}</td>
                <td className="px-3 py-2.5 text-right">
                  {formatearRD(it.precioUnitario)}
                </td>
                <td className="px-3 py-2.5 text-right font-medium">
                  {formatearRD(it.importe)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <dl className="ml-auto max-w-xs space-y-1 text-sm">
        <Fila etiqueta="Subtotal" valor={formatearRD(factura.subtotal)} />
        {factura.descuento > 0 && (
          <Fila
            etiqueta="Descuento"
            valor={`− ${formatearRD(factura.descuento)}`}
          />
        )}
        {factura.impuestoPorcentaje > 0 && (
          <Fila
            etiqueta={`ITBIS (${factura.impuestoPorcentaje}%)`}
            valor={formatearRD(factura.impuestos)}
          />
        )}
        <div className="flex justify-between border-t border-white/10 pt-1 text-base font-extrabold">
          <span>Total</span>
          <span>{formatearRD(factura.total)}</span>
        </div>
        {factura.montoPagado > 0 && (
          <Fila
            etiqueta="Pagado"
            valor={`− ${formatearRD(factura.montoPagado)}`}
          />
        )}
        {factura.montoDevuelto > 0 && (
          <Fila
            etiqueta="Devuelto"
            valor={`− ${formatearRD(factura.montoDevuelto)}`}
          />
        )}
        <div className="flex justify-between border-t border-white/10 pt-1 font-bold">
          <span>Saldo</span>
          <span className={factura.saldoFinal > 0 ? "text-amber-300" : "text-verde"}>
            {formatearRD(factura.saldoFinal)}
          </span>
        </div>
      </dl>

      {factura.devoluciones.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
            Devoluciones
          </h3>
          <ul className="space-y-1 text-sm">
            {factura.devoluciones.map((d, i) => (
              <li key={i} className="flex justify-between text-white/70">
                <span>
                  {fechaHora(d.fecha)}
                  {d.motivo ? ` · ${d.motivo}` : ""}
                </span>
                <span>{formatearRD(d.monto)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {factura.notas && (
        <p className="whitespace-pre-line rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/60">
          {factura.notas}
        </p>
      )}
    </div>
  );
}

function Panelito({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-verde/20 bg-verde/[0.04] p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-verde/80">
        {titulo}
      </h3>
      {children}
    </div>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between text-white/70">
      <span>{etiqueta}</span>
      <span>{valor}</span>
    </div>
  );
}
