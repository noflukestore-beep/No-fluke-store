/**
 * Lógica de precios. Ver sección 14 de ESPECIFICACION.md.
 *
 * Regla de oro: el precio se recalcula SIEMPRE en el servidor con estos
 * mismos helpers. Lo que manda el navegador se ignora.
 */
import type { Producto, TipoPrecio } from "@/lib/firebase/tipos";

/** Campos de `Producto` necesarios para decidir el precio. */
export type DatosPrecio = Pick<
  Producto,
  "precio" | "precioOferta" | "ofertaHasta" | "precioMayor" | "cantidadMayor"
>;

export interface PrecioResultado {
  valor: number;
  tipo: TipoPrecio;
}

/**
 * Precio unitario efectivo de un producto según la cantidad total de ese
 * producto en el carrito (sumando todas sus variantes).
 *
 * Prioridad: por mayor > oferta vigente > detalle.
 */
export function precioEfectivo(
  producto: DatosPrecio,
  cantidadDelProducto: number,
): PrecioResultado {
  const ofertaVigente =
    producto.precioOferta != null &&
    (producto.ofertaHasta == null || producto.ofertaHasta > Date.now());

  if (
    producto.precioMayor != null &&
    producto.cantidadMayor != null &&
    cantidadDelProducto >= producto.cantidadMayor
  ) {
    return { valor: producto.precioMayor, tipo: "mayor" };
  }

  if (ofertaVigente) {
    return { valor: producto.precioOferta as number, tipo: "oferta" };
  }

  return { valor: producto.precio, tipo: "detalle" };
}

/** `1250` -> `"RD$1,250.00"`. */
export function formatearRD(valor: number): string {
  const numero = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
  return `RD$${numero}`;
}

/** `342600` -> `"RD$342,600"`. Sin centavos, para cifras grandes de panel. */
export function formatearRDCorto(valor: number): string {
  return `RD$${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(valor)}`;
}

/** Porcentaje de descuento redondeado (para badges "-24%"). */
export function porcentajeDescuento(precio: number, precioOferta: number): number {
  if (precio <= 0 || precioOferta >= precio) return 0;
  return Math.round(((precio - precioOferta) / precio) * 100);
}

/**
 * Precio "antes" que se muestra tachado junto al precio vigente, o `null`
 * si no aplica. Dos fuentes posibles, en este orden:
 * 1. `precioFantasma`: referencia permanente de exhibición (no vence).
 * 2. El precio de lista, solo mientras haya una oferta real vigente.
 */
export function precioTachado(
  producto: Pick<Producto, "precio" | "precioFantasma">,
  valorVigente: number,
  tipoVigente: TipoPrecio,
): number | null {
  if (
    producto.precioFantasma != null &&
    producto.precioFantasma > valorVigente
  ) {
    return producto.precioFantasma;
  }
  if (tipoVigente === "oferta" && producto.precio > valorVigente) {
    return producto.precio;
  }
  return null;
}
