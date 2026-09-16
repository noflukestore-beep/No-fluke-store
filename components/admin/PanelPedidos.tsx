"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { cancelarPedido } from "@/actions/pedidos";
import type { EstadoPedido, Pedido } from "@/lib/firebase/tipos";
import { formatearRD } from "@/lib/precios";

const TABS: Array<{ estado: EstadoPedido; etiqueta: string }> = [
  { estado: "pendiente", etiqueta: "Pendientes" },
  { estado: "confirmado", etiqueta: "Facturados" },
  { estado: "entregado", etiqueta: "Entregados" },
  { estado: "cancelado", etiqueta: "Cancelados" },
];

const COLOR_ESTADO: Record<EstadoPedido, string> = {
  pendiente: "bg-amber-400/15 text-amber-300",
  confirmado: "bg-sky-400/15 text-sky-300",
  entregado: "bg-verde/15 text-verde",
  cancelado: "bg-rose-400/15 text-rose-300",
};

function hace(millis: number): string {
  if (!millis) return "—";
  const min = Math.floor((Date.now() - millis) / 60000);
  if (min < 1) return "ahora mismo";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

export default function PanelPedidos({ pedidos }: { pedidos: Pedido[] }) {
  const [tab, setTab] = useState<EstadoPedido>("pendiente");

  const conteos = useMemo(() => {
    const c: Record<EstadoPedido, number> = {
      pendiente: 0,
      confirmado: 0,
      entregado: 0,
      cancelado: 0,
    };
    for (const p of pedidos) c[p.estado]++;
    return c;
  }, [pedidos]);

  const lista = pedidos.filter((p) => p.estado === tab);

  return (
    <section className="mt-8">
      <div className="flex gap-1 overflow-x-auto border-b border-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map(({ estado, etiqueta }) => {
          const activo = tab === estado;
          return (
            <button
              key={estado}
              type="button"
              onClick={() => setTab(estado)}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                activo
                  ? "border-verde text-white"
                  : "border-transparent text-white/45 hover:text-white/80"
              }`}
            >
              {etiqueta}
              {conteos[estado] > 0 && (
                <span
                  className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold ${
                    estado === "pendiente"
                      ? "bg-rose-500 text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {conteos[estado]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {lista.length === 0 ? (
        <p className="py-16 text-center text-sm text-white/40">
          No hay pedidos en este estado.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {lista.map((pedido) => (
            <TarjetaPedido key={pedido.id} pedido={pedido} />
          ))}
        </ul>
      )}
    </section>
  );
}

function TarjetaPedido({ pedido }: { pedido: Pedido }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const articulos = pedido.items.reduce((s, i) => s + i.cantidad, 0);

  function cancelar() {
    setError(null);
    iniciar(async () => {
      const r = await cancelarPedido(pedido.id);
      if (!r.ok) setError(r.error ?? "No se pudo cancelar.");
    });
  }

  return (
    <li className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-bold tracking-tight">
            {pedido.codigo}
          </p>
          <p className="mt-0.5 text-xs text-white/40">
            {hace(pedido.creadoEn)}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${COLOR_ESTADO[pedido.estado]}`}
        >
          {pedido.estado}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-sm font-semibold">{pedido.clienteNombre}</p>
        <p className="text-xs text-white/45">{pedido.clienteTelefono}</p>
        {pedido.clienteDireccion && (
          <p className="mt-1 text-xs text-white/45">
            📍 {pedido.clienteDireccion}
          </p>
        )}
        {pedido.nota && (
          <p className="mt-1 text-xs italic text-white/40">
            &ldquo;{pedido.nota}&rdquo;
          </p>
        )}
      </div>

      <ul className="mt-3 space-y-0.5 border-t border-white/5 pt-2 text-xs text-white/55">
        {pedido.items.map((it, i) => (
          <li key={i} className="truncate">
            {it.cantidad}x {it.productoNombre}
            {it.varianteDesc !== "Único" ? ` (${it.varianteDesc})` : ""}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-end justify-between border-t border-white/5 pt-3">
        <span className="text-xs text-white/45">
          {articulos} {articulos === 1 ? "artículo" : "artículos"}
        </span>
        <span className="font-display text-lg font-extrabold text-verde">
          {formatearRD(pedido.total)}
        </span>
      </div>

      {error && (
        <p className="mt-2 text-xs font-semibold text-rose-400">{error}</p>
      )}

      <div className="mt-3 flex gap-2">
        {pedido.estado === "pendiente" && (
          <>
            <Link
              href={`/admin/facturas?pedido=${pedido.id}`}
              className="rounded-lg bg-verde px-3 py-2 text-sm font-semibold text-[#04140c] hover:brightness-110"
            >
              Facturar
            </Link>
            <button
              type="button"
              onClick={cancelar}
              disabled={pendiente}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/5 disabled:opacity-50"
            >
              Cancelar
            </button>
          </>
        )}
        {pedido.estado === "confirmado" && pedido.facturaId && (
          <Link
            href={`/admin/facturas/${pedido.facturaId}`}
            className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/5"
          >
            Ver factura
          </Link>
        )}
        <a
          href={`https://wa.me/${pedido.clienteTelefono}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/50 transition-colors hover:bg-white/5"
          aria-label="Abrir WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6a9 9 0 0 1-3.4-3c-.3-.4-.8-1.1-.8-2s.5-1.4.7-1.6c.2-.2.4-.3.6-.3h.4c.2 0 .3 0 .5.4l.7 1.6c0 .2 0 .3-.1.4l-.3.4-.2.3c-.1.1-.2.2 0 .5.2.3.7 1.1 1.5 1.7 1 .8 1.7 1 2 1.2.2 0 .4 0 .5-.1l.6-.7c.2-.2.3-.2.5-.1l1.6.7c.2.1.4.2.4.3.1.1.1.4 0 .8Z" />
          </svg>
        </a>
      </div>
    </li>
  );
}
