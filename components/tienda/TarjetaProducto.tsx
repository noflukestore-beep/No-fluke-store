import Image from "next/image";
import Link from "next/link";
import type { ProductoPublico } from "@/lib/firebase/tipos";
import {
  formatearRDCorto,
  porcentajeDescuento,
  precioEfectivo,
} from "@/lib/precios";

export default function TarjetaProducto({
  producto,
}: {
  producto: ProductoPublico;
}) {
  const { valor, tipo } = precioEfectivo(producto, 1);
  const enOferta = tipo === "oferta";
  const agotado = producto.stockTotal <= 0;
  const pocas =
    !agotado && producto.stockTotal <= producto.stockMinimo
      ? producto.stockTotal
      : null;
  const foto = producto.imagenes[0];

  return (
    <Link
      href={`/tienda/producto/${producto.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-colors hover:border-verde/40"
    >
      <div className="relative aspect-square bg-gradient-to-br from-white/[0.07] to-transparent">
        {foto && (
          <Image
            src={foto.url}
            alt={foto.alt || producto.nombre}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
            className="object-cover"
          />
        )}

        {/* Insignias */}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {enOferta && (
            <span className="rounded-md bg-verde px-1.5 py-0.5 text-[11px] font-extrabold text-[#04140c]">
              -{porcentajeDescuento(producto.precio, producto.precioOferta ?? 0)}%
            </span>
          )}
          {producto.precioMayor != null && !enOferta && (
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/70 backdrop-blur">
              Por mayor
            </span>
          )}
          {producto.nuevoIngreso && !enOferta && producto.precioMayor == null && (
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/70 backdrop-blur">
              Nuevo
            </span>
          )}
        </div>

        {agotado && (
          <div className="absolute inset-0 grid place-items-center bg-black/50">
            <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-bold uppercase tracking-wide">
              Agotado
            </span>
          </div>
        )}
        {pocas != null && (
          <span className="absolute bottom-2 left-2 rounded-md bg-rose-500/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            Últimas {pocas}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <p className="text-[11px] uppercase tracking-wide text-white/40">
          {producto.marca}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug">
          {producto.nombre}
        </p>

        <div className="mt-auto pt-2">
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            <span className="font-display text-sm font-extrabold text-verde sm:text-base">
              {formatearRDCorto(valor)}
            </span>
            {enOferta && (
              <span className="text-[11px] text-white/35 line-through">
                {formatearRDCorto(producto.precio)}
              </span>
            )}
          </div>

          {producto.precioMayor != null && producto.cantidadMayor != null && (
            <p className="mt-0.5 text-[11px] text-white/45">
              Desde {producto.cantidadMayor} und:{" "}
              {formatearRDCorto(producto.precioMayor)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
