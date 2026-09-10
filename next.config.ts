import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Firebase Storage no transforma imágenes; Vercel las redimensiona y
    // convierte a WebP desde estas URLs remotas (ESPECIFICACION.md §6).
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
};

export default nextConfig;
