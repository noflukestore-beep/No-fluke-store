import EnConstruccion from "@/components/admin/EnConstruccion";

export const metadata = { title: "Productos · Panel" };

export default function AdminProductos() {
  return (
    <EnConstruccion
      titulo="Productos"
      descripcion="Tabla de productos con búsqueda, filtro por categoría, stock y activar/desactivar. Editor con imágenes y variantes."
      fase="Fase 3"
    />
  );
}
