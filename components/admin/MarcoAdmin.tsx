"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type IconoNombre =
  | "dashboard"
  | "productos"
  | "categorias"
  | "pedidos"
  | "config";

const RUTAS: Array<{
  href: string;
  etiqueta: string;
  icono: IconoNombre;
  badge?: number;
}> = [
  { href: "/admin", etiqueta: "Dashboard", icono: "dashboard" },
  { href: "/admin/productos", etiqueta: "Productos", icono: "productos" },
  { href: "/admin/categorias", etiqueta: "Categorías", icono: "categorias" },
  { href: "/admin/pedidos", etiqueta: "Pedidos", icono: "pedidos", badge: 3 },
  { href: "/admin/config", etiqueta: "Configuración", icono: "config" },
];

function Icono({ nombre }: { nombre: IconoNombre }) {
  const p: Record<IconoNombre, string> = {
    dashboard: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z",
    productos: "M3 7l9-4 9 4-9 4-9-4Zm0 5l9 4 9-4M3 17l9 4 9-4",
    categorias: "M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z",
    pedidos: "M6 2h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm8 1v5h5M8 13h8M8 17h6",
    config: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.2-1.8l2-1.5-2-3.4-2.3 1a8 8 0 0 0-3-1.8L14 1h-4l-.5 2.7a8 8 0 0 0-3 1.8l-2.3-1-2 3.4 2 1.5A8 8 0 0 0 4 12c0 .6 0 1.2.2 1.8l-2 1.5 2 3.4 2.3-1a8 8 0 0 0 3 1.8L10 23h4l.5-2.7a8 8 0 0 0 3-1.8l2.3 1 2-3.4-2-1.5c.1-.6.2-1.2.2-1.8Z",
  };
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={p[nombre]} />
    </svg>
  );
}

function Contenido({ cerrar }: { cerrar?: () => void }) {
  const ruta = usePathname();

  const esActivo = (href: string) =>
    href === "/admin" ? ruta === "/admin" : ruta.startsWith(href);

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/admin"
        onClick={cerrar}
        className="flex items-center gap-2 px-5 py-4"
      >
        <Image
          src="/logo-no-fluke-store.png"
          alt="No Fluke Store"
          width={110}
          height={92}
          className="h-11 w-auto"
          priority
        />
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {RUTAS.map(({ href, etiqueta, icono, badge }) => {
          const activo = esActivo(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={cerrar}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activo
                  ? "bg-verde text-[#04140c]"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icono nombre={icono} />
              <span className="flex-1">{etiqueta}</span>
              {badge != null && (
                <span
                  className={`rounded-full px-1.5 text-[11px] font-bold ${
                    activo ? "bg-[#04140c] text-verde" : "bg-verde text-[#04140c]"
                  }`}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="font-display text-sm font-extrabold uppercase leading-tight tracking-tight text-white/80">
          Más que ropa
          <br />
          <span className="text-verde">es estilo</span>
        </p>
        <p className="mt-1 text-[11px] text-white/40">
          No Fluke Store — el estilo no es suerte.
        </p>
      </div>
    </div>
  );
}

export default function MarcoAdmin({ children }: { children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="flex min-h-dvh bg-[#0a0f0c] text-white">
      {/* Sidebar escritorio */}
      <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-[#070c09] lg:block">
        <div className="sticky top-0 h-dvh">
          <Contenido />
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
            <Contenido cerrar={() => setAbierto(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
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

          <div className="relative flex-1 md:max-w-md">
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder="Buscar productos, pedidos, clientes…"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-12 text-sm text-white placeholder:text-white/40 focus:border-verde/50 focus:outline-none"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-white/40">
              ⌘K
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              className="relative grid h-9 w-9 place-items-center rounded-lg text-white/70 hover:bg-white/5"
              aria-label="Notificaciones"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-verde" />
            </button>

            <Link
              href="/"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white sm:block"
            >
              Ver tienda ↗
            </Link>

            <div className="ml-1 flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-white/5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-verde text-xs font-bold text-[#04140c]">
                NF
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-semibold">Administrador</p>
                <p className="text-[11px] text-white/45">No Fluke Store</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
