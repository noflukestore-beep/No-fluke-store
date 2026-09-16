import CarritoCliente from "@/components/tienda/CarritoCliente";
import { obtenerConfig } from "@/lib/firebase/catalogo";

export const metadata = { title: "Carrito" };
export const revalidate = 60;

export default async function CarritoPagina() {
  const config = await obtenerConfig();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
        Tu carrito
      </h1>
      {config.whatsapp ? (
        <CarritoCliente
          whatsapp={config.whatsapp}
          costoEnvio={config.costoEnvio}
        />
      ) : (
        <p className="mt-6 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-center text-sm text-amber-200">
          La tienda todavía no configuró un número de WhatsApp para recibir
          pedidos.
        </p>
      )}
    </div>
  );
}
