import EnConstruccion from "@/components/admin/EnConstruccion";

export const metadata = { title: "Categorías · Panel" };

export default function AdminCategorias() {
  return (
    <EnConstruccion
      titulo="Categorías"
      descripcion="CRUD de categorías con orden. Al renombrar, actualiza en lote los productos afectados."
      fase="Fase 3"
    />
  );
}
