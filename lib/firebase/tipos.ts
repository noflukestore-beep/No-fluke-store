/**
 * Tipos del modelo de datos. Reflejan exactamente la sección 2 de
 * ESPECIFICACION.md. Firestore no tiene joins: variantes e imágenes viven
 * embebidas dentro del producto.
 */

/**
 * Forma estructural común a `Timestamp` del SDK de cliente
 * (`firebase/firestore`) y del Admin SDK (`firebase-admin/firestore`).
 * Se usa aquí para no acoplar los tipos del modelo a un SDK concreto.
 */
export interface Timestamp {
  toDate(): Date;
  toMillis(): number;
  seconds: number;
  nanoseconds: number;
}

export type TipoPrecio = "detalle" | "oferta" | "mayor";

export type EstadoPedido =
  | "pendiente"
  | "confirmado"
  | "entregado"
  | "cancelado";

// --- Categorías ------------------------------------------------------------

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  imagenUrl: string | null;
  orden: number;
  activa: boolean;
  creadoEn: Timestamp;
}

// --- Productos -----------------------------------------------------------

export interface Variante {
  id: string;
  talla: string;
  color: string;
  sku: string;
  stock: number;
  activo: boolean;
}

export interface Imagen {
  /** Ruta en Storage, ej. `productos/abc/1.webp`. Necesaria para borrar. */
  path: string;
  url: string;
  alt: string;
  orden: number;
}

export interface Producto {
  id: string;
  nombre: string;
  /** Único, se valida al guardar. */
  slug: string;
  descripcion: string;
  marca: string;

  // Denormalizado: se copia de la categoría para no hacer segunda lectura.
  categoriaId: string;
  categoriaNombre: string;
  categoriaSlug: string;

  precio: number;
  precioOferta: number | null;
  ofertaHasta: Timestamp | null;

  // Precio al por mayor: se aplica al llegar a la cantidad mínima.
  precioMayor: number | null;
  /** Unidades del producto, sumando variantes. */
  cantidadMayor: number | null;

  activo: boolean;
  destacado: boolean;

  variantes: Variante[];
  imagenes: Imagen[];

  /** Tokens en minúscula y sin acentos, para búsqueda con array-contains. */
  keywords: string[];

  /** Suma de `stock` de las variantes. Se recalcula al guardar. */
  stockTotal: number;
  creadoEn: Timestamp;
  actualizadoEn: Timestamp;
}

// --- Pedidos ------------------------------------------------------------

export interface PedidoItem {
  productoId: string;
  varianteId: string;
  productoNombre: string;
  /** Ej. "Talla M / Negro". */
  varianteDesc: string;
  precioUnitario: number;
  tipoPrecio: TipoPrecio;
  cantidad: number;
  imagenUrl: string | null;
}

export interface Pedido {
  id: string;
  /** Corto, para decirlo por WhatsApp. Ej. "PED-8F3K". */
  codigo: string;
  clienteNombre: string;
  clienteTelefono: string;
  nota: string | null;

  /** Copia congelada de los precios al momento del pedido. */
  items: PedidoItem[];

  subtotal: number;
  costoEnvio: number;
  total: number;

  estado: EstadoPedido;
  /** Evita descontar stock dos veces. */
  stockDescontado: boolean;
  creadoEn: Timestamp;
  actualizadoEn: Timestamp;
}

// --- Configuración de la tienda --------------------------------------------

export interface Config {
  nombreTienda: string;
  /** Internacional, sin `+`. Ej. "18091234567". */
  whatsapp: string;
  moneda: string;
  costoEnvio: number;
  mensajeBienvenida: string | null;
  logoUrl: string | null;
}
