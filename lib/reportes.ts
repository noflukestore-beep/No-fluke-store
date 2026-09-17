/**
 * Resuelve el rango de fechas de los reportes (Compra y Venta) a partir de
 * los `searchParams` de la página: `?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`, o
 * `?todo=1` para no acotar. Sin parámetros, cae en los últimos 30 días.
 */
export interface RangoFechas {
  /** `null` = sin límite (rango "Todo"). */
  desde: number | null;
  hasta: number | null;
  esTodo: boolean;
  /** Para precargar los `<input type="date">` del filtro. */
  desdeInput: number;
  hastaInput: number;
}

export function resolverRango(sp: {
  desde?: string;
  hasta?: string;
  todo?: string;
}): RangoFechas {
  const hoy = new Date();
  const hastaDefecto = new Date(hoy);
  hastaDefecto.setHours(23, 59, 59, 999);
  const desdeDefecto = new Date(hoy);
  desdeDefecto.setDate(desdeDefecto.getDate() - 29);
  desdeDefecto.setHours(0, 0, 0, 0);

  if (sp.todo === "1") {
    return {
      desde: null,
      hasta: null,
      esTodo: true,
      desdeInput: desdeDefecto.getTime(),
      hastaInput: hastaDefecto.getTime(),
    };
  }

  const desde = sp.desde
    ? new Date(`${sp.desde}T00:00:00`).getTime()
    : desdeDefecto.getTime();
  const hasta = sp.hasta
    ? new Date(`${sp.hasta}T23:59:59`).getTime()
    : hastaDefecto.getTime();

  return { desde, hasta, esTodo: false, desdeInput: desde, hastaInput: hasta };
}

/** `true` si el rango cabe en una gráfica diaria legible (~3 meses). */
export function rangoGraficable(rango: RangoFechas): boolean {
  if (rango.desde == null || rango.hasta == null) return false;
  const dias = (rango.hasta - rango.desde) / 86_400_000;
  return dias > 0 && dias <= 92;
}

/** Reduce las etiquetas del eje X a un máximo legible, sin desalinear los
 * puntos (elige índices espaciados de forma pareja, siempre con el primero
 * y el último). */
export function etiquetasEspaciadas(etiquetas: string[], max = 8): string[] {
  if (etiquetas.length <= max) return etiquetas;
  const resultado: string[] = [];
  for (let i = 0; i < max; i++) {
    const idx = Math.round((i * (etiquetas.length - 1)) / (max - 1));
    resultado.push(etiquetas[idx]);
  }
  return resultado;
}

/** Serie diaria [{ etiqueta, valor }] para alimentar `GraficoArea`. */
export function serieDiaria<T>(
  items: T[],
  fechaDe: (item: T) => number,
  valorDe: (item: T) => number,
  desde: number,
  hasta: number,
): { etiquetas: string[]; valores: number[] } {
  const dias = Math.max(1, Math.round((hasta - desde) / 86_400_000) + 1);
  const valores = new Array(dias).fill(0);
  for (const item of items) {
    const idx = Math.floor((fechaDe(item) - desde) / 86_400_000);
    if (idx >= 0 && idx < dias) valores[idx] += valorDe(item);
  }
  const etiquetas = valores.map((_, i) => {
    const f = new Date(desde + i * 86_400_000);
    return f.toLocaleDateString("es-DO", { day: "2-digit", month: "2-digit" });
  });
  return { etiquetas, valores };
}
