import Link from "next/link";

export const metadata = { title: "Carrito" };

export default function CarritoPagina() {
  return (
    <div className="px-4 py-8 md:px-6">
      <div className="border-b border-tinta pb-2">
        <h1 className="titular text-2xl md:text-3xl">Tu carrito</h1>
      </div>

      <div className="mt-8 border border-linea bg-lienzo p-10 text-center">
        <p className="text-sm leading-relaxed text-humo">
          El carrito y el cierre de pedido por WhatsApp se construyen en la
          Fase 4.
        </p>
        <Link
          href="/tienda"
          className="mt-5 inline-block bg-verde px-6 py-3 text-sm font-semibold text-tinta transition-colors hover:bg-verde-hondo hover:text-white"
        >
          Seguir viendo
        </Link>
      </div>
    </div>
  );
}
