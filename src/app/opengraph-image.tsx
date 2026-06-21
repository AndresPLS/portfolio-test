import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

/**
 * Imagen OG de la home, generada en build con `next/og` (`ImageResponse`).
 *
 * Next detecta este fichero por convención (`opengraph-image`) y lo expone
 * como `…/opengraph-image`, añadiéndolo a la metadata de la ruta. El JSX se
 * renderiza a PNG con Satori — solo admite un subconjunto de CSS (flexbox,
 * sin grid), por eso el layout va con `display: flex` explícito.
 */

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#f5f5f5",
        color: "#000",
        padding: "80px",
      }}
    >
      <div style={{ display: "flex", fontSize: 32, letterSpacing: "0.2em" }}>
        PHOTOGRAPHY
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", fontSize: 120, fontWeight: 700 }}>
          Andrés Polo
        </div>
        <div style={{ display: "flex", fontSize: 36, color: "#555" }}>
          Series &amp; projects
        </div>
      </div>
    </div>,
    size,
  );
}
