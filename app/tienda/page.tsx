import Link from "next/link";
import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { CATEGORIAS, DESTACADOS, OFERTAS } from "@/lib/tienda/demo";

export const metadata = { title: "Tienda" };

const ICONO_CAT: Record<string, string> = {
  perfumes: "🧴",
  ropa: "🧥",
  "t-shirts": "👕",
  calzados: "👟",
  accesorios: "🧢",
};

export default function TiendaInicio() {
  return (
    <div className="space-y-8">
      {/* Categorías — barra segmentada */}
      <section>
        <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/12 bg-white/[0.03] p-1 align-top [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href="/tienda"
            className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-white ring-2 ring-verde ring-inset"
          >
            Todos
          </Link>
          {CATEGORIAS.map((c) => (
            <Link
              key={c.slug}
              href={`/tienda/categoria/${c.slug}`}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              <span aria-hidden>{ICONO_CAT[c.slug] ?? "•"}</span>
              {c.nombre}
            </Link>
          ))}
        </div>
      </section>

      {/* Ofertas */}
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
          {OFERTAS.map((p) => (
            <div key={p.slug} className="w-44 shrink-0 sm:w-52">
              <TarjetaProducto producto={p} />
            </div>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section>
        <h2 className="mb-3 font-display text-lg font-extrabold uppercase tracking-tight">
          Destacados
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {DESTACADOS.map((p) => (
            <TarjetaProducto key={p.slug} producto={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
