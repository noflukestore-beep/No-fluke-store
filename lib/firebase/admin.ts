/**
 * Admin SDK de Firebase. SOLO servidor (Server Components, Server Actions,
 * Route Handlers, scripts).
 *
 * Ignora las Security Rules por completo. Se usa para leer el catálogo con ISR
 * (sección 4), crear pedidos, descontar stock y todas las escrituras del panel.
 * Su credencial NUNCA lleva el prefijo `NEXT_PUBLIC_`.
 *
 * `import "server-only"` hace fallar el build si algún módulo con `"use client"`
 * llega a importar este archivo. La comprobación de `window` es una segunda
 * barrera en tiempo de ejecución.
 */
import "server-only";
import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

if (typeof window !== "undefined") {
  throw new Error(
    "lib/firebase/admin.ts se importó en el navegador. Este módulo es solo del servidor.",
  );
}

/**
 * La clave privada admite dos formatos de variable de entorno:
 * - `FIREBASE_PRIVATE_KEY_BASE64`: la clave PEM codificada en base64, sin
 *   comillas ni `\n`. Se prefiere este: es una sola línea "plana" que no se
 *   rompe al copiar y pegar (por ejemplo en el panel de Vercel).
 * - `FIREBASE_PRIVATE_KEY`: la clave PEM con los saltos de línea escritos
 *   como `\n` (como la deja `.env.local`). Se usa si no está la de arriba.
 */
function leerClavePrivada(): string | undefined {
  const base64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  if (base64) {
    return Buffer.from(base64, "base64").toString("utf8");
  }
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function crearAppAdmin(): App {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = leerClavePrivada();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Faltan FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY en el entorno.",
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    // El bucket no es secreto; se usa para subir fotos de producto.
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

// Singleton: evita "app already exists" en hot-reload y entre invocaciones.
const appAdmin: App = getApps().length ? getApps()[0]! : crearAppAdmin();

export const adminAuth = getAuth(appAdmin);
export const adminDb = getFirestore(appAdmin);

/** Bucket de Storage para las fotos de producto (`productos/<id>/<archivo>`). */
export function bucketAdmin() {
  return getStorage(appAdmin).bucket();
}
