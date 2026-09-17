"use server";

import {
  FieldValue,
  type DocumentData,
  type DocumentReference,
  type Transaction,
} from "firebase-admin/firestore";
import { revalidatePath, revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { obtenerFacturaPorNumero } from "@/lib/firebase/admin-catalogo";
import type { Factura } from "@/lib/firebase/tipos";
import { formatearRD } from "@/lib/precios";
import { normalizarTelefono } from "@/lib/texto";

/** Para el módulo de Devoluciones: busca por el número que ve el cliente. */
export async function buscarFacturaPorNumero(
  numero: string,
): Promise<Factura | null> {
  if (!numero.trim()) return null;
  return obtenerFacturaPorNumero(numero);
}

// TODO (login admin): verificar sesión + claim rol=admin al inicio de cada
// acción. Los Server Actions son alcanzables por POST directo.

// --- Tipos de entrada ------------------------------------------------

export interface FacturaLineaInput {
  productoId: string;
  varianteId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface FacturaInput {
  clienteNombre: string;
  clienteTelefono: string;
  clienteDocumento: string;
  /** Descuento general en RD$. */
  descuento: number;
  impuestoPorcentaje: number;
  metodoPago: string;
  /** Marcar la factura como pagada al emitir. */
  pagar: boolean;
  notas: string;
  lineas: FacturaLineaInput[];
  /** Pedido de WhatsApp del que se origina esta factura, si aplica. */
  pedidoId?: string | null;
}

export interface Resultado {
  ok: boolean;
  error?: string;
  id?: string;
  numero?: string;
}

// --- Utilidades -----------------------------------------------------

/** Redondeo a centavos, evita el ruido de coma flotante. */
function money(x: number): number {
  return Math.round((Number(x) || 0) * 100) / 100;
}

function padNumero(n: number): string {
  return `FACT-${String(n).padStart(6, "0")}`;
}

function descripcionLinea(
  productoNombre: string,
  v: { talla?: string; color?: string },
): string {
  const attrs = [v.talla, v.color].map((x) => (x ?? "").trim()).filter(Boolean);
  return `${productoNombre}${attrs.length ? ` — ${attrs.join(" / ")}` : ""}`;
}

function refrescar(id?: string) {
  revalidateTag("catalogo", "max");
  revalidatePath("/admin/facturas");
  revalidatePath("/admin/inventario");
  revalidatePath("/admin/inventario/ajustes");
  revalidatePath("/admin/inventario/movimientos");
  revalidatePath("/admin/productos");
  if (id) {
    revalidatePath(`/admin/facturas/${id}`);
    revalidatePath(`/factura/${id}`);
  }
}

/** Descuenta o repone unidades en las variantes de un producto (mutando la copia). */
function aplicarDeltas(
  variantes: Array<Record<string, unknown>>,
  deltas: Map<string, number>,
): number {
  for (const [varianteId, delta] of deltas) {
    const i = variantes.findIndex((v) => v.id === varianteId);
    if (i < 0) continue;
    const actual = Number(variantes[i].stock) || 0;
    variantes[i].stock = Math.max(0, Math.round(actual + delta));
  }
  return variantes.reduce((s, v) => s + (Number(v.stock) || 0), 0);
}

// --- Emitir factura -----------------------------------------------

export async function crearFactura(entrada: FacturaInput): Promise<Resultado> {
  const clienteNombre = entrada.clienteNombre.trim();
  if (!clienteNombre) {
    return { ok: false, error: "El nombre del cliente es obligatorio." };
  }

  // Combina líneas repetidas (mismo producto + variante).
  const combinadas = new Map<string, FacturaLineaInput>();
  for (const l of entrada.lineas) {
    const cantidad = Math.round(Number(l.cantidad) || 0);
    const precio = money(l.precioUnitario);
    if (!l.productoId || !l.varianteId) continue;
    if (cantidad <= 0) {
      return { ok: false, error: "Cada línea debe tener cantidad mayor que 0." };
    }
    if (precio < 0) {
      return { ok: false, error: "El precio no puede ser negativo." };
    }
    const clave = `${l.productoId}:${l.varianteId}`;
    const previa = combinadas.get(clave);
    combinadas.set(clave, {
      productoId: l.productoId,
      varianteId: l.varianteId,
      cantidad: (previa?.cantidad ?? 0) + cantidad,
      precioUnitario: precio,
    });
  }
  const lineas = [...combinadas.values()];
  if (lineas.length === 0) {
    return { ok: false, error: "Agrega al menos un producto." };
  }

  const pct = Math.min(100, Math.max(0, Number(entrada.impuestoPorcentaje) || 0));
  const facturaRef = adminDb.collection("facturas").doc();
  const contadorRef = adminDb.doc("contadores/facturas");
  const productoIds = [...new Set(lineas.map((l) => l.productoId))];
  const productoRefs = productoIds.map((id) =>
    adminDb.collection("productos").doc(id),
  );
  const pedidoRef = entrada.pedidoId
    ? adminDb.collection("pedidos").doc(entrada.pedidoId)
    : null;

  try {
    const resultado = await adminDb.runTransaction(async (tx: Transaction) => {
      const [contadorSnap, pedidoSnap, ...prodSnaps] = await Promise.all([
        tx.get(contadorRef),
        pedidoRef ? tx.get(pedidoRef) : Promise.resolve(null),
        ...productoRefs.map((r) => tx.get(r)),
      ]);
      if (pedidoRef && (!pedidoSnap || !pedidoSnap.exists)) {
        throw new Error("El pedido de origen ya no existe.");
      }

      const productos = new Map<
        string,
        {
          ref: DocumentReference;
          data: DocumentData;
          variantes: Array<Record<string, unknown>>;
        }
      >();
      prodSnaps.forEach((snap, i) => {
        if (!snap.exists) throw new Error("Un producto de la factura ya no existe.");
        const data = snap.data() as DocumentData;
        productos.set(productoIds[i], {
          ref: productoRefs[i],
          data,
          variantes: (Array.isArray(data.variantes) ? data.variantes : []).map(
            (v) => ({ ...v }),
          ),
        });
      });

      // Verifica existencia suficiente.
      const faltantes: string[] = [];
      for (const l of lineas) {
        const p = productos.get(l.productoId)!;
        const v = p.variantes.find((x) => x.id === l.varianteId);
        if (!v) {
          faltantes.push(`${p.data.nombre ?? "producto"} (variante no existe)`);
          continue;
        }
        const stock = Number(v.stock) || 0;
        if (stock < l.cantidad) {
          faltantes.push(
            `${descripcionLinea(String(p.data.nombre ?? ""), v)} — hay ${stock}, pides ${l.cantidad}`,
          );
        }
      }
      if (faltantes.length) {
        throw new Error(`Sin existencia suficiente:\n• ${faltantes.join("\n• ")}`);
      }

      // Arma los ítems y los totales.
      const items = lineas.map((l) => {
        const p = productos.get(l.productoId)!;
        const v = p.variantes.find((x) => x.id === l.varianteId)!;
        const importe = money(l.cantidad * l.precioUnitario);
        return {
          productoId: l.productoId,
          varianteId: l.varianteId,
          descripcion: descripcionLinea(String(p.data.nombre ?? ""), v),
          sku: String(v.sku ?? p.data.sku ?? ""),
          cantidad: l.cantidad,
          precioUnitario: l.precioUnitario,
          importe,
          devuelto: 0,
        };
      });

      const subtotal = money(items.reduce((s, it) => s + it.importe, 0));
      const descuento = Math.min(subtotal, Math.max(0, money(entrada.descuento)));
      const base = money(subtotal - descuento);
      const impuestos = money((base * pct) / 100);
      const total = money(base + impuestos);

      const n = (Number(contadorSnap.data()?.ultimo) || 0) + 1;
      const numero = padNumero(n);
      const ahora = Date.now();
      const telefono = normalizarTelefono(entrada.clienteTelefono);
      const pagada = entrada.pagar === true;

      // Descuenta inventario y registra el movimiento por línea.
      for (const [productoId, p] of productos) {
        const deltas = new Map<string, number>();
        for (const l of lineas.filter((x) => x.productoId === productoId)) {
          deltas.set(l.varianteId, (deltas.get(l.varianteId) ?? 0) - l.cantidad);
        }
        const stockTotal = aplicarDeltas(p.variantes, deltas);
        tx.update(p.ref, {
          variantes: p.variantes,
          stockTotal,
          actualizadoEn: FieldValue.serverTimestamp(),
        });
      }
      for (const it of items) {
        const p = productos.get(it.productoId)!;
        const v = p.variantes.find((x) => x.id === it.varianteId)!;
        const mov = adminDb.collection("movimientos").doc();
        tx.set(mov, {
          productoId: it.productoId,
          productoNombre: p.data.nombre ?? "",
          varianteId: it.varianteId,
          varianteDesc:
            [v.talla, v.color].map((x) => String(x ?? "").trim()).filter(Boolean).join(" / ") ||
            "Único",
          tipo: "venta",
          cantidad: -it.cantidad,
          stockAntes: (Number(v.stock) || 0) + it.cantidad,
          stockDespues: Number(v.stock) || 0,
          motivo: `Factura ${numero}`,
          creadoEn: FieldValue.serverTimestamp(),
        });
      }

      tx.set(contadorRef, { ultimo: n }, { merge: true });

      tx.set(facturaRef, {
        numero,
        pedidoId: entrada.pedidoId || null,
        clienteId: telefono || null,
        clienteNombre,
        clienteTelefono: telefono,
        clienteDocumento: entrada.clienteDocumento.trim() || null,
        items,
        subtotal,
        descuento,
        impuestoPorcentaje: pct,
        impuestos,
        total,
        estado: pagada ? "pagada" : "emitida",
        fechaEmision: ahora,
        fechaPago: pagada ? ahora : null,
        metodoPago: entrada.metodoPago.trim() || null,
        notas: entrada.notas.trim() || null,
        montoPagado: pagada ? total : 0,
        tieneDevolucion: false,
        montoDevuelto: 0,
        devoluciones: [],
        saldoFinal: pagada ? 0 : total,
        stockDescontado: true,
        creadoEn: FieldValue.serverTimestamp(),
        actualizadoEn: FieldValue.serverTimestamp(),
      });

      if (telefono) {
        tx.set(
          adminDb.collection("clientes").doc(telefono),
          {
            id: telefono,
            nombre: clienteNombre,
            telefono,
            documento: entrada.clienteDocumento.trim() || null,
            totalFacturado: FieldValue.increment(total),
            facturas: FieldValue.increment(1),
            ultimaFactura: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }

      if (pedidoRef) {
        tx.update(pedidoRef, {
          estado: "confirmado",
          facturaId: facturaRef.id,
          actualizadoEn: FieldValue.serverTimestamp(),
        });
      }

      return { numero };
    });

    refrescar(facturaRef.id);
    if (entrada.pedidoId) revalidatePath("/admin/pedidos");
    return { ok: true, id: facturaRef.id, numero: resultado.numero };
  } catch (e) {
    return { ok: false, error: (e as Error).message || "No se pudo emitir la factura." };
  }
}

// --- Registrar pago ----------------------------------------------

export interface PagoInput {
  facturaId: string;
  monto: number;
  metodo: string;
}

export async function registrarPago(entrada: PagoInput): Promise<Resultado> {
  const monto = money(Math.abs(entrada.monto));
  if (monto <= 0) return { ok: false, error: "El monto debe ser mayor que 0." };

  const ref = adminDb.collection("facturas").doc(entrada.facturaId);
  try {
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("La factura ya no existe.");
      const f = snap.data()!;
      if (f.estado === "anulada") throw new Error("La factura está anulada.");

      const pendiente = money(
        f.total - (f.montoPagado ?? 0) - (f.montoDevuelto ?? 0),
      );
      if (pendiente <= 0) throw new Error("La factura ya no tiene saldo pendiente.");
      if (monto > pendiente + 0.01) {
        throw new Error(`El pago supera el saldo pendiente (${formatearRD(pendiente)}).`);
      }

      const montoPagado = money((f.montoPagado ?? 0) + monto);
      const saldoFinal = Math.max(
        0,
        money(f.total - montoPagado - (f.montoDevuelto ?? 0)),
      );
      const liquidada = saldoFinal <= 0.01;

      tx.update(ref, {
        montoPagado,
        saldoFinal,
        estado: liquidada ? "pagada" : f.estado,
        fechaPago: liquidada && !f.fechaPago ? Date.now() : (f.fechaPago ?? null),
        metodoPago: entrada.metodo.trim() || f.metodoPago || null,
        actualizadoEn: FieldValue.serverTimestamp(),
      });
    });
    refrescar(entrada.facturaId);
    return { ok: true, id: entrada.facturaId };
  } catch (e) {
    return { ok: false, error: (e as Error).message || "No se pudo registrar el pago." };
  }
}

// --- Anular factura --------------------------------------------

export interface AnularInput {
  facturaId: string;
  motivo: string;
}

export async function anularFactura(entrada: AnularInput): Promise<Resultado> {
  const motivo = entrada.motivo.trim();
  if (!motivo) return { ok: false, error: "Indica el motivo de la anulación." };

  const ref = adminDb.collection("facturas").doc(entrada.facturaId);
  try {
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("La factura ya no existe.");
      const f = snap.data()!;
      if (f.estado === "anulada") throw new Error("La factura ya está anulada.");

      const items: Array<Record<string, unknown>> = f.items ?? [];
      if (f.stockDescontado) {
        const porProducto = new Map<string, Map<string, number>>();
        for (const it of items) {
          const reponer = Number(it.cantidad) - Number(it.devuelto ?? 0);
          if (reponer <= 0) continue;
          const pid = String(it.productoId);
          const vid = String(it.varianteId);
          const m = porProducto.get(pid) ?? new Map<string, number>();
          m.set(vid, (m.get(vid) ?? 0) + reponer);
          porProducto.set(pid, m);
        }
        const ids = [...porProducto.keys()];
        const refs = ids.map((id) => adminDb.collection("productos").doc(id));
        const snaps = await Promise.all(refs.map((r) => tx.get(r)));
        snaps.forEach((ps, i) => {
          if (!ps.exists) return;
          const data = ps.data()!;
          const variantes = (Array.isArray(data.variantes) ? data.variantes : []).map(
            (v) => ({ ...v }),
          );
          const deltas = porProducto.get(ids[i])!;
          const stockTotal = aplicarDeltas(variantes, deltas);
          tx.update(refs[i], {
            variantes,
            stockTotal,
            actualizadoEn: FieldValue.serverTimestamp(),
          });
          for (const [varianteId, cant] of deltas) {
            const mov = adminDb.collection("movimientos").doc();
            const vv = variantes.find((x) => x.id === varianteId);
            tx.set(mov, {
              productoId: ids[i],
              productoNombre: data.nombre ?? "",
              varianteId,
              varianteDesc:
                [vv?.talla, vv?.color].map((x) => String(x ?? "").trim()).filter(Boolean).join(" / ") ||
                "Único",
              tipo: "devolucion",
              cantidad: cant,
              stockAntes: (Number(vv?.stock) || 0) - cant,
              stockDespues: Number(vv?.stock) || 0,
              motivo: `Anulación ${f.numero}`,
              costoUnitario: null,
              creadoEn: FieldValue.serverTimestamp(),
            });
          }
        });
      }

      tx.update(ref, {
        estado: "anulada",
        saldoFinal: 0,
        stockDescontado: false,
        notas: `${f.notas ? `${f.notas}\n` : ""}Anulada: ${motivo}`,
        actualizadoEn: FieldValue.serverTimestamp(),
      });
    });
    refrescar(entrada.facturaId);
    return { ok: true, id: entrada.facturaId };
  } catch (e) {
    return { ok: false, error: (e as Error).message || "No se pudo anular la factura." };
  }
}

