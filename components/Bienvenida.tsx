import Image from "next/image";
import Link from "next/link";

const GRADIENTE_MARCA =
  "linear-gradient(135deg, #0b8f43 0%, #16db65 45%, #4dff9e 100%)";

export default function Bienvenida() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#040705] text-white">
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

        <Link
          href="/tienda"
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
        </Link>

        <div
          className="b-subir relative z-10 mt-14 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/45"
          style={{ animationDelay: "1.85s" }}
        >
          Perfumes <span className="text-verde-claro">◆</span> Ropa{" "}
          <span className="text-verde-claro">◆</span> T-Shirts{" "}
          <span className="text-verde-claro">◆</span> Zapatos
        </div>
      </section>
    </div>
  );
}
