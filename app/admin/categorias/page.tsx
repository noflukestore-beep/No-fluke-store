import Link from "next/link";
import TablaCategorias from "@/components/admin/TablaCategorias";
import {
  listarCategoriasAdmin,
  listarProductosAdmin,
} from "@/lib/firebase/admin-catalogo";

export const metadata = { title: "Categorías · Panel" };
export const dynamic = "force-dynamic";

export default async function AdminCategorias() {
  const [categorias, productos] = await Promise.all([
    listarCategoriasAdmin(),
    listarProductosAdmin(),
  ]);

  const conteos: Record<string, number> = {};
  for (const p of productos) {
    conteos[p.categoriaId] = (conteos[p.categoriaId] ?? 0) + 1;
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
            Categorías
          </h1>
          <p className="text-sm text-white/50">
            {categorias.length}{" "}
            {categorias.length === 1 ? "categoría" : "categorías"}
          </p>
        </div>
        <Link
          href="/admin/categorias/nueva"
          className="rounded-lg bg-verde px-4 py-2 text-sm font-bold text-[#04140c] hover:brightness-105"
        >
          + Nueva categoría
        </Link>
      </div>

      <TablaCategorias categorias={categorias} conteos={conteos} />
    </div>
  );
}
