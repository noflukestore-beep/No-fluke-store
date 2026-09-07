/**
 * Productos de ejemplo para maquetar el frente de tienda.
 * Se reemplazan por lecturas de Firestore con ISR en la Fase 2.
 */

export interface CategoriaDemo {
  nombre: string;
  slug: string;
}

export const CATEGORIAS: CategoriaDemo[] = [
  { nombre: "Perfumes", slug: "perfumes" },
  { nombre: "Ropa", slug: "ropa" },
  { nombre: "T-Shirts", slug: "t-shirts" },
  { nombre: "Calzados", slug: "calzados" },
  { nombre: "Accesorios", slug: "accesorios" },
];

export interface ProductoDemo {
  slug: string;
  nombre: string;
  marca: string;
  categoria: string;
  categoriaSlug: string;
  precio: number;
  precioOferta?: number;
  precioMayor?: number;
  cantidadMayor?: number;
  agotado?: boolean;
  ultimasUnidades?: number;
  destacado?: boolean;
}

export const PRODUCTOS: ProductoDemo[] = [
  {
    slug: "no-fluke-hoodie-negro",
    nombre: "No Fluke Hoodie Oversize",
    marca: "No Fluke",
    categoria: "Ropa",
    categoriaSlug: "ropa",
    precio: 3499,
    precioOferta: 2799,
    precioMayor: 2400,
    cantidadMayor: 6,
    destacado: true,
  },
  {
    slug: "street-crown-tee",
    nombre: "Street Crown Tee",
    marca: "No Fluke",
    categoria: "T-Shirts",
    categoriaSlug: "t-shirts",
    precio: 1250,
    precioMayor: 950,
    cantidadMayor: 6,
    destacado: true,
  },
  {
    slug: "fluke-sneakers-verde",
    nombre: "Fluke Sneakers Green Strike",
    marca: "No Fluke",
    categoria: "Calzados",
    categoriaSlug: "calzados",
    precio: 5999,
    precioOferta: 4999,
    ultimasUnidades: 3,
    destacado: true,
  },
  {
    slug: "varsity-jacket-crown",
    nombre: "Varsity Jacket Crown",
    marca: "No Fluke",
    categoria: "Ropa",
    categoriaSlug: "ropa",
    precio: 4499,
    destacado: true,
  },
  {
    slug: "crown-snapback",
    nombre: "Crown Snapback",
    marca: "No Fluke",
    categoria: "Accesorios",
    categoriaSlug: "accesorios",
    precio: 1699,
    precioMayor: 1300,
    cantidadMayor: 6,
    destacado: true,
  },
  {
    slug: "eau-de-noir-100ml",
    nombre: "Eau de Noir 100ml",
    marca: "Maison RD",
    categoria: "Perfumes",
    categoriaSlug: "perfumes",
    precio: 3900,
    precioOferta: 3200,
    destacado: true,
  },
  {
    slug: "citrus-drip-75ml",
    nombre: "Citrus Drip 75ml",
    marca: "Maison RD",
    categoria: "Perfumes",
    categoriaSlug: "perfumes",
    precio: 2800,
  },
  {
    slug: "cargo-tech-negro",
    nombre: "Cargo Tech Pants",
    marca: "No Fluke",
    categoria: "Ropa",
    categoriaSlug: "ropa",
    precio: 2999,
    precioOferta: 2399,
  },
  {
    slug: "tee-lifestyle-blanco",
    nombre: "Tee Lifestyle Blanco",
    marca: "No Fluke",
    categoria: "T-Shirts",
    categoriaSlug: "t-shirts",
    precio: 1150,
    precioMayor: 890,
    cantidadMayor: 6,
  },
  {
    slug: "runner-mono-black",
    nombre: "Runner Mono Black",
    marca: "No Fluke",
    categoria: "Calzados",
    categoriaSlug: "calzados",
    precio: 5200,
    agotado: true,
  },
  {
    slug: "tote-built-different",
    nombre: "Tote Built Different",
    marca: "No Fluke",
    categoria: "Accesorios",
    categoriaSlug: "accesorios",
    precio: 990,
  },
  {
    slug: "medias-crown-pack3",
    nombre: "Medias Crown (pack de 3)",
    marca: "No Fluke",
    categoria: "Accesorios",
    categoriaSlug: "accesorios",
    precio: 650,
    precioMayor: 480,
    cantidadMayor: 6,
  },
];

export const OFERTAS = PRODUCTOS.filter((p) => p.precioOferta != null);
export const DESTACADOS = PRODUCTOS.filter((p) => p.destacado);

export function porcentaje(precio: number, oferta: number): number {
  return Math.round(((precio - oferta) / precio) * 100);
}
