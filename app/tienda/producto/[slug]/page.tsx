import Link from "next/link";
import { notFound } from "next/navigation";
import Precio from "@/components/tienda/Precio";
import { PRODUCTOS } from "@/lib/tienda/demo";

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

  return (
    <div className="px-4 py-8 md:px-6">
      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        <div className="relative aspect-square overflow-hidden bg-lienzo">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#fff_0%,#f3f5f2_100%)]" />
          {producto.agotado && (
            <div className="absolute inset-0 grid place-items-center bg-lienzo/75">
              <span className="border border-tinta px-3 py-1 text-xs font-semibold text-tinta">
                Agotado
              </span>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-humo">{producto.marca}</p>
          <h1 className="titular mt-1 text-2xl md:text-3xl">{producto.nombre}</h1>

          <div className="mt-4">
            <Precio producto={producto} tamano="detalle" />
          </div>

          <div className="mt-8 border-t border-linea pt-6 text-sm leading-relaxed text-humo">
            El selector de talla y color, la cantidad y el botón para agregar al
            carrito se construyen en las fases 2 y 4.
          </div>

          <Link
            href={`/tienda/categoria/${producto.categoriaSlug}`}
            className="mt-6 inline-block text-sm text-humo underline decoration-linea underline-offset-4 hover:text-tinta hover:decoration-verde-hondo"
          >
            Ver más de {producto.categoria}
          </Link>
        </div>
      </div>
    </div>
  );
}
