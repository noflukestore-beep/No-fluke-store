import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { CATEGORIAS, PRODUCTOS } from "@/lib/tienda/demo";

export const metadata = { title: "Buscar" };

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export default async function BuscarPagina({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q = "", cat = "" } = await searchParams;
  const termino = normalizar(q.trim());
  const categoria = CATEGORIAS.find((c) => c.slug === cat);

  let resultados = PRODUCTOS;
  if (categoria) {
    resultados = resultados.filter((p) => p.categoriaSlug === categoria.slug);
  }
  if (termino) {
    resultados = resultados.filter((p) =>
      normalizar(`${p.nombre} ${p.marca} ${p.categoria}`).includes(termino),
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
        {q.trim() ? `“${q.trim()}”` : "Búsqueda"}
      </h1>
      <p className="mt-1 text-sm text-white/50">
        {resultados.length} {resultados.length === 1 ? "resultado" : "resultados"}
        {categoria ? ` en ${categoria.nombre}` : ""}
      </p>

      {resultados.length === 0 ? (
        <p className="py-16 text-center text-sm text-white/40">
          No encontramos productos con esa búsqueda.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {resultados.map((p) => (
            <TarjetaProducto key={p.slug} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
