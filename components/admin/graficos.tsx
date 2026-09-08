/** Gráficos en SVG puro, sin dependencias. Colores de marca. */

const VERDE = "#16db65";

export function Sparkline({
  datos,
  className = "",
}: {
  datos: number[];
  className?: string;
}) {
  const w = 120;
  const h = 36;
  const min = Math.min(...datos);
  const max = Math.max(...datos);
  const span = max - min || 1;
  const paso = w / (datos.length - 1);
  const puntos = datos.map((v, i) => {
    const x = i * paso;
    const y = h - 3 - ((v - min) / span) * (h - 6);
    return `${x},${y}`;
  });
  const area = `M0,${h} L${puntos.join(" L")} L${w},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={VERDE} stopOpacity="0.35" />
          <stop offset="100%" stopColor={VERDE} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark)" />
      <polyline
        points={puntos.join(" ")}
        fill="none"
        stroke={VERDE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GraficoArea({
  datos,
  etiquetasX,
  puntoDestacado,
}: {
  datos: number[];
  etiquetasX: string[];
  puntoDestacado?: { indice: number; texto: string };
}) {
  const w = 640;
  const h = 240;
  const padL = 4;
  const padB = 22;
  const min = 0;
  const max = Math.ceil(Math.max(...datos) / 4) * 4;
  const span = max - min || 1;
  const paso = (w - padL) / (datos.length - 1);
  const yDe = (v: number) => h - padB - ((v - min) / span) * (h - padB - 8);

  const puntos = datos.map((v, i) => `${padL + i * paso},${yDe(v)}`);
  const area = `M${padL},${h - padB} L${puntos.join(" L")} L${w},${h - padB} Z`;

  const dest =
    puntoDestacado &&
    (() => {
      const x = padL + puntoDestacado.indice * paso;
      const y = yDe(datos[puntoDestacado.indice]);
      return { x, y };
    })();

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={VERDE} stopOpacity="0.28" />
          <stop offset="100%" stopColor={VERDE} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Líneas guía */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={padL}
          x2={w}
          y1={8 + f * (h - padB - 8)}
          y2={8 + f * (h - padB - 8)}
          stroke="#ffffff"
          strokeOpacity="0.06"
        />
      ))}

      <path d={area} fill="url(#areaFill)" />
      <polyline
        points={puntos.join(" ")}
        fill="none"
        stroke={VERDE}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {dest && (
        <g>
          <line
            x1={dest.x}
            x2={dest.x}
            y1={dest.y}
            y2={h - padB}
            stroke={VERDE}
            strokeOpacity="0.4"
            strokeDasharray="3 3"
          />
          <circle cx={dest.x} cy={dest.y} r="5" fill={VERDE} stroke="#0a1310" strokeWidth="2" />
          <g transform={`translate(${Math.min(dest.x, w - 70)}, ${Math.max(dest.y - 40, 4)})`}>
            <rect width="66" height="30" rx="6" fill="#0a1310" stroke="#ffffff" strokeOpacity="0.12" />
            <text x="33" y="19" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">
              {puntoDestacado.texto}
            </text>
          </g>
        </g>
      )}

      {etiquetasX.map((et, i) => (
        <text
          key={i}
          x={padL + (i / (etiquetasX.length - 1)) * (w - padL)}
          y={h - 6}
          textAnchor={i === 0 ? "start" : i === etiquetasX.length - 1 ? "end" : "middle"}
          fill="#ffffff"
          fillOpacity="0.4"
          fontSize="10"
        >
          {et}
        </text>
      ))}
    </svg>
  );
}

export function Donut({
  segmentos,
  centro,
  subcentro,
}: {
  segmentos: Array<{ valor: number; color: string }>;
  centro: string;
  subcentro: string;
}) {
  const size = 180;
  const r = 70;
  const c = 2 * Math.PI * r;
  const total = segmentos.reduce((s, x) => s + x.valor, 0) || 1;
  const arcos = segmentos.reduce<
    Array<{ color: string; largo: number; offset: number }>
  >((acc, seg) => {
    const largo = (seg.valor / total) * c;
    const offset = acc.reduce((s, a) => s + a.largo, 0);
    return [...acc, { color: seg.color, largo, offset }];
  }, []);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="16" />
      {arcos.map((arco, i) => (
        <circle
          key={i}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={arco.color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${arco.largo} ${c - arco.largo}`}
          strokeDashoffset={-arco.offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      ))}
      <text x="50%" y="47%" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="800">
        {centro}
      </text>
      <text x="50%" y="60%" textAnchor="middle" fill="#ffffff" fillOpacity="0.5" fontSize="11">
        {subcentro}
      </text>
    </svg>
  );
}
