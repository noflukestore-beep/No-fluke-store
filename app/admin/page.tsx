import Link from "next/link";
import { Donut, GraficoArea, Sparkline } from "@/components/admin/graficos";
import {
  INVENTARIO,
  KPIS,
  PEDIDOS_DEMO,
  PRODUCTOS_TOP,
  VENTAS_30D,
} from "@/lib/admin/demo";
import { listarProductosAdmin } from "@/lib/firebase/admin-catalogo";
import { formatearRD, formatearRDCorto } from "@/lib/precios";
import type { EstadoPedido } from "@/lib/firebase/tipos";

export const metadata = { title: "Dashboard · Panel" };
// Siempre fresco: un producto recién guardado debe verse aquí de inmediato.
export const dynamic = "force-dynamic";

const COLOR_ESTADO: Record<EstadoPedido, string> = {
  pendiente: "bg-amber-400/15 text-amber-300",
  confirmado: "bg-sky-400/15 text-sky-300",
  entregado: "bg-verde/15 text-verde",
  cancelado: "bg-rose-400/15 text-rose-300",
};

export default async function Dashboard() {
  const productos = await listarProductosAdmin();
  const productosRecientes = productos.slice(0, 4);

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-white/50">
            Esto es lo que está pasando en tu tienda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300">
            Datos de ejemplo
          </span>
          <span className="flex items-center gap-2 rounded-lg border border-verde/30 bg-verde/10 px-3 py-1.5 text-sm font-semibold text-verde">
            Últimos 30 días ▾
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <Panel key={kpi.etiqueta} className="p-4">
            <p className="text-xs text-white/50">{kpi.etiqueta}</p>
            <p className="mt-1 truncate text-xl font-bold tracking-tight">
              {kpi.valor}
            </p>
            <div className="mt-2 h-8 w-full opacity-90">
              <Sparkline datos={kpi.serie} className="h-full w-full" />
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px]">
              <span className="font-semibold text-verde">
                ▲ {kpi.delta.toFixed(1)}%
              </span>
              <span className="text-white/40">vs mes anterior</span>
            </p>
          </Panel>
        ))}
      </div>

      {/* Ventas + Top productos + Inventario */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel className="p-5 lg:col-span-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white/70">
                Resumen de ventas
              </h2>
              <p className="mt-1 font-display text-2xl font-extrabold tracking-tight">
                {formatearRDCorto(342600)}
              </p>
              <p className="text-xs text-white/40">últimos 30 días</p>
            </div>
            <span className="rounded-md bg-verde/15 px-2 py-1 text-xs font-semibold text-verde">
              ▲ 18.2%
            </span>
          </div>
          <div className="mt-3">
            <GraficoArea
              datos={VENTAS_30D}
              etiquetasX={["1", "5", "10", "15", "20", "25", "30"]}
              puntoDestacado={{ indice: 19, texto: "RD$14k" }}
            />
          </div>
        </Panel>

        <Panel className="p-5 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/70">
              Productos más vendidos
            </h2>
            <Link href="/admin/productos" className="text-xs text-verde hover:underline">
              Ver todos →
            </Link>
          </div>
          <ul className="mt-3 space-y-3">
            {PRODUCTOS_TOP.map((p) => (
              <li key={p.nombre} className="flex items-center gap-3">
                <span className="h-9 w-9 shrink-0 rounded-lg border border-white/10 bg-white/5" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.nombre}</p>
                  <p className="text-xs text-white/40">{p.categoria}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold">
                    {formatearRDCorto(p.ingreso)}
                  </p>
                  <p className="text-xs text-white/40">
                    {p.vendidos} uds ·{" "}
                    <span className="text-verde">▲{p.delta}%</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-5 lg:col-span-3">
          <h2 className="text-sm font-semibold text-white/70">Inventario</h2>
          <div className="mt-2 flex justify-center">
            <Donut
              segmentos={INVENTARIO.segmentos.map((s) => ({
                valor: s.valor,
                color: s.color,
              }))}
              centro={INVENTARIO.total.toLocaleString("es-DO")}
              subcentro="artículos"
            />
          </div>
          <ul className="mt-2 space-y-1.5">
            {INVENTARIO.segmentos.map((s) => (
              <li key={s.etiqueta} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="flex-1 text-white/60">{s.etiqueta}</span>
                <span className="font-semibold">
                  {s.valor.toLocaleString("es-DO")}
                </span>
                <span className="w-8 text-right text-white/40">{s.pct}%</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Banner */}
      <div
        className="relative overflow-hidden rounded-xl border border-verde/20 p-6 md:p-8"
        style={{
          backgroundImage:
            "linear-gradient(110deg,#06120b 0%,#0d2a17 55%,#0a1f12 100%)",
        }}
      >
        <div aria-hidden className="b-textura opacity-20" />
        <p className="relative text-xs font-bold uppercase tracking-[0.3em] text-verde">
          Nueva colección
        </p>
        <h3 className="relative mt-1 font-display text-3xl font-extrabold uppercase italic tracking-tight md:text-4xl">
          Built Different
        </h3>
        <p className="relative mt-1 text-sm text-white/60">
          Streetwear para los que se mueven distinto.
        </p>
        <Link
          href="/tienda"
          className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-verde px-5 py-2.5 text-sm font-bold text-[#04140c] transition-transform hover:scale-105"
        >
          Ir a la tienda →
        </Link>
      </div>

      {/* Pedidos recientes + Destacados */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel className="p-5 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/70">
              Pedidos recientes
            </h2>
            <Link href="/admin/pedidos" className="text-xs text-verde hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[440px] text-sm">
              <thead>
                <tr className="text-left text-xs text-white/40">
                  <th className="pb-2 font-medium">Pedido</th>
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Estado</th>
                  <th className="pb-2 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {PEDIDOS_DEMO.slice(0, 6).map((p) => (
                  <tr key={p.codigo}>
                    <td className="py-2.5 font-mono text-xs font-semibold">
                      {p.codigo}
                    </td>
                    <td className="py-2.5 text-white/80">{p.clienteNombre}</td>
                    <td className="py-2.5 font-semibold">
                      {formatearRD(p.total)}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${COLOR_ESTADO[p.estado]}`}
                      >
                        {p.estado}
                      </span>
                    </td>
                    <td className="py-2.5 text-white/40">{p.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="p-5 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white/70">
              Productos recientes
              <span className="rounded-full bg-verde/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-verde">
                en vivo
              </span>
            </h2>
            <Link href="/admin/productos" className="text-xs text-verde hover:underline">
              Ver todos →
            </Link>
          </div>
          {productosRecientes.length === 0 ? (
            <p className="mt-4 text-center text-sm text-white/40">
              Todavía no has creado ningún producto.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {productosRecientes.map((p) => {
                const foto = p.imagenes[0];
                return (
                  <Link
                    key={p.id}
                    href={`/admin/productos/${p.id}`}
                    className="rounded-lg border border-white/10 bg-white/5 p-2.5 transition-colors hover:border-verde/40"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-md border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                      {foto && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={foto.url}
                          alt={foto.alt || p.nombre}
                          className="h-full w-full object-cover"
                        />
                      )}
                      {!p.activo && (
                        <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white/70">
                          Oculto
                        </span>
                      )}
                    </div>
                    <p className="mt-2 truncate text-sm font-medium">
                      {p.nombre}
                    </p>
                    <div className="mt-0.5 flex items-center justify-between">
                      <span className="text-sm font-bold text-verde">
                        {formatearRD(p.precio)}
                      </span>
                      <span className="text-xs text-white/40">
                        {p.categoriaNombre || "—"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-white/10 bg-white/[0.03] ${className}`}
    >
      {children}
    </section>
  );
}
