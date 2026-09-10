"use server";

import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath, revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import type { Config } from "@/lib/firebase/tipos";

// TODO (login admin): verificar sesión + claim rol=admin.

export interface ConfigInput {
  nombreTienda: string;
  whatsapp: string;
  costoEnvio: number;
  mensajeBienvenida: string;
  correo: string;
  direccion: string;
  instagram: string;
  facebook: string;
  tiktok: string;
}

export interface Resultado {
  ok: boolean;
  error?: string;
  /** Campos ya normalizados, para reflejarlos en el formulario. */
  guardado?: Pick<
    Config,
    | "whatsapp"
    | "instagram"
    | "facebook"
    | "tiktok"
    | "mensajeBienvenida"
    | "correo"
    | "direccion"
    | "costoEnvio"
  >;
}

/**
 * Deja el WhatsApp en formato internacional dominicano `1809XXXXXXX`
 * (11 dígitos). Devuelve `null` si el número no es válido.
 */
function normalizarWhatsapp(bruto: string): string | null {
  let d = bruto.replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 10) d = `1${d}`; // sin código de país
  if (/^1(809|829|849)\d{7}$/.test(d)) return d;
  return null;
}

/** Quita `@`, URL y barras: deja solo el usuario de la red social. */
function usuarioRed(bruto: string): string | null {
  const limpio = bruto
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?(instagram|facebook|fb|tiktok)\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "")
    .trim();
  return limpio || null;
}

export async function guardarConfig(entrada: ConfigInput): Promise<Resultado> {
  const nombreTienda = entrada.nombreTienda.trim();
  if (!nombreTienda) {
    return { ok: false, error: "El nombre de la tienda es obligatorio." };
  }

  const whatsapp = normalizarWhatsapp(entrada.whatsapp);
  if (whatsapp === null) {
    return {
      ok: false,
      error:
        "El WhatsApp debe ser un número dominicano válido (ej. 809 555 1234).",
    };
  }

  const costoEnvio = Math.max(
    0,
    Math.round(Number(entrada.costoEnvio) || 0),
  );

  const texto = (v: string) => v.trim() || null;

  const datos = {
    nombreTienda,
    whatsapp,
    costoEnvio,
    mensajeBienvenida: texto(entrada.mensajeBienvenida),
    correo: texto(entrada.correo),
    direccion: texto(entrada.direccion),
    instagram: usuarioRed(entrada.instagram),
    facebook: usuarioRed(entrada.facebook),
    tiktok: usuarioRed(entrada.tiktok),
  };

  await adminDb.doc("config/tienda").set(
    { ...datos, actualizadoEn: FieldValue.serverTimestamp() },
    { merge: true },
  );

  revalidateTag("catalogo", "max");
  revalidateTag("config", "max");
  revalidatePath("/admin/config");
  return {
    ok: true,
    guardado: {
      whatsapp: datos.whatsapp,
      instagram: datos.instagram,
      facebook: datos.facebook,
      tiktok: datos.tiktok,
      mensajeBienvenida: datos.mensajeBienvenida,
      correo: datos.correo,
      direccion: datos.direccion,
      costoEnvio: datos.costoEnvio,
    },
  };
}
