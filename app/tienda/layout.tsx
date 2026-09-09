import type { Metadata } from "next";
import MarcoTienda from "@/components/tienda/MarcoTienda";
import { obtenerCategorias } from "@/lib/firebase/catalogo";

export const metadata: Metadata = {
  title: {
    default: "Tienda",
    template: "%s · No Fluke Store",
  },
};

export const revalidate = 60;

export default async function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categorias = await obtenerCategorias();
  const nav = categorias.map((c) => ({ nombre: c.nombre, slug: c.slug }));
  return <MarcoTienda categorias={nav}>{children}</MarcoTienda>;
}
