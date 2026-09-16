import Link from "next/link";
import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import {
  obtenerCategorias,
  obtenerOfertas,
  obtenerProductos,
} from "@/lib/firebase/catalogo";

export const metadata = { title: "Tienda" };
export const revalidate = 60;

export default async function TiendaInicio() {
  const [categorias, productos, ofertas] = await Promise.all([
    obtenerCategorias(),
    obtenerProductos(),
    obtenerOfertas(),
  ]);

  return (
    <div className="space-y-8">
      {/* Categorías — barra segmentada */}
      <section>
        <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border-2 border-verde/70 bg-white/[0.03] p-1 align-top shadow-[0_0_26px_-6px_rgba(22,219,101,0.75)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href="/tienda"
            className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-white ring-2 ring-verde ring-inset"
          >
            Todos
          </Link>
          {categorias.map((c) => (
            <Link
              key={c.slug}
              href={`/tienda/categoria/${c.slug}`}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              {c.icono && <span aria-hidden>{c.icono}</span>}
              {c.nombre}
            </Link>
          ))}
        </div>
      </section>

      {/* Ofertas */}
      {ofertas.length > 0 && (
        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-lg font-extrabold uppercase tracking-tight">
              🔥 Ofertas
            </h2>
            <Link
              href="/tienda/ofertas"
              className="text-xs font-semibold text-verde hover:underline"
            >
              Ver todas →
            </Link>
          </div>
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {ofertas.map((p) => (
              <div key={p.id} className="w-44 shrink-0 sm:w-52">
                <TarjetaProducto producto={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Catálogo */}
      <section>
        <h2 className="mb-3 font-display text-lg font-extrabold uppercase tracking-tight">
          Catálogo
        </h2>
        {productos.length === 0 ? (
          <p className="py-12 text-center text-sm text-white/40">
            Todavía no hay productos.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {productos.map((p) => (
              <TarjetaProducto key={p.id} producto={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
