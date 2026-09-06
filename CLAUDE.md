@AGENTS.md

# No Fluke Store

Catálogo en línea de perfumes, ropa, t-shirts y zapatos para República
Dominicana. Panel admin, carrito y cierre de pedido por WhatsApp.
La especificación completa está en `ESPECIFICACION.md`. Léela antes de
cualquier tarea.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind v4 + Firebase
(Firestore, Storage, Auth) + Zustand. Despliegue en Vercel.

> Nota: la especificación dice "Next.js 15"; se decidió usar la 16 (última
> versión soportada). Los patrones de App Router de la especificación —ISR con
> `export const revalidate`, Server Actions, `middleware`— aplican igual.
> `AGENTS.md` describe las particularidades de esta versión de Next.

## Reglas que no se rompen

1. **Todo el texto visible en español.** Nombres de variables y funciones
   también en español, para que coincidan con el modelo de datos.

2. **Mobile-first siempre.** Clases base de Tailwind = celular.
   `md:` y `lg:` ensanchan. Nunca al revés.

3. **El catálogo se lee en el servidor con ISR** (`export const revalidate`).
   Nunca consultar Firestore desde el navegador en pantallas públicas.
   Nunca usar `onSnapshot` en el catálogo. Esto es control de costos, no
   preferencia de estilo.

4. **Dos SDK separados.** `lib/firebase/cliente.ts` solo para auth y lecturas
   puntuales del navegador. `lib/firebase/admin.ts` solo en el servidor.
   El Admin SDK jamás se importa desde un componente con `"use client"`.

5. **`FIREBASE_PRIVATE_KEY` y `FIREBASE_CLIENT_EMAIL` nunca llevan el prefijo
   `NEXT_PUBLIC_`.**

6. **Los precios se recalculan siempre en el servidor.** Lo que manda el
   navegador se ignora. Aplica a ofertas y a precio por mayor.

7. **`"use client"` solo donde hace falta:** carrito, filtros, selectores,
   formularios. Todo lo demás, Server Component.

8. Moneda DOP con formato `RD$1,250.00`. Teléfonos como `1809XXXXXXX`.

## Al terminar una tarea

Dime siempre: qué archivos tocaste, qué debo configurar yo del lado de
Firebase o Vercel, y cómo verifico que funciona.
