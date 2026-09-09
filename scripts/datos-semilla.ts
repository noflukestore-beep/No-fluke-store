/**
 * Datos de ejemplo para sembrar Firestore. Los usa `sembrar-demo.ts`.
 * No es código de la app; solo tooling.
 */
import type { Genero } from "../lib/firebase/tipos";

export interface CategoriaSemilla {
  nombre: string;
  slug: string;
  icono: string;
  descripcion: string;
}

export const CATEGORIAS_SEMILLA: CategoriaSemilla[] = [
  { nombre: "Perfumes", slug: "perfumes", icono: "🧴", descripcion: "Fragancias para hombre y mujer." },
  { nombre: "Ropa", slug: "ropa", icono: "🧥", descripcion: "Hoodies, chaquetas y pantalones." },
  { nombre: "T-Shirts", slug: "t-shirts", icono: "👕", descripcion: "T-shirts y básicas oversize." },
  { nombre: "Calzados", slug: "calzados", icono: "👟", descripcion: "Tenis y sneakers." },
  { nombre: "Accesorios", slug: "accesorios", icono: "🧢", descripcion: "Gorras, totes y medias." },
];

export interface ProductoSemilla {
  slug: string;
  nombre: string;
  marca: string;
  categoriaSlug: string;
  genero: Genero;
  descripcion: string;
  precio: number;
  precioOferta?: number;
  precioMayor?: number;
  cantidadMayor?: number;
  colores: string[];
  tallas: string[];
  /** 0 => agotado; number => stock total exacto; undefined => stock normal. */
  stockObjetivo?: number;
  destacado?: boolean;
  nuevoIngreso?: boolean;
}

