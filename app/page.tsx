import Link from "next/link";

const CATEGORIAS = ["Perfumes", "Ropa", "T-Shirts", "Zapatos"];

const MARQUEE = [
  "No Fluke Store",
  "El estilo no es suerte",
  "Envíos a todo RD",
  "Pide por WhatsApp",
];

export default function Inicio() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      {/* Resplandores verdes de fondo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-flotar absolute left-1/2 top-[-15%] h-[70vmin] w-[70vmin] -translate-x-1/2 rounded-full bg-verde/25 blur-[130px]" />
        <div className="animate-flotar-lento absolute bottom-[-20%] right-[-15%] h-[60vmin] w-[60vmin] rounded-full bg-verde-oscuro/35 blur-[130px]" />
        <div className="animate-flotar-lento absolute bottom-[10%] left-[-10%] h-[45vmin] w-[45vmin] rounded-full bg-verde-claro/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent,#040705_72%)]" />
      </div>

      {/* Rejilla sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:46px_46px] [mask-image:radial-gradient(circle_at_center,#000_10%,transparent_75%)]"
      />

      {/* Monograma */}
      <div className="aparecer relative mb-8 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-verde to-verde-oscuro font-display text-lg font-extrabold text-[#040705] shadow-[0_0_50px_-8px_var(--color-verde)]">
        NF
        <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/25" />
      </div>

      {/* Distintivo */}
      <span className="aparecer aparecer-1 mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-medium tracking-wide text-white/65 backdrop-blur-sm sm:text-xs">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verde opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-verde" />
        </span>
        República Dominicana · Envíos a todo el país
      </span>

      {/* Título */}
      <h1 className="aparecer aparecer-2 font-display font-extrabold uppercase leading-[0.88] tracking-tight">
        <span className="block bg-gradient-to-b from-white to-white/55 bg-clip-text text-[13.5vw] text-transparent sm:text-7xl lg:text-8xl">
          No Fluke
        </span>
        <span className="animate-brillo -mt-1 block bg-gradient-to-r from-verde-oscuro via-verde-claro to-verde bg-[length:200%_auto] bg-clip-text text-[13.5vw] text-transparent sm:text-7xl lg:text-8xl">
          Store
        </span>
      </h1>

      {/* Eslogan */}
      <p className="aparecer aparecer-3 mt-8 text-2xl font-bold text-white sm:text-3xl">
        El estilo no es suerte.
      </p>
      <p className="aparecer aparecer-4 mt-3 max-w-xs text-pretty text-sm text-white/55 sm:max-w-md sm:text-base">
        Perfumes, ropa, t-shirts y zapatos que hablan por ti.
      </p>

      {/* Botón */}
      <Link
        href="/tienda"
        className="group aparecer aparecer-5 relative mt-11 inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-verde px-9 py-4 text-base font-bold text-[#040705] shadow-[0_0_45px_-6px_var(--color-verde)] transition-transform duration-300 hover:scale-[1.05] active:scale-100"
      >
        <span className="relative z-10">Entrar a la página</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden
        >
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
      </Link>

      {/* Categorías */}
      <ul className="aparecer aparecer-6 mt-14 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
        {CATEGORIAS.map((categoria, i) => (
          <li key={categoria} className="flex items-center gap-3">
            {i > 0 && <span className="text-verde">◆</span>}
            {categoria}
          </li>
        ))}
      </ul>

      {/* Marquee inferior */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden border-t border-white/10 bg-white/[0.02] py-3 backdrop-blur-sm">
        <div className="animate-marquee flex w-max gap-8 whitespace-nowrap pr-8 text-[11px] font-bold uppercase tracking-[0.32em] text-white/30">
          {[0, 1].map((grupo) => (
            <div key={grupo} className="flex gap-8" aria-hidden={grupo === 1}>
              {MARQUEE.map((texto) => (
                <span key={texto} className="flex items-center gap-8">
                  {texto}
                  <span className="text-verde/70">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
