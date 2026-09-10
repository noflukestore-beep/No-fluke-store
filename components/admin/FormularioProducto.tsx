"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  guardarProducto,
  type ImagenInput,
  type ProductoInput,
  type VarianteInput,
} from "@/actions/productos";
import type { Categoria, Producto } from "@/lib/firebase/tipos";
import { formatearRD, porcentajeDescuento } from "@/lib/precios";

const entrada =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-verde/60 focus:outline-none";

const TALLAS_LETRA = ["S", "M", "L", "XL", "XXL"];
const TALLAS_NUMERO = ["38", "39", "40", "41", "42", "43", "44", "45"];

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
function entero(valor: string): number {
  const n = Number(valor);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function nuevaVariante(talla = "", color = ""): VarianteInput {
  return {
    id: `v${Math.random().toString(36).slice(2, 8)}`,
    talla,
    color,
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
  const sku = producto?.sku ?? "";
  const codigoBarra = producto?.codigoBarra ?? "";
  const [activo, setActivo] = useState(producto?.activo ?? true);
  const [destacado, setDestacado] = useState(producto?.destacado ?? false);
  const [nuevoIngreso, setNuevoIngreso] = useState(
    producto?.nuevoIngreso ?? false,
  );

  // --- Fotos --------------------------------------------------------
  const [imagenes, setImagenes] = useState<ImagenInput[]>(
    producto?.imagenes?.map((im) => ({ url: im.url, alt: im.alt })) ?? [],
  );
  const [urlNueva, setUrlNueva] = useState("");

  // --- Precio y ganancia ------------------------------------------
  const [precioCompra, setPrecioCompra] = useState(
    producto?.precioCompra != null ? String(producto.precioCompra) : "",
  );
  const [precio, setPrecio] = useState(
    producto ? String(producto.precio) : "",
  );
  const margenInicial =
    producto?.precioCompra != null &&
    producto.precioCompra > 0 &&
    producto.precio > 0
      ? String(
          Math.round(
            ((producto.precio - producto.precioCompra) /
              producto.precioCompra) *
              100,
          ),
        )
      : "";
  const [margen, setMargen] = useState(margenInicial);

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

  // --- Tallas y existencia --------------------------------------
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
  const [tallaLibre, setTallaLibre] = useState("");

  // Precio de venta = costo + % ganancia. Cada handler solo escribe los
  // otros dos campos, así que no hay bucle.
  function cambiarCosto(v: string) {
    setPrecioCompra(v);
    const c = num(v);
    const m = num(margen);
    if (c != null && c > 0 && m != null) {
      setPrecio(String(Math.round(c * (1 + m / 100))));
    }
  }
  function cambiarMargen(v: string) {
    setMargen(v);
    const c = num(precioCompra);
    const m = num(v);
    if (c != null && c > 0 && m != null) {
      setPrecio(String(Math.round(c * (1 + m / 100))));
    }
  }
  function cambiarPrecio(v: string) {
    setPrecio(v);
    const c = num(precioCompra);
    const p = num(v);
    if (c != null && c > 0 && p != null) {
      setMargen(String(Math.round(((p - c) / c) * 100)));
    }
  }

  const pv = num(precio) ?? 0;
  const pc = num(precioCompra);
  const po = num(precioOferta);
  const pm = num(precioMayor);
  const ganancia = pc != null && pv > 0 ? pv - pc : null;
  const pctOferta = po != null && pv > 0 ? porcentajeDescuento(pv, po) : 0;
  const mayorMalo = pm != null && (po ?? pv) > 0 && pm >= (po ?? pv);

  const stockTotal = useMemo(
    () => variantes.reduce((s, v) => s + (Number(v.stock) || 0), 0),
    [variantes],
  );
  const tallasElegidas = useMemo(
    () => new Set(variantes.map((v) => v.talla).filter(Boolean)),
    [variantes],
  );
  const modoSimple =
    variantes.length === 1 && !variantes[0].talla && !variantes[0].color;

  // --- Fotos: acciones ------------------------------------------
  function agregarImagen() {
    const url = urlNueva.trim();
    if (!/^https?:\/\/\S+/i.test(url)) return;
    setImagenes((prev) => [...prev, { url, alt: "" }]);
    setUrlNueva("");
  }
  function moverImagen(i: number, dir: -1 | 1) {
    setImagenes((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copia = [...prev];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  }

  // --- Tallas: acciones ----------------------------------------
  function alternarTalla(t: string) {
    setVariantes((prev) => {
      const tiene = prev.some((v) => v.talla === t);
      if (tiene) {
        const resto = prev.filter((v) => v.talla !== t);
        return resto.length ? resto : [nuevaVariante()];
      }
      const limpio = prev.filter((v) => v.talla || v.color);
      return [...limpio, nuevaVariante(t)];
    });
  }
  function agregarTallaLibre() {
    const t = tallaLibre.trim();
    if (!t || tallasElegidas.has(t)) return;
    alternarTalla(t);
    setTallaLibre("");
  }
  function editarVariante(
    id: string,
    campo: keyof VarianteInput,
    valor: unknown,
  ) {
    setVariantes((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [campo]: valor } : v)),
    );
  }
  function quitarVariante(id: string) {
    setVariantes((prev) => {
      const resto = prev.filter((v) => v.id !== id);
      return resto.length ? resto : [nuevaVariante()];
    });
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const datos: ProductoInput = {
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
      imagenes: imagenes.map((im) => ({ url: im.url.trim(), alt: im.alt.trim() })),
    };
    iniciar(async () => {
      const r = await guardarProducto(datos);
      if (r.ok) {
        router.push("/admin/productos");
        router.refresh();
      } else {
        setError(r.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <form onSubmit={enviar} className="max-w-3xl space-y-6 pb-28">
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
              {categorias.length === 0 && (
                <option value="">— sin categorías —</option>
              )}
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
          <Interruptor
            valor={activo}
            set={setActivo}
            label="Activo (visible en la tienda)"
          />
          <Interruptor valor={destacado} set={setDestacado} label="Destacado" />
          <Interruptor
            valor={nuevoIngreso}
            set={setNuevoIngreso}
            label="Nuevo ingreso"
          />
        </div>
      </Seccion>

      {/* Fotos */}
      <Seccion titulo="Fotos">
        {imagenes.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {imagenes.map((im, i) => (
              <li
                key={`${im.url}-${i}`}
                className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]"
              >
                <div className="relative aspect-square bg-black/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={im.url}
                    alt={im.alt || "Foto del producto"}
                    className="h-full w-full object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded bg-verde px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-[#04140c]">
                      Portada
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-2">
                  <input
                    value={im.alt}
                    onChange={(e) =>
                      setImagenes((prev) =>
                        prev.map((x, k) =>
                          k === i ? { ...x, alt: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="Describe la foto"
                    className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white placeholder:text-white/30 focus:border-verde/60 focus:outline-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moverImagen(i, -1)}
                        disabled={i === 0}
                        className="rounded px-1.5 py-0.5 text-xs text-white/50 hover:bg-white/10 disabled:opacity-30"
                        aria-label="Mover a la izquierda"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => moverImagen(i, 1)}
                        disabled={i === imagenes.length - 1}
                        className="rounded px-1.5 py-0.5 text-xs text-white/50 hover:bg-white/10 disabled:opacity-30"
                        aria-label="Mover a la derecha"
                      >
                        →
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setImagenes((prev) => prev.filter((_, k) => k !== i))
                      }
                      className="rounded px-1.5 py-0.5 text-xs text-white/40 hover:bg-white/5 hover:text-rose-400"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={urlNueva}
            onChange={(e) => setUrlNueva(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregarImagen();
              }
            }}
            placeholder="https://…  (enlace de la imagen)"
            className={entrada}
          />
          <button
            type="button"
            onClick={agregarImagen}
            className="shrink-0 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5"
          >
            Agregar foto
          </button>
        </div>
        <p className="text-xs text-white/40">
          La primera foto es la portada. Por ahora se agregan por enlace
          (Instagram, Google Drive público, etc.). La subida de archivos
          desde el teléfono se activa cuando habilites Firebase Storage.
        </p>
      </Seccion>

      {/* Precio y ganancia */}
      <Seccion titulo="Precio y ganancia (RD$)">
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="Costo (lo que te salió)">
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={precioCompra}
              onChange={(e) => cambiarCosto(e.target.value)}
              className={entrada}
              placeholder="0"
            />
          </Campo>
          <Campo etiqueta="Ganancia (%)">
            <input
              type="number"
              inputMode="numeric"
              value={margen}
              onChange={(e) => cambiarMargen(e.target.value)}
              className={entrada}
              placeholder="Ej. 50"
            />
          </Campo>
          <Campo etiqueta="Precio de venta" requerido>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={precio}
              onChange={(e) => cambiarPrecio(e.target.value)}
              required
              className={entrada}
            />
          </Campo>
        </div>
        {ganancia != null && (
          <p className="text-xs text-white/50">
            Ganas{" "}
            <span className="font-semibold text-verde">
              {formatearRD(ganancia)}
            </span>{" "}
            por unidad
            {pc != null && pc > 0 && ganancia > 0 && (
              <> ({Math.round((ganancia / pc) * 100)}% sobre el costo)</>
            )}
            .
          </p>
        )}

        <div className="h-px bg-white/10" />

        <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
          Precio por mayor
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Precio por mayor">
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={precioMayor}
              onChange={(e) => setPrecioMayor(e.target.value)}
              className={`${entrada} ${mayorMalo ? "border-rose-500" : ""}`}
              placeholder="Opcional"
            />
          </Campo>
          <Campo etiqueta="Desde esta cantidad">
            <input
              type="number"
              min={2}
              inputMode="numeric"
              value={cantidadMayor}
              onChange={(e) => setCantidadMayor(e.target.value)}
              className={entrada}
              placeholder="Ej. 6"
            />
          </Campo>
        </div>
        {mayorMalo && (
          <p className="text-sm font-semibold text-rose-400">
            El precio por mayor debe ser menor que la oferta o el precio de
            venta.
          </p>
        )}

        <div className="h-px bg-white/10" />

        <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
          Oferta
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            etiqueta={
              pctOferta > 0
                ? `Precio de oferta  (−${pctOferta}%)`
                : "Precio de oferta"
            }
          >
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={precioOferta}
              onChange={(e) => setPrecioOferta(e.target.value)}
              className={entrada}
              placeholder="Opcional"
            />
          </Campo>
          <Campo etiqueta="Válida hasta">
            <input
              type="date"
              value={ofertaHasta}
              onChange={(e) => setOfertaHasta(e.target.value)}
              className={entrada}
            />
          </Campo>
        </div>
      </Seccion>

      {/* Tallas y existencia */}
      <Seccion titulo="Tallas y existencia">
        <div className="space-y-3">
          <p className="text-xs font-medium text-white/50">
            Elige las tallas de este producto
          </p>
          <GrupoTallas
            titulo="Ropa"
            opciones={TALLAS_LETRA}
            elegidas={tallasElegidas}
            onToggle={alternarTalla}
          />
          <GrupoTallas
            titulo="Calzado"
            opciones={TALLAS_NUMERO}
            elegidas={tallasElegidas}
            onToggle={alternarTalla}
          />
          <div className="flex gap-2">
            <input
              value={tallaLibre}
              onChange={(e) => setTallaLibre(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  agregarTallaLibre();
                }
              }}
              placeholder="Otra talla (ej. Única, 3XL)"
              className={`${entrada} sm:max-w-xs`}
            />
            <button
              type="button"
              onClick={agregarTallaLibre}
              className="shrink-0 rounded-lg border border-white/15 px-3 text-sm font-semibold text-white/80 hover:bg-white/5"
            >
              Añadir
            </button>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {modoSimple ? (
          <div className="sm:max-w-xs">
            <Campo etiqueta="Existencia (unidades)">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={variantes[0].stock}
                onChange={(e) =>
                  editarVariante(
                    variantes[0].id,
                    "stock",
                    entero(e.target.value),
                  )
                }
                className={entrada}
              />
            </Campo>
            <p className="mt-1 text-xs text-white/40">
              Si el producto viene en varias tallas o colores, elígelos
              arriba y pon la existencia de cada uno.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {variantes.map((v) => (
              <div
                key={v.id}
                className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-3 sm:grid-cols-[1fr_1fr_110px_auto] sm:items-end"
              >
                <label className="block">
                  <span className="mb-1 block text-[11px] text-white/40">
                    Talla
                  </span>
                  <input
                    value={v.talla}
                    onChange={(e) =>
                      editarVariante(v.id, "talla", e.target.value)
                    }
                    className={entrada}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] text-white/40">
                    Color
                  </span>
                  <input
                    value={v.color}
                    onChange={(e) =>
                      editarVariante(v.id, "color", e.target.value)
                    }
                    placeholder="Opcional"
                    className={entrada}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] text-white/40">
                    Existencia
                  </span>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={v.stock}
                    onChange={(e) =>
                      editarVariante(v.id, "stock", entero(e.target.value))
                    }
                    className={entrada}
                  />
                </label>
                <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:flex-col sm:items-end sm:gap-1">
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs text-white/60">
                    <input
                      type="checkbox"
                      checked={v.activo}
                      onChange={(e) =>
                        editarVariante(v.id, "activo", e.target.checked)
                      }
                      className="h-4 w-4 accent-verde"
                    />
                    Activa
                  </label>
                  <button
                    type="button"
                    onClick={() => quitarVariante(v.id)}
                    className="rounded-md px-2 py-1 text-xs text-white/40 hover:bg-white/5 hover:text-rose-400"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setVariantes((prev) => [...prev, nuevaVariante()])
              }
              className="rounded-lg border border-white/15 px-3 py-1.5 text-sm font-semibold text-white/80 hover:bg-white/5"
            >
              + Agregar fila
            </button>
          </div>
        )}

        <div className="h-px bg-white/10" />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-white/50">
              Avísame cuando queden
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
                className={`${entrada} w-24`}
              />
              <span className="text-sm text-white/50">unidades o menos</span>
            </div>
          </label>
          <p className="text-sm text-white/50">
            Existencia total:{" "}
            <span className="font-semibold text-white">{stockTotal}</span>
          </p>
        </div>
      </Seccion>

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

function GrupoTallas({
  titulo,
  opciones,
  elegidas,
  onToggle,
}: {
  titulo: string;
  opciones: string[];
  elegidas: Set<string>;
  onToggle: (t: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 w-14 shrink-0 text-[11px] uppercase tracking-wide text-white/35">
        {titulo}
      </span>
      {opciones.map((t) => {
        const on = elegidas.has(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => onToggle(t)}
            className={`min-w-9 rounded-md border px-2.5 py-1.5 text-sm font-semibold transition-colors ${
              on
                ? "border-verde bg-verde text-[#04140c]"
                : "border-white/15 text-white/70 hover:bg-white/5"
            }`}
          >
            {t}
          </button>
        );
      })}
    </div>
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
