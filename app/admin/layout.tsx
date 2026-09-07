import type { Metadata } from "next";
import BarraAdmin from "@/components/admin/BarraAdmin";

export const metadata: Metadata = {
  title: "Panel",
};

// TODO (Fase 3): proteger con middleware + cookie de sesión (claim rol=admin).
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      <BarraAdmin />
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
