import Link from "next/link";
import FormularioFactura from "@/components/admin/FormularioFactura";
import {
  listarProductosAdmin,
  obtenerConfigAdmin,
} from "@/lib/firebase/admin-catalogo";

export const metadata = { title: "Nueva factura · Panel" };
export const dynamic = "force-dynamic";

export default async function NuevaFactura() {
  const [productos, config] = await Promise.all([
    listarProductosAdmin(),
    obtenerConfigAdmin(),
  ]);
  const conStock = productos.filter((p) => p.activo || p.stockTotal > 0);

  return (
    <div>
      <Link
        href="/admin/facturas"
        className="text-sm text-white/50 hover:text-white"
      >
        ← Facturas
      </Link>
      <h1 className="mb-5 mt-1 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        Nueva factura
      </h1>

      {productos.length === 0 ? (
        <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-200">
          Primero crea productos en{" "}
          <Link href="/admin/productos" className="underline">
            Productos
          </Link>
          .
        </p>
      ) : (
        <FormularioFactura productos={conStock} config={config} />
      )}
    </div>
  );
}
