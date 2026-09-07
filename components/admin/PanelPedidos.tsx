"use client";

import { useMemo, useState } from "react";
import type { EstadoPedido } from "@/lib/firebase/tipos";
import { PEDIDOS_DEMO, type PedidoDemo } from "@/lib/admin/demo";
import { formatearRD } from "@/lib/precios";

const TABS: Array<{ estado: EstadoPedido; etiqueta: string }> = [
  { estado: "pendiente", etiqueta: "Pendientes" },
  { estado: "confirmado", etiqueta: "Confirmados" },
  { estado: "entregado", etiqueta: "Entregados" },
  { estado: "cancelado", etiqueta: "Cancelados" },
];

const COLOR_ESTADO: Record<EstadoPedido, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  confirmado: "bg-emerald-100 text-emerald-700",
  entregado: "bg-neutral-200 text-neutral-600",
  cancelado: "bg-rose-100 text-rose-700",
};

export default function PanelPedidos() {
  const [tab, setTab] = useState<EstadoPedido>("pendiente");

  const conteos = useMemo(() => {
    const c: Record<EstadoPedido, number> = {
      pendiente: 0,
      confirmado: 0,
      entregado: 0,
      cancelado: 0,
    };
    for (const p of PEDIDOS_DEMO) c[p.estado]++;
    return c;
  }, []);

  const lista = PEDIDOS_DEMO.filter((p) => p.estado === tab);

  return (
    <section className="mt-8">
      {/* Pestañas */}
      <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map(({ estado, etiqueta }) => {
          const activo = tab === estado;
          return (
            <button
              key={estado}
              type="button"
              onClick={() => setTab(estado)}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                activo
                  ? "border-verde text-neutral-900"
                  : "border-transparent text-neutral-400 hover:text-neutral-700"
              }`}
            >
              {etiqueta}
              {conteos[estado] > 0 && (
                <span
                  className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold ${
                    estado === "pendiente"
                      ? "bg-rose-500 text-white"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {conteos[estado]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {lista.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400">
          No hay pedidos en este estado.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {lista.map((pedido) => (
            <TarjetaPedido key={pedido.codigo} pedido={pedido} />
          ))}
        </ul>
      )}
    </section>
  );
}

function TarjetaPedido({ pedido }: { pedido: PedidoDemo }) {
  return (
    <li className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-bold tracking-tight text-neutral-900">
            {pedido.codigo}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">{pedido.hace}</p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
            COLOR_ESTADO[pedido.estado]
          }`}
        >
          {pedido.estado}
        </span>
      </div>

      {pedido.atrasado && (
        <p className="mt-2 rounded-md bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-600">
          Pendiente hace más de 24 h
        </p>
      )}

      <div className="mt-3">
        <p className="text-sm font-semibold text-neutral-900">
          {pedido.clienteNombre}
        </p>
        <p className="text-xs text-neutral-500">{pedido.clienteTelefono}</p>
      </div>

      <div className="mt-3 flex gap-1.5">
        {Array.from({ length: pedido.miniaturas }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-10 rounded-lg border border-neutral-200 bg-neutral-100"
          />
        ))}
      </div>

      <div className="mt-3 flex items-end justify-between border-t border-neutral-100 pt-3">
        <span className="text-xs text-neutral-500">
          {pedido.articulos} {pedido.articulos === 1 ? "artículo" : "artículos"}
        </span>
        <span className="text-lg font-bold text-verde-oscuro">
          {formatearRD(pedido.total)}
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        {pedido.estado === "pendiente" && (
          <>
            <BotonAccion tono="verde">Confirmar</BotonAccion>
            <BotonAccion tono="borde">Cancelar</BotonAccion>
          </>
        )}
        {pedido.estado === "confirmado" && (
          <BotonAccion tono="verde">Marcar entregado</BotonAccion>
        )}
        <a
          href={`https://wa.me/${pedido.clienteTelefono}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50"
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

function BotonAccion({
  children,
  tono,
}: {
  children: React.ReactNode;
  tono: "verde" | "borde";
}) {
  return (
    <button
      type="button"
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
        tono === "verde"
          ? "bg-verde text-[#04140c] hover:brightness-105"
          : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}
