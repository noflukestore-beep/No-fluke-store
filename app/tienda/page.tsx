import Link from "next/link";

export const metadata = {
  title: "Tienda",
};

export default function Tienda() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/60">
        En construcción
      </span>
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
        Catálogo en camino
      </h1>
      <p className="max-w-sm text-sm text-white/55">
        Estamos montando la vitrina. Pronto vas a poder ver perfumes, ropa,
        t-shirts y zapatos, y cerrar tu pedido por WhatsApp.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-verde px-6 py-3 text-sm font-bold text-[#040705] transition-transform duration-300 hover:scale-105"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
