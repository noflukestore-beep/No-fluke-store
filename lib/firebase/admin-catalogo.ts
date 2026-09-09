/**
 * Lecturas del catálogo para el PANEL (no cacheadas, incluyen inactivos y el
 * costo). Separado de `catalogo.ts` que es para el frente público con ISR.
 * SOLO servidor.
 */
import "server-only";
import type { DocumentData } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { Categoria, Producto } from "@/lib/firebase/tipos";

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
