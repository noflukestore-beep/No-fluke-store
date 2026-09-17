"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  buscarFacturaPorNumero,
  registrarDevolucion,
} from "@/actions/facturas";
import type { Factura } from "@/lib/firebase/tipos";
import { formatearRD } from "@/lib/precios";

const entrada =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-verde/60 focus:outline-none";

function fechaHora(m: number | null) {
  if (!m) return "—";
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(m));
}

export default function BuscadorDevolucion() {
  const [numero, setNumero] = useState("");
  const [factura, setFactura] = useState<Factura | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [cantidades, setCantidades] = useState<Record<string, string>>({});
  const [motivo, setMotivo] = useState("");
  const [confirmacion, setConfirmacion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    if (!numero.trim()) return;
    setBuscando(true);
    setError(null);
    setConfirmacion(null);
    setNoEncontrada(false);
    const f = await buscarFacturaPorNumero(numero.trim());
    setBuscando(false);
    setFactura(f);
    setCantidades({});
    setMotivo("");
    if (!f) setNoEncontrada(true);
  }

  function registrar() {
    if (!factura) return;
    setError(null);
    setConfirmacion(null);
    const lineas = Object.entries(cantidades)
      .map(([varianteId, v]) => ({ varianteId, cantidad: Number(v) || 0 }))
      .filter((l) => l.cantidad > 0);
    if (lineas.length === 0) {
      setError("Indica al menos una cantidad a devolver.");
      return;
    }
    iniciar(async () => {
      const r = await registrarDevolucion({
        facturaId: factura.id,
        motivo,
        lineas,
      });
      if (!r.ok) {
        setError(r.error ?? "No se pudo registrar la devolución.");
        return;
      }
      const actualizada = await buscarFacturaPorNumero(factura.numero);
      setFactura(actualizada);
      setCantidades({});
      setMotivo("");
      setConfirmacion("Devolución registrada. El inventario ya se actualizó.");
    });
  }

  const anulada = factura?.estado === "anulada";
  const items = factura?.items ?? [];
  const nadaPorDevolver =
    factura != null && items.every((it) => it.cantidad - it.devuelto <= 0);

  return (
    <div className="max-w-2xl space-y-5">
      <form onSubmit={buscar} className="flex flex-wrap items-end gap-3">
        <label className="block flex-1 min-w-[200px]">
          <span className="mb-1 block text-xs font-medium text-white/50">
            Número de factura
          </span>
          <input
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="Ej. FACT-000012"
            className={`${entrada} w-full uppercase`}
          />
        </label>
        <button
          type="submit"
          disabled={buscando || !numero.trim()}
          className="rounded-lg bg-verde px-5 py-2 text-sm font-bold text-[#04140c] hover:brightness-105 disabled:opacity-60"
        >
          {buscando ? "Buscando…" : "Buscar"}
        </button>
      </form>

      {noEncontrada && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300">
          No existe ninguna factura con el número &quot;{numero.trim()}
          &quot;. Revisa que esté completo, ej. FACT-000012.
        </p>
      )}

      {factura && (
        <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-display text-lg font-extrabold tracking-tight">
                {factura.numero}
              </p>
              <p className="text-sm text-white/60">
                {factura.clienteNombre}
                {factura.clienteTelefono ? ` · ${factura.clienteTelefono}` : ""}
              </p>
              <p className="text-xs text-white/35">
                Emitida {fechaHora(factura.fechaEmision)}
              </p>
            </div>
            <Link
              href={`/admin/facturas/${factura.id}`}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/5"
            >
              Ver factura completa →
            </Link>
          </div>

          {anulada ? (
            <p className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/50">
              Esta factura está anulada; no se le pueden registrar
              devoluciones.
            </p>
          ) : nadaPorDevolver ? (
            <p className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/50">
              Ya se devolvió todo lo de esta factura.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="bg-white/[0.03] text-left text-xs text-white/45">
                    <tr>
                      <th className="px-3 py-2 font-medium">Artículo</th>
                      <th className="px-3 py-2 font-medium text-right">
                        Precio facturado
                      </th>
                      <th className="px-3 py-2 font-medium text-right">
                        Disponible
                      </th>
                      <th className="px-3 py-2 font-medium text-right">
                        Devolver
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map((it) => {
                      const disp = it.cantidad - it.devuelto;
                      return (
                        <tr key={it.varianteId}>
                          <td className="px-3 py-2">
                            {it.descripcion}
                            {it.devuelto > 0 && (
                              <span className="block text-[11px] text-white/40">
                                {it.devuelto} ya devuelto(s)
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right text-white/70">
                            {formatearRD(it.precioUnitario)}
                          </td>
                          <td className="px-3 py-2 text-right text-white/70">
                            {disp}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              min={0}
                              max={disp}
                              disabled={disp <= 0}
                              value={cantidades[it.varianteId] ?? ""}
                              onChange={(e) =>
                                setCantidades((p) => ({
                                  ...p,
                                  [it.varianteId]: e.target.value,
                                }))
                              }
                              placeholder="0"
                              className="w-20 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-right text-sm text-white focus:border-verde/60 focus:outline-none disabled:opacity-40"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-white/50">
                  Motivo
                </span>
                <input
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej. talla equivocada, defecto de fábrica…"
                  className={`${entrada} w-full`}
                />
              </label>

              {error && (
                <p className="whitespace-pre-line text-sm font-semibold text-rose-400">
                  {error}
                </p>
              )}
              {confirmacion && (
                <p className="text-sm font-semibold text-verde">
                  {confirmacion}
                </p>
              )}

              <button
                type="button"
                onClick={registrar}
                disabled={pendiente}
                className="rounded-lg bg-verde px-5 py-2.5 text-sm font-bold text-[#04140c] hover:brightness-105 disabled:opacity-60"
              >
                {pendiente ? "Registrando…" : "Registrar devolución"}
              </button>
              <p className="text-xs text-white/40">
                El precio se calcula tal cual se facturó — el costo del
                artículo no cambia. Las unidades vuelven al inventario de
                inmediato.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
