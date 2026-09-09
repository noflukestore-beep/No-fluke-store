"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  guardarProducto,
  type ProductoInput,
  type VarianteInput,
} from "@/actions/productos";
import type { Categoria, Producto } from "@/lib/firebase/tipos";
import { porcentajeDescuento } from "@/lib/precios";

const entrada =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-verde/60 focus:outline-none";
const celda =
  "w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white focus:border-verde/60 focus:outline-none";

/** epoch millis -> "YYYY-MM-DD" para <input type=date>. */
function aFecha(millis: number | null): string {
  if (!millis) return "";
  return new Date(millis).toISOString().slice(0, 10);
}
function deFecha(valor: string): number | null {
  if (!valor) return null;
  const t = new Date(`${valor}T23:59:59`).getTime();
  return Number.isNaN(t) ? null : t;
}
function num(valor: string): number | null {
  if (valor.trim() === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function nuevaVariante(): VarianteInput {
  return {
    id: `v${Math.random().toString(36).slice(2, 8)}`,
    talla: "",
    color: "",
    sku: "",
    stock: 0,
    precioExtra: 0,
    activo: true,
  };
}

export default function FormularioProducto({
  categorias,
  producto,
}: {
  categorias: Categoria[];
  producto?: Producto;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [marca, setMarca] = useState(producto?.marca ?? "");
  const [categoriaId, setCategoriaId] = useState(
    producto?.categoriaId ?? categorias[0]?.id ?? "",
  );
  const [genero, setGenero] = useState<ProductoInput["genero"]>(
    producto?.genero ?? "",
  );
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? "");
  // SKU y código de barra: se conservan si ya existen, pero no se editan aquí.
  const sku = producto?.sku ?? "";
  const codigoBarra = producto?.codigoBarra ?? "";
  const [activo, setActivo] = useState(producto?.activo ?? true);
  const [destacado, setDestacado] = useState(producto?.destacado ?? false);
  const [nuevoIngreso, setNuevoIngreso] = useState(
    producto?.nuevoIngreso ?? false,
  );

  const [precio, setPrecio] = useState(
    producto ? String(producto.precio) : "",
  );
  const [precioCompra, setPrecioCompra] = useState(
    producto?.precioCompra != null ? String(producto.precioCompra) : "",
  );
  const [precioOferta, setPrecioOferta] = useState(
    producto?.precioOferta != null ? String(producto.precioOferta) : "",
  );
  const [ofertaHasta, setOfertaHasta] = useState(
    aFecha(producto?.ofertaHasta ?? null),
  );
  const [precioMayor, setPrecioMayor] = useState(
    producto?.precioMayor != null ? String(producto.precioMayor) : "",
  );
  const [cantidadMayor, setCantidadMayor] = useState(
    producto?.cantidadMayor != null ? String(producto.cantidadMayor) : "",
  );
  const [stockMinimo, setStockMinimo] = useState(
    String(producto?.stockMinimo ?? 3),
  );

  const [variantes, setVariantes] = useState<VarianteInput[]>(
    producto && producto.variantes.length
      ? producto.variantes.map((v) => ({
          id: v.id,
          talla: v.talla,
          color: v.color,
          sku: v.sku,
          stock: v.stock,
          precioExtra: v.precioExtra ?? 0,
          activo: v.activo,
        }))
      : [nuevaVariante()],
  );

  const [tallasGen, setTallasGen] = useState("");
  const [coloresGen, setColoresGen] = useState("");

  const stockTotal = useMemo(
    () => variantes.reduce((s, v) => s + (Number(v.stock) || 0), 0),
    [variantes],
  );
  const pv = num(precio) ?? 0;
  const po = num(precioOferta);
  const pm = num(precioMayor);
  const pctOferta = po != null && pv > 0 ? porcentajeDescuento(pv, po) : 0;
  const mayorMalo = pm != null && (po ?? pv) > 0 && pm >= (po ?? pv);

  function editarVariante(id: string, campo: keyof VarianteInput, valor: unknown) {
    setVariantes((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [campo]: valor } : v)),
    );
  }
  function generarCombinaciones() {
    const tallas = tallasGen.split(",").map((t) => t.trim()).filter(Boolean);
    const colores = coloresGen.split(",").map((c) => c.trim()).filter(Boolean);
    const listaTallas = tallas.length ? tallas : [""];
    const listaColores = colores.length ? colores : [""];
    const combos: VarianteInput[] = [];
    for (const t of listaTallas) {
      for (const c of listaColores) {
        combos.push({ ...nuevaVariante(), talla: t, color: c });
      }
    }
    if (combos.length) setVariantes(combos);
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const entrada: ProductoInput = {
      id: producto?.id,
      nombre,
      descripcion,
      marca,
      sku,
      codigoBarra,
      genero,
      categoriaId,
      precioCompra: num(precioCompra),
      precio: pv,
      precioOferta: po,
      ofertaHasta: deFecha(ofertaHasta),
      precioMayor: pm,
      cantidadMayor: num(cantidadMayor),
      activo,
      destacado,
      nuevoIngreso,
      stockMinimo: num(stockMinimo) ?? 3,
      variantes: variantes.map((v) => ({
        ...v,
        stock: Number(v.stock) || 0,
        precioExtra: Number(v.precioExtra) || 0,
      })),
    };
    iniciar(async () => {
      const r = await guardarProducto(entrada);
      if (r.ok) {
        router.push("/admin/productos");
        router.refresh();
      } else {
        setError(r.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <form onSubmit={enviar} className="max-w-3xl space-y-6 pb-24">
      {/* Información */}
      <Seccion titulo="Información">
        <Campo etiqueta="Nombre" requerido>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className={entrada}
            placeholder="Ej. Eau de Noir 100ml"
          />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Marca">
            <input
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className={entrada}
            />
          </Campo>
          <Campo etiqueta="Categoría" requerido>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className={entrada}
            >
              {categorias.length === 0 && <option value="">— sin categorías —</option>}
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </Campo>
        </div>
        <div className="sm:max-w-xs">
          <Campo etiqueta="Género">
            <select
              value={genero}
              onChange={(e) =>
                setGenero(e.target.value as ProductoInput["genero"])
              }
              className={entrada}
            >
              <option value="">—</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="unisex">Unisex</option>
            </select>
          </Campo>
        </div>
        <Campo etiqueta="Descripción">
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className={`${entrada} resize-y`}
          />
        </Campo>
        <div className="flex flex-wrap gap-4">
          <Interruptor valor={activo} set={setActivo} label="Activo (visible en la tienda)" />
          <Interruptor valor={destacado} set={setDestacado} label="Destacado" />
          <Interruptor valor={nuevoIngreso} set={setNuevoIngreso} label="Nuevo ingreso" />
        </div>
      </Seccion>

      {/* Precios */}
      <Seccion titulo="Precios (RD$)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Precio de venta" requerido>
            <input
              type="number"
              min={0}
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
              className={entrada}
            />
          </Campo>
          <Campo etiqueta="Costo (solo tú lo ves)">
            <input
              type="number"
              min={0}
              value={precioCompra}
              onChange={(e) => setPrecioCompra(e.target.value)}
              className={entrada}
            />
          </Campo>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
          <Campo
            etiqueta={
              pctOferta > 0 ? `Precio de oferta  (−${pctOferta}%)` : "Precio de oferta"
            }
          >
            <input
              type="number"
              min={0}
              value={precioOferta}
              onChange={(e) => setPrecioOferta(e.target.value)}
              className={entrada}
            />
          </Campo>
          <Campo etiqueta="Oferta válida hasta">
            <input
              type="date"
              value={ofertaHasta}
              onChange={(e) => setOfertaHasta(e.target.value)}
              className={entrada}
            />
          </Campo>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="Precio por mayor">
            <input
              type="number"
              min={0}
              value={precioMayor}
              onChange={(e) => setPrecioMayor(e.target.value)}
              className={`${entrada} ${mayorMalo ? "border-rose-500" : ""}`}
            />
          </Campo>
          <Campo etiqueta="Desde (unidades)">
            <input
              type="number"
              min={2}
              value={cantidadMayor}
              onChange={(e) => setCantidadMayor(e.target.value)}
              className={entrada}
            />
          </Campo>
          <Campo etiqueta="Alerta de stock bajo">
            <input
              type="number"
              min={0}
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
              className={entrada}
            />
          </Campo>
        </div>
        {mayorMalo && (
          <p className="text-sm font-semibold text-rose-400">
            El precio por mayor debe ser menor que la oferta / el precio de venta.
          </p>
        )}
      </Seccion>

      {/* Variantes */}
      <Seccion titulo="Variantes">
        <div className="flex flex-wrap items-end gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <Campo etiqueta="Tallas (separadas por coma)">
            <input
              value={tallasGen}
              onChange={(e) => setTallasGen(e.target.value)}
              placeholder="S, M, L, XL"
              className={entrada}
            />
          </Campo>
          <Campo etiqueta="Colores (separados por coma)">
            <input
              value={coloresGen}
              onChange={(e) => setColoresGen(e.target.value)}
              placeholder="Negro, Verde"
              className={entrada}
            />
          </Campo>
          <button
            type="button"
            onClick={generarCombinaciones}
            className="h-10 shrink-0 rounded-lg border border-white/15 px-3 text-sm font-semibold text-white/80 hover:bg-white/5"
          >
            Generar
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs text-white/40">
                <th className="pb-2 font-medium">Talla</th>
                <th className="pb-2 font-medium">Color</th>
                <th className="pb-2 font-medium">SKU</th>
                <th className="pb-2 font-medium">Stock</th>
                <th className="pb-2 font-medium">Activo</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {variantes.map((v) => (
                <tr key={v.id}>
                  <td className="py-1.5 pr-2">
                    <input value={v.talla} onChange={(e) => editarVariante(v.id, "talla", e.target.value)} className={celda} />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input value={v.color} onChange={(e) => editarVariante(v.id, "color", e.target.value)} className={celda} />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input value={v.sku} onChange={(e) => editarVariante(v.id, "sku", e.target.value)} className={celda} />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) => editarVariante(v.id, "stock", Number(e.target.value))}
                      className={`${celda} w-20`}
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      type="checkbox"
                      checked={v.activo}
                      onChange={(e) => editarVariante(v.id, "activo", e.target.checked)}
                      className="h-4 w-4 accent-verde"
                    />
                  </td>
                  <td className="py-1.5 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setVariantes((prev) =>
                          prev.length > 1 ? prev.filter((x) => x.id !== v.id) : prev,
                        )
                      }
                      className="rounded-md px-2 py-1 text-white/40 hover:bg-white/5 hover:text-rose-400"
                      aria-label="Quitar variante"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setVariantes((prev) => [...prev, nuevaVariante()])}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm font-semibold text-white/80 hover:bg-white/5"
          >
            + Agregar variante
          </button>
          <p className="text-sm text-white/50">
            Stock total: <span className="font-semibold text-white">{stockTotal}</span>
          </p>
        </div>
      </Seccion>

      <p className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/40">
        La subida de fotos llega cuando actives Firebase Storage.
      </p>

      {/* Barra fija */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0a0f0c]/95 px-4 py-3 backdrop-blur md:pl-64 md:pr-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          {error ? (
            <p className="text-sm font-semibold text-rose-400">{error}</p>
          ) : (
            <span className="text-xs text-white/40">
              {producto ? "Editando" : "Nuevo producto"}
            </span>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/admin/productos")}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pendiente}
              className="rounded-lg bg-verde px-5 py-2 text-sm font-bold text-[#04140c] hover:brightness-105 disabled:opacity-60"
            >
              {pendiente ? "Guardando…" : "Guardar producto"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
      <h2 className="mb-4 font-display text-lg font-extrabold uppercase tracking-tight">
        {titulo}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Campo({
  etiqueta,
  requerido,
  children,
}: {
  etiqueta: string;
  requerido?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block flex-1">
      <span className="mb-1 block text-xs font-medium text-white/50">
        {etiqueta}
        {requerido && <span className="text-verde"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Interruptor({
  valor,
  set,
  label,
}: {
  valor: boolean;
  set: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={valor}
        onChange={(e) => set(e.target.checked)}
        className="h-4 w-4 accent-verde"
      />
      {label}
    </label>
  );
}
