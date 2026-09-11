/**
 * Tipos del modelo de datos (Firestore, denormalizado).
 * Base: sección 2 de ESPECIFICACION.md + campos útiles del diseño del admin.
 *
 * Las fechas se guardan como epoch millis (`number`), no como `Timestamp`,
 * para que los objetos sean serializables y no acoplen la app a un SDK.
 * La capa de lectura (`lib/firebase/catalogo.ts`) hace la conversión.
 */

export type Genero = "hombre" | "mujer" | "unisex";
export type TipoPrecio = "detalle" | "oferta" | "mayor";
export type EstadoPedido =
  | "pendiente"
  | "confirmado"
  | "entregado"
  | "cancelado";
export type EstadoFactura = "emitida" | "pagada" | "anulada";

// --- Categorías ----------------------------------------------------------

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagenUrl: string | null;
  /** Emoji o nombre de icono para el menú. */
  icono: string | null;
  orden: number;
  activa: boolean;
  creadoEn: number;
}

// --- Productos ---------------------------------------------------------

export interface Variante {
  id: string;
  talla: string;
  color: string;
  sku: string;
  stock: number;
  /** Sobreprecio de esta variante (0 por defecto). */
  precioExtra: number;
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
  sku: string | null;
  codigoBarra: string | null;
  genero: Genero | null;

  // Denormalizado: se copia de la categoría para no hacer segunda lectura.
  categoriaId: string;
  categoriaNombre: string;
  categoriaSlug: string;

  /** Costo. SOLO admin — nunca se envía al frente de tienda. */
  precioCompra: number | null;

  precio: number;
  precioOferta: number | null;
  /** Denormalizado = `precioOferta != null`. La vigencia se revisa al leer. */
  tieneOferta: boolean;
  /** Millis. `null` = sin fecha de fin. */
  ofertaHasta: number | null;

  precioMayor: number | null;
  /** Unidades del producto, sumando variantes. */
  cantidadMayor: number | null;

  activo: boolean;
  destacado: boolean;
  nuevoIngreso: boolean;

  variantes: Variante[];
  imagenes: Imagen[];
  /** Tokens en minúscula y sin acentos, para búsqueda con array-contains. */
  keywords: string[];

  /** Suma de `stock` de las variantes. Se recalcula al guardar. */
  stockTotal: number;
  /** Umbral para la alerta de stock bajo. */
  stockMinimo: number;

  creadoEn: number;
  actualizadoEn: number;
}

/** El producto tal como se envía al frente público: sin el costo. */
export type ProductoPublico = Omit<Producto, "precioCompra">;

// --- Pedidos ---------------------------------------------------------

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
  creadoEn: number;
  actualizadoEn: number;
}

// --- Facturas -------------------------------------------------------

export interface FacturaItem {
  productoId: string;
  varianteId: string;
  /** Ej. "Eau de Noir 100ml — M / Negro". */
  descripcion: string;
  sku: string;
  cantidad: number;
  /** Precio unitario congelado al emitir. */
  precioUnitario: number;
  /** cantidad × precioUnitario. */
  importe: number;
  /** Unidades ya devueltas de esta línea. */
  devuelto: number;
}

export interface DevolucionFactura {
  fecha: number;
  motivo: string | null;
  /** Monto reembolsado (incluye su parte de descuento e impuesto). */
  monto: number;
  lineas: { varianteId: string; cantidad: number }[];
}

export interface Factura {
  id: string;
  /** Correlativo legible. Ej. "FACT-000001". */
  numero: string;
  pedidoId: string | null;
  /** = teléfono normalizado del cliente, o null. */
  clienteId: string | null;
  clienteNombre: string;
  clienteTelefono: string;
  /** Cédula o RNC. */
  clienteDocumento: string | null;

  items: FacturaItem[];

  subtotal: number;
  /** Descuento general en RD$ sobre el subtotal. */
  descuento: number;
  impuestoPorcentaje: number;
  impuestos: number;
  total: number;

