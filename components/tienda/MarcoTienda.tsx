"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CATEGORIAS } from "@/lib/tienda/demo";

const ARTICULOS_CARRITO = 2; // TODO Fase 4: store de Zustand

/* Iconos ------------------------------------------------------------------ */
const trazo = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Icono = {
  buscar: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...trazo}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  ),
  carrito: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...trazo}>
      <path d="M4 5h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.2L20.5 8H6.4" />
      <circle cx="10" cy="20" r="1.2" />
      <circle cx="18" cy="20" r="1.2" />
    </svg>
  ),
  inicio: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...trazo}>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9h12v-9" />
    </svg>
  ),
  etiqueta: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...trazo}>
      <path d="M4 12.6V5a1 1 0 0 1 1-1h7.6a1 1 0 0 1 .7.3l6.4 6.4a1 1 0 0 1 0 1.4l-7.6 7.6a1 1 0 0 1-1.4 0L4.3 13.3a1 1 0 0 1-.3-.7Z" />
      <circle cx="8.6" cy="8.6" r="1.1" />
    </svg>
  ),
  cuadricula: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...trazo}>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" />
      <rect x="4" y="13" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" />
    </svg>
  ),
  menu: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...trazo}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  cerrar: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...trazo}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  ),
};

/* Navegación lateral ------------------------------------------------------- */
function ListaCategorias({ cerrar }: { cerrar?: () => void }) {
  const ruta = usePathname();

  return (
    <div className="flex h-full flex-col bg-tinta text-white">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/tienda" onClick={cerrar}>
          <Image
            src="/logo-no-fluke-store.png"
            alt="No Fluke Store"
            width={120}
            height={100}
            className="h-10 w-auto"
            priority
          />
        </Link>
        {cerrar && (
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar menú"
            className="grid h-9 w-9 place-items-center text-white/60 hover:text-white"
          >
            <Icono.cerrar className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-6">
        <Link
          href="/tienda"
          onClick={cerrar}
          className={`block px-3 py-2.5 text-sm ${
            ruta === "/tienda"
              ? "bg-verde font-semibold text-tinta"
              : "text-white/70 hover:text-white"
          }`}
        >
          Todo el catálogo
        </Link>

        <p className="px-3 pb-1 pt-5 text-xs text-white/35">Categorías</p>

        {CATEGORIAS.map((c) => {
          const href = `/tienda/categoria/${c.slug}`;
          const activo = ruta === href;
          return (
            <Link
              key={c.slug}
              href={href}
              onClick={cerrar}
              className={`block px-3 py-2.5 text-sm ${
                activo
                  ? "bg-verde font-semibold text-tinta"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {c.nombre}
            </Link>
          );
        })}

        <Link
          href="/tienda/ofertas"
          onClick={cerrar}
          className="mt-5 flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-verde hover:underline"
        >
          <Icono.etiqueta className="h-4 w-4" />
          Rebajas
        </Link>
      </nav>

      <div className="border-t border-white/10 px-5 py-5">
        <p className="titular text-lg text-white">El estilo no es suerte</p>
        <p className="mt-1.5 text-xs leading-relaxed text-white/45">
          Pide por WhatsApp. Entrega en todo el país.
        </p>
      </div>
    </div>
  );
}

/* Marco -------------------------------------------------------------------- */
export default function MarcoTienda({
  children,
}: {
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();

  const navInferior = [
    { href: "/tienda", etiqueta: "Inicio", Icono: Icono.inicio },
    { href: "/tienda/ofertas", etiqueta: "Rebajas", Icono: Icono.etiqueta },
  ];

  return (
    <div className="flex min-h-dvh bg-papel text-tinta">
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-0 h-dvh">
          <ListaCategorias />
        </div>
      </aside>

      {abierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-tinta/60"
            onClick={() => setAbierto(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72">
            <ListaCategorias cerrar={() => setAbierto(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-linea bg-papel/95 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            onClick={() => setAbierto(true)}
            aria-label="Abrir menú"
            className="grid h-9 w-9 place-items-center text-tinta lg:hidden"
          >
            <Icono.menu className="h-5 w-5" />
          </button>

          <Link href="/tienda" className="lg:hidden">
            <Image
              src="/logo-no-fluke-store.png"
              alt="No Fluke Store"
              width={90}
              height={75}
              className="h-7 w-auto"
              priority
            />
          </Link>

          <div className="relative hidden flex-1 sm:block md:max-w-sm">
            <Icono.buscar className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-humo" />
            <input
              type="search"
              placeholder="Buscar perfumes, ropa, tenis"
              className="w-full border-0 border-b border-linea bg-transparent py-2 pl-6 pr-2 text-sm text-tinta placeholder:text-humo focus:border-tinta focus:outline-none"
            />
          </div>

          <Link
            href="/tienda/carrito"
            className="relative ml-auto grid h-10 w-10 place-items-center text-tinta"
            aria-label={`Carrito, ${ARTICULOS_CARRITO} artículos`}
          >
            <Icono.carrito className="h-5 w-5" />
            {ARTICULOS_CARRITO > 0 && (
              <span className="cifra absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center bg-verde px-1 text-[10px] text-tinta">
                {ARTICULOS_CARRITO}
              </span>
            )}
          </Link>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-linea px-4 py-8 md:px-6">
          <p className="titular text-2xl">El estilo no es suerte</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-humo">
            Perfumes, ropa, t-shirts y tenis. Pides por WhatsApp y coordinamos
            la entrega en todo el país.
          </p>
        </footer>
      </div>

      <nav className="fixed bottom-0 left-0 z-40 flex w-full border-t border-linea bg-papel lg:hidden">
        {navInferior.map(({ href, etiqueta, Icono: I }) => {
          const activo = ruta === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] ${
                activo ? "font-semibold text-tinta" : "text-humo"
              }`}
            >
              <span className="relative">
                <I className="h-5 w-5" />
                {activo && (
                  <span className="absolute -bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 bg-verde" />
                )}
              </span>
              {etiqueta}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-humo"
        >
          <Icono.cuadricula className="h-5 w-5" />
          Categorías
        </button>

        <Link
          href="/tienda/carrito"
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] ${
            ruta === "/tienda/carrito" ? "font-semibold text-tinta" : "text-humo"
          }`}
        >
          <span className="relative">
            <Icono.carrito className="h-5 w-5" />
            {ARTICULOS_CARRITO > 0 && (
              <span className="cifra absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center bg-verde px-1 text-[10px] text-tinta">
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
