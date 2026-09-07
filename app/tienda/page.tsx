import Link from "next/link";
import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { CATEGORIAS, DESTACADOS, OFERTAS } from "@/lib/tienda/demo";

export const metadata = { title: "Tienda" };

export default function TiendaInicio() {
  return (
    <div className="space-y-8">
      <span className="inline-block rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
        Datos de ejemplo · el catálogo real llega en la Fase 2
      </span>

      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-2xl border border-verde/20 p-6 md:p-10"
        style={{
          backgroundImage:
            "linear-gradient(115deg,#06120b 0%,#0f3019 55%,#0a1f12 100%)",
        }}
      >
        <div aria-hidden className="b-textura opacity-20" />
        <p className="relative text-xs font-bold uppercase tracking-[0.3em] text-verde">
          Nueva colección
        </p>
        <h1 className="relative mt-2 font-display text-4xl font-extrabold uppercase italic leading-[0.95] tracking-tight md:text-6xl">
          Built
          <br />
          Different
        </h1>
        <p className="relative mt-3 max-w-md text-sm text-white/60 md:text-base">
          Perfumes, ropa, t-shirts y tenis para los que se mueven distinto.
          Pide por WhatsApp, entrega en todo el país.
        </p>
        <Link
          href="/tienda/ofertas"
          className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-verde px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-[#04140c] transition-transform hover:scale-105"
        >
          Ver ofertas →
        </Link>
      </section>

      {/* Categorías */}
      <section>
        <h2 className="mb-3 font-display text-lg font-extrabold uppercase tracking-tight">
          Categorías
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIAS.map((c) => (
            <Link
              key={c.slug}
              href={`/tienda/categoria/${c.slug}`}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-verde/40 hover:text-white"
            >
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
            <div key={p.slug} className="w-40 shrink-0 sm:w-48">
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
