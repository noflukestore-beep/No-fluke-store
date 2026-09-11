"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ajustarStock, type ModoAjuste } from "@/actions/inventario";

export interface ArticuloInventario {
  productoId: string;
  varianteId: string;
  nombre: string;
  descripcion: string;
  marca: string;
  categoriaNombre: string;
  sku: string;
  talla: string;
  color: string;
  stock: number;
  stockMinimo: number;
  activo: boolean;
}

const MODOS: { valor: ModoAjuste; etiqueta: string }[] = [
  { valor: "entrada", etiqueta: "Entrada +" },
  { valor: "salida", etiqueta: "Salida −" },
  { valor: "fijar", etiqueta: "Fijar =" },
];

function variante(a: ArticuloInventario) {
  const p = [a.talla, a.color].filter(Boolean);
  return p.length ? p.join(" / ") : "Único";
}

function estado(a: ArticuloInventario) {
  if (a.stock <= 0) return { texto: "Agotado", clase: "bg-rose-500/15 text-rose-300" };
  if (a.stock <= a.stockMinimo)
    return { texto: "Stock bajo", clase: "bg-amber-400/15 text-amber-300" };
  return { texto: "OK", clase: "bg-verde/15 text-verde" };
}

export default function TablaInventario({
  articulos,
}: {
  articulos: ArticuloInventario[];
}) {
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return articulos;
    return articulos.filter((a) =>
      `${a.nombre} ${a.descripcion} ${a.marca} ${a.categoriaNombre} ${a.sku} ${a.talla} ${a.color} ${a.productoId} ${a.varianteId}`
        .toLowerCase()
        .includes(t),
    );
  }, [articulos, q]);

  const unidades = articulos.reduce((s, a) => s + a.stock, 0);
  const agotados = articulos.filter((a) => a.stock <= 0).length;
  const bajos = articulos.filter(
    (a) => a.stock > 0 && a.stock <= a.stockMinimo,
  ).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi etiqueta="Artículos" valor={articulos.length} />
        <Kpi etiqueta="Unidades" valor={unidades} />
        <Kpi etiqueta="Stock bajo" valor={bajos} acento={bajos > 0 ? "amber" : undefined} />
        <Kpi etiqueta="Agotados" valor={agotados} acento={agotados > 0 ? "rose" : undefined} />
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nombre, descripción, ID, SKU, talla…"
        className="w-full max-w-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-verde/60 focus:outline-none"
      />

      {lista.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-10 text-center text-sm text-white/40">
          {articulos.length === 0
            ? "No hay artículos. Crea productos en la sección Productos."
            : "Nada coincide con la búsqueda."}
        </p>
      ) : (
        <ul className="space-y-2">
          {lista.map((a) => {
            const clave = `${a.productoId}:${a.varianteId}`;
            const est = estado(a);
            return (
              <li
                key={clave}
                className="rounded-xl border border-white/10 bg-white/[0.03]"
              >
                <div className="flex items-center gap-3 p-3 sm:p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {a.nombre}
                      {!a.activo && (
                        <span className="ml-2 text-[11px] text-white/35">
                          (oculto)
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-white/40">
                      {variante(a)}
                      {" · "}
                      {a.categoriaNombre || "sin categoría"}
                      {a.sku ? ` · ${a.sku}` : ""}
                    </p>
                  </div>
                  <div className="w-16 shrink-0 text-right">
                    <p
                      className={`font-display text-2xl font-extrabold leading-none ${
                        a.stock <= 0
                          ? "text-rose-400"
                          : a.stock <= a.stockMinimo
                            ? "text-amber-400"
                            : "text-white"
                      }`}
                    >
                      {a.stock}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-white/35">
                      uds.
                    </p>
                  </div>
                  <span
                    className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold sm:inline-block ${est.clase}`}
                  >
                    {est.texto}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setAbierto((c) => (c === clave ? null : clave))
                    }
                    className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-sm font-semibold text-white/80 hover:bg-white/5"
                  >
                    {abierto === clave ? "Cerrar" : "Ajustar"}
                  </button>
                </div>

                {abierto === clave && (
                  <PanelAjuste
                    articulo={a}
                    onListo={() => setAbierto(null)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function PanelAjuste({
  articulo,
  onListo,
}: {
  articulo: ArticuloInventario;
  onListo: () => void;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [modo, setModo] = useState<ModoAjuste>("entrada");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const n = Number(cantidad) || 0;
  const previo =
    modo === "entrada"
      ? articulo.stock + n
      : modo === "salida"
        ? Math.max(0, articulo.stock - n)
        : Math.max(0, Math.round(n));

  function aplicar() {
    setError(null);
    if (!motivo.trim()) {
      setError("Escribe el motivo del ajuste.");
      return;
    }
    iniciar(async () => {
      const r = await ajustarStock({
        productoId: articulo.productoId,
        varianteId: articulo.varianteId,
        modo,
        cantidad: n,
        motivo,
      });
      if (r.ok) {
        onListo();
        router.refresh();
      } else {
        setError(r.error ?? "No se pudo ajustar.");
      }
    });
  }

  return (
    <div className="border-t border-white/10 bg-white/[0.02] p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {MODOS.map((m) => (
          <button
            key={m.valor}
            type="button"
            onClick={() => setModo(m.valor)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
              modo === m.valor
                ? "border-verde bg-verde text-[#04140c]"
                : "border-white/15 text-white/70 hover:bg-white/5"
            }`}
          >
            {m.etiqueta}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <label className="block">
          <span className="mb-1 block text-[11px] text-white/40">
            {modo === "fijar" ? "Nueva existencia" : "Cantidad"}
          </span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            autoFocus
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-verde/60 focus:outline-none sm:w-32"
          />
        </label>
        <label className="block flex-1">
          <span className="mb-1 block text-[11px] text-white/40">
            Motivo <span className="text-verde">*</span>
          </span>
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej. compra a proveedor, merma, conteo físico…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-verde/60 focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={aplicar}
          disabled={
            pendiente || !motivo.trim() || (modo !== "fijar" && n <= 0)
          }
          className="rounded-lg bg-verde px-4 py-2 text-sm font-bold text-[#04140c] hover:brightness-105 disabled:opacity-50"
        >
          {pendiente ? "Aplicando…" : "Aplicar"}
        </button>
        <p className="text-xs text-white/50">
          {articulo.stock} → <span className="font-semibold text-white">{previo}</span> unidades
        </p>
        {error && (
          <p className="text-xs font-semibold text-rose-400">{error}</p>
        )}
      </div>
    </div>
  );
}

function Kpi({
  etiqueta,
  valor,
  acento,
}: {
  etiqueta: string;
  valor: number;
  acento?: "amber" | "rose";
}) {
  const color =
    acento === "amber"
      ? "text-amber-400"
      : acento === "rose"
        ? "text-rose-400"
        : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs text-white/50">{etiqueta}</p>
      <p className={`mt-1 font-display text-2xl font-extrabold tracking-tight ${color}`}>
        {valor}
      </p>
    </div>
  );
}
