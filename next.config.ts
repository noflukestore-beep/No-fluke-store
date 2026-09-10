import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel redimensiona y convierte a WebP desde estas URLs remotas
    // (ESPECIFICACION.md §6). Mientras no haya Firebase Storage, las fotos
    // de producto se cargan por enlace, así que se permite cualquier host
    // HTTPS; los de Firebase quedan explícitos por claridad.
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
