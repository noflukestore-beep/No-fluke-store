import type { Metadata } from "next";
import MarcoAdmin from "@/components/admin/MarcoAdmin";

export const metadata: Metadata = {
  title: "Panel",
};

// TODO (Fase 3): proteger con middleware + cookie de sesión (claim rol=admin).
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarcoAdmin>{children}</MarcoAdmin>;
}
