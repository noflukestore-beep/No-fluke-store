/**
 * Lectura del catálogo público. SOLO servidor (Admin SDK).
 *
 * Estrategia (ESPECIFICACION.md §4 y §5): el catálogo es pequeño, así que se
 * trae completo una vez, se cachea con ISR (`unstable_cache`, revalida cada
 * 60s) y las pantallas filtran en memoria. Un mismo juego de lecturas sirve a
 * todos los visitantes hasta la siguiente revalidación.
 *
 * Tras editar productos en el panel, llamar `revalidateTag("catalogo")`.
 */
import "server-only";
import { unstable_cache } from "next/cache";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import {
  normalizarConfig,
  type Categoria,
  type Config,
  type Producto,
  type ProductoPublico,
} from "@/lib/firebase/tipos";
import { precioEfectivo } from "@/lib/precios";
import { quitarAcentos } from "@/lib/texto";

// --- Serialización -----------------------------------------------------

function aMillis(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof (v as { toMillis?: () => number }).toMillis === "function") {
    return (v as { toMillis: () => number }).toMillis();
  }
  return null;
}

function serializarProducto(doc: QueryDocumentSnapshot): Producto {
  const d = doc.data();
  const precioOferta =
    typeof d.precioOferta === "number" ? d.precioOferta : null;
  return {
    id: doc.id,
    nombre: d.nombre ?? "",
    slug: d.slug ?? doc.id,
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
    imagenes: Array.isArray(d.imagenes)
      ? [...d.imagenes].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      : [],
    keywords: Array.isArray(d.keywords) ? d.keywords : [],
    stockTotal: typeof d.stockTotal === "number" ? d.stockTotal : 0,
    stockMinimo: typeof d.stockMinimo === "number" ? d.stockMinimo : 3,
    creadoEn: aMillis(d.creadoEn) ?? 0,
    actualizadoEn: aMillis(d.actualizadoEn) ?? 0,
  };
}

function serializarCategoria(doc: QueryDocumentSnapshot): Categoria {
  const d = doc.data();
  return {
    id: doc.id,
    nombre: d.nombre ?? "",
    slug: d.slug ?? doc.id,
    descripcion: d.descripcion ?? null,
    imagenUrl: d.imagenUrl ?? null,
    icono: d.icono ?? null,
    orden: typeof d.orden === "number" ? d.orden : 0,
    activa: d.activa ?? false,
    creadoEn: aMillis(d.creadoEn) ?? 0,
  };
}

function sinCosto(p: Producto): ProductoPublico {
  const copia: Partial<Producto> = { ...p };
  delete copia.precioCompra;
  return copia as ProductoPublico;
}

// --- Carga cacheada ---------------------------------------------------

const cargarCatalogo = unstable_cache(
  async (): Promise<{
    productos: ProductoPublico[];
    categorias: Categoria[];
  }> => {
    const [prodSnap, catSnap] = await Promise.all([
      adminDb.collection("productos").orderBy("creadoEn", "desc").get(),
      adminDb.collection("categorias").orderBy("orden", "asc").get(),
    ]);

    return {
      productos: prodSnap.docs
        .map(serializarProducto)
        .filter((p) => p.activo)
        .map(sinCosto),
      categorias: catSnap.docs.map(serializarCategoria).filter((c) => c.activa),
    };
  },
  ["catalogo-v1"],
  { revalidate: 60, tags: ["catalogo"] },
);

// --- API pública ----------------------------------------------------

export async function obtenerCategorias(): Promise<Categoria[]> {
  return (await cargarCatalogo()).categorias;
}

export async function obtenerProductos(): Promise<ProductoPublico[]> {
  return (await cargarCatalogo()).productos;
}

export async function obtenerDestacados(): Promise<ProductoPublico[]> {
  return (await obtenerProductos()).filter((p) => p.destacado);
}

/** Productos con oferta vigente ahora. */
export async function obtenerOfertas(): Promise<ProductoPublico[]> {
  return (await obtenerProductos()).filter(
    (p) => precioEfectivo(p, 1).tipo === "oferta",
  );
}

export async function obtenerPorCategoria(
  slug: string,
): Promise<ProductoPublico[]> {
  return (await obtenerProductos()).filter((p) => p.categoriaSlug === slug);
}

export async function obtenerProducto(
  slug: string,
): Promise<ProductoPublico | null> {
  return (await obtenerProductos()).find((p) => p.slug === slug) ?? null;
}

export async function obtenerCategoria(
  slug: string,
): Promise<Categoria | null> {
  return (await obtenerCategorias()).find((c) => c.slug === slug) ?? null;
}

export async function buscar(
  termino: string,
  categoriaSlug?: string,
): Promise<ProductoPublico[]> {
  let productos = await obtenerProductos();
  if (categoriaSlug) {
    productos = productos.filter((p) => p.categoriaSlug === categoriaSlug);
  }
  const q = quitarAcentos(termino.trim().toLowerCase());
  if (!q) return productos;
  return productos.filter((p) => {
    if (p.keywords.includes(q)) return true;
    const texto = quitarAcentos(
      `${p.nombre} ${p.marca} ${p.categoriaNombre}`.toLowerCase(),
    );
    return texto.includes(q);
  });
}

export async function obtenerConfig(): Promise<Config> {
  const leer = unstable_cache(
    async () => {
      const snap = await adminDb.doc("config/tienda").get();
      return normalizarConfig(snap.exists ? snap.data() : undefined);
    },
    ["config-tienda-v1"],
    { revalidate: 300, tags: ["catalogo", "config"] },
  );
  return leer();
}
