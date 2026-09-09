import Link from "next/link";
import FormularioCategoria from "@/components/admin/FormularioCategoria";

export const metadata = { title: "Nueva categoría · Panel" };
export const dynamic = "force-dynamic";

export default function NuevaCategoria() {
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
      <FormularioCategoria />
    </div>
  );
}
