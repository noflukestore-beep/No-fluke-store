/**
 * Lecturas del catálogo para el PANEL (no cacheadas, incluyen inactivos y el
 * costo). Separado de `catalogo.ts` que es para el frente público con ISR.
 * SOLO servidor.
 */
import "server-only";
import type { DocumentData, Query } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import {
  normalizarConfig,
  type Categoria,
  type Config,
  type Factura,
  type FacturaItem,
  type MovimientoInventario,
  type Pedido,
  type PedidoItem,
  type Producto,
} from "@/lib/firebase/tipos";

function aMillis(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof (v as { toMillis?: () => number }).toMillis === "function") {
    return (v as { toMillis: () => number }).toMillis();
  }
  return null;
}

export function mapearProducto(id: string, d: DocumentData): Producto {
  const precioOferta =
    typeof d.precioOferta === "number" ? d.precioOferta : null;
  return {
    id,
    nombre: d.nombre ?? "",
    slug: d.slug ?? id,
    descripcion: d.descripcion ?? "",
    marca: d.marca ?? "",
    sku: d.sku ?? null,
    codigoBarra: d.codigoBarra ?? null,
    genero: d.genero ?? null,
    categoriaId: d.categoriaId ?? "",
    categoriaNombre: d.categoriaNombre ?? "",
    categoriaSlug: d.categoriaSlug ?? "",
    precioCompra: typeof d.precioCompra === "number" ? d.precioCompra : null,
    precio: typeof d.precio === "number" ? d.precio : 0,
    precioFantasma:
      typeof d.precioFantasma === "number" ? d.precioFantasma : null,
    precioOferta,
    tieneOferta: d.tieneOferta ?? precioOferta != null,
    ofertaHasta: aMillis(d.ofertaHasta),
    precioMayor: typeof d.precioMayor === "number" ? d.precioMayor : null,
    cantidadMayor:
      typeof d.cantidadMayor === "number" ? d.cantidadMayor : null,
    activo: d.activo ?? false,
    destacado: d.destacado ?? false,
    nuevoIngreso: d.nuevoIngreso ?? false,
    variantes: Array.isArray(d.variantes) ? d.variantes : [],
    imagenes: Array.isArray(d.imagenes) ? d.imagenes : [],
    keywords: Array.isArray(d.keywords) ? d.keywords : [],
    stockTotal: typeof d.stockTotal === "number" ? d.stockTotal : 0,
    stockMinimo: typeof d.stockMinimo === "number" ? d.stockMinimo : 3,
    creadoEn: aMillis(d.creadoEn) ?? 0,
    actualizadoEn: aMillis(d.actualizadoEn) ?? 0,
  };
}

export function mapearCategoria(id: string, d: DocumentData): Categoria {
  return {
    id,
    nombre: d.nombre ?? "",
    slug: d.slug ?? id,
    descripcion: d.descripcion ?? null,
    imagenUrl: d.imagenUrl ?? null,
    icono: d.icono ?? null,
    orden: typeof d.orden === "number" ? d.orden : 0,
    activa: d.activa ?? false,
    creadoEn: aMillis(d.creadoEn) ?? 0,
  };
}

export async function listarProductosAdmin(): Promise<Producto[]> {
  const snap = await adminDb
    .collection("productos")
    .orderBy("creadoEn", "desc")
    .get();
  return snap.docs.map((doc) => mapearProducto(doc.id, doc.data()));
}

export async function obtenerProductoAdmin(
  id: string,
): Promise<Producto | null> {
  const snap = await adminDb.collection("productos").doc(id).get();
  if (!snap.exists) return null;
  return mapearProducto(snap.id, snap.data()!);
}

export async function listarCategoriasAdmin(): Promise<Categoria[]> {
  const snap = await adminDb
    .collection("categorias")
    .orderBy("orden", "asc")
    .get();
  return snap.docs.map((doc) => mapearCategoria(doc.id, doc.data()));
}

