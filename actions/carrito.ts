"use server";

import { obtenerProductos } from "@/lib/firebase/catalogo";
import type { ProductoPublico } from "@/lib/firebase/tipos";

/**
 * Precios y existencia actuales para las líneas del carrito (que solo vive en
 * `localStorage`). Reutiliza el catálogo cacheado con ISR, así que no cuesta
 * lecturas extra de Firestore. El precio final se vuelve a calcular en
 * `crearPedido`; esto es solo para mostrarle un estimado al cliente.
 */
export async function obtenerProductosCarrito(
  ids: string[],
): Promise<ProductoPublico[]> {
  if (ids.length === 0) return [];
  const set = new Set(ids);
  const productos = await obtenerProductos();
  return productos.filter((p) => set.has(p.id));
}
