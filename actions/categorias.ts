"use server";

import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath, revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { generarSlug } from "@/lib/texto";

// TODO (login admin): verificar sesión + claim rol=admin.

export interface CategoriaInput {
  id?: string;
  nombre: string;
  descripcion: string;
  activa: boolean;
}

export interface Resultado {
  ok: boolean;
  error?: string;
  id?: string;
}

function refrescar() {
  revalidateTag("catalogo", "max");
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
}

async function slugUnico(base: string, idPropio?: string): Promise<string> {
  let slug = base || "categoria";
  for (let n = 2; n <= 20; n++) {
    const snap = await adminDb
      .collection("categorias")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snap.empty || snap.docs[0].id === idPropio) return slug;
    slug = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

export async function guardarCategoria(
  entrada: CategoriaInput,
): Promise<Resultado> {
  const nombre = entrada.nombre.trim();
  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };

  const slug = await slugUnico(generarSlug(nombre), entrada.id);
  const datos = {
    nombre,
    slug,
    descripcion: entrada.descripcion.trim() || null,
    activa: entrada.activa,
  };

  let id = entrada.id;
  if (id) {
    const previo = await adminDb.collection("categorias").doc(id).get();
    // icono y orden se conservan tal cual (se administran aparte).
    await adminDb.collection("categorias").doc(id).update(datos);

    // Si cambió el nombre o el slug, sincronizar los productos (§2.2).
    const antes = previo.data();
    if (
      antes &&
      (antes.nombre !== datos.nombre || antes.slug !== datos.slug)
    ) {
      const prods = await adminDb
        .collection("productos")
        .where("categoriaId", "==", id)
        .get();
      // writeBatch: máx. 500 por lote (suficiente aquí).
      const lote = adminDb.batch();
      prods.docs.forEach((d) =>
        lote.update(d.ref, {
          categoriaNombre: datos.nombre,
          categoriaSlug: datos.slug,
          actualizadoEn: FieldValue.serverTimestamp(),
        }),
      );
      await lote.commit();
    }
  } else {
    // orden: al final de la lista actual.
    const todas = await adminDb.collection("categorias").get();
    let maxOrden = 0;
    todas.forEach((d) => {
      const o = d.data().orden;
      if (typeof o === "number" && o > maxOrden) maxOrden = o;
    });
    const ref = await adminDb.collection("categorias").add({
      ...datos,
      icono: null,
      orden: maxOrden + 1,
      imagenUrl: null,
      creadoEn: FieldValue.serverTimestamp(),
    });
    id = ref.id;
  }

  refrescar();
  return { ok: true, id };
}

export async function alternarActivaCategoria(
  id: string,
  activa: boolean,
): Promise<Resultado> {
  await adminDb.collection("categorias").doc(id).update({ activa });
  refrescar();
  return { ok: true, id };
}

/**
 * Elimina una categoría. Si tiene productos, se reasignan: a la categoría
 * `moverA` si se indica una válida, o si no quedan "sin categoría".
 */
export async function eliminarCategoria(
  id: string,
  moverA?: string,
): Promise<Resultado> {
  const productos = await adminDb
    .collection("productos")
    .where("categoriaId", "==", id)
    .get();

  if (!productos.empty) {
    let destino: { id: string; nombre: string; slug: string } | null = null;
    if (moverA && moverA !== id) {
      const catSnap = await adminDb.collection("categorias").doc(moverA).get();
      if (!catSnap.exists) {
        return { ok: false, error: "La categoría destino ya no existe." };
      }
      const c = catSnap.data()!;
      destino = { id: moverA, nombre: c.nombre ?? "", slug: c.slug ?? moverA };
    }

    const lote = adminDb.batch();
    productos.docs.forEach((d) =>
      lote.update(d.ref, {
        categoriaId: destino ? destino.id : "",
        categoriaNombre: destino ? destino.nombre : "Sin categoría",
        categoriaSlug: destino ? destino.slug : "",
        actualizadoEn: FieldValue.serverTimestamp(),
      }),
    );
    await lote.commit();
  }

  await adminDb.collection("categorias").doc(id).delete();
  refrescar();
  return { ok: true };
}
