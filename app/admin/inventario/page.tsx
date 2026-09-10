import TablaInventario, {
  type ArticuloInventario,
} from "@/components/admin/TablaInventario";
import { listarProductosAdmin } from "@/lib/firebase/admin-catalogo";

export const metadata = { title: "Inventario · Panel" };
export const dynamic = "force-dynamic";

export default async function AdminInventario() {
  const productos = await listarProductosAdmin();

  const articulos: ArticuloInventario[] = productos
    .flatMap((p) =>
      p.variantes.map((v) => ({
        productoId: p.id,
        varianteId: v.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        marca: p.marca,
        categoriaNombre: p.categoriaNombre,
        sku: v.sku || p.sku || "",
        talla: v.talla,
        color: v.color,
        stock: v.stock,
        stockMinimo: p.stockMinimo,
        activo: p.activo && v.activo,
      })),
    )
    .sort((a, b) => a.stock - b.stock || a.nombre.localeCompare(b.nombre));

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        Inventario
      </h1>
      <p className="mb-5 mt-1 text-sm text-white/50">
        Existencia de cada artículo. Registra entradas y salidas y queda la
        bitácora.
      </p>
      <TablaInventario articulos={articulos} />
    </div>
  );
}
