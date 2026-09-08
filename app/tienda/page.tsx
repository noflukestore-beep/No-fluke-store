import Link from "next/link";
import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { CATEGORIAS, DESTACADOS, OFERTAS, PRODUCTOS } from "@/lib/tienda/demo";

export const metadata = { title: "Tienda" };

/** Título de sección: un filete de tinta y el nombre. Sin versalitas. */
function Seccion({
  titulo,
  enlace,
  children,
}: {
  titulo: string;
  enlace?: { href: string; texto: string };
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 py-8 md:px-6">
      <div className="mb-4 flex items-baseline justify-between border-b border-tinta pb-2">
        <h2 className="titular text-xl md:text-2xl">{titulo}</h2>
        {enlace && (
          <Link
            href={enlace.href}
            className="text-sm text-humo underline decoration-linea underline-offset-4 hover:text-tinta hover:decoration-verde-hondo"
          >
            {enlace.texto}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default function TiendaInicio() {
  const conMayor = PRODUCTOS.filter((p) => p.precioMayor != null).slice(0, 4);

  return (
    <div>
      {/* Hero: la única pieza oscura del catálogo. Sin degradado ni textura,
          solo el lema puesto grande. El tipo es el diseño. */}
      <section className="bg-tinta px-4 py-12 text-white md:px-6 md:py-20">
        <h1 className="titular max-w-[14ch] text-[clamp(2.6rem,11vw,5.5rem)]">
          El estilo no es suerte
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60 md:text-base">
          Perfumes, ropa, t-shirts y tenis. Escoges, pides por WhatsApp y
          coordinamos la entrega. Precios especiales desde 6 unidades.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/tienda/ofertas"
            className="bg-verde px-6 py-3 text-sm font-semibold text-tinta transition-colors hover:bg-verde-hondo hover:text-white"
          >
            Ver rebajas
          </Link>
          <Link
            href="/tienda/categoria/ropa"
            className="border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white"
          >
            Ver todo
          </Link>
        </div>
      </section>

      {/* Categorías como fichas anchas, no píldoras. Cada una es una puerta. */}
      <nav className="riel flex gap-px bg-linea px-4 md:px-6" aria-label="Categorías">
        {CATEGORIAS.map((c) => (
          <Link
            key={c.slug}
            href={`/tienda/categoria/${c.slug}`}
            className="min-w-[8.5rem] flex-1 bg-papel py-4 text-center text-sm text-tinta transition-colors hover:bg-verde"
          >
            {c.nombre}
          </Link>
        ))}
      </nav>

      <Seccion
        titulo="Rebajas"
        enlace={{ href: "/tienda/ofertas", texto: "Ver todas" }}
      >
        <div className="riel -mx-4 flex gap-4 px-4 pb-1 md:-mx-6 md:px-6">
          {OFERTAS.map((p) => (
            <div key={p.slug} className="w-40 shrink-0 sm:w-48">
              <TarjetaProducto producto={p} />
            </div>
          ))}
        </div>
      </Seccion>

      {/* Franja de mayoreo: el argumento comercial que distingue esta tienda.
          Va en verde plano, no en gris, porque es una oferta, no un aviso. */}
      {conMayor.length > 0 && (
        <section className="bg-verde px-4 py-8 text-tinta md:px-6">
          <h2 className="titular text-xl md:text-2xl">
            Compra en cantidad y paga menos
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-tinta/75">
            El precio baja solo al llegar a la cantidad mínima. No hace falta
            registrarse ni pedir cotización.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {conMayor.map((p) => (
              <Link
                key={p.slug}
                href={`/tienda/producto/${p.slug}`}
                className="bg-papel p-3 transition-transform hover:-translate-y-0.5"
              >
                <p className="line-clamp-2 text-sm leading-snug">{p.nombre}</p>
                <p className="cifra mt-2 text-lg">
                  RD${p.precioMayor!.toLocaleString("en-US")}
                </p>
                <p className="text-[11px] text-humo">
                  desde {p.cantidadMayor} unidades
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Seccion titulo="Lo más buscado">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {DESTACADOS.map((p) => (
            <TarjetaProducto key={p.slug} producto={p} />
          ))}
        </div>
      </Seccion>
    </div>
  );
}