export async function obtenerConfigAdmin(): Promise<Config> {
  const snap = await adminDb.doc("config/tienda").get();
  return normalizarConfig(snap.exists ? snap.data() : undefined);
}

function mapearFactura(id: string, d: DocumentData): Factura {
  const items: FacturaItem[] = (Array.isArray(d.items) ? d.items : []).map(
    (it: DocumentData) => ({
      productoId: it.productoId ?? "",
      varianteId: it.varianteId ?? "",
      descripcion: it.descripcion ?? "",
      sku: it.sku ?? "",
      cantidad: Number(it.cantidad) || 0,
      precioUnitario: Number(it.precioUnitario) || 0,
      importe: Number(it.importe) || 0,
      devuelto: Number(it.devuelto) || 0,
    }),
  );
  return {
    id,
    numero: d.numero ?? id,
    pedidoId: d.pedidoId ?? null,
    clienteId: d.clienteId ?? null,
    clienteNombre: d.clienteNombre ?? "",
    clienteTelefono: d.clienteTelefono ?? "",
    clienteDocumento: d.clienteDocumento ?? null,
    items,
    subtotal: Number(d.subtotal) || 0,
    descuento: Number(d.descuento) || 0,
    impuestoPorcentaje: Number(d.impuestoPorcentaje) || 0,
    impuestos: Number(d.impuestos) || 0,
    total: Number(d.total) || 0,
    estado: d.estado ?? "emitida",
    fechaEmision: aMillis(d.fechaEmision) ?? 0,
    fechaPago: aMillis(d.fechaPago),
    metodoPago: d.metodoPago ?? null,
    notas: d.notas ?? null,
    montoPagado: Number(d.montoPagado) || 0,
    tieneDevolucion: d.tieneDevolucion ?? false,
    montoDevuelto: Number(d.montoDevuelto) || 0,
    devoluciones: (Array.isArray(d.devoluciones) ? d.devoluciones : []).map(
      (v: DocumentData) => ({
        fecha: aMillis(v.fecha) ?? 0,
        motivo: v.motivo ?? null,
        monto: Number(v.monto) || 0,
        lineas: Array.isArray(v.lineas) ? v.lineas : [],
      }),
    ),
    saldoFinal: Number(d.saldoFinal) || 0,
    stockDescontado: d.stockDescontado ?? false,
    creadoEn: aMillis(d.creadoEn) ?? 0,
    actualizadoEn: aMillis(d.actualizadoEn) ?? 0,
  };
}

export async function listarFacturas(limite = 200): Promise<Factura[]> {
  const snap = await adminDb
    .collection("facturas")
    .orderBy("fechaEmision", "desc")
    .limit(limite)
    .get();
  return snap.docs.map((doc) => mapearFactura(doc.id, doc.data()));
}

export async function obtenerFactura(id: string): Promise<Factura | null> {
  const snap = await adminDb.collection("facturas").doc(id).get();
  if (!snap.exists) return null;
  return mapearFactura(snap.id, snap.data()!);
}

/** Busca por el número legible (ej. "FACT-000012"), no por el id interno. */
export async function obtenerFacturaPorNumero(
  numero: string,
): Promise<Factura | null> {
  const snap = await adminDb
    .collection("facturas")
    .where("numero", "==", numero.trim().toUpperCase())
    .limit(1)
    .get();
  if (snap.empty) return null;
  return mapearFactura(snap.docs[0].id, snap.docs[0].data());
}

