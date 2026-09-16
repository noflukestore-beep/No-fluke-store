"use client";

/**
 * Carrito de compras. Vive solo en `localStorage` del navegador — nunca toca
 * Firestore (ver ESPECIFICACION.md §7). El precio que se muestra aquí es una
 * estimación para el cliente; el servidor lo recalcula siempre al crear el
 * pedido (`actions/pedidos.ts`).
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrito {
  productoId: string;
  varianteId: string;
  nombre: string;
  marca: string;
  varianteDesc: string;
  slug: string;
  imagenUrl: string | null;
  cantidad: number;
}

interface EstadoCarrito {
  items: ItemCarrito[];
  agregar: (item: Omit<ItemCarrito, "cantidad">, cantidad: number) => void;
  cambiarCantidad: (productoId: string, varianteId: string, cantidad: number) => void;
  quitar: (productoId: string, varianteId: string) => void;
  vaciar: () => void;
}

export const useCarrito = create<EstadoCarrito>()(
  persist(
    (set) => ({
      items: [],
      agregar: (item, cantidad) =>
        set((estado) => {
          const existe = estado.items.find(
            (i) => i.productoId === item.productoId && i.varianteId === item.varianteId,
          );
          if (existe) {
            return {
              items: estado.items.map((i) =>
                i === existe ? { ...i, cantidad: i.cantidad + cantidad } : i,
              ),
            };
          }
          return { items: [...estado.items, { ...item, cantidad }] };
        }),
      cambiarCantidad: (productoId, varianteId, cantidad) =>
        set((estado) => ({
          items:
            cantidad <= 0
              ? estado.items.filter(
                  (i) => !(i.productoId === productoId && i.varianteId === varianteId),
                )
              : estado.items.map((i) =>
                  i.productoId === productoId && i.varianteId === varianteId
                    ? { ...i, cantidad }
                    : i,
                ),
        })),
      quitar: (productoId, varianteId) =>
        set((estado) => ({
          items: estado.items.filter(
            (i) => !(i.productoId === productoId && i.varianteId === varianteId),
          ),
        })),
      vaciar: () => set({ items: [] }),
    }),
    { name: "no-fluke-carrito" },
  ),
);
