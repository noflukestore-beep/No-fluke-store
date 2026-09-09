import Link from "next/link";
import TablaProductos from "@/components/admin/TablaProductos";
import { listarProductosAdmin } from "@/lib/firebase/admin-catalogo";

export const metadata = { title: "Productos · Panel" };
export const dynamic = "force-dynamic";

export default async function AdminProductos() {
  const productos = await listarProductosAdmin();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
            Productos
          </h1>
          <p className="text-sm text-white/50">
            {productos.length} {productos.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-lg bg-verde px-4 py-2 text-sm font-bold text-[#04140c] hover:brightness-105"
        >
          + Nuevo producto
        </Link>
      </div>

      <TablaProductos productos={productos} />
    </div>
  );
}
