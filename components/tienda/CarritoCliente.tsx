"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { obtenerProductosCarrito } from "@/actions/carrito";
import { crearPedido } from "@/actions/pedidos";
import type { ProductoPublico } from "@/lib/firebase/tipos";
import { useHidratado } from "@/lib/hooks/useHidratado";
import { formatearRD, precioEfectivo } from "@/lib/precios";
import { useCarrito } from "@/lib/store/carrito";

const entrada =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-verde/60 focus:outline-none";

function construirMensaje(params: {
  codigo: string;
  nombre: string;
  direccion: string;
  items: {
    productoNombre: string;
    productoSku: string | null;
    varianteDesc: string;
    cantidad: number;
    precioUnitario: number;
  }[];
  total: number;
  enlaceAdmin: string;
}): string {
  const lineas = [
    `Hola! Quiero hacer un pedido *${params.codigo}*`,
    "",
    ...params.items.map(
      (i) =>
        `• ${i.productoSku ? `[${i.productoSku}] ` : ""}${i.cantidad}x ${i.productoNombre}` +
        (i.varianteDesc && i.varianteDesc !== "Único" ? ` (${i.varianteDesc})` : "") +
        ` — ${formatearRD(i.precioUnitario * i.cantidad)}`,
    ),
    "",
    `Total: *${formatearRD(params.total)}*`,
    `Nombre: ${params.nombre}`,
    `Dirección de entrega: ${params.direccion}`,
    "",
    `Panel: ${params.enlaceAdmin}`,
  ];
  return lineas.join("\n");
}

