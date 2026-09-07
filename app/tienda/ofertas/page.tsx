import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { OFERTAS } from "@/lib/tienda/demo";

export const metadata = { title: "Ofertas" };

export default function OfertasPagina() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
        🔥 Ofertas
      </h1>
      <p className="mt-1 text-sm text-white/50">
        {OFERTAS.length} {OFERTAS.length === 1 ? "producto" : "productos"} en
        oferta
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {OFERTAS.map((p) => (
          <TarjetaProducto key={p.slug} producto={p} />
        ))}
      </div>
    </div>
  );
}
