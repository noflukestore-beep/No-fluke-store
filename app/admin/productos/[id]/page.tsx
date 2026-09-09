import Link from "next/link";
import { notFound } from "next/navigation";
import FormularioProducto from "@/components/admin/FormularioProducto";
import {
  listarCategoriasAdmin,
  obtenerProductoAdmin,
} from "@/lib/firebase/admin-catalogo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await obtenerProductoAdmin(id);
  return { title: `${p?.nombre ?? "Producto"} · Panel` };
}

export default async function EditarProducto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [producto, categorias] = await Promise.all([
    obtenerProductoAdmin(id),
    listarCategoriasAdmin(),
  ]);
  if (!producto) notFound();

  return (
    <div>
      <Link
        href="/admin/productos"
        className="text-sm text-white/50 hover:text-white"
      >
        ← Productos
      </Link>
      <h1 className="mb-5 mt-1 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        {producto.nombre}
      </h1>
      <FormularioProducto categorias={categorias} producto={producto} />
    </div>
  );
}
