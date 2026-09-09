import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { buscar, obtenerCategoria } from "@/lib/firebase/catalogo";

export const metadata = { title: "Buscar" };

export default async function BuscarPagina({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q = "", cat = "" } = await searchParams;
  const [resultados, categoria] = await Promise.all([
    buscar(q, cat || undefined),
    cat ? obtenerCategoria(cat) : Promise.resolve(null),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
        {q.trim() ? `“${q.trim()}”` : "Búsqueda"}
      </h1>
      <p className="mt-1 text-sm text-white/50">
        {resultados.length}{" "}
        {resultados.length === 1 ? "resultado" : "resultados"}
        {categoria ? ` en ${categoria.nombre}` : ""}
      </p>

      {resultados.length === 0 ? (
        <p className="py-16 text-center text-sm text-white/40">
          No encontramos productos con esa búsqueda.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {resultados.map((p) => (
            <TarjetaProducto key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
