import Link from "next/link";
import { porcentaje, type ProductoDemo } from "@/lib/tienda/demo";
import Precio from "@/components/tienda/Precio";

/**
 * Sin borde, sin radio, sin relleno translúcido.
 *
 * La foto se apoya sobre lienzo blanco y el texto va debajo, alineado al
 * mismo eje. En una rejilla apretada las fotos forman un muro de mercancía,
 * que es como se ve una tienda de verdad. El marco de tarjeta solo mete
 * ruido entre producto y producto.
 */
export default function TarjetaProducto({
  producto,
}: {
  producto: ProductoDemo;
}) {
  const enOferta = producto.precioOferta != null;

  return (
    <Link
      href={`/tienda/producto/${producto.slug}`}
      className="group block"
    >
      <div className="relative aspect-square overflow-hidden bg-lienzo">
        {/* Aquí va next/image en la Fase 2. */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#fff_0%,#f3f5f2_100%)]" />

        {enOferta && (
          <span className="cifra absolute left-0 top-0 bg-verde px-2 py-1 text-sm text-tinta">
            −{porcentaje(producto.precio, producto.precioOferta!)}%
          </span>
        )}

        {producto.agotado && (
          <div className="absolute inset-0 grid place-items-center bg-lienzo/75">
            <span className="border border-tinta px-3 py-1 text-xs font-semibold text-tinta">
              Agotado
            </span>
          </div>
        )}

        {!producto.agotado && producto.ultimasUnidades != null && (
          <span className="absolute bottom-0 left-0 bg-alerta px-2 py-1 text-[11px] font-semibold text-white">
            Quedan {producto.ultimasUnidades}
          </span>
        )}
      </div>

      {/* Filete que ata la foto con su información. */}
      <div className="border-t border-tinta pt-2">
        <p className="text-[11px] text-humo">{producto.marca}</p>
        <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-tinta group-hover:underline group-hover:decoration-verde-hondo group-hover:decoration-2 group-hover:underline-offset-2">
          {producto.nombre}
        </p>
        <div className="mt-2">
          <Precio producto={producto} />
        </div>
      </div>
    </Link>
  );
}
