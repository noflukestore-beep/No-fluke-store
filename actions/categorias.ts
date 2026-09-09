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
  icono: string;
  orden: number;
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
    icono: entrada.icono.trim() || null,
    orden: Math.round(entrada.orden || 0),
    activa: entrada.activa,
  };

  let id = entrada.id;
  if (id) {
    const previo = await adminDb.collection("categorias").doc(id).get();
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
    const ref = await adminDb.collection("categorias").add({
      ...datos,
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

export async function eliminarCategoria(id: string): Promise<Resultado> {
  const enUso = await adminDb
    .collection("productos")
    .where("categoriaId", "==", id)
    .limit(1)
    .get();
  if (!enUso.empty) {
    return {
      ok: false,
      error: "Tiene productos asignados. Muévelos a otra categoría primero.",
    };
  }
  await adminDb.collection("categorias").doc(id).delete();
  refrescar();
  return { ok: true };
}
