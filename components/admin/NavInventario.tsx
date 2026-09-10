"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/inventario", etiqueta: "Existencias" },
  { href: "/admin/inventario/ajustes", etiqueta: "Ajustes" },
  { href: "/admin/inventario/movimientos", etiqueta: "Movimientos" },
];

export default function NavInventario() {
  const ruta = usePathname();
  return (
    <div className="mb-5 flex gap-1 border-b border-white/10">
      {TABS.map((t) => {
        const activo = ruta === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
              activo
                ? "border-verde text-white"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            {t.etiqueta}
          </Link>
        );
      })}
    </div>
  );
}
