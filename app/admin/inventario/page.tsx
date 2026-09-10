import NavInventario from "@/components/admin/NavInventario";
import TablaExistencias from "@/components/admin/TablaExistencias";
import { listarProductosAdmin } from "@/lib/firebase/admin-catalogo";

export const metadata = { title: "Existencias · Inventario" };
export const dynamic = "force-dynamic";

export default async function AdminExistencias() {
  const productos = await listarProductosAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        Inventario
      </h1>
      <p className="mb-5 mt-1 text-sm text-white/50">
        Existencia, fecha de registro y precios de cada producto.
      </p>
      <NavInventario />
      <TablaExistencias productos={productos} />
    </div>
  );
}
