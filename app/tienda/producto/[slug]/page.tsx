import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SelectorCompra from "@/components/tienda/SelectorCompra";
import { obtenerProducto, obtenerProductos } from "@/lib/firebase/catalogo";
import {
  formatearRD,
  porcentajeDescuento,
  precioEfectivo,
  precioTachado,
} from "@/lib/precios";

export const revalidate = 60;

export async function generateStaticParams() {
  const productos = await obtenerProductos();
  return productos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const producto = await obtenerProducto(slug);
  return { title: producto?.nombre ?? "Producto" };
}

export default async function ProductoPagina({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const producto = await obtenerProducto(slug);
  if (!producto) notFound();

  const { valor, tipo } = precioEfectivo(producto, 1);
  const tachado = precioTachado(producto, valor, tipo);
  const agotado = producto.stockTotal <= 0;

  const activas = producto.variantes.filter((v) => v.activo && v.stock > 0);
  const tallas = [...new Set(activas.map((v) => v.talla).filter(Boolean))];
  const colores = [...new Set(activas.map((v) => v.color).filter(Boolean))];
  const foto = producto.imagenes[0];

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-10">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent">
        {foto && (
          <Image
            src={foto.url}
            alt={foto.alt || producto.nombre}
            fill
            priority
            sizes="(min-width:768px) 45vw, 100vw"
            className="object-cover"
          />
        )}
        {agotado && (
          <div className="absolute inset-0 grid place-items-center bg-black/50">
            <span className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-bold uppercase tracking-wide">
              Agotado
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-white/40">
          {producto.marca}
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
          {producto.nombre}
        </h1>

        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="font-display text-3xl font-extrabold text-verde">
            {formatearRD(valor)}
          </span>
          {tachado != null && (
            <>
              <span className="text-white/35 line-through">
                {formatearRD(tachado)}
              </span>
              <span className="rounded-md bg-verde px-1.5 py-0.5 text-xs font-extrabold text-[#04140c]">
                -{porcentajeDescuento(tachado, valor)}%
              </span>
            </>
          )}
        </div>

        {producto.precioMayor != null && producto.cantidadMayor != null && (
          <p className="mt-3 inline-block rounded-lg border border-verde/30 bg-verde/10 px-3 py-1.5 text-sm font-semibold text-verde">
            Desde {producto.cantidadMayor} unidades:{" "}
            {formatearRD(producto.precioMayor)} c/u
          </p>
        )}

        <p
          className={`mt-3 text-sm font-semibold ${
            agotado
              ? "text-rose-400"
              : producto.stockTotal <= producto.stockMinimo
                ? "text-amber-400"
                : "text-white/50"
          }`}
        >
          {agotado
            ? "Agotado"
            : producto.stockTotal <= producto.stockMinimo
              ? `¡Últimas ${producto.stockTotal} unidades!`
              : `${producto.stockTotal} unidades disponibles`}
        </p>

        {(tallas.length > 0 || colores.length > 0) && (
          <div className="mt-5 space-y-3">
            {tallas.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-wide text-white/40">
                  Tallas
                </p>
                <div className="flex flex-wrap gap-2">
                  {tallas.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {colores.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-wide text-white/40">
                  Colores
                </p>
                <div className="flex flex-wrap gap-2">
                  {colores.map((c) => (
                    <span
                      key={c}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-sm"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {producto.descripcion && (
          <p className="mt-5 text-sm leading-relaxed text-white/60">
            {producto.descripcion}
          </p>
        )}

        {!agotado && <SelectorCompra producto={producto} />}

        <Link
          href={`/tienda/categoria/${producto.categoriaSlug}`}
          className="mt-4 inline-block text-sm font-semibold text-verde hover:underline"
        >
          ← Más de {producto.categoriaNombre}
        </Link>
      </div>
    </div>
  );
}
