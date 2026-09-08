import { formatearRDCorto } from "@/lib/precios";
import type { ProductoDemo } from "@/lib/tienda/demo";

/**
 * Escalera de precio.
 *
 * Es el elemento con más peso visual de toda la tienda, a propósito: el precio
 * es el contenido emocional de un catálogo, y el segundo escalón (por mayor)
 * es lo que hace que el cliente suba la cantidad.
 *
 * `tamano="card"` en rejillas, `tamano="detalle"` en la ficha del producto.
 */
export default function Precio({
  producto,
  tamano = "card",
}: {
  producto: ProductoDemo;
  tamano?: "card" | "detalle";
}) {
  const enOferta = producto.precioOferta != null;
  const vigente = enOferta ? producto.precioOferta! : producto.precio;
  const hayMayor = producto.precioMayor != null && producto.cantidadMayor != null;

  const cifra = tamano === "detalle" ? "text-4xl sm:text-5xl" : "text-lg sm:text-xl";
  const tachado = tamano === "detalle" ? "text-base" : "text-xs";

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className={`cifra ${cifra} text-tinta`}>
          {formatearRDCorto(vigente)}
        </span>
        {enOferta && (
          <span className={`${tachado} text-humo line-through`}>
            {formatearRDCorto(producto.precio)}
          </span>
        )}
      </div>

      {hayMayor && (
        <p
          className={`mt-1.5 inline-flex items-baseline gap-1.5 bg-verde px-1.5 py-0.5 text-tinta ${
            tamano === "detalle" ? "text-sm" : "text-[11px]"
          }`}
        >
          <span className="font-semibold">
            {producto.cantidadMayor}+ und
          </span>
          <span className="cifra">
            {formatearRDCorto(producto.precioMayor!)}
          </span>
          <span className="opacity-70">c/u</span>
        </p>
      )}
    </div>
  );
}