function mapearPedido(id: string, d: DocumentData): Pedido {
  const items: PedidoItem[] = (Array.isArray(d.items) ? d.items : []).map(
    (it: DocumentData) => ({
      productoId: it.productoId ?? "",
      varianteId: it.varianteId ?? "",
      productoNombre: it.productoNombre ?? "",
      productoSku: it.productoSku ?? null,
      varianteDesc: it.varianteDesc ?? "Único",
      precioUnitario: Number(it.precioUnitario) || 0,
      tipoPrecio: it.tipoPrecio ?? "detalle",
      cantidad: Number(it.cantidad) || 0,
      imagenUrl: it.imagenUrl ?? null,
    }),
  );
  return {
    id,
    codigo: d.codigo ?? id,
    clienteNombre: d.clienteNombre ?? "",
    clienteTelefono: d.clienteTelefono ?? "",
    clienteDireccion: d.clienteDireccion ?? "",
    nota: d.nota ?? null,
    items,
    subtotal: Number(d.subtotal) || 0,
    costoEnvio: Number(d.costoEnvio) || 0,
    total: Number(d.total) || 0,
    estado: d.estado ?? "pendiente",
    stockDescontado: d.stockDescontado ?? false,
    facturaId: d.facturaId ?? null,
    creadoEn: aMillis(d.creadoEn) ?? 0,
    actualizadoEn: aMillis(d.actualizadoEn) ?? 0,
  };
}

export async function listarPedidosAdmin(limite = 200): Promise<Pedido[]> {
  const snap = await adminDb
    .collection("pedidos")
    .orderBy("creadoEn", "desc")
    .limit(limite)
    .get();
  return snap.docs.map((doc) => mapearPedido(doc.id, doc.data()));
}

export async function obtenerPedidoAdmin(id: string): Promise<Pedido | null> {
  const snap = await adminDb.collection("pedidos").doc(id).get();
  if (!snap.exists) return null;
  return mapearPedido(snap.id, snap.data()!);
}

function mapearMovimiento(id: string, d: DocumentData): MovimientoInventario {
  return {
    id,
    productoId: d.productoId ?? "",
    productoNombre: d.productoNombre ?? "",
    varianteId: d.varianteId ?? "",
    varianteDesc: d.varianteDesc ?? "Único",
    tipo: d.tipo ?? "ajuste",
    cantidad: typeof d.cantidad === "number" ? d.cantidad : 0,
    stockAntes: typeof d.stockAntes === "number" ? d.stockAntes : 0,
    stockDespues: typeof d.stockDespues === "number" ? d.stockDespues : 0,
    motivo: d.motivo ?? null,
    costoUnitario: typeof d.costoUnitario === "number" ? d.costoUnitario : null,
    creadoEn: aMillis(d.creadoEn) ?? 0,
  };
}

export async function listarMovimientos(
  limite = 120,
): Promise<MovimientoInventario[]> {
  const snap = await adminDb
    .collection("movimientos")
    .orderBy("creadoEn", "desc")
    .limit(limite)
    .get();
  return snap.docs.map((doc) => mapearMovimiento(doc.id, doc.data()));
}

/**
 * Todas las entradas de inventario ("Alta de producto" + ajustes de
 * entrada), sin límite de fecha ni cantidad — es la base del Reporte de
 * Compra, que filtra por rango de fechas en memoria. Un solo `where` de
 * igualdad no necesita índice compuesto.
 */
export async function listarEntradasInventario(): Promise<
  MovimientoInventario[]
> {
  const snap = await adminDb
    .collection("movimientos")
    .where("tipo", "==", "entrada")
    .get();
  return snap.docs.map((doc) => mapearMovimiento(doc.id, doc.data()));
}

/** Facturas emitidas cuya fecha cae dentro del rango (en millis). */
export async function listarFacturasEnRango(
  desde: number | null,
  hasta: number | null,
): Promise<Factura[]> {
  let q: Query = adminDb.collection("facturas");
  if (desde != null) q = q.where("fechaEmision", ">=", desde);
  if (hasta != null) q = q.where("fechaEmision", "<=", hasta);
  const snap = await q.orderBy("fechaEmision", "desc").get();
  return snap.docs.map((doc) => mapearFactura(doc.id, doc.data()));
}
