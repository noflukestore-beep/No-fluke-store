import type { Metadata } from "next";
import MarcoTienda from "@/components/tienda/MarcoTienda";

export const metadata: Metadata = {
  title: {
    default: "Tienda",
    template: "%s · No Fluke Store",
  },
};

export default function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarcoTienda>{children}</MarcoTienda>;
}
