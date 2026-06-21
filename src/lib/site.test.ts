import { describe, expect, it } from "vitest";

import { absoluteUrl, siteConfig } from "./site";

/**
 * En el entorno de test no hay `NEXT_PUBLIC_SITE_URL` ni la variable de Vercel,
 * así que la URL base cae al fallback de desarrollo (`http://localhost:3000`).
 */
describe("absoluteUrl", () => {
  it("usa el fallback de localhost como base", () => {
    expect(siteConfig.url).toBe("http://localhost:3000");
  });

  it("compone una URL absoluta a partir de una ruta", () => {
    expect(absoluteUrl("/work/dreamly")).toBe(
      "http://localhost:3000/work/dreamly",
    );
  });

  it("por defecto apunta a la raíz", () => {
    expect(absoluteUrl()).toBe("http://localhost:3000/");
  });
});
