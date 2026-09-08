"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CATEGORIAS } from "@/lib/tienda/demo";

const ARTICULOS_CARRITO = 2; // TODO Fase 4: store de Zustand

function IconoBusqueda({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function IconoCarrito({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6h15l-1.5 9h-12L5 3H2M6 20a1 1 0 1 0 0 .01M18 20a1 1 0 1 0 0 .01" />
    </svg>
  );
}

/* --------------------------------------------------------------------------
   Encabezado: banner "Built Different" fijo, compacto. Encima: el logo
   animado en la esquina, el buscador destacado y el carrito.
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
          <IconoBusqueda className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-500" />
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
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Carrito */}
        <Link
          href="/tienda/carrito"
          aria-label={`Carrito, ${articulos} artículos`}
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20"
        >
          <IconoCarrito className="h-5 w-5" />
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

function NavCategorias({ cerrar }: { cerrar?: () => void }) {
  const ruta = usePathname();
  return (
    <div className="flex h-full flex-col">
      {cerrar && (
        <Link
          href="/tienda"
          onClick={cerrar}
          className="flex items-center px-5 py-4"
        >
          <Image
            src="/logo-no-fluke-store.png"
            alt="No Fluke Store"
            width={120}
            height={100}
            className="h-10 w-auto"
          />
        </Link>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        <Link
          href="/tienda"
          onClick={cerrar}
          className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
            ruta === "/tienda"
              ? "bg-verde text-[#04140c]"
              : "text-white/70 hover:bg-white/5 hover:text-white"
          }`}
        >
          Inicio
        </Link>

        <p className="px-3 pb-1 pt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
          Categorías
        </p>
        {CATEGORIAS.map((c) => {
          const href = `/tienda/categoria/${c.slug}`;
          const activo = ruta === href;
          return (
            <Link
              key={c.slug}
              href={href}
              onClick={cerrar}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activo
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {c.nombre}
            </Link>
          );
        })}

        <Link
          href="/tienda/ofertas"
          onClick={cerrar}
          className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-verde hover:bg-white/5"
        >
          🔥 Ofertas
        </Link>
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="font-display text-sm font-extrabold uppercase leading-tight tracking-tight text-white/80">
          Más que ropa
          <br />
          <span className="text-verde">es estilo</span>
        </p>
        <p className="mt-1 text-[11px] text-white/40">El estilo no es suerte.</p>
      </div>
    </div>
  );
}

export default function MarcoTienda({
  children,
}: {
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();

  const itemsNav = [
    { href: "/tienda", etiqueta: "Inicio", icono: "🏠" },
    { href: "/tienda/ofertas", etiqueta: "Ofertas", icono: "🔥" },
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
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-white/10 bg-[#070c09]">
            <NavCategorias cerrar={() => setAbierto(false)} />
          </aside>
        </div>
      )}

      <div className="flex pt-24 sm:pt-28">
        {/* Sidebar escritorio */}
        <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-[#070c09] lg:block">
          <div className="sticky top-28 h-[calc(100dvh-7rem)] overflow-y-auto">
            <NavCategorias />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>

      {/* Navegación inferior móvil */}
      <nav className="fixed bottom-0 left-0 z-40 flex w-full items-stretch border-t border-white/10 bg-[#070c09] lg:hidden">
        {itemsNav.map((item) => {
          const activo = ruta === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                activo ? "text-verde" : "text-white/55"
              }`}
            >
              <span className="text-base">{item.icono}</span>
              {item.etiqueta}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-white/55"
        >
          <span className="text-base">▤</span>
          Categorías
        </button>
        <Link
          href="/tienda/carrito"
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
            ruta === "/tienda/carrito" ? "text-verde" : "text-white/55"
          }`}
        >
          <span className="relative text-base">
            🛒
            {ARTICULOS_CARRITO > 0 && (
              <span className="absolute -right-2 -top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-verde px-1 text-[9px] font-bold text-[#04140c]">
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
