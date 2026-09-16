import Link from "next/link";
import FormularioFactura from "@/components/admin/FormularioFactura";
import {
  listarFacturas,
  listarProductosAdmin,
  obtenerConfigAdmin,
  obtenerPedidoAdmin,
} from "@/lib/firebase/admin-catalogo";
import type { EstadoFactura } from "@/lib/firebase/tipos";
import { formatearRD } from "@/lib/precios";

export const metadata = { title: "Facturación · Panel" };
export const dynamic = "force-dynamic";

const ETIQUETA: Record<EstadoFactura, string> = {
  emitida: "Emitida",
  pagada: "Pagada",
  anulada: "Anulada",
};
const CLASE: Record<EstadoFactura, string> = {
  emitida: "bg-amber-400/15 text-amber-300",
  pagada: "bg-verde/15 text-verde",
  anulada: "bg-white/10 text-white/45",
};

function fecha(m: number) {
  if (!m) return "—";
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
  }).format(new Date(m));
}

export default async function AdminFacturacion({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string }>;
}) {
  const { pedido: pedidoId } = await searchParams;
  const [productos, config, facturas, pedido] = await Promise.all([
    listarProductosAdmin(),
    obtenerConfigAdmin(),
    listarFacturas(15),
    pedidoId ? obtenerPedidoAdmin(pedidoId) : Promise.resolve(null),
  ]);
  const conStock = productos.filter((p) => p.activo || p.stockTotal > 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        Facturación
      </h1>
      <p className="mb-5 mt-1 text-sm text-white/50">
        Emite una factura; descuenta del inventario al emitirla.
      </p>

      {pedidoId && !pedido && (
        <p className="mb-5 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-200">
          El pedido que buscas ya no existe o ya fue facturado.
        </p>
      )}

      {productos.length === 0 ? (
        <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-200">
          Primero crea productos en{" "}
          <Link href="/admin/productos" className="underline">
            Productos
          </Link>
          .
        </p>
      ) : (
        <FormularioFactura productos={conStock} config={config} pedido={pedido} />
      )}

      {facturas.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-lg font-extrabold uppercase tracking-tight">
            Facturas recientes
          </h2>
          <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10">
            {facturas.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/admin/facturas/${f.id}`}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 text-sm hover:bg-white/[0.03]"
                >
                  <span className="font-semibold text-verde">{f.numero}</span>
                  <span className="min-w-0 flex-1 truncate text-white/70">
                    {f.clienteNombre}
                  </span>
                  <span className="text-xs text-white/40">
                    {fecha(f.fechaEmision)}
                  </span>
                  <span className="font-semibold">{formatearRD(f.total)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${CLASE[f.estado]}`}
                  >
                    {ETIQUETA[f.estado]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
