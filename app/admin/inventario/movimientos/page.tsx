import NavInventario from "@/components/admin/NavInventario";
import TablaMovimientos from "@/components/admin/TablaMovimientos";
import { listarMovimientos } from "@/lib/firebase/admin-catalogo";

export const metadata = { title: "Movimientos · Inventario" };
export const dynamic = "force-dynamic";

export default async function MovimientosInventario() {
  const movimientos = await listarMovimientos(150);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        Inventario
      </h1>
      <p className="mb-5 mt-1 text-sm text-white/50">
        Historial de cada entrada, salida y ajuste.
      </p>
      <NavInventario />
      <TablaMovimientos movimientos={movimientos} />
    </div>
  );
}
