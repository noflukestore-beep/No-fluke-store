import EnConstruccion from "@/components/admin/EnConstruccion";

export const metadata = { title: "Clientes · Panel" };

export default function AdminClientes() {
  return (
    <EnConstruccion
      titulo="Clientes"
      descripcion="Lista de clientes derivada de los pedidos (nombre y teléfono), con historial de compras y acceso directo a WhatsApp."
      fase="Fase 5"
    />
  );
}
