/** Piezas visuales compartidas entre Reporte de Compra y Reporte de Venta. */

export function Kpi({
  etiqueta,
  valor,
  sub,
  acento,
}: {
  etiqueta: string;
  valor: string;
  sub?: string;
  acento?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border p-4 ${
        acento ? "border-verde/40 bg-verde/5" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p className="text-xs text-white/50">{etiqueta}</p>
      <p
        className={`mt-1 break-words font-display text-lg font-extrabold leading-tight tracking-tight sm:text-xl md:text-2xl ${
          acento ? "text-verde" : ""
        }`}
      >
        {valor}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-white/40">{sub}</p>}
    </div>
  );
}

export function TarjetaVacia({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-10 text-center text-sm text-white/40">
      {children}
    </p>
  );
}
