import Link from "next/link";
import { notFound } from "next/navigation";
import FormularioCategoria from "@/components/admin/FormularioCategoria";
import { listarCategoriasAdmin } from "@/lib/firebase/admin-catalogo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cat = (await listarCategoriasAdmin()).find((c) => c.id === id);
  return { title: `${cat?.nombre ?? "Categoría"} · Panel` };
}

export default async function EditarCategoria({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoria = (await listarCategoriasAdmin()).find((c) => c.id === id);
  if (!categoria) notFound();

  return (
    <div>
      <Link
        href="/admin/categorias"
        className="text-sm text-white/50 hover:text-white"
      >
        ← Categorías
      </Link>
      <h1 className="mb-5 mt-1 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        {categoria.nombre}
      </h1>
      <FormularioCategoria categoria={categoria} />
    </div>
  );
}
