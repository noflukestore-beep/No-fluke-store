import { notFound } from "next/navigation";
import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { CATEGORIAS, PRODUCTOS } from "@/lib/tienda/demo";

export function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = CATEGORIAS.find((c) => c.slug === slug);
  return { title: cat?.nombre ?? "Categoría" };
}

export default async function CategoriaPagina({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoria = CATEGORIAS.find((c) => c.slug === slug);
  if (!categoria) notFound();

  const productos = PRODUCTOS.filter((p) => p.categoriaSlug === slug);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
        {categoria.nombre}
      </h1>
      <p className="mt-1 text-sm text-white/50">
        {productos.length}{" "}
        {productos.length === 1 ? "producto" : "productos"}
      </p>

      {productos.length === 0 ? (
        <p className="py-16 text-center text-sm text-white/40">
          Todavía no hay productos en esta categoría.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {productos.map((p) => (
            <TarjetaProducto key={p.slug} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
