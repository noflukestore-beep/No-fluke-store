"use client";

export default function BotonImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-black px-5 py-2 text-sm font-bold text-white hover:bg-black/80 print:hidden"
    >
      Imprimir / Guardar PDF
    </button>
  );
}
