import EnConstruccion from "@/components/admin/EnConstruccion";

export const metadata = { title: "Inventario · Panel" };

export default function AdminInventario() {
  return (
    <EnConstruccion
      titulo="Inventario"
      descripcion="Stock por producto y variante, con alertas de stock bajo y agotado. El stock se descuenta al confirmar el pedido."
      fase="Fase 5"
    />
  );
}
