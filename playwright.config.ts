import { defineConfig, devices } from "@playwright/test";

/**
 * Config de Playwright para los tests e2e *smoke*.
 *
 * `webServer` arranca el build de producción (`next start`) y espera a que
 * responda antes de lanzar los tests; Playwright lo apaga al terminar. Usamos
 * el build real (no `next dev`) para que el smoke se parezca a producción.
 *
 * Nota: reutiliza el servidor si ya hay uno en :3000 (tú sueles tenerlo abierto).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
