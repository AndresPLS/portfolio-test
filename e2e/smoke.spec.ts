import { expect, test } from "@playwright/test";

/**
 * Smoke tests: no comprueban animaciones (frágiles y fuera del alcance del
 * plan), sino que las páginas clave cargan y la navegación principal funciona.
 */

test("la home carga con la cabecera del sitio", async ({ page }) => {
  await page.goto("/");

  // El logo/nombre de la cabecera enlaza a la home.
  await expect(page.getByRole("link", { name: "Andrés Polo" })).toBeVisible();

  // El scrubber muestra una portada activa enlazada a su ficha.
  const cover = page.getByRole("link", { name: /Ver proyecto:/ });
  await expect(cover).toBeVisible();
});

test("se navega de la home a una ficha de proyecto", async ({ page }) => {
  await page.goto("/");

  const cover = page.getByRole("link", { name: /Ver proyecto:/ }).first();
  await cover.click();

  // La URL pasa a /work/<slug> y la ficha renderiza su contenedor de scroll.
  await expect(page).toHaveURL(/\/work\/[^/]+$/);
  await expect(page.locator("#shots")).toBeVisible();
});

test("el scrubber de la home es navegable con teclado", async ({ page }) => {
  await page.goto("/");

  const cover = page.getByRole("link", { name: /Ver proyecto:/ });
  await expect(cover).toHaveAttribute("aria-label", /\(1 de \d+\)/);

  await cover.focus();
  await page.keyboard.press("ArrowRight");

  // La flecha cambia el proyecto activo (el destino del enlace se actualiza).
  await expect(cover).toHaveAttribute("aria-label", /\(2 de \d+\)/);
});

test("la página About carga", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("link", { name: "Andrés Polo" })).toBeVisible();
});
