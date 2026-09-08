import PanelPedidos from "@/components/admin/PanelPedidos";
import { ALERTAS, RESUMEN_DIA } from "@/lib/admin/demo";
import { formatearRD } from "@/lib/precios";

export const metadata = { title: "Pedidos · Panel" };

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

export default function AdminPedidos() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
            Pedidos
          </h1>
          <p className="text-sm text-white/50 first-letter:uppercase">{HOY}</p>
        </div>
        <span className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300">
          Datos de ejemplo · aún no lee Firestore
        </span>
      </div>

      {/* Resumen */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tarjeta etiqueta="Pendientes" valor={String(RESUMEN_DIA.pendientes)} acento />
        <Tarjeta
          etiqueta="Ventas confirmadas"
          valor={formatearRD(RESUMEN_DIA.ventasConfirmadas)}
        />
        <Tarjeta etiqueta="Entregados hoy" valor={String(RESUMEN_DIA.entregadosHoy)} />
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
            className="flex items-center gap-2.5 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-sm text-amber-200"
          >
            <span aria-hidden>{ICONO_ALERTA[alerta.tipo]}</span>
            {alerta.texto}
          </div>
        ))}
      </div>

      <PanelPedidos />
    </div>
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
      className={`rounded-xl border p-4 ${
        acento
          ? "border-verde/40 bg-verde/5"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p className="text-xs text-white/50">{etiqueta}</p>
      <p
        className={`mt-1 font-display text-2xl font-extrabold tracking-tight ${
          acento ? "text-verde" : ""
        }`}
      >
        {valor}
      </p>
    </div>
  );
}
