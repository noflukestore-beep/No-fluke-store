import Link from "next/link";

export const metadata = { title: "Carrito" };

export default function CarritoPagina() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
        Tu carrito
      </h1>
      <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
        <p className="text-sm text-white/60">
          El carrito y el cierre de pedido por WhatsApp se construyen en la
          Fase 4.
        </p>
        <Link
          href="/tienda"
          className="mt-4 inline-block rounded-full bg-verde px-5 py-2.5 text-sm font-bold text-[#04140c] transition-transform hover:scale-105"
        >
          Seguir viendo
        </Link>
      </div>
    </div>
  );
}