  estado: EstadoFactura;
  fechaEmision: number;
  fechaPago: number | null;
  metodoPago: string | null;
  notas: string | null;

  montoPagado: number;
  tieneDevolucion: boolean;
  montoDevuelto: number;
  devoluciones: DevolucionFactura[];
  /** total − pagado − devuelto (nunca negativo). */
  saldoFinal: number;

  /** Evita descontar/reponer inventario dos veces. */
  stockDescontado: boolean;
  creadoEn: number;
  actualizadoEn: number;
}

// --- Inventario ------------------------------------------------------

export type TipoMovimiento = "entrada" | "salida" | "ajuste" | "venta";

/** Una línea de la bitácora de inventario. Cada ajuste deja una. */
export interface MovimientoInventario {
  id: string;
  productoId: string;
  productoNombre: string;
  varianteId: string;
  /** Ej. "M / Negro" o "Único". */
  varianteDesc: string;
  tipo: TipoMovimiento;
  /** Con signo: positivo entra, negativo sale. */
  cantidad: number;
  stockAntes: number;
  stockDespues: number;
  motivo: string | null;
  creadoEn: number;
}

// --- Clientes (ligero, derivado de los pedidos) ------------------------

export interface Cliente {
  /** = teléfono. */
  id: string;
  nombre: string;
  telefono: string;
  totalPedidos: number;
  totalGastado: number;
  primerPedido: number;
  ultimoPedido: number;
}

// --- Configuración de la tienda ---------------------------------------

export interface Config {
  nombreTienda: string;
  /** Internacional, sin `+`. Ej. "18091234567". */
  whatsapp: string;
  moneda: string;
  costoEnvio: number;
  mensajeBienvenida: string | null;
  logoUrl: string | null;
  correo: string | null;
  direccion: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  /** RNC / cédula del negocio, para las facturas. */
  rnc: string | null;
  /** ITBIS por defecto en las facturas. 0 = sin impuesto. */
  impuestoPorcentaje: number;
}

export const CONFIG_POR_DEFECTO: Config = {
  nombreTienda: "No Fluke Store",
  whatsapp: "",
  moneda: "DOP",
  costoEnvio: 0,
  mensajeBienvenida: null,
  logoUrl: null,
  correo: null,
  direccion: null,
  instagram: null,
  facebook: null,
  tiktok: null,
  rnc: null,
  impuestoPorcentaje: 0,
};

/**
 * Convierte el documento crudo `config/tienda` en un `Config` seguro:
 * solo los campos conocidos y serializables (nada de `Timestamp`, que
 * rompe el paso a componentes cliente).
 */
export function normalizarConfig(
  d: Record<string, unknown> | undefined,
): Config {
  const texto = (v: unknown) =>
    typeof v === "string" && v.trim() ? v : null;
  return {
    nombreTienda:
      typeof d?.nombreTienda === "string" && d.nombreTienda.trim()
        ? d.nombreTienda
        : CONFIG_POR_DEFECTO.nombreTienda,
    whatsapp: typeof d?.whatsapp === "string" ? d.whatsapp : "",
    moneda:
      typeof d?.moneda === "string" ? d.moneda : CONFIG_POR_DEFECTO.moneda,
    costoEnvio: typeof d?.costoEnvio === "number" ? d.costoEnvio : 0,
    mensajeBienvenida: texto(d?.mensajeBienvenida),
    logoUrl: texto(d?.logoUrl),
    correo: texto(d?.correo),
    direccion: texto(d?.direccion),
    instagram: texto(d?.instagram),
    facebook: texto(d?.facebook),
    tiktok: texto(d?.tiktok),
    rnc: texto(d?.rnc),
    impuestoPorcentaje:
      typeof d?.impuestoPorcentaje === "number" ? d.impuestoPorcentaje : 0,
  };
}
