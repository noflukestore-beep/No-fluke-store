import FiltroFechas from "@/components/admin/FiltroFechas";
import { Kpi, TarjetaVacia } from "@/components/admin/ReporteUI";
import { GraficoArea } from "@/components/admin/graficos";
import {
  listarFacturasEnRango,
  listarProductosAdmin,
} from "@/lib/firebase/admin-catalogo";
import { formatearRD, formatearRDCorto } from "@/lib/precios";
import {
  etiquetasEspaciadas,
  rangoGraficable,
  resolverRango,
  serieDiaria,
} from "@/lib/reportes";

export const metadata = { title: "Reporte de Venta · Panel" };
export const dynamic = "force-dynamic";

export default async function ReporteVenta({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; todo?: string }>;
}) {
  const sp = await searchParams;
  const rango = resolverRango(sp);

  const [todasLasFacturas, productos] = await Promise.all([
    listarFacturasEnRango(rango.desde, rango.hasta),
    listarProductosAdmin(),
  ]);
  const costoDe = new Map(productos.map((p) => [p.id, p.precioCompra]));

  const anuladas = todasLasFacturas.filter((f) => f.estado === "anulada");
  const facturas = todasLasFacturas.filter((f) => f.estado !== "anulada");

  const ventasBrutas = facturas.reduce((s, f) => s + f.subtotal, 0);
  const descuentos = facturas.reduce((s, f) => s + f.descuento, 0);
  const itbisCobrado = facturas.reduce((s, f) => s + f.impuestos, 0);
  const totalFacturado = facturas.reduce((s, f) => s + f.total, 0);
  const cobrado = facturas.reduce((s, f) => s + f.montoPagado, 0);
  const pendienteCobro = facturas.reduce((s, f) => s + f.saldoFinal, 0);
  const devuelto = facturas.reduce((s, f) => s + f.montoDevuelto, 0);

  let unidadesVendidas = 0;
  let costoMercanciaVendida = 0;
  const porProducto = new Map<
    string,
    { nombre: string; unidades: number; ingreso: number; costo: number }
  >();
  for (const f of facturas) {
    for (const it of f.items) {
      const cantidadNeta = it.cantidad - it.devuelto;
      if (cantidadNeta <= 0) continue;
      const costoUnit = costoDe.get(it.productoId) ?? 0;
      const ingreso = it.precioUnitario * cantidadNeta;
      const costo = costoUnit * cantidadNeta;
      unidadesVendidas += cantidadNeta;
      costoMercanciaVendida += costo;
      const prev = porProducto.get(it.productoId) ?? {
        nombre: it.descripcion,
        unidades: 0,
        ingreso: 0,
        costo: 0,
      };
      prev.unidades += cantidadNeta;
      prev.ingreso += ingreso;
      prev.costo += costo;
      porProducto.set(it.productoId, prev);
    }
  }
  const gananciaBruta = ventasBrutas - descuentos - costoMercanciaVendida;
  const baseVentas = ventasBrutas - descuentos;
  const margen = baseVentas > 0 ? (gananciaBruta / baseVentas) * 100 : 0;

  const filas = [...porProducto.entries()]
    .map(([id, v]) => ({ id, ...v, ganancia: v.ingreso - v.costo }))
    .sort((a, b) => b.ingreso - a.ingreso);

  const graficable = rangoGraficable(rango);
  const serie =
    graficable && rango.desde != null && rango.hasta != null
      ? serieDiaria(
          facturas,
          (f) => f.fechaEmision,
          (f) => f.total,
          rango.desde,
          rango.hasta,
        )
      : null;

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        Reporte de Venta
      </h1>
      <p className="mb-5 mt-1 text-sm text-white/50">
        Lo vendido y lo ganado en el período, según las facturas emitidas.
      </p>

      <FiltroFechas
        desde={rango.desdeInput}
        hasta={rango.hastaInput}
        esTodo={rango.esTodo}
      />

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          etiqueta="Ganancia bruta estimada"
          valor={formatearRDCorto(gananciaBruta)}
          sub={`Margen ${margen.toFixed(0)}%`}
          acento
        />
        <Kpi etiqueta="Total facturado" valor={formatearRDCorto(totalFacturado)} />
        <Kpi etiqueta="Cobrado" valor={formatearRDCorto(cobrado)} />
        <Kpi etiqueta="Pendiente por cobrar" valor={formatearRDCorto(pendienteCobro)} />
        <Kpi etiqueta="Facturas emitidas" valor={String(facturas.length)} />
        <Kpi etiqueta="Unidades vendidas" valor={String(unidadesVendidas)} />
        <Kpi etiqueta="Devuelto" valor={formatearRDCorto(devuelto)} />
        <Kpi etiqueta="ITBIS cobrado" valor={formatearRDCorto(itbisCobrado)} />
      </div>

      <p className="mt-3 text-xs text-white/40">
        Ganancia bruta = ventas − descuentos − costo de la mercancía vendida
        (no incluye ITBIS). {anuladas.length > 0 && (
          <>
            {anuladas.length}{" "}
            {anuladas.length === 1 ? "factura anulada" : "facturas anuladas"}{" "}
            en el período no se cuentan.
          </>
        )}
      </p>

      {serie && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-3 text-sm font-semibold text-white/70">
            Facturado por día
          </h2>
          <GraficoArea
            datos={serie.valores}
            etiquetasX={etiquetasEspaciadas(serie.etiquetas)}
          />
        </div>
      )}

      <div className="mt-5">
        <h2 className="mb-3 font-display text-lg font-extrabold uppercase tracking-tight">
          Por producto
        </h2>
        {filas.length === 0 ? (
          <TarjetaVacia>No hay ventas en este período.</TarjetaVacia>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-white/[0.03] text-left text-xs text-white/45">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Producto</th>
                  <th className="px-3 py-2.5 font-medium text-right">
                    Unidades
                  </th>
                  <th className="px-3 py-2.5 font-medium text-right">
                    Ingreso
                  </th>
                  <th className="px-3 py-2.5 font-medium text-right">
                    Ganancia
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filas.map((f) => (
                  <tr key={f.id} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5">{f.nombre}</td>
                    <td className="px-3 py-2.5 text-right">{f.unidades}</td>
                    <td className="px-3 py-2.5 text-right font-semibold">
                      {formatearRD(f.ingreso)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-verde">
                      {formatearRD(f.ganancia)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