export default function CarritoCliente({
  whatsapp,
  costoEnvio,
}: {
  whatsapp: string;
  costoEnvio: number;
}) {
  const hidratado = useHidratado();

  const items = useCarrito((s) => s.items);
  const cambiarCantidad = useCarrito((s) => s.cambiarCantidad);
  const quitar = useCarrito((s) => s.quitar);
  const vaciar = useCarrito((s) => s.vaciar);

  const [productos, setProductos] = useState<Map<string, ProductoPublico>>(
    new Map(),
  );
  const idsClave = useMemo(
    () => [...new Set(items.map((i) => i.productoId))].sort().join(","),
    [items],
  );

  useEffect(() => {
    if (!hidratado || idsClave === "") return;
    let cancelado = false;
    obtenerProductosCarrito(idsClave.split(",")).then((lista) => {
      if (cancelado) return;
      setProductos(new Map(lista.map((p) => [p.id, p])));
    });
    return () => {
      cancelado = true;
    };
  }, [hidratado, idsClave]);

  const cantidadPorProducto = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of items) {
      m.set(i.productoId, (m.get(i.productoId) ?? 0) + i.cantidad);
    }
    return m;
  }, [items]);

  const lineas = useMemo(
    () =>
      items.map((i) => {
        const producto = productos.get(i.productoId);
        const variante = producto?.variantes.find((v) => v.id === i.varianteId);
        const cantidadDelProducto = cantidadPorProducto.get(i.productoId) ?? i.cantidad;
        const precio = producto
          ? precioEfectivo(producto, cantidadDelProducto).valor
          : null;
        const stockDisponible = variante?.stock ?? null;
        return {
          item: i,
          producto,
          precio,
          agotado: producto != null && (variante == null || !variante.activo || (stockDisponible ?? 0) <= 0),
          excedeStock: stockDisponible != null && i.cantidad > stockDisponible,
        };
      }),
    [items, productos, cantidadPorProducto],
  );

  const subtotal = lineas.reduce(
    (s, l) => s + (l.precio ?? 0) * l.item.cantidad,
    0,
  );
  const total = subtotal + costoEnvio;
  const hayProblemas = lineas.some((l) => l.agotado || l.excedeStock);

  // --- Formulario de datos --------------------------------------------
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codigoListo, setCodigoListo] = useState<string | null>(null);

  async function enviarPedido(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const r = await crearPedido({
      clienteNombre: nombre,
      clienteTelefono: telefono,
      clienteDireccion: direccion,
      nota,
      items: items.map((i) => ({
        productoId: i.productoId,
        varianteId: i.varianteId,
        cantidad: i.cantidad,
      })),
    });
    setEnviando(false);
    if (!r.ok || !r.items || !r.codigo || r.total == null) {
      setError(r.error ?? "No se pudo crear el pedido.");
      return;
    }

    const enlaceAdmin = `${window.location.origin}/admin/facturas?pedido=${r.id}`;
    const mensaje = construirMensaje({
      codigo: r.codigo,
      nombre,
      direccion,
      items: r.items,
      total: r.total,
      enlaceAdmin,
    });
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`;
    setCodigoListo(r.codigo);
    vaciar();
    window.location.href = url;
  }

  if (!hidratado) return null;

  if (codigoListo) {
    return (
      <div className="mt-10 rounded-xl border border-verde/30 bg-verde/10 p-6 text-center">
        <p className="text-lg font-bold text-verde">
          ¡Pedido {codigoListo} enviado!
        </p>
        <p className="mt-2 text-sm text-white/60">
          Si WhatsApp no abrió solo, revisa tus notificaciones o vuelve a
          intentarlo.
        </p>
        <Link
          href="/tienda"
          className="mt-4 inline-block rounded-full bg-verde px-5 py-2.5 text-sm font-bold text-[#04140c]"
        >
          Seguir viendo
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
        <p className="text-sm text-white/60">Tu carrito está vacío.</p>
        <Link
          href="/tienda"
          className="mt-4 inline-block rounded-full bg-verde px-5 py-2.5 text-sm font-bold text-[#04140c] transition-transform hover:scale-105"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4 pb-28">
      <ul className="space-y-2.5">
        {lineas.map(({ item, precio, agotado, excedeStock }) => (
          <li
            key={`${item.productoId}:${item.varianteId}`}
            className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
              {item.imagenUrl && (
                <Image
                  src={item.imagenUrl}
                  alt={item.nombre}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/tienda/producto/${item.slug}`}
                className="line-clamp-1 text-sm font-medium hover:text-verde"
              >
                {item.nombre}
              </Link>
              {item.varianteDesc !== "Único" && (
                <p className="text-xs text-white/40">{item.varianteDesc}</p>
              )}
              {agotado ? (
                <p className="mt-1 text-xs font-semibold text-rose-400">
                  Ya no está disponible
                </p>
              ) : excedeStock ? (
                <p className="mt-1 text-xs font-semibold text-amber-400">
                  Solo queda menos de lo que pediste
                </p>
              ) : null}
              <div className="mt-1.5 flex items-center justify-between">
                <div className="flex items-center rounded-md border border-white/15">
                  <button
                    type="button"
                    onClick={() =>
                      cambiarCantidad(
                        item.productoId,
                        item.varianteId,
                        item.cantidad - 1,
                      )
                    }
                    className="grid h-7 w-7 place-items-center text-white/70 hover:bg-white/5"
                    aria-label="Restar"
                  >
                    −
                  </button>
                  <span className="w-7 text-center text-xs font-semibold">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      cambiarCantidad(
                        item.productoId,
                        item.varianteId,
                        item.cantidad + 1,
                      )
                    }
                    className="grid h-7 w-7 place-items-center text-white/70 hover:bg-white/5"
                    aria-label="Sumar"
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {precio != null && (
                    <span className="text-sm font-semibold text-verde">
                      {formatearRD(precio * item.cantidad)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => quitar(item.productoId, item.varianteId)}
                    className="text-xs text-white/40 hover:text-rose-400"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={vaciar}
        className="text-xs text-white/40 hover:text-rose-400"
      >
        Vaciar carrito
      </button>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between text-white/70">
            <span>Subtotal</span>
            <span>{formatearRD(subtotal)}</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Envío</span>
            <span>{costoEnvio > 0 ? formatearRD(costoEnvio) : "A coordinar"}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-1.5 text-base font-extrabold">
            <span>Total</span>
            <span className="text-verde">{formatearRD(total)}</span>
          </div>
        </dl>
      </div>

      {hayProblemas && (
        <p className="text-sm font-semibold text-amber-400">
          Revisa las existencias marcadas arriba antes de continuar.
        </p>
      )}

      {!mostrarForm ? (
        <button
          type="button"
          onClick={() => setMostrarForm(true)}
          disabled={hayProblemas}
          className="fixed inset-x-0 bottom-16 z-30 mx-auto flex w-full max-w-3xl items-center justify-center gap-2 border-t border-white/10 bg-verde px-4 py-4 text-sm font-bold text-[#04140c] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 lg:static lg:rounded-lg lg:border-0"
        >
          Pedir por WhatsApp
        </button>
      ) : (
        <form
          onSubmit={enviarPedido}
          className="space-y-3 rounded-xl border border-verde/30 bg-white/[0.03] p-4"
        >
          <h2 className="font-display text-base font-extrabold uppercase tracking-tight">
            Tus datos para la entrega
          </h2>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-white/50">
              Nombre completo *
            </span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className={entrada}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-white/50">
              Teléfono (WhatsApp) *
            </span>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              inputMode="tel"
              placeholder="809 555 1234"
              className={entrada}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-white/50">
              Dirección de entrega *
            </span>
            <textarea
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              required
              rows={2}
              placeholder="Calle, número, sector, ciudad, referencia…"
              className={`${entrada} resize-y`}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-white/50">
              Nota (opcional)
            </span>
            <input
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej. entregar en la tarde"
              className={entrada}
            />
          </label>

          {error && (
            <p className="whitespace-pre-line text-sm font-semibold text-rose-400">
              {error}
            </p>
          )}

          <div className="flex gap-2 pb-1">
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/5"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 rounded-lg bg-verde px-5 py-2.5 text-sm font-bold text-[#04140c] hover:brightness-105 disabled:opacity-60"
            >
              {enviando ? "Enviando…" : "Enviar pedido por WhatsApp"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
