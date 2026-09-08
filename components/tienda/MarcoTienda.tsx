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

function NavCategorias({ cerrar }: { cerrar?: () => void }) {
  const ruta = usePathname();
  return (
    <div className="flex h-full flex-col">
      <Link href="/tienda" onClick={cerrar} className="flex items-center px-5 py-4">
        <Image
          src="/logo-no-fluke-store.png"
          alt="No Fluke Store"
          width={120}
          height={100}
          className="h-11 w-auto"
          priority
        />
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
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
        <p className="mt-1 text-[11px] text-white/40">
          El estilo no es suerte.
        </p>
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
    <div className="flex min-h-dvh bg-[#0a0f0c] text-white">
      {/* Sidebar escritorio */}
      <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-[#070c09] lg:block">
        <div className="sticky top-0 h-dvh">
          <NavCategorias />
        </div>
      </aside>

      {/* Drawer móvil */}
      {abierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setAbierto(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-white/10 bg-[#070c09]">
            <NavCategorias cerrar={() => setAbierto(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        {/* Barra superior */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-white/10 bg-[#0a0f0c]/90 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-white/70 hover:bg-white/5 lg:hidden"
            aria-label="Menú"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/tienda" className="lg:hidden">
            <Image
              src="/logo-no-fluke-store.png"
              alt="No Fluke Store"
              width={90}
              height={75}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <div className="relative hidden flex-1 sm:block md:max-w-md">
            <IconoBusqueda className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="search"
              placeholder="Buscar perfumes, ropa, tenis…"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-verde/50 focus:outline-none"
            />
          </div>

          <Link
            href="/tienda/carrito"
            className="relative ml-auto grid h-10 w-10 place-items-center rounded-lg text-white/80 hover:bg-white/5"
            aria-label="Carrito"
          >
            <IconoCarrito className="h-5 w-5" />
            {ARTICULOS_CARRITO > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-verde px-1 text-[10px] font-bold text-[#04140c]">
                {ARTICULOS_CARRITO}
              </span>
            )}
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
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
