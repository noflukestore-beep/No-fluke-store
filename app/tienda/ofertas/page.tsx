import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { OFERTAS } from "@/lib/tienda/demo";

export const metadata = { title: "Rebajas" };

export default function OfertasPagina() {
  return (
    <div className="px-4 py-8 md:px-6">
      <div className="border-b border-tinta pb-2">
        <h1 className="titular text-2xl md:text-3xl">Rebajas</h1>
        <p className="mt-1 text-sm text-humo">
          {OFERTAS.length} {OFERTAS.length === 1 ? "producto" : "productos"} con
          precio rebajado
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {OFERTAS.map((p) => (
          <TarjetaProducto key={p.slug} producto={p} />
        ))}
      </div>
    </div>
  );
}
