import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las imágenes ahora son locales (public/projects/...), así que no hace falta
  // configurar dominios remotos.
  images: {
    // Sirve AVIF si el navegador lo soporta; si no, cae a WebP; si no, al original.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
