import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { obtenerOfertas } from "@/lib/firebase/catalogo";

export const metadata = { title: "Ofertas" };
export const revalidate = 60;

export default async function OfertasPagina() {
  const ofertas = await obtenerOfertas();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
        🔥 Ofertas
      </h1>
      <p className="mt-1 text-sm text-white/50">
        {ofertas.length} {ofertas.length === 1 ? "producto" : "productos"} en
        oferta
      </p>

      {ofertas.length === 0 ? (
        <p className="py-16 text-center text-sm text-white/40">
          No hay ofertas activas ahora mismo.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ofertas.map((p) => (
            <TarjetaProducto key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
