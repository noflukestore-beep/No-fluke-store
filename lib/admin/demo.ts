/**
 * Datos de ejemplo para maquetar el panel mientras no hay datos reales.
 * Se reemplazan por lecturas de Firestore (Admin SDK) en las fases 5 y 6.
 */
import type { EstadoPedido } from "@/lib/firebase/tipos";

// --- Categorías del catálogo (vienen de la colección `categorias`) ---------
export const CATEGORIAS_MENU = [
  { nombre: "Perfumes", slug: "perfumes" },
  { nombre: "Ropa", slug: "ropa" },
  { nombre: "T-Shirts", slug: "t-shirts" },
  { nombre: "Calzados", slug: "calzados" },
  { nombre: "Accesorios", slug: "accesorios" },
];

// --- KPIs del período -----------------------------------------------------
export interface Kpi {
  etiqueta: string;
  valor: string;
  delta: number; // % vs período anterior
  serie: number[]; // mini-sparkline
}

export const KPIS: Kpi[] = [
  {
    etiqueta: "Pedidos",
    valor: "128",
    delta: 12.5,
    serie: [8, 10, 9, 12, 11, 14, 13, 16, 15, 18, 20, 24],
  },
  {
    etiqueta: "Ventas",
    valor: "RD$342,600",
    delta: 18.2,
    serie: [12, 14, 13, 16, 18, 17, 21, 20, 24, 26, 29, 33],
  },
  {
    etiqueta: "Clientes",
    valor: "94",
    delta: 9.4,
    serie: [4, 5, 6, 6, 7, 8, 8, 9, 10, 11, 12, 13],
  },
  {
    etiqueta: "Ticket promedio",
    valor: "RD$2,680",
    delta: 3.1,
    serie: [20, 21, 20, 22, 23, 22, 24, 23, 25, 24, 26, 27],
  },
];

// --- Serie de ventas (últimos 30 días, en miles de RD$) -------------------
export const VENTAS_30D: number[] = [
  6, 7, 6.5, 8, 7.5, 9, 8.5, 7, 9.5, 10, 9, 11, 10.5, 12, 11, 13, 12.5, 11,
  13.5, 14, 12.5, 15, 14.5, 13, 15.5, 16, 15, 17, 16.5, 18,
];

// --- Rendimiento de productos -------------------------------------------
export interface ProductoTop {
  nombre: string;
  categoria: string;
  vendidos: number;
  ingreso: number;
  delta: number;
}

export const PRODUCTOS_TOP: ProductoTop[] = [
  { nombre: "No Fluke Hoodie", categoria: "Ropa", vendidos: 412, ingreso: 288400, delta: 24 },
  { nombre: "Street Crown Tee", categoria: "T-Shirts", vendidos: 389, ingreso: 116700, delta: 18 },
  { nombre: "Fluke Sneakers", categoria: "Calzados", vendidos: 276, ingreso: 138000, delta: 32 },
  { nombre: "Varsity Jacket", categoria: "Ropa", vendidos: 198, ingreso: 158400, delta: 12 },
  { nombre: "Crown Cap", categoria: "Accesorios", vendidos: 521, ingreso: 78150, delta: 28 },
];

// --- Resumen de inventario --------------------------------------------
export const INVENTARIO = {
  total: 1842,
  segmentos: [
    { etiqueta: "En stock", valor: 1485, pct: 81, color: "#16db65" },
    { etiqueta: "Stock bajo", valor: 267, pct: 14, color: "#f5b301" },
    { etiqueta: "Agotado", valor: 90, pct: 5, color: "#ef4444" },
  ],
};

// --- Pedidos recientes ------------------------------------------------
export interface PedidoDemo {
  codigo: string;
  clienteNombre: string;
  clienteTelefono: string;
  articulos: number;
  miniaturas: number;
  total: number;
  estado: EstadoPedido;
  hace: string;
  fecha: string;
  atrasado?: boolean;
}

export const PEDIDOS_DEMO: PedidoDemo[] = [
  { codigo: "NF-1284", clienteNombre: "Marcos Johnson", clienteTelefono: "18095551234", articulos: 3, miniaturas: 3, total: 4800, estado: "entregado", hace: "hace 12 min", fecha: "30 abr" },
  { codigo: "NF-1283", clienteNombre: "Sofía Carter", clienteTelefono: "18294447788", articulos: 2, miniaturas: 2, total: 3560, estado: "confirmado", hace: "hace 1 h", fecha: "30 abr" },
  { codigo: "NF-1282", clienteNombre: "Daniel Kim", clienteTelefono: "18493332211", articulos: 5, miniaturas: 4, total: 8800, estado: "pendiente", hace: "hace 3 h", fecha: "29 abr" },
  { codigo: "NF-1281", clienteNombre: "Jasmine Lee", clienteTelefono: "18095559090", articulos: 1, miniaturas: 1, total: 2600, estado: "entregado", hace: "hace 5 h", fecha: "29 abr" },
  { codigo: "NF-1280", clienteNombre: "Chris Walker", clienteTelefono: "18296661212", articulos: 4, miniaturas: 4, total: 5990, estado: "confirmado", hace: "ayer", fecha: "28 abr" },
  { codigo: "NF-1279", clienteNombre: "Ana Jiménez", clienteTelefono: "18493334455", articulos: 6, miniaturas: 4, total: 6900, estado: "pendiente", hace: "hace 1 día", fecha: "28 abr", atrasado: true },
  { codigo: "NF-1278", clienteNombre: "Yerlin Mateo", clienteTelefono: "18494561234", articulos: 1, miniaturas: 1, total: 950, estado: "cancelado", hace: "hace 2 días", fecha: "27 abr" },
];

export const RESUMEN_DIA = {
  pendientes: PEDIDOS_DEMO.filter((p) => p.estado === "pendiente").length,
  ventasConfirmadas: 12450,
  entregadosHoy: 2,
  ticketPromedio: 2680,
};

export const ALERTAS: Array<{ tipo: "stock" | "foto" | "atraso"; texto: string }> =
  [
    { tipo: "atraso", texto: "1 pedido pendiente de más de 24 horas" },
    { tipo: "stock", texto: "2 productos con stock bajo (≤ 3 unidades)" },
    { tipo: "foto", texto: "1 producto activo sin foto" },
  ];

// --- Productos destacados -------------------------------------------
export interface ProductoDestacado {
  nombre: string;
  precio: number;
  rating: number;
  reseñas: number;
}

export const PRODUCTOS_DESTACADOS: ProductoDestacado[] = [
  { nombre: "No Fluke Hoodie", precio: 3499, rating: 4.9, reseñas: 320 },
  { nombre: "Fluke Sneakers", precio: 5999, rating: 4.8, reseñas: 276 },
  { nombre: "Varsity Jacket", precio: 4499, rating: 4.9, reseñas: 198 },
  { nombre: "Crown Snapback", precio: 1699, rating: 4.8, reseñas: 521 },
];
