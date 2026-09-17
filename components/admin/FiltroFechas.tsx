"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const entrada =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-verde/60 focus:outline-none";

function aInput(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Filtro de fecha inicio / fecha fin, compartido por los reportes. Cambia
 * los `searchParams` de la página (?desde=YYYY-MM-DD&hasta=YYYY-MM-DD),
 * así que la página en sí es la que recalcula todo del lado del servidor. */
export default function FiltroFechas({
  desde,
  hasta,
  esTodo,
}: {
  desde: number;
  hasta: number;
  esTodo: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [d, setD] = useState(aInput(desde));
  const [h, setH] = useState(aInput(hasta));

  function aplicar(nd: string, nh: string) {
    const params = new URLSearchParams();
    if (nd) params.set("desde", nd);
    if (nh) params.set("hasta", nh);
    router.push(`${pathname}?${params.toString()}`);
  }

  function preset(dias: number) {
    const fin = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - (dias - 1));
    const nd = aInput(inicio.getTime());
    const nh = aInput(fin.getTime());
    setD(nd);
    setH(nh);
    aplicar(nd, nh);
  }

  function verTodo() {
    router.push(`${pathname}?todo=1`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-white/50">
          Desde
        </span>
        <input
          type="date"
          value={d}
          onChange={(e) => setD(e.target.value)}
          className={entrada}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-white/50">
          Hasta
        </span>
        <input
          type="date"
          value={h}
          onChange={(e) => setH(e.target.value)}
          className={entrada}
        />
      </label>
      <button
        type="button"
        onClick={() => aplicar(d, h)}
        className="rounded-lg bg-verde px-4 py-2 text-sm font-bold text-[#04140c] hover:brightness-105"
      >
        Filtrar
      </button>

      <div className="ml-auto flex flex-wrap gap-1.5">
        {[
          { etiqueta: "7 días", dias: 7 },
          { etiqueta: "30 días", dias: 30 },
          { etiqueta: "90 días", dias: 90 },
        ].map((p) => (
          <button
            key={p.dias}
            type="button"
            onClick={() => preset(p.dias)}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/5"
          >
            {p.etiqueta}
          </button>
        ))}
        <button
          type="button"
          onClick={verTodo}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
            esTodo
              ? "border-verde/50 bg-verde/10 text-verde"
              : "border-white/15 text-white/70 hover:bg-white/5"
          }`}
        >
          Todo
        </button>
      </div>
    </div>
  );
}