// --- Registrar devolución -------------------------------------

export interface DevolucionInput {
  facturaId: string;
  motivo: string;
  lineas: { varianteId: string; cantidad: number }[];
}

export async function registrarDevolucion(
  entrada: DevolucionInput,
): Promise<Resultado> {
  const pedidas = entrada.lineas
    .map((l) => ({
      varianteId: l.varianteId,
      cantidad: Math.round(Number(l.cantidad) || 0),
    }))
    .filter((l) => l.cantidad > 0);
  if (pedidas.length === 0) {
    return { ok: false, error: "Indica qué unidades se devuelven." };
  }

  const ref = adminDb.collection("facturas").doc(entrada.facturaId);
  try {
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("La factura ya no existe.");
      const f = snap.data()!;
      if (f.estado === "anulada") throw new Error("La factura está anulada.");

      const items: Array<Record<string, unknown>> = (f.items ?? []).map(
        (it: Record<string, unknown>) => ({ ...it }),
      );
      const base = money(f.subtotal - (f.descuento ?? 0));
      const ratioDescuento = f.subtotal > 0 ? base / f.subtotal : 1;
      const factorImpuesto = 1 + (Number(f.impuestoPorcentaje) || 0) / 100;

      const porProducto = new Map<string, Map<string, number>>();
      let montoDevolucion = 0;
      for (const p of pedidas) {
        const it = items.find((x) => x.varianteId === p.varianteId);
        if (!it) throw new Error("Una de las líneas no está en la factura.");
        const disponibles = Number(it.cantidad) - Number(it.devuelto ?? 0);
        if (p.cantidad > disponibles) {
          throw new Error(
            `De "${it.descripcion}" solo quedan ${disponibles} por devolver.`,
          );
        }
        const unitNeto = Number(it.importe) / Number(it.cantidad);
        const unitFinal = unitNeto * ratioDescuento * factorImpuesto;
        montoDevolucion += money(unitFinal * p.cantidad);
        it.devuelto = Number(it.devuelto ?? 0) + p.cantidad;

        const m = porProducto.get(String(it.productoId)) ?? new Map();
        m.set(p.varianteId, (m.get(p.varianteId) ?? 0) + p.cantidad);
        porProducto.set(String(it.productoId), m);
      }
      montoDevolucion = money(montoDevolucion);

      const ids = [...porProducto.keys()];
      const refs = ids.map((id) => adminDb.collection("productos").doc(id));
      const snaps = await Promise.all(refs.map((r) => tx.get(r)));
      snaps.forEach((ps, i) => {
        if (!ps.exists) return;
        const data = ps.data()!;
        const variantes = (Array.isArray(data.variantes) ? data.variantes : []).map(
          (v) => ({ ...v }),
        );
        const deltas = porProducto.get(ids[i])!;
        const stockTotal = aplicarDeltas(variantes, deltas);
        tx.update(refs[i], {
          variantes,
          stockTotal,
          actualizadoEn: FieldValue.serverTimestamp(),
        });
        for (const [varianteId, cant] of deltas) {
          const mov = adminDb.collection("movimientos").doc();
          const vv = variantes.find((x) => x.id === varianteId);
          tx.set(mov, {
            productoId: ids[i],
            productoNombre: data.nombre ?? "",
            varianteId,
            varianteDesc:
              [vv?.talla, vv?.color].map((x) => String(x ?? "").trim()).filter(Boolean).join(" / ") ||
              "Único",
            tipo: "devolucion",
            cantidad: cant,
            stockAntes: (Number(vv?.stock) || 0) - cant,
            stockDespues: Number(vv?.stock) || 0,
            motivo: `Devolución ${f.numero}`,
            costoUnitario: null,
            creadoEn: FieldValue.serverTimestamp(),
          });
        }
      });

      const montoDevuelto = money((f.montoDevuelto ?? 0) + montoDevolucion);
      const saldoFinal = Math.max(
        0,
        money(f.total - (f.montoPagado ?? 0) - montoDevuelto),
      );

      tx.update(ref, {
        items,
        tieneDevolucion: true,
        montoDevuelto,
        saldoFinal,
        devoluciones: FieldValue.arrayUnion({
          fecha: Date.now(),
          motivo: entrada.motivo.trim() || null,
          monto: montoDevolucion,
          lineas: pedidas,
        }),
        actualizadoEn: FieldValue.serverTimestamp(),
      });
    });
    refrescar(entrada.facturaId);
    return { ok: true, id: entrada.facturaId };
  } catch (e) {
    return { ok: false, error: (e as Error).message || "No se pudo registrar la devolución." };
  }
}
