"use client";

import { useSyncExternalStore } from "react";

const suscribir = () => () => {};

/**
 * `true` solo después de montar en el navegador. Evita el desajuste de
 * hidratación cuando el contenido depende de `localStorage` (el carrito):
 * el servidor no tiene esos datos, así que debe renderizar como si aún no
 * hubieran cargado.
 */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    suscribir,
    () => true,
    () => false,
  );
}
