import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Config de Vitest para los tests unitarios.
 *
 * - `environment: jsdom` → da un DOM simulado para probar hooks/componentes React.
 * - `globals: true` → `describe/it/expect` sin importarlos (estilo Jest).
 * - El alias `@/` replica el de tsconfig para que los imports funcionen igual.
 * - Excluimos `e2e/` (esos los corre Playwright, no Vitest).
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
