"use server";

import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath, revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import type { Genero } from "@/lib/firebase/tipos";
import { generarKeywords, generarSlug } from "@/lib/texto";
import { borrarImagenProducto } from "./imagenes";

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

export interface ImagenInput {
  url: string;
  alt: string;
  /** Ruta en Storage; vacía si la imagen vino por enlace. */
  path?: string;
}

export interface ProductoInput {
  id?: string;
  nombre: string;
  descripcion: string;
  marca: string;
  codigoBarra: string;
  genero: Genero | "";
  categoriaId: string;
  precioCompra: number | null;
  precio: number;
  precioFantasma: number | null;
  precioOferta: number | null;
  ofertaHasta: number | null;
  precioMayor: number | null;
  cantidadMayor: number | null;
  activo: boolean;
  destacado: boolean;
  nuevoIngreso: boolean;
  stockMinimo: number;
  variantes: VarianteInput[];
  imagenes: ImagenInput[];
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
  if (p.precioFantasma != null && !(p.precioFantasma > p.precio)) {
    return "El precio fantasma debe ser mayor que el precio de venta.";
  }
  if (p.precioOferta != null && !(p.precioOferta < p.precio)) {
    return "El precio de oferta debe ser menor que el precio de venta.";
  }
  if (p.precioMayor != null && p.precioMayor > 0) {
    if (p.cantidadMayor == null || !(p.cantidadMayor >= 2)) {
      return "Indica la cantidad mínima para el precio por mayor (2 o más).";
    }
    const tope = p.precioOferta ?? p.precio;
    if (!(p.precioMayor < tope)) {
      return "El precio por mayor debe ser menor que la oferta / el precio de venta.";
    }
  }
  if (p.variantes.length === 0) return "Agrega al menos una fila de existencia.";
  // Se permite una sola fila sin talla ni color (producto de talla única).
  if (p.variantes.length > 1) {
    for (const v of p.variantes) {
      if (!v.talla.trim() && !v.color.trim()) {
        return "Quita las filas vacías o ponles talla o color.";
      }
    }
  }
  for (const v of p.variantes) {
    if (v.stock < 0) return "La existencia no puede ser negativa.";
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

/**
 * Código correlativo único del artículo, ej. "ART-000042". Se asigna una
 * sola vez al crear el producto (o al abrir por primera vez uno viejo que
 * no tenía). El contador vive en `contadores/productos`, igual que el de
 * facturas, para que nunca se repita aunque se cree más de uno a la vez.
 */
async function generarCodigoProducto(): Promise<string> {
  const contadorRef = adminDb.doc("contadores/productos");
  const n = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(contadorRef);
    const siguiente = (Number(snap.data()?.ultimo) || 0) + 1;
    tx.set(contadorRef, { ultimo: siguiente }, { merge: true });
    return siguiente;
  });
  return `ART-${String(n).padStart(6, "0")}`;
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

  // Si es una edición, reutiliza el código del artículo; si el producto es
  // viejo y todavía no tenía (o si es uno nuevo), se genera uno ahora.
  const previo = entrada.id
    ? await adminDb.collection("productos").doc(entrada.id).get()
    : null;
  const sku = previo?.data()?.sku || (await generarCodigoProducto());

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

  const imagenes = entrada.imagenes
    .map((im, i) => ({
      path: im.path?.trim() || "",
      url: im.url.trim(),
      alt: im.alt.trim(),
      orden: i,
    }))
    .filter((im) => /^https?:\/\/\S+/i.test(im.url));

  const datos = {
    nombre: entrada.nombre.trim(),
    slug,
    descripcion: entrada.descripcion.trim(),
    marca: entrada.marca.trim(),
    sku,
    codigoBarra: entrada.codigoBarra.trim() || null,
    genero: entrada.genero || null,
    categoriaId: entrada.categoriaId,
    categoriaNombre: cat.nombre ?? "",
    categoriaSlug: cat.slug ?? entrada.categoriaId,
    precioCompra: entrada.precioCompra,
    precio: Math.round(entrada.precio),
    precioFantasma:
      entrada.precioFantasma != null
        ? Math.round(entrada.precioFantasma)
        : null,
    precioOferta:
      entrada.precioOferta != null ? Math.round(entrada.precioOferta) : null,
    tieneOferta: entrada.precioOferta != null,
    ofertaHasta: entrada.ofertaHasta,
    precioMayor:
      entrada.precioMayor != null && entrada.precioMayor > 0
        ? Math.round(entrada.precioMayor)
        : null,
    cantidadMayor:
      entrada.precioMayor != null && entrada.precioMayor > 0
        ? entrada.cantidadMayor
        : null,
    activo: entrada.activo,
    destacado: entrada.destacado,
    nuevoIngreso: entrada.nuevoIngreso,
    variantes,
    imagenes,
    keywords: generarKeywords(entrada.nombre, entrada.marca, cat.nombre),
    stockTotal,
    stockMinimo: Math.max(0, Math.round(entrada.stockMinimo || 3)),
    actualizadoEn: FieldValue.serverTimestamp(),
  };

  let id = entrada.id;
  if (id) {
    // Borra de Storage las fotos que se quitaron en esta edición.
    const pathsAntes: string[] = (previo?.data()?.imagenes ?? [])
      .map((im: { path?: string }) => im?.path)
      .filter(Boolean);
    const pathsAhora = new Set(imagenes.map((im) => im.path).filter(Boolean));
    await Promise.all(
      pathsAntes
        .filter((p) => !pathsAhora.has(p))
        .map((p) => borrarImagenProducto(p)),
    );
    await adminDb.collection("productos").doc(id).update(datos);
  } else {
    const ref = await adminDb.collection("productos").add({
      ...datos,
      creadoEn: FieldValue.serverTimestamp(),
    });
    id = ref.id;

    // Deja constancia en la bitácora de inventario de la existencia con la
    // que nace el producto — es la base del Reporte de Compra.
    const conStock = variantes.filter((v) => v.stock > 0);
    await Promise.all(
      conStock.map((v) =>
        adminDb.collection("movimientos").add({
          productoId: id,
          productoNombre: datos.nombre,
          varianteId: v.id,
          varianteDesc: [v.talla, v.color].filter(Boolean).join(" / ") || "Único",
          tipo: "entrada",
          cantidad: v.stock,
          stockAntes: 0,
          stockDespues: v.stock,
          motivo: "Alta de producto",
          costoUnitario: entrada.precioCompra,
          creadoEn: FieldValue.serverTimestamp(),
        }),
      ),
    );
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
  const snap = await adminDb.collection("productos").doc(id).get();
  const paths: string[] = (snap.data()?.imagenes ?? [])
    .map((im: { path?: string }) => im?.path)
    .filter(Boolean);
  await Promise.all(paths.map((p) => borrarImagenProducto(p)));
  await adminDb.collection("productos").doc(id).delete();
  revalidateTag("catalogo", "max");
  revalidatePath("/admin/productos");
  return { ok: true };
}
