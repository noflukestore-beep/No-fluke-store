import Link from "next/link";
import { notFound } from "next/navigation";
import DetalleFactura from "@/components/admin/DetalleFactura";
import { obtenerFactura } from "@/lib/firebase/admin-catalogo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const f = await obtenerFactura(id);
  return { title: `${f?.numero ?? "Factura"} · Panel` };
}

export default async function PaginaDetalleFactura({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const factura = await obtenerFactura(id);
  if (!factura) notFound();

  return (
    <div>
      <Link
        href="/admin/facturas"
        className="text-sm text-white/50 hover:text-white"
      >
        ← Facturas
      </Link>
      <div className="mt-1">
        <DetalleFactura factura={factura} />
      </div>
    </div>
  );
}