export const PRODUCTOS_SEMILLA: ProductoSemilla[] = [
  {
    slug: "no-fluke-hoodie-oversize",
    nombre: "No Fluke Hoodie Oversize",
    marca: "No Fluke",
    categoriaSlug: "ropa",
    genero: "unisex",
    descripcion:
      "Hoodie oversize de algodón peinado 320g, capucha forrada y bolsillo canguro. Estampado del logo en el pecho.",
    precio: 3499,
    precioOferta: 2799,
    precioMayor: 2400,
    cantidadMayor: 6,
    colores: ["Negro", "Verde"],
    tallas: ["S", "M", "L", "XL"],
    destacado: true,
    nuevoIngreso: true,
  },
  {
    slug: "street-crown-tee",
    nombre: "Street Crown Tee",
    marca: "No Fluke",
    categoriaSlug: "t-shirts",
    genero: "unisex",
    descripcion:
      "T-shirt de corte regular en algodón 100%. Gráfico de corona en serigrafía a un color.",
    precio: 1250,
    precioMayor: 950,
    cantidadMayor: 6,
    colores: ["Negro", "Blanco"],
    tallas: ["S", "M", "L", "XL"],
    destacado: true,
  },
  {
    slug: "fluke-sneakers-green-strike",
    nombre: "Fluke Sneakers Green Strike",
    marca: "No Fluke",
    categoriaSlug: "calzados",
    genero: "unisex",
    descripcion:
      "Sneaker de silueta baja, upper de cuero sintético con detalles en verde neón y suela de goma.",
    precio: 5999,
    precioOferta: 4999,
    colores: ["Negro/Verde"],
    tallas: ["39", "40", "41", "42", "43"],
    stockObjetivo: 3,
    destacado: true,
  },
  {
    slug: "varsity-jacket-crown",
    nombre: "Varsity Jacket Crown",
    marca: "No Fluke",
    categoriaSlug: "ropa",
    genero: "unisex",
    descripcion:
      "Chaqueta varsity con cuerpo de lana mixta y mangas de cuero sintético. Parches bordados.",
    precio: 4499,
    colores: ["Negro/Blanco"],
    tallas: ["S", "M", "L", "XL"],
    destacado: true,
  },
  {
    slug: "crown-snapback",
    nombre: "Crown Snapback",
    marca: "No Fluke",
    categoriaSlug: "accesorios",
    genero: "unisex",
    descripcion: "Gorra snapback estructurada, visera plana y bordado 3D del logo.",
    precio: 1699,
    precioMayor: 1300,
    cantidadMayor: 6,
    colores: ["Negro", "Verde"],
    tallas: ["Única"],
    destacado: true,
  },
  {
    slug: "eau-de-noir-100ml",
    nombre: "Eau de Noir 100ml",
    marca: "Maison RD",
    categoriaSlug: "perfumes",
    genero: "hombre",
    descripcion:
      "Eau de parfum amaderada con notas de bergamota, cardamomo y ámbar. Fijación alta.",
    precio: 3900,
    precioOferta: 3200,
    colores: ["100 ml"],
    tallas: ["Única"],
    destacado: true,
  },
  {
    slug: "citrus-drip-75ml",
    nombre: "Citrus Drip 75ml",
    marca: "Maison RD",
    categoriaSlug: "perfumes",
    genero: "unisex",
    descripcion:
      "Fragancia fresca cítrica con limón, jengibre y almizcle blanco. Ideal para el día.",
    precio: 2800,
    colores: ["75 ml"],
    tallas: ["Única"],
  },
  {
    slug: "cargo-tech-pants",
    nombre: "Cargo Tech Pants",
    marca: "No Fluke",
    categoriaSlug: "ropa",
    genero: "unisex",
    descripcion:
      "Pantalón cargo de tejido ripstop, cintura elástica con cordón y seis bolsillos.",
    precio: 2999,
    precioOferta: 2399,
    colores: ["Negro", "Verde militar"],
    tallas: ["28", "30", "32", "34", "36"],
    nuevoIngreso: true,
  },
  {
    slug: "tee-lifestyle-blanco",
    nombre: "Tee Lifestyle Blanco",
    marca: "No Fluke",
    categoriaSlug: "t-shirts",
    genero: "unisex",
    descripcion: "Básica de peso medio, cuello reforzado. Sin estampado.",
    precio: 1150,
    precioMayor: 890,
    cantidadMayor: 6,
    colores: ["Blanco"],
    tallas: ["S", "M", "L", "XL"],
  },
  {
    slug: "runner-mono-black",
    nombre: "Runner Mono Black",
    marca: "No Fluke",
    categoriaSlug: "calzados",
    genero: "unisex",
    descripcion: "Tenis running de malla transpirable en negro total. Media suela EVA.",
    precio: 5200,
    colores: ["Negro"],
    tallas: ["39", "40", "41", "42", "43"],
    stockObjetivo: 0,
  },
  {
    slug: "tote-built-different",
    nombre: "Tote Built Different",
    marca: "No Fluke",
    categoriaSlug: "accesorios",
    genero: "unisex",
    descripcion: "Tote de lona 12oz con serigrafía a dos tintas. Asas reforzadas.",
    precio: 990,
    colores: ["Natural"],
    tallas: ["Única"],
  },
  {
    slug: "medias-crown-pack-3",
    nombre: "Medias Crown (pack de 3)",
    marca: "No Fluke",
    categoriaSlug: "accesorios",
    genero: "unisex",
    descripcion: "Pack de 3 pares de medias tobilleras con logo tejido en el puño.",
    precio: 650,
    precioMayor: 480,
    cantidadMayor: 6,
    colores: ["Negro", "Blanco"],
    tallas: ["Única"],
  },
];

export const CONFIG_SEMILLA = {
  nombreTienda: "No Fluke Store",
  whatsapp: "18090000000",
  moneda: "DOP",
  costoEnvio: 0,
  mensajeBienvenida: "El estilo no es suerte.",
  logoUrl: null as string | null,
  correo: "hola@noflukestore.com",
  direccion: "Santo Domingo, República Dominicana",
  instagram: "noflukestore",
  facebook: "noflukestore",
  tiktok: "noflukestore",
};
