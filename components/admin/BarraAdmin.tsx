"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  { href: "/admin", etiqueta: "Pedidos" },
  { href: "/admin/productos", etiqueta: "Productos" },
  { href: "/admin/ofertas", etiqueta: "Ofertas" },
  { href: "/admin/categorias", etiqueta: "Categorías" },
  { href: "/admin/config", etiqueta: "Configuración" },
];

export default function BarraAdmin() {
  const ruta = usePathname();

  return (
    <header
      className="sticky top-0 z-40 border-b border-white/10 text-white"
      style={{ backgroundColor: "#06130c" }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 md:h-16 md:px-6">
        {/* Logo + marca */}
        <Link href="/admin" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo-no-fluke-store.png"
            alt="No Fluke Store"
            width={80}
            height={67}
            className="h-8 w-auto md:h-9"
            priority
          />
          <span className="hidden text-sm font-bold tracking-tight sm:block">
            No&nbsp;Fluke&nbsp;Store
          </span>
          <span className="rounded-md bg-verde/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-verde">
            Panel
          </span>
        </Link>

        {/* Navegación */}
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ENLACES.map(({ href, etiqueta }) => {
            const activo =
              href === "/admin" ? ruta === "/admin" : ruta.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activo
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:text-white"
                }`}
              >
                {etiqueta}
              </Link>
            );
          })}
        </nav>

        {/* Acciones */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/"
            className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-white/55 transition-colors hover:text-white md:block"
          >
            Ver tienda ↗
          </Link>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full bg-verde text-xs font-bold text-[#04140c]"
            aria-label="Cuenta"
          >
            NF
          </button>
        </div>
      </div>
    </header>
  );
}
