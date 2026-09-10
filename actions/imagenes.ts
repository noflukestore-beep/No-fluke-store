"use server";

import { randomUUID } from "node:crypto";
import { bucketAdmin } from "@/lib/firebase/admin";

// TODO (login admin): verificar sesión + claim rol=admin.

export interface SubidaResultado {
  ok: boolean;
  error?: string;
  url?: string;
  path?: string;
}

const MAX_BYTES = 8 * 1024 * 1024; // la compresión del navegador deja <1 MB

/**
 * Sube una foto de producto a Firebase Storage y devuelve su URL de descarga.
 * La imagen ya viene comprimida desde el navegador.
 */
export async function subirImagenProducto(
  fd: FormData,
): Promise<SubidaResultado> {
  const archivo = fd.get("archivo");
  const productoId = String(fd.get("productoId") || "").trim() || "sin-guardar";

  if (!(archivo instanceof File)) {
    return { ok: false, error: "No llegó ninguna imagen." };
  }
  if (!archivo.type.startsWith("image/")) {
    return { ok: false, error: "El archivo debe ser una imagen." };
  }
  if (archivo.size > MAX_BYTES) {
    return { ok: false, error: "La imagen es muy pesada." };
  }

  const ext = archivo.type === "image/png" ? "png"
    : archivo.type === "image/webp" ? "webp"
    : archivo.type === "image/avif" ? "avif"
    : "jpg";
  const nombre = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const path = `productos/${productoId}/${nombre}`;

  try {
    const bucket = bucketAdmin();
    const token = randomUUID();
    const buffer = Buffer.from(await archivo.arrayBuffer());

    await bucket.file(path).save(buffer, {
      contentType: archivo.type,
      resumable: false,
      metadata: {
        cacheControl: "public, max-age=31536000, immutable",
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      path,
    )}?alt=media&token=${token}`;

    return { ok: true, url, path };
  } catch (e) {
    const msg = (e as Error).message || "";
    if (/does not exist|Not Found|404/i.test(msg)) {
      return {
        ok: false,
        error:
          "Falta activar Firebase Storage. Ábrelo en la consola de Firebase y vuelve a intentar.",
      };
    }
    return { ok: false, error: "No se pudo subir la imagen. Intenta de nuevo." };
  }
}

/** Borra una foto de Storage. Best-effort: los errores no rompen el guardado. */
export async function borrarImagenProducto(path: string): Promise<void> {
  if (!path) return;
  try {
    await bucketAdmin().file(path).delete({ ignoreNotFound: true });
  } catch {
    // Se ignora: puede que el archivo ya no exista.
  }
}
