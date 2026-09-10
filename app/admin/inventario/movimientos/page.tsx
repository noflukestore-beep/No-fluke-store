import Link from "next/link";
import TablaMovimientos from "@/components/admin/TablaMovimientos";
import { listarMovimientos } from "@/lib/firebase/admin-catalogo";

export const metadata = { title: "Movimientos · Inventario" };
export const dynamic = "force-dynamic";

export default async function MovimientosInventario() {
  const movimientos = await listarMovimientos(150);

  return (
    <div>
      <Link
        href="/admin/inventario"
        className="text-sm text-white/50 hover:text-white"
      >
        ← Inventario
      </Link>
      <h1 className="mb-5 mt-1 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        Movimientos de inventario
      </h1>
      <TablaMovimientos movimientos={movimientos} />
    </div>
  );
}
