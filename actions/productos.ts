"use server";

import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath, revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import type { Genero } from "@/lib/firebase/tipos";
import { generarKeywords, generarSlug } from "@/lib/texto";

// TODO (login admin): verificar sesión + claim rol=admin al inicio de cada
// acción. Los Server Actions son alcanzables por POST directo.

export interface VarianteInput {
  id: string;
  talla: string;
  color: string;
  sku: string;
  stock: number;
  precioExtra: number;
  activo: boolean;
}

export interface ProductoInput {
  id?: string;
  nombre: string;
  descripcion: string;
  marca: string;
  sku: string;
  codigoBarra: string;
  genero: Genero | "";
  categoriaId: string;
  precioCompra: number | null;
  precio: number;
  precioOferta: number | null;
  ofertaHasta: number | null;
  precioMayor: number | null;
  cantidadMayor: number | null;
  activo: boolean;
  destacado: boolean;
  nuevoIngreso: boolean;
  stockMinimo: number;
  variantes: VarianteInput[];
}

export interface Resultado {
  ok: boolean;
  error?: string;
  id?: string;
}

function validar(p: ProductoInput): string | null {
  if (!p.nombre.trim()) return "El nombre es obligatorio.";
  if (!p.categoriaId) return "Elige una categoría.";
  if (!(p.precio > 0)) return "El precio de venta debe ser mayor que 0.";
  if (p.precioOferta != null && !(p.precioOferta < p.precio)) {
    return "El precio de oferta debe ser menor que el precio de venta.";
  }
  if (p.precioMayor != null) {
    if (p.cantidadMayor == null || !(p.cantidadMayor >= 2)) {
      return "Indica la cantidad mínima para el precio por mayor (2 o más).";
    }
    const tope = p.precioOferta ?? p.precio;
    if (!(p.precioMayor < tope)) {
      return "El precio por mayor debe ser menor que la oferta / el precio de venta.";
    }
  }
  if (p.variantes.length === 0) return "Agrega al menos una variante.";
  for (const v of p.variantes) {
    if (!v.talla.trim() && !v.color.trim()) {
      return "Cada variante necesita talla o color.";
    }
    if (v.stock < 0) return "El stock no puede ser negativo.";
  }
  return null;
}

async function slugUnico(base: string, idPropio?: string): Promise<string> {
  let slug = base || "producto";
  for (let n = 2; n <= 20; n++) {
    const snap = await adminDb
      .collection("productos")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snap.empty || snap.docs[0].id === idPropio) return slug;
    slug = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

export async function guardarProducto(
  entrada: ProductoInput,
): Promise<Resultado> {
  const error = validar(entrada);
  if (error) return { ok: false, error };

  const catSnap = await adminDb
    .collection("categorias")
    .doc(entrada.categoriaId)
    .get();
  if (!catSnap.exists) return { ok: false, error: "La categoría no existe." };
  const cat = catSnap.data()!;

  const slug = await slugUnico(generarSlug(entrada.nombre), entrada.id);

  const variantes = entrada.variantes.map((v, i) => ({
    id: v.id || `v${i + 1}`,
    talla: v.talla.trim(),
    color: v.color.trim(),
    sku: v.sku.trim(),
    stock: Math.max(0, Math.round(v.stock || 0)),
    precioExtra: Math.max(0, Math.round(v.precioExtra || 0)),
    activo: v.activo,
  }));
  const stockTotal = variantes.reduce((s, v) => s + v.stock, 0);

  const datos = {
    nombre: entrada.nombre.trim(),
    slug,
    descripcion: entrada.descripcion.trim(),
    marca: entrada.marca.trim(),
    sku: entrada.sku.trim() || null,
    codigoBarra: entrada.codigoBarra.trim() || null,
    genero: entrada.genero || null,
    categoriaId: entrada.categoriaId,
    categoriaNombre: cat.nombre ?? "",
    categoriaSlug: cat.slug ?? entrada.categoriaId,
    precioCompra: entrada.precioCompra,
    precio: Math.round(entrada.precio),
    precioOferta:
      entrada.precioOferta != null ? Math.round(entrada.precioOferta) : null,
    tieneOferta: entrada.precioOferta != null,
    ofertaHasta: entrada.ofertaHasta,
    precioMayor:
      entrada.precioMayor != null ? Math.round(entrada.precioMayor) : null,
    cantidadMayor: entrada.cantidadMayor,
    activo: entrada.activo,
    destacado: entrada.destacado,
    nuevoIngreso: entrada.nuevoIngreso,
    variantes,
    keywords: generarKeywords(entrada.nombre, entrada.marca, cat.nombre),
    stockTotal,
    stockMinimo: Math.max(0, Math.round(entrada.stockMinimo || 3)),
    actualizadoEn: FieldValue.serverTimestamp(),
  };

  let id = entrada.id;
  if (id) {
    await adminDb.collection("productos").doc(id).update(datos);
  } else {
    const ref = await adminDb.collection("productos").add({
      ...datos,
      imagenes: [],
      creadoEn: FieldValue.serverTimestamp(),
    });
    id = ref.id;
  }

  revalidateTag("catalogo", "max");
  revalidatePath("/admin/productos");
  return { ok: true, id };
}

export async function alternarActivo(
  id: string,
  activo: boolean,
): Promise<Resultado> {
  await adminDb
    .collection("productos")
    .doc(id)
    .update({ activo, actualizadoEn: FieldValue.serverTimestamp() });
  revalidateTag("catalogo", "max");
  revalidatePath("/admin/productos");
  return { ok: true, id };
}

export async function eliminarProducto(id: string): Promise<Resultado> {
  await adminDb.collection("productos").doc(id).delete();
  revalidateTag("catalogo", "max");
  revalidatePath("/admin/productos");
  return { ok: true };
}
