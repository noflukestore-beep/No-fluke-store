import Link from "next/link";
import TablaFacturas from "@/components/admin/TablaFacturas";
import { listarFacturas } from "@/lib/firebase/admin-catalogo";

export const metadata = { title: "Facturas · Panel" };
export const dynamic = "force-dynamic";

export default async function AdminFacturas() {
  const facturas = await listarFacturas();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
            Facturas
          </h1>
          <p className="text-sm text-white/50">
            {facturas.length} {facturas.length === 1 ? "factura" : "facturas"}
          </p>
        </div>
        <Link
          href="/admin/facturas/nueva"
          className="rounded-lg bg-verde px-4 py-2 text-sm font-bold text-[#04140c] hover:brightness-105"
        >
          + Nueva factura
        </Link>
      </div>

      <TablaFacturas facturas={facturas} />
    </div>
  );
}
