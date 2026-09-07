import EnConstruccion from "@/components/admin/EnConstruccion";

export const metadata = { title: "Configuración · Panel" };

export default function AdminConfig() {
  return (
    <EnConstruccion
      titulo="Configuración"
      descripcion="Número de WhatsApp, nombre de la tienda, logo y costo de envío."
      fase="Fase 4"
    />
  );
}
