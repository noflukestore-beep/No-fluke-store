import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCTOS } from "@/lib/tienda/demo";
import { formatearRD } from "@/lib/precios";

export function generateStaticParams() {
  return PRODUCTOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: PRODUCTOS.find((p) => p.slug === slug)?.nombre ?? "Producto" };
}

export default async function ProductoPagina({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const producto = PRODUCTOS.find((p) => p.slug === slug);
  if (!producto) notFound();

  const precio = producto.precioOferta ?? producto.precio;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="aspect-square rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent" />

      <div>
        <p className="text-xs uppercase tracking-wide text-white/40">
          {producto.marca}
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
          {producto.nombre}
        </h1>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-3xl font-extrabold text-verde">
            {formatearRD(precio)}
          </span>
          {producto.precioOferta != null && (
            <span className="text-white/35 line-through">
              {formatearRD(producto.precio)}
            </span>
          )}
        </div>

        {producto.precioMayor != null && producto.cantidadMayor != null && (
          <p className="mt-2 inline-block rounded-lg border border-verde/30 bg-verde/10 px-3 py-1.5 text-sm font-semibold text-verde">
            Desde {producto.cantidadMayor} unidades:{" "}
            {formatearRD(producto.precioMayor)} c/u
          </p>
        )}

        <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-sm text-white/60">
          El selector de talla/color, la cantidad y el botón “Agregar al
          carrito” se construyen en las fases 2 y 4.
        </div>

        <Link
          href="/tienda"
          className="mt-4 inline-block text-sm font-semibold text-verde hover:underline"
        >
          ← Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
