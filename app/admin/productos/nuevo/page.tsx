import Link from "next/link";
import FormularioProducto from "@/components/admin/FormularioProducto";
import { listarCategoriasAdmin } from "@/lib/firebase/admin-catalogo";

export const metadata = { title: "Nuevo producto · Panel" };
export const dynamic = "force-dynamic";

export default async function NuevoProducto() {
  const categorias = await listarCategoriasAdmin();

  return (
    <div>
      <Link
        href="/admin/productos"
        className="text-sm text-white/50 hover:text-white"
      >
        ← Productos
      </Link>
      <h1 className="mb-5 mt-1 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        Nuevo producto
      </h1>

      {categorias.length === 0 ? (
        <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-200">
          Primero crea al menos una categoría en{" "}
          <Link href="/admin/categorias" className="underline">
            Categorías
          </Link>
          .
        </p>
      ) : (
        <FormularioProducto categorias={categorias} />
      )}
    </div>
  );
}
