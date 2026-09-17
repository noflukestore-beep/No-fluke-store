import FiltroFechas from "@/components/admin/FiltroFechas";
import { Kpi, TarjetaVacia } from "@/components/admin/ReporteUI";
import { GraficoArea } from "@/components/admin/graficos";
import { listarEntradasInventario } from "@/lib/firebase/admin-catalogo";
import { formatearRD, formatearRDCorto } from "@/lib/precios";
import {
  etiquetasEspaciadas,
  rangoGraficable,
  resolverRango,
  serieDiaria,
} from "@/lib/reportes";

export const metadata = { title: "Reporte de Compra · Panel" };
export const dynamic = "force-dynamic";

export default async function ReporteCompra({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; todo?: string }>;
}) {
  const sp = await searchParams;
  const rango = resolverRango(sp);

  const entradas = await listarEntradasInventario();
  const enRango = entradas
    .filter(
      (m) =>
        (rango.desde == null || m.creadoEn >= rango.desde) &&
        (rango.hasta == null || m.creadoEn <= rango.hasta),
    )
    .sort((a, b) => b.creadoEn - a.creadoEn);

  const totalInvertido = enRango.reduce(
    (s, m) => s + m.cantidad * (m.costoUnitario ?? 0),
    0,
  );
  const totalUnidades = enRango.reduce((s, m) => s + m.cantidad, 0);
  const articulos = new Set(enRango.map((m) => m.productoId)).size;
  const movimientosSinCosto = enRango.filter((m) => m.costoUnitario == null);
  const unidadesSinCosto = movimientosSinCosto.reduce(
    (s, m) => s + m.cantidad,
    0,
  );
  const costoPromedio = totalUnidades > 0 ? totalInvertido / totalUnidades : 0;

  const porProducto = new Map<
    string,
    { nombre: string; unidades: number; invertido: number; sinCosto: boolean }
  >();
  for (const m of enRango) {
    const prev = porProducto.get(m.productoId) ?? {
      nombre: m.productoNombre,
      unidades: 0,
      invertido: 0,
      sinCosto: false,
    };
    prev.unidades += m.cantidad;
    prev.invertido += m.cantidad * (m.costoUnitario ?? 0);
    if (m.costoUnitario == null) prev.sinCosto = true;
    porProducto.set(m.productoId, prev);
  }
  const filas = [...porProducto.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.invertido - a.invertido);

  const graficable = rangoGraficable(rango);
  const serie =
    graficable && rango.desde != null && rango.hasta != null
      ? serieDiaria(
          enRango,
          (m) => m.creadoEn,
          (m) => m.cantidad * (m.costoUnitario ?? 0),
          rango.desde,
          rango.hasta,
        )
      : null;

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        Reporte de Compra
      </h1>
      <p className="mb-5 mt-1 text-sm text-white/50">
        Cuánto se ha invertido en mercancía: cada vez que das de alta un
        producto o agregas existencia con &quot;Ajustes → Entrada&quot;, queda
        registrado aquí.
      </p>

      <FiltroFechas
        desde={rango.desdeInput}
        hasta={rango.hastaInput}
        esTodo={rango.esTodo}
      />

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          etiqueta="Total invertido"
          valor={formatearRDCorto(totalInvertido)}
          acento
        />
        <Kpi etiqueta="Unidades ingresadas" valor={String(totalUnidades)} />
        <Kpi etiqueta="Artículos distintos" valor={String(articulos)} />
        <Kpi
          etiqueta="Costo promedio / unidad"
          valor={formatearRDCorto(costoPromedio)}
        />
      </div>

      {unidadesSinCosto > 0 && (
        <p className="mt-3 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          {unidadesSinCosto} unidades no tienen &quot;Costo&quot; registrado en
          su producto — no se sumaron al total invertido.
        </p>
      )}

      {serie && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-3 text-sm font-semibold text-white/70">
            Invertido por día
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
          <TarjetaVacia>
            No hay entradas de inventario en este período.
          </TarjetaVacia>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-white/[0.03] text-left text-xs text-white/45">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Producto</th>
                  <th className="px-3 py-2.5 font-medium text-right">
                    Unidades
                  </th>
                  <th className="px-3 py-2.5 font-medium text-right">
                    Invertido
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filas.map((f) => (
                  <tr key={f.id} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5">
                      {f.nombre}
                      {f.sinCosto && (
                        <span className="ml-1.5 text-[10px] font-semibold uppercase text-amber-400">
                          sin costo
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">{f.unidades}</td>
                    <td className="px-3 py-2.5 text-right font-semibold">
                      {formatearRD(f.invertido)}
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
