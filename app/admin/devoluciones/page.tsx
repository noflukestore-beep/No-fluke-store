import BuscadorDevolucion from "@/components/admin/BuscadorDevolucion";

export const metadata = { title: "Devoluciones · Panel" };

export default function AdminDevoluciones() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        Devoluciones
      </h1>
      <p className="mb-5 mt-1 text-sm text-white/50">
        Busca una factura por su número, indica cuántas unidades devuelve el
        cliente y el inventario se reintegra al instante.
      </p>
      <BuscadorDevolucion />
    </div>
  );
}
