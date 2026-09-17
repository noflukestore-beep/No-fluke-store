"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { crearFactura, type FacturaLineaInput } from "@/actions/facturas";
import type { Config, Pedido, Producto } from "@/lib/firebase/tipos";
import { formatearRD } from "@/lib/precios";

const entrada =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-verde/60 focus:outline-none";

interface Opcion {
  productoId: string;
  varianteId: string;
  etiqueta: string;
  stock: number;
  precio: number;
}

interface Linea {
  key: string;
  productoId: string;
  varianteId: string;
  descripcion: string;
  stock: number;
  cantidad: number;
  precioUnitario: number;
}

function money(x: number) {
  return Math.round((Number(x) || 0) * 100) / 100;
}

export default function FormularioFactura({
  productos,
  config,
  pedido,
}: {
  productos: Producto[];
  config: Config;
  pedido?: Pedido | null;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [ahora] = useState(() => Date.now());

  const opciones = useMemo<Opcion[]>(() => {
    const lista: Opcion[] = [];
    for (const p of productos) {
      const ofertaVigente =
        p.precioOferta != null &&
        (p.ofertaHasta == null || p.ofertaHasta > ahora);
      const precio = ofertaVigente ? (p.precioOferta as number) : p.precio;
      for (const v of p.variantes) {
        const attrs = [v.talla, v.color].filter(Boolean).join(" / ");
        lista.push({
          productoId: p.id,
          varianteId: v.id,
          etiqueta: `${p.sku ? `[${p.sku}] ` : ""}${p.nombre}${attrs ? ` — ${attrs}` : ""}`,
          stock: v.stock,
          precio,
        });
      }
    }
    return lista.sort((a, b) => a.etiqueta.localeCompare(b.etiqueta));
  }, [productos, ahora]);

  const [clienteNombre, setClienteNombre] = useState(
    pedido?.clienteNombre ?? "",
  );
  const [clienteTelefono, setClienteTelefono] = useState(
    pedido?.clienteTelefono ?? "",
  );
  const [clienteDocumento, setClienteDocumento] = useState("");
  const [lineas, setLineas] = useState<Linea[]>(() => {
    if (!pedido) return [];
    return pedido.items.map((it) => {
      const stock =
        productos
          .find((p) => p.id === it.productoId)
          ?.variantes.find((v) => v.id === it.varianteId)?.stock ?? 0;
      return {
        key: `${it.productoId}:${it.varianteId}`,
        productoId: it.productoId,
        varianteId: it.varianteId,
        descripcion: `${it.productoSku ? `[${it.productoSku}] ` : ""}${
          it.varianteDesc && it.varianteDesc !== "Único"
            ? `${it.productoNombre} — ${it.varianteDesc}`
            : it.productoNombre
        }`,
        stock,
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
      };
    });
  });
  const [seleccion, setSeleccion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [listaAbierta, setListaAbierta] = useState(false);
  const [cantNueva, setCantNueva] = useState("1");
  const [descuento, setDescuento] = useState("0");
  const [impuesto, setImpuesto] = useState(
    String(config.impuestoPorcentaje ?? 0),
  );
  const [metodoPago, setMetodoPago] = useState("");
  const [pagar, setPagar] = useState(false);
  const [notas, setNotas] = useState(() => {
    if (!pedido) return "";
    const partes = [
      `Pedido ${pedido.codigo} por WhatsApp.`,
      `Entrega: ${pedido.clienteDireccion}`,
    ];
    if (pedido.nota) partes.push(`Nota del cliente: ${pedido.nota}`);
    return partes.join("\n");
  });

  const coincidencias = useMemo(() => {
    const t = busqueda.trim().toLowerCase();
    const lista = t
      ? opciones.filter((o) => o.etiqueta.toLowerCase().includes(t))
      : opciones;
    return lista.slice(0, 20);
  }, [opciones, busqueda]);

  function elegirOpcion(o: Opcion) {
    setSeleccion(`${o.productoId}:${o.varianteId}`);
    setBusqueda(o.etiqueta);
    setListaAbierta(false);
  }

  function agregarLinea() {
    const o = opciones.find(
      (x) => `${x.productoId}:${x.varianteId}` === seleccion,
    );
    if (!o) return;
    const cantidad = Math.max(1, Math.round(Number(cantNueva) || 1));
    setLineas((prev) => {
      const clave = `${o.productoId}:${o.varianteId}`;
      const existe = prev.find((l) => l.key === clave);
      if (existe) {
        return prev.map((l) =>
          l.key === clave ? { ...l, cantidad: l.cantidad + cantidad } : l,
        );
      }
      return [
        ...prev,
        {
          key: clave,
          productoId: o.productoId,
          varianteId: o.varianteId,
          descripcion: o.etiqueta,
          stock: o.stock,
          cantidad,
          precioUnitario: o.precio,
        },
      ];
    });
    setSeleccion("");
    setBusqueda("");
    setCantNueva("1");
  }

  function editar(key: string, campo: "cantidad" | "precioUnitario", valor: number) {
    setLineas((prev) =>
      prev.map((l) => (l.key === key ? { ...l, [campo]: valor } : l)),
    );
  }

  const subtotal = money(
    lineas.reduce((s, l) => s + l.cantidad * l.precioUnitario, 0),
  );
  const dsc = Math.min(subtotal, Math.max(0, money(Number(descuento) || 0)));
  const base = money(subtotal - dsc);
  const pct = Math.min(100, Math.max(0, Number(impuesto) || 0));
  const itbis = money((base * pct) / 100);
  const total = money(base + itbis);

  const hayFaltante = lineas.some((l) => l.cantidad > l.stock);

  function limpiar() {
    setError(null);
    setClienteNombre("");
    setClienteTelefono("");
    setClienteDocumento("");
    setLineas([]);
    setSeleccion("");
    setBusqueda("");
    setListaAbierta(false);
    setCantNueva("1");
    setDescuento("0");
    setImpuesto(String(config.impuestoPorcentaje ?? 0));
    setMetodoPago("");
    setPagar(false);
    setNotas("");
  }

  function emitir() {
    setError(null);
    if (!clienteNombre.trim()) {
      setError("Escribe el nombre del cliente.");
      return;
    }
    if (lineas.length === 0) {
      setError("Agrega al menos un producto.");
      return;
    }
    if (hayFaltante) {
      setError("Hay líneas con más cantidad que la existencia disponible.");
      return;
    }
    const payload: FacturaLineaInput[] = lineas.map((l) => ({
      productoId: l.productoId,
      varianteId: l.varianteId,
      cantidad: l.cantidad,
      precioUnitario: l.precioUnitario,
    }));
    iniciar(async () => {
      const r = await crearFactura({
        clienteNombre,
        clienteTelefono,
        clienteDocumento,
        descuento: Number(descuento) || 0,
        impuestoPorcentaje: pct,
        metodoPago,
        pagar,
        notas,
        lineas: payload,
        pedidoId: pedido?.id ?? null,
      });
      if (r.ok && r.id) {
        router.push(`/admin/facturas/${r.id}`);
        router.refresh();
      } else {
        setError(r.error ?? "No se pudo emitir la factura.");
      }
    });
  }

  return (
    <div className="max-w-3xl space-y-6 pb-28">
      {pedido && (
        <div className="rounded-xl border border-verde/30 bg-verde/10 p-4 text-sm text-verde">
          Facturando el pedido <strong>{pedido.codigo}</strong> recibido por
          WhatsApp. Revisa los datos y emite para descontar el inventario.
        </div>
      )}
      <Seccion titulo="Cliente">
        <Campo etiqueta="Nombre" requerido>
          <input
            value={clienteNombre}
            onChange={(e) => setClienteNombre(e.target.value)}
            required
            className={entrada}
          />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Teléfono">
            <input
              value={clienteTelefono}
              onChange={(e) => setClienteTelefono(e.target.value)}
              inputMode="tel"
              placeholder="809 555 1234"
              className={entrada}
            />
          </Campo>
          <Campo etiqueta="Cédula / RNC">
            <input
              value={clienteDocumento}
              onChange={(e) => setClienteDocumento(e.target.value)}
              className={entrada}
            />
          </Campo>
        </div>
      </Seccion>

      <Seccion titulo="Productos">
        <div className="relative">
          <input
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setSeleccion("");
              setListaAbierta(true);
            }}
            onFocus={() => setListaAbierta(true)}
            onBlur={() => setTimeout(() => setListaAbierta(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!seleccion && coincidencias.length > 0) {
                  elegirOpcion(coincidencias[0]);
                }
              } else if (e.key === "Escape") {
                setListaAbierta(false);
              }
            }}
            placeholder="Busca un producto por nombre…"
            className={entrada}
          />
          {listaAbierta && (
            <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#0c1310] shadow-xl">
              {coincidencias.length === 0 ? (
                <li className="px-3 py-2.5 text-sm text-white/40">
                  Nada coincide con &quot;{busqueda}&quot;.
                </li>
              ) : (
                coincidencias.map((o) => (
                  <li key={`${o.productoId}:${o.varianteId}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => elegirOpcion(o)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-white/5"
                    >
                      <span className="min-w-0 truncate">{o.etiqueta}</span>
                      <span
                        className={`shrink-0 text-xs ${
                          o.stock > 0 ? "text-white/40" : "text-rose-400"
                        }`}
                      >
                        {o.stock} disp. · {formatearRD(o.precio)}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="number"
            min={1}
            value={cantNueva}
            onChange={(e) => setCantNueva(e.target.value)}
            className={`${entrada} sm:w-24`}
            aria-label="Cantidad"
          />
          <button
            type="button"
            onClick={agregarLinea}
            disabled={!seleccion}
            className="shrink-0 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5 disabled:opacity-50"
          >
            Agregar
          </button>
        </div>

        {lineas.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-white/[0.03] text-left text-xs text-white/45">
                <tr>
                  <th className="px-3 py-2 font-medium">Artículo</th>
                  <th className="px-3 py-2 font-medium text-right">Cant.</th>
                  <th className="px-3 py-2 font-medium text-right">Precio</th>
                  <th className="px-3 py-2 font-medium text-right">Importe</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {lineas.map((l) => {
                  const falta = l.cantidad > l.stock;
                  return (
                    <tr key={l.key}>
                      <td className="px-3 py-2">
                        {l.descripcion}
                        {falta && (
                          <span className="block text-[11px] text-rose-400">
                            solo hay {l.stock}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min={1}
                          value={l.cantidad}
                          onChange={(e) =>
                            editar(
                              l.key,
                              "cantidad",
                              Math.max(1, Math.round(Number(e.target.value) || 1)),
                            )
                          }
                          className={`w-16 rounded-md border bg-white/5 px-2 py-1 text-right text-sm text-white focus:outline-none ${
                            falta ? "border-rose-500" : "border-white/10 focus:border-verde/60"
                          }`}
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          value={l.precioUnitario}
                          onChange={(e) =>
                            editar(
                              l.key,
                              "precioUnitario",
                              Math.max(0, money(Number(e.target.value) || 0)),
                            )
                          }
                          className="w-24 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-right text-sm text-white focus:border-verde/60 focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-medium">
                        {formatearRD(money(l.cantidad * l.precioUnitario))}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setLineas((prev) => prev.filter((x) => x.key !== l.key))
                          }
                          className="rounded px-1.5 py-0.5 text-white/40 hover:text-rose-400"
                          aria-label="Quitar"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>

      <Seccion titulo="Totales">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Descuento (RD$)">
            <input
              type="number"
              min={0}
              value={descuento}
              onChange={(e) => setDescuento(e.target.value)}
              className={entrada}
            />
          </Campo>
          <Campo etiqueta="ITBIS (%)">
            <input
              type="number"
              min={0}
              max={100}
              value={impuesto}
              onChange={(e) => setImpuesto(e.target.value)}
              className={entrada}
            />
          </Campo>
        </div>

        <dl className="ml-auto max-w-xs space-y-1 text-sm">
          <Fila etiqueta="Subtotal" valor={formatearRD(subtotal)} />
          {dsc > 0 && (
            <Fila etiqueta="Descuento" valor={`− ${formatearRD(dsc)}`} />
          )}
          {pct > 0 && (
            <Fila etiqueta={`ITBIS (${pct}%)`} valor={formatearRD(itbis)} />
          )}
          <div className="flex justify-between border-t border-white/10 pt-1 text-base font-extrabold">
            <span>Total</span>
            <span className="text-verde">{formatearRD(total)}</span>
          </div>
        </dl>
      </Seccion>

      <Seccion titulo="Pago">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Método de pago">
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className={entrada}
            >
              <option value="">—</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </Campo>
          <label className="flex cursor-pointer items-center gap-2 self-end pb-2 text-sm">
            <input
              type="checkbox"
              checked={pagar}
              onChange={(e) => setPagar(e.target.checked)}
              className="h-4 w-4 accent-verde"
            />
            Marcar como pagada al emitir
          </label>
        </div>
        <Campo etiqueta="Notas">
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            className={`${entrada} resize-y`}
          />
        </Campo>
      </Seccion>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0a0f0c]/95 px-4 py-3 backdrop-blur md:pl-64 md:pr-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          {error ? (
            <p className="text-sm font-semibold text-rose-400">{error}</p>
          ) : (
            <span className="text-sm text-white/60">
              Total{" "}
              <span className="font-bold text-white">{formatearRD(total)}</span>
            </span>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={limpiar}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={emitir}
              disabled={pendiente}
              className="rounded-lg bg-verde px-5 py-2 text-sm font-bold text-[#04140c] hover:brightness-105 disabled:opacity-60"
            >
              {pendiente ? "Emitiendo…" : "Emitir factura"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
      <h2 className="mb-4 font-display text-lg font-extrabold uppercase tracking-tight">
        {titulo}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Campo({
  etiqueta,
  requerido,
  children,
}: {
  etiqueta: string;
  requerido?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block flex-1">
      <span className="mb-1 block text-xs font-medium text-white/50">
        {etiqueta}
        {requerido && <span className="text-verde"> *</span>}
      </span>
      {children}
    </label>
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
