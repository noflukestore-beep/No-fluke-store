import EnConstruccion from "@/components/admin/EnConstruccion";

export const metadata = { title: "Ofertas · Panel" };

export default function AdminOfertas() {
  return (
    <EnConstruccion
      titulo="Ofertas"
      descripcion="Fijar precio de oferta y vigencia a varios productos a la vez."
      fase="Fase 6"
    />
  );
}
