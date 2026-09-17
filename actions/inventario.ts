"use server";

import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath, revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";

// TODO (login admin): verificar sesión + claim rol=admin.

export type ModoAjuste = "entrada" | "salida" | "fijar";

export interface AjusteInput {
  productoId: string;
  varianteId: string;
  modo: ModoAjuste;
  /** Siempre positiva; el modo define qué se hace con ella. */
  cantidad: number;
  motivo: string;
}

export interface Resultado {
  ok: boolean;
  error?: string;
  /** Existencia de la variante después del ajuste. */
  stock?: number;
}

function descripcionVariante(v: { talla?: string; color?: string }): string {
  const partes = [v.talla, v.color].map((x) => (x ?? "").trim()).filter(Boolean);
  return partes.join(" / ") || "Único";
}

export async function ajustarStock(entrada: AjusteInput): Promise<Resultado> {
  if (!entrada.productoId || !entrada.varianteId) {
    return { ok: false, error: "Artículo no válido." };
  }
  const cantidad = Math.round(Math.abs(Number(entrada.cantidad) || 0));
  if (entrada.modo !== "fijar" && cantidad <= 0) {
    return { ok: false, error: "La cantidad debe ser mayor que 0." };
  }
  if (!entrada.motivo.trim()) {
    return { ok: false, error: "Escribe el motivo del ajuste." };
  }

  const ref = adminDb.collection("productos").doc(entrada.productoId);

  try {
    const stockFinal = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("El producto ya no existe.");
      const d = snap.data()!;
      const variantes: Array<Record<string, unknown>> = Array.isArray(d.variantes)
        ? d.variantes.map((v) => ({ ...v }))
        : [];
      const i = variantes.findIndex((v) => v.id === entrada.varianteId);
      if (i < 0) throw new Error("Esa variante ya no existe.");

      const antes = Number(variantes[i].stock) || 0;
      let despues =
        entrada.modo === "entrada"
          ? antes + cantidad
          : entrada.modo === "salida"
            ? antes - cantidad
            : cantidad;
      despues = Math.max(0, Math.round(despues));

      if (despues === antes) return antes;

      variantes[i].stock = despues;
      const stockTotal = variantes.reduce(
        (s, v) => s + (Number(v.stock) || 0),
        0,
      );
      tx.update(ref, {
        variantes,
        stockTotal,
        actualizadoEn: FieldValue.serverTimestamp(),
      });

      const mov = adminDb.collection("movimientos").doc();
      tx.set(mov, {
        productoId: entrada.productoId,
        productoNombre: d.nombre ?? "",
        varianteId: entrada.varianteId,
        varianteDesc: descripcionVariante(variantes[i]),
        tipo:
          entrada.modo === "entrada"
            ? "entrada"
            : entrada.modo === "salida"
              ? "salida"
              : "ajuste",
        cantidad: despues - antes,
        stockAntes: antes,
        stockDespues: despues,
        motivo: entrada.motivo.trim() || null,
        costoUnitario:
          entrada.modo === "entrada" && typeof d.precioCompra === "number"
            ? d.precioCompra
            : null,
        creadoEn: FieldValue.serverTimestamp(),
      });

      return despues;
    });

    revalidateTag("catalogo", "max");
    revalidatePath("/admin/inventario");
    revalidatePath("/admin/inventario/movimientos");
    revalidatePath("/admin/productos");
    return { ok: true, stock: stockFinal };
  } catch (e) {
    return { ok: false, error: (e as Error).message || "No se pudo ajustar." };
  }
}
