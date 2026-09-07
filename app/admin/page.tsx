import PanelPedidos from "@/components/admin/PanelPedidos";
import { ALERTAS, RESUMEN_DIA } from "@/lib/admin/demo";
import { formatearRD } from "@/lib/precios";

const HOY = new Intl.DateTimeFormat("es-DO", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());

const ICONO_ALERTA: Record<string, string> = {
  atraso: "⏰",
  stock: "📦",
  foto: "🖼️",
};

export default function PanelInicio() {
  return (
    <>
      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Pedidos
          </h1>
          <p className="text-sm text-neutral-500 first-letter:uppercase">{HOY}</p>
        </div>
        <span className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          Datos de ejemplo · el panel aún no lee Firestore
        </span>
      </div>

      {/* Resumen del día */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tarjeta
          etiqueta="Pendientes"
          valor={String(RESUMEN_DIA.pendientes)}
          acento
        />
        <Tarjeta
          etiqueta="Ventas confirmadas"
          valor={formatearRD(RESUMEN_DIA.ventasConfirmadas)}
        />
        <Tarjeta
          etiqueta="Entregados hoy"
          valor={String(RESUMEN_DIA.entregadosHoy)}
        />
        <Tarjeta
          etiqueta="Ticket promedio"
          valor={formatearRD(RESUMEN_DIA.ticketPromedio)}
        />
      </div>

      {/* Alertas */}
      <div className="mt-4 space-y-2">
        {ALERTAS.map((alerta) => (
          <div
            key={alerta.texto}
            className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
          >
            <span aria-hidden>{ICONO_ALERTA[alerta.tipo]}</span>
            {alerta.texto}
          </div>
        ))}
      </div>

      <PanelPedidos />
    </>
  );
}

function Tarjeta({
  etiqueta,
  valor,
  acento = false,
}: {
  etiqueta: string;
  valor: string;
  acento?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        acento ? "border-verde/40 ring-1 ring-verde/20" : "border-neutral-200"
      }`}
    >
      <p className="text-xs font-medium text-neutral-500">{etiqueta}</p>
      <p
        className={`mt-1 text-2xl font-bold tracking-tight ${
          acento ? "text-verde-oscuro" : "text-neutral-900"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}
