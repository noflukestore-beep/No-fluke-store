import Link from "next/link";
import FormularioCategoria from "@/components/admin/FormularioCategoria";
import { listarCategoriasAdmin } from "@/lib/firebase/admin-catalogo";

export const metadata = { title: "Nueva categoría · Panel" };
export const dynamic = "force-dynamic";

export default async function NuevaCategoria() {
  const categorias = await listarCategoriasAdmin();
  const ordenSugerido =
    categorias.reduce((max, c) => Math.max(max, c.orden), 0) + 1;

  return (
    <div>
      <Link
        href="/admin/categorias"
        className="text-sm text-white/50 hover:text-white"
      >
        ← Categorías
      </Link>
      <h1 className="mb-5 mt-1 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        Nueva categoría
      </h1>
      <FormularioCategoria ordenSugerido={ordenSugerido} />
    </div>
  );
}
