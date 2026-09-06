"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Pantalla = "intro" | "categorias";

const CATEGORIAS = [
  { nombre: "Perfumes", slug: "perfumes" },
  { nombre: "Ropa", slug: "ropa" },
  { nombre: "T-Shirts", slug: "t-shirts" },
  { nombre: "Zapatos", slug: "zapatos" },
];

// Ancla del barrido circular según la posición del tile en la rejilla 2x2.
const ANCLA_BARRIDO = ["25% 28%", "75% 28%", "25% 72%", "75% 72%"];

const GRADIENTE_MARCA =
  "linear-gradient(135deg, #0b8f43 0%, #16db65 45%, #4dff9e 100%)";

export default function Bienvenida() {
  const router = useRouter();
  const [pantalla, setPantalla] = useState<Pantalla>("intro");
  const [activo, setActivo] = useState<number | null>(null);
  const [saliendo, setSaliendo] = useState<string | null>(null);
  const [expandido, setExpandido] = useState(false);
  const puedeHover = useRef(false);

  useEffect(() => {
    puedeHover.current =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches;
    router.prefetch("/tienda");
  }, [router]);

  const elegirCategoria = useCallback(
    (indice: number, slug: string) => {
      if (saliendo) return;
      setSaliendo(ANCLA_BARRIDO[indice]);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setExpandido(true)),
      );
      window.setTimeout(() => router.push(`/tienda?c=${slug}`), 640);
    },
    [router, saliendo],
  );

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#040705] text-white">
      {pantalla === "intro" ? (
        /* ---------- Pantalla 1: Bienvenida ---------- */
        <section
          className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center"
          style={{ backgroundImage: "var(--fondo-bienvenida)" }}
        >
          <div aria-hidden className="b-textura" />

          {/* Logo: "pop" al cargar y luego flota para siempre (anidados) */}
          <div className="b-logo-pop relative z-10 mb-6 w-[min(420px,82vw)] drop-shadow-[0_18px_35px_rgba(0,0,0,0.45)]">
            <div className="b-logo-flotar">
              <Image
                src="/logo-no-fluke-store.png"
                alt="No Fluke Store"
                width={680}
                height={567}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>

          <h1 className="relative z-10 font-display font-extrabold uppercase leading-[1.05] tracking-tight">
            <span
              className="b-subir block whitespace-nowrap text-white"
              style={{ fontSize: "clamp(26px,6vw,48px)", animationDelay: "0.9s" }}
            >
              Bienvenido a
            </span>
            <span
              className="b-subir block italic text-verde-claro"
              style={{ fontSize: "clamp(30px,7vw,54px)", animationDelay: "1.1s" }}
            >
              No Fluke Store
            </span>
          </h1>

          <p
            className="b-subir relative z-10 mt-5 max-w-sm text-pretty text-sm italic text-white/70 sm:text-base"
            style={{ animationDelay: "1.35s" }}
          >
            El estilo no es suerte. Es lo que eliges ponerte.
          </p>

          <button
            type="button"
            onClick={() => setPantalla("categorias")}
            style={{
              backgroundColor: "#16db65",
              backgroundImage: GRADIENTE_MARCA,
              animationDelay: "1.6s",
            }}
            className="b-subir b-anillo group relative z-10 mt-10 inline-flex items-center gap-2 whitespace-nowrap rounded-full px-7 py-4 font-display text-sm font-extrabold uppercase tracking-normal text-[#040705] transition-transform duration-200 hover:scale-[1.06] active:scale-[0.98] sm:px-9 sm:tracking-wide"
          >
            Entrar a la tienda
            <span aria-hidden className="text-lg leading-none">
              ›
            </span>
          </button>

          <div
            className="b-subir relative z-10 mt-14 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/45"
            style={{ animationDelay: "1.85s" }}
          >
            Perfumes <span className="text-verde-claro">◆</span> Ropa{" "}
            <span className="text-verde-claro">◆</span> T-Shirts{" "}
            <span className="text-verde-claro">◆</span> Zapatos
          </div>
        </section>
      ) : (
        /* ---------- Pantalla 2: ¿Qué buscas? ---------- */
        <section className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-14">
          <div aria-hidden className="b-textura opacity-30" />

          <button
            type="button"
            onClick={() => setPantalla("intro")}
            className="absolute left-4 top-4 z-30 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white/80 backdrop-blur transition-colors hover:bg-black/70"
          >
            ‹ Volver
          </button>

          <h2 className="b-subir relative z-10 mb-6 text-center font-display text-sm font-extrabold uppercase tracking-[0.3em] text-white/50">
            Elige por dónde empezar
          </h2>

          <div className="relative z-10 w-full max-w-3xl">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {CATEGORIAS.map((categoria, i) => {
                const atenuado = activo !== null && activo !== i;
                return (
                  <button
                    key={categoria.slug}
                    type="button"
                    onMouseEnter={() => puedeHover.current && setActivo(i)}
                    onMouseLeave={() => puedeHover.current && setActivo(null)}
                    onClick={() => elegirCategoria(i, categoria.slug)}
                    style={{
                      animationDelay: `${0.15 + i * 0.09}s`,
                      backgroundImage:
                        i % 3 === 0
                          ? "linear-gradient(150deg,#0b8f43,#052b18)"
                          : "linear-gradient(150deg,#0d1f16,#050a07)",
                    }}
                    className={`${
                      i % 2 === 0 ? "b-entrar-izq" : "b-entrar-der"
                    } group relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 p-6 text-left transition-all duration-300 ease-out will-change-transform sm:min-h-[36vh] ${
                      atenuado
                        ? "scale-[0.97] blur-[10px] brightness-[0.45] saturate-[0.6]"
                        : activo === i
                          ? "sm:scale-[1.015]"
                          : "scale-100"
                    } hover:border-verde/50`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">
                      <span>0{i + 1}</span>
                      <span className="text-verde transition-transform duration-300 group-hover:translate-x-1">
                        Ver ›
                      </span>
                    </div>
                    <span className="font-display text-[1.9rem] font-extrabold uppercase leading-none tracking-tight text-white sm:text-4xl">
                      {categoria.nombre}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Burst central, anclado al centro de la rejilla */}
            <div
              aria-hidden
              className="b-burst pointer-events-none absolute left-1/2 top-1/2 z-20 hidden h-36 w-36 -translate-x-1/2 -translate-y-1/2 sm:block"
            >
              <div
                className="b-burst-late b-clip-marca grid h-full w-full place-items-center"
                style={{
                  backgroundColor: "#16db65",
                  backgroundImage: GRADIENTE_MARCA,
                }}
              >
                <span className="text-center font-display text-sm font-extrabold uppercase leading-tight tracking-tight text-[#040705]">
                  ¿Qué
                  <br />
                  buscas?
                </span>
              </div>
            </div>
          </div>

          <a
            href="/tienda"
            className="b-subir relative z-10 mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-white/45 underline-offset-4 hover:text-white/80 hover:underline"
            style={{ animationDelay: "0.55s" }}
          >
            Ver todo el catálogo
          </a>

          {/* Barrido circular al elegir un lado */}
          {saliendo && (
            <div
              className="fixed inset-0 z-50"
              style={{
                backgroundColor: "#16db65",
                backgroundImage: GRADIENTE_MARCA,
                clipPath: `circle(${expandido ? "150%" : "0%"} at ${saliendo})`,
                transition: "clip-path 0.62s ease-in",
              }}
            />
          )}
        </section>
      )}
    </div>
  );
}
