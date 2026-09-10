import FormularioConfig from "@/components/admin/FormularioConfig";
import { obtenerConfigAdmin } from "@/lib/firebase/admin-catalogo";

export const metadata = { title: "Configuración · Panel" };
export const dynamic = "force-dynamic";

export default async function AdminConfig() {
  const config = await obtenerConfigAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        Configuración
      </h1>
      <p className="mb-5 mt-1 text-sm text-white/50">
        Datos de la tienda para el catálogo y el pedido por WhatsApp.
      </p>
      <FormularioConfig config={config} />
    </div>
  );
}
