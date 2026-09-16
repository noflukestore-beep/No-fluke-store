"use server";

import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { precioEfectivo } from "@/lib/precios";
import { normalizarTelefono } from "@/lib/texto";
import type { PedidoItem } from "@/lib/firebase/tipos";

// TODO (login admin): verificar sesión + claim rol=admin al inicio de las
// acciones de administración de este archivo (cancelarPedido).

export interface ItemPedidoInput {
  productoId: string;
  varianteId: string;
  cantidad: number;
}

export interface PedidoInput {
  clienteNombre: string;
  clienteTelefono: string;
  clienteDireccion: string;
  nota: string;
  items: ItemPedidoInput[];
}

export interface ResultadoPedido {
  ok: boolean;
  error?: string;
  id?: string;
  codigo?: string;
  total?: number;
  items?: PedidoItem[];
}

const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generarCodigo(): string {
  let s = "";
  for (let i = 0; i < 4; i++) {
    s += ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)];
  }
  return `PED-${s}`;
}

async function codigoUnico(): Promise<string> {
  for (let intento = 0; intento < 5; intento++) {
    const codigo = generarCodigo();
    const snap = await adminDb
      .collection("pedidos")
      .where("codigo", "==", codigo)
      .limit(1)
      .get();
    if (snap.empty) return codigo;
  }
  return `PED-${Date.now().toString(36).toUpperCase()}`;
}

export async function crearPedido(
  entrada: PedidoInput,
): Promise<ResultadoPedido> {
  const clienteNombre = entrada.clienteNombre.trim();
  if (!clienteNombre) return { ok: false, error: "Escribe tu nombre." };

  const telefono = normalizarTelefono(entrada.clienteTelefono);
  if (!telefono) {
    return {
      ok: false,
      error: "Escribe un número de teléfono dominicano válido.",
    };
  }

  const clienteDireccion = entrada.clienteDireccion.trim();
  if (!clienteDireccion) {
    return { ok: false, error: "Escribe la dirección de entrega." };
  }

  const pedidos = entrada.items
    .map((i) => ({ ...i, cantidad: Math.round(Number(i.cantidad) || 0) }))
    .filter((i) => i.productoId && i.varianteId && i.cantidad > 0);
  if (pedidos.length === 0) {
    return { ok: false, error: "Tu carrito está vacío." };
  }

  const productoIds = [...new Set(pedidos.map((i) => i.productoId))];
  const cantidadPorProducto = new Map<string, number>();
  for (const i of pedidos) {
    cantidadPorProducto.set(
      i.productoId,
      (cantidadPorProducto.get(i.productoId) ?? 0) + i.cantidad,
    );
  }

  const snaps = await Promise.all(
    productoIds.map((id) => adminDb.collection("productos").doc(id).get()),
  );

  const items: PedidoItem[] = [];
  const faltantes: string[] = [];

  for (const snap of snaps) {
    if (!snap.exists) {
      faltantes.push("Un producto de tu pedido ya no está disponible.");
      continue;
    }
    const d = snap.data()!;
    if (!d.activo) {
      faltantes.push(`${d.nombre ?? "Producto"} ya no está disponible.`);
      continue;
    }
    const variantes: Array<Record<string, unknown>> = Array.isArray(
      d.variantes,
    )
      ? d.variantes
      : [];
    const cantidadDelProducto = cantidadPorProducto.get(snap.id) ?? 0;
    const { valor, tipo } = precioEfectivo(
      {
        precio: Number(d.precio) || 0,
        precioOferta: typeof d.precioOferta === "number" ? d.precioOferta : null,
        ofertaHasta:
          typeof d.ofertaHasta === "number"
            ? d.ofertaHasta
            : d.ofertaHasta?.toMillis?.() ?? null,
        precioMayor: typeof d.precioMayor === "number" ? d.precioMayor : null,
        cantidadMayor:
          typeof d.cantidadMayor === "number" ? d.cantidadMayor : null,
      },
      cantidadDelProducto,
    );

    for (const i of pedidos.filter((x) => x.productoId === snap.id)) {
      const v = variantes.find((x) => x.id === i.varianteId);
      if (!v || !v.activo) {
        faltantes.push(`${d.nombre ?? "Producto"}: esa opción ya no existe.`);
        continue;
      }
      const stock = Number(v.stock) || 0;
      if (stock < i.cantidad) {
        faltantes.push(
          `${d.nombre ?? "Producto"}${
            v.talla || v.color
              ? ` (${[v.talla, v.color].filter(Boolean).join(" / ")})`
              : ""
          }: solo hay ${stock} disponibles.`,
        );
        continue;
      }
      items.push({
        productoId: snap.id,
        varianteId: i.varianteId,
        productoNombre: String(d.nombre ?? ""),
        varianteDesc:
          [v.talla, v.color]
            .map((x) => String(x ?? "").trim())
            .filter(Boolean)
            .join(" / ") || "Único",
        precioUnitario: valor,
        tipoPrecio: tipo,
        cantidad: i.cantidad,
        imagenUrl: Array.isArray(d.imagenes) ? d.imagenes[0]?.url ?? null : null,
      });
    }
  }

  if (faltantes.length > 0) {
    return { ok: false, error: faltantes.join("\n") };
  }
  if (items.length === 0) {
    return { ok: false, error: "Tu carrito está vacío." };
  }

  const configSnap = await adminDb.doc("config/tienda").get();
  const costoEnvio = Number(configSnap.data()?.costoEnvio) || 0;

  const subtotal = items.reduce(
    (s, i) => s + i.precioUnitario * i.cantidad,
    0,
  );
  const total = subtotal + costoEnvio;
  const codigo = await codigoUnico();

  const ref = await adminDb.collection("pedidos").add({
    codigo,
    clienteNombre,
    clienteTelefono: telefono,
    clienteDireccion,
    nota: entrada.nota.trim() || null,
    items,
    subtotal,
    costoEnvio,
    total,
    estado: "pendiente",
    stockDescontado: false,
    facturaId: null,
    creadoEn: FieldValue.serverTimestamp(),
    actualizadoEn: FieldValue.serverTimestamp(),
  });

  revalidatePath("/admin/pedidos");

  return { ok: true, id: ref.id, codigo, total, items };
}

export async function cancelarPedido(id: string): Promise<ResultadoPedido> {
  const ref = adminDb.collection("pedidos").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, error: "El pedido ya no existe." };
  if (snap.data()?.estado === "confirmado") {
    return {
      ok: false,
      error: "Este pedido ya se facturó; no se puede cancelar.",
    };
  }
  await ref.update({
    estado: "cancelado",
    actualizadoEn: FieldValue.serverTimestamp(),
  });
  revalidatePath("/admin/pedidos");
  return { ok: true, id };
}
