"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CATEGORIAS } from "@/lib/tienda/demo";

const ARTICULOS_CARRITO = 2; // TODO Fase 4: store de Zustand

/* Iconos SVG de trazo consistente ---------------------------------------- */
const trazo = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const Ico = {
  inicio: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...trazo}>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9h12v-9" />
    </svg>
  ),
  grid: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...trazo}>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" />
      <rect x="4" y="13" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" />
    </svg>
  ),
  etiqueta: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...trazo}>
      <path d="M4 12.6V5a1 1 0 0 1 1-1h7.6a1 1 0 0 1 .7.3l6.4 6.4a1 1 0 0 1 0 1.4l-7.6 7.6a1 1 0 0 1-1.4 0L4.3 13.3a1 1 0 0 1-.3-.7Z" />
      <circle cx="8.6" cy="8.6" r="1.1" />
    </svg>
  ),
  buscar: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...trazo}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  carrito: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...trazo}>
      <path d="M4 5h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.2L20.5 8H6.4" />
      <circle cx="10" cy="20" r="1.1" />
      <circle cx="18" cy="20" r="1.1" />
    </svg>
  ),
  menu: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...trazo}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
};

/* --------------------------------------------------------------------------
   Encabezado: banner "Built Different" fijo, compacto, con el logo animado
   en una esquina, el buscador destacado y el carrito.
-------------------------------------------------------------------------- */
function EncabezadoBanner({
  onMenu,
  articulos,
}: {
  onMenu: () => void;
  articulos: number;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-24 border-b-2 border-verde bg-black sm:h-28">
      <Image
        src="/banner-built-different.png"
        alt="No Fluke Store — Built Different"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-black via-black/45 to-black/70"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center gap-3 px-3 sm:px-5">
        {/* Logo animado (pop al cargar + flotación, como en la bienvenida) */}
        <Link
          href="/tienda"
          aria-label="Inicio"
          className="b-logo-pop shrink-0 drop-shadow-[0_0_18px_rgba(22,219,101,0.55)]"
        >
          <span className="b-logo-flotar block">
            <Image
              src="/logo-no-fluke-store.png"
              alt="No Fluke Store"
              width={200}
              height={167}
              priority
              className="h-14 w-auto sm:h-16"
            />
          </span>
        </Link>

        {/* Buscador destacado */}
        <div className="relative mx-auto w-full max-w-md min-w-0">
          {Ico.buscar(
            "pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-500",
          )}
          <input
            type="search"
            placeholder="Buscar perfumes, ropa, tenis…"
            className="w-full rounded-full border-2 border-verde/60 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-neutral-900 shadow-[0_0_24px_-6px_rgba(22,219,101,0.7)] placeholder:text-neutral-400 focus:border-verde focus:outline-none"
          />
        </div>

        {/* Menú (móvil) */}
        <button
          type="button"
          onClick={onMenu}
          aria-label="Menú"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20 lg:hidden"
        >
          {Ico.menu("h-5 w-5")}
        </button>

        {/* Carrito */}
        <Link
          href="/tienda/carrito"
          aria-label={`Carrito, ${articulos} artículos`}
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20"
        >
          {Ico.carrito("h-5 w-5")}
          {articulos > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-verde px-1 text-[11px] font-bold text-[#04140c]">
              {articulos}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

/* Navegación de categorías (sidebar + drawer) --------------------------- */
function NavCategorias({ cerrar }: { cerrar?: () => void }) {
  const ruta = usePathname();

  const item = (
    href: string,
    etiqueta: string,
    icono: React.ReactNode,
    exacto = true,
  ) => {
    const activo = exacto ? ruta === href : ruta.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        onClick={cerrar}
        className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
          activo
            ? "bg-white/[0.06] font-semibold text-white before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-verde"
            : "font-medium text-white/55 hover:bg-white/[0.04] hover:text-white"
        }`}
      >
        <span className={activo ? "text-verde" : "text-white/40"}>{icono}</span>
        {etiqueta}
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {cerrar && (
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <Image
            src="/logo-no-fluke-store.png"
            alt="No Fluke Store"
            width={120}
            height={100}
            className="h-9 w-auto"
          />
        </div>
      )}

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {item("/tienda", "Inicio", Ico.inicio("h-[18px] w-[18px]"))}

        <p className="px-3 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">
          Catálogo
        </p>
        {CATEGORIAS.map((c) =>
          item(
            `/tienda/categoria/${c.slug}`,
            c.nombre,
            <span className="h-[18px] w-[18px] rounded-sm border border-current" />,
          ),
        )}

        <div className="pt-4">
          {item("/tienda/ofertas", "Ofertas", Ico.etiqueta("h-[18px] w-[18px]"), false)}
        </div>
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-sm font-semibold text-white">El estilo no es suerte.</p>
        <p className="mt-1 text-[11px] leading-relaxed text-white/40">
          Pides por WhatsApp y coordinamos la entrega en todo el país.
        </p>
      </div>
    </div>
  );
}

/* Marco ----------------------------------------------------------------- */
export default function MarcoTienda({
  children,
}: {
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();

  const navInferior = [
    { href: "/tienda", etiqueta: "Inicio", icono: Ico.inicio },
    { href: "/tienda/ofertas", etiqueta: "Ofertas", icono: Ico.etiqueta },
  ];

  return (
    <div className="min-h-dvh bg-[#0a0f0c] text-white">
      <EncabezadoBanner
        onMenu={() => setAbierto(true)}
        articulos={ARTICULOS_CARRITO}
      />

      {/* Drawer móvil */}
      {abierto && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setAbierto(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-white/10 bg-[#0b100d]">
            <NavCategorias cerrar={() => setAbierto(false)} />
          </aside>
        </div>
      )}

      <div className="flex pt-24 sm:pt-28">
        {/* Sidebar escritorio */}
        <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-[#0b100d] lg:block">
          <div className="sticky top-28 h-[calc(100dvh-7rem)] overflow-y-auto">
            <NavCategorias />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>

      {/* Navegación inferior móvil */}
      <nav className="fixed bottom-0 left-0 z-40 flex w-full items-stretch border-t border-white/10 bg-[#0b100d] lg:hidden">
        {navInferior.map(({ href, etiqueta, icono }) => {
          const activo = ruta === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                activo ? "text-verde" : "text-white/50"
              }`}
            >
              {icono("h-5 w-5")}
              {etiqueta}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-white/50"
        >
          {Ico.grid("h-5 w-5")}
          Categorías
        </button>
        <Link
          href="/tienda/carrito"
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
            ruta === "/tienda/carrito" ? "text-verde" : "text-white/50"
          }`}
        >
          <span className="relative">
            {Ico.carrito("h-5 w-5")}
            {ARTICULOS_CARRITO > 0 && (
              <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-verde px-1 text-[9px] font-bold text-[#04140c]">
                {ARTICULOS_CARRITO}
              </span>
            )}
          </span>
          Carrito
        </Link>
      </nav>
    </div>
  );
}
