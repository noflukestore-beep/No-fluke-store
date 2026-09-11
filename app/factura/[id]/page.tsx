import Link from "next/link";
import { notFound } from "next/navigation";
import BotonImprimir from "@/components/BotonImprimir";
import { obtenerConfigAdmin, obtenerFactura } from "@/lib/firebase/admin-catalogo";
import { formatearRD } from "@/lib/precios";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const f = await obtenerFactura(id);
  return { title: f ? `Factura ${f.numero}` : "Factura" };
}

const ESTADO: Record<string, string> = {
  emitida: "EMITIDA",
  pagada: "PAGADA",
  anulada: "ANULADA",
};

function fecha(m: number | null) {
  if (!m) return "—";
  return new Intl.DateTimeFormat("es-DO", { dateStyle: "long" }).format(
    new Date(m),
  );
}

export default async function PaginaFactura({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [factura, config] = await Promise.all([
    obtenerFactura(id),
    obtenerConfigAdmin(),
  ]);
  if (!factura) notFound();

  return (
    <main className="min-h-dvh bg-white text-black">
      <style>{`
        @media print { @page { margin: 14mm; } }
      `}</style>
      <div className="mx-auto max-w-[820px] p-4 sm:p-8 print:p-0">
      {/* contenido */}

      <div className="mb-5 flex justify-end gap-2 print:hidden">
        <Link
          href="/admin/facturas"
          className="rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold text-black/70 hover:bg-black/5"
        >
          ← Volver
        </Link>
        <BotonImprimir />
      </div>

      <article className="rounded-xl border border-black/10 bg-white p-6 shadow-sm sm:p-10 print:border-0 print:p-0 print:shadow-none">
        {/* Encabezado */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-5">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              {config.nombreTienda}
            </h1>
            <div className="mt-1 text-xs leading-5 text-black/60">
              {config.rnc && <p>RNC: {config.rnc}</p>}
              {config.direccion && <p>{config.direccion}</p>}
              {config.whatsapp && <p>Tel: {config.whatsapp}</p>}
              {config.correo && <p>{config.correo}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
              Factura
            </p>
            <p className="text-lg font-extrabold">{factura.numero}</p>
            <p className="mt-1 text-xs text-black/60">
              {fecha(factura.fechaEmision)}
            </p>
            <span
              className={`mt-2 inline-block rounded border px-2 py-0.5 text-[11px] font-bold ${
                factura.estado === "anulada"
                  ? "border-black/20 text-black/40"
                  : factura.estado === "pagada"
                    ? "border-green-600 text-green-700"
                    : "border-amber-500 text-amber-600"
              }`}
            >
              {ESTADO[factura.estado]}
            </span>
          </div>
        </div>

        {/* Cliente */}
        <div className="grid gap-1 py-5 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
            Cliente
          </p>
          <p className="font-semibold">{factura.clienteNombre}</p>
          {factura.clienteDocumento && (
            <p className="text-black/60">Doc: {factura.clienteDocumento}</p>
          )}
          {factura.clienteTelefono && (
            <p className="text-black/60">Tel: {factura.clienteTelefono}</p>
          )}
        </div>

        {/* Items */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-black/10 text-left text-xs uppercase tracking-wide text-black/45">
              <th className="py-2 font-medium">Descripción</th>
              <th className="py-2 text-right font-medium">Cant.</th>
              <th className="py-2 text-right font-medium">Precio</th>
              <th className="py-2 text-right font-medium">Importe</th>
            </tr>
          </thead>
          <tbody>
            {factura.items.map((it) => (
              <tr key={it.varianteId} className="border-b border-black/5">
                <td className="py-2 pr-2">
                  {it.descripcion}
                  {it.sku && (
                    <span className="block text-[11px] text-black/40">
                      {it.sku}
                    </span>
                  )}
                </td>
                <td className="py-2 text-right">{it.cantidad}</td>
                <td className="py-2 text-right">
                  {formatearRD(it.precioUnitario)}
                </td>
                <td className="py-2 text-right">{formatearRD(it.importe)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="mt-4 flex justify-end">
          <dl className="w-56 space-y-1 text-sm">
            <div className="flex justify-between text-black/60">
              <dt>Subtotal</dt>
              <dd>{formatearRD(factura.subtotal)}</dd>
            </div>
            {factura.descuento > 0 && (
              <div className="flex justify-between text-black/60">
                <dt>Descuento</dt>
                <dd>− {formatearRD(factura.descuento)}</dd>
              </div>
            )}
            {factura.impuestoPorcentaje > 0 && (
              <div className="flex justify-between text-black/60">
                <dt>ITBIS ({factura.impuestoPorcentaje}%)</dt>
                <dd>{formatearRD(factura.impuestos)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-black/20 pt-1 text-base font-extrabold">
              <dt>Total</dt>
              <dd>{formatearRD(factura.total)}</dd>
            </div>
            {factura.montoPagado > 0 && (
              <div className="flex justify-between text-black/60">
                <dt>Pagado</dt>
                <dd>− {formatearRD(factura.montoPagado)}</dd>
              </div>
            )}
            {factura.montoDevuelto > 0 && (
              <div className="flex justify-between text-black/60">
                <dt>Devuelto</dt>
                <dd>− {formatearRD(factura.montoDevuelto)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-black/20 pt-1 font-bold">
              <dt>Saldo</dt>
              <dd>{formatearRD(factura.saldoFinal)}</dd>
            </div>
          </dl>
        </div>

        {factura.metodoPago && (
          <p className="mt-4 text-xs text-black/50">
            Método de pago: {factura.metodoPago}
          </p>
        )}
        {factura.notas && (
          <p className="mt-2 whitespace-pre-line text-xs text-black/50">
            {factura.notas}
          </p>
        )}

        <p className="mt-8 border-t border-black/10 pt-4 text-center text-[11px] text-black/40">
          Gracias por su compra · {config.nombreTienda}
        </p>
      </article>
      </div>
    </main>
  );
}
