import { test, expect } from "@playwright/test";
import { navigateTo, waitForLoaded } from "../helpers";

test.describe("Logistique — Bons de Commande", () => {

  test("affiche la liste des BDC avec les KPI", async ({ page }) => {
    await navigateTo(page, "/admin/achats/bon-commandes");
    await waitForLoaded(page);

    await expect(page.getByRole("heading", { name: /bons de commande/i })).toBeVisible();

    // KPI cards
    await expect(page.getByText(/total bdc/i)).toBeVisible();
    await expect(page.getByText("Brouillons")).toBeVisible();   // KPI exact — pas "En cours"
    await expect(page.getByText(/transmis/i).first()).toBeVisible();
    await expect(page.getByText(/terminés/i)).toBeVisible();
  });

  test("un BDC peut être ouvert (accordéon) pour voir ses lignes", async ({ page }) => {
    await navigateTo(page, "/admin/achats/bon-commandes");
    await waitForLoaded(page);

    const premierBDC = page.locator(".space-y-3 > div").first();
    if (!await premierBDC.isVisible().catch(() => false)) {
      test.skip();
      return;
    }

    // Clic pour ouvrir
    await premierBDC.locator(".cursor-pointer").first().click();
    await page.waitForTimeout(500);

    // Le tableau de lignes doit apparaître — cibler le columnheader pour éviter l'ambiguïté
    await expect(premierBDC.getByRole("columnheader", { name: /client/i })).toBeVisible();
    await expect(premierBDC.getByRole("columnheader", { name: /produit/i })).toBeVisible();
    await expect(premierBDC.getByRole("columnheader", { name: /fournisseur/i })).toBeVisible();
  });

  test("assigner un fournisseur à une ligne BDC", async ({ page }) => {
    await navigateTo(page, "/admin/achats/bon-commandes");
    await waitForLoaded(page);

    const premierBDC = page.locator(".space-y-3 > div").first();
    if (!await premierBDC.isVisible().catch(() => false)) test.skip();

    await premierBDC.locator(".cursor-pointer").first().click();
    await page.waitForTimeout(500);

    // Chercher le sélecteur de fournisseur sur la première ligne
    const selectFourn = premierBDC.getByRole("combobox").first();
    if (!await selectFourn.isVisible().catch(() => false)) test.skip();

    await selectFourn.click();

    // Le popover de sélection fournisseur s'ouvre
    const premiereOption = page.locator("[cmdk-item]").first();
    if (await premiereOption.isVisible()) {
      await premiereOption.click();
      await waitForLoaded(page);
    }
  });

  test("le bouton 'Sauvegarder assignations' est présent dans le détail", async ({ page }) => {
    await navigateTo(page, "/admin/achats/bon-commandes");
    await waitForLoaded(page);

    const premierBDC = page.locator(".space-y-3 > div").first();
    if (!await premierBDC.isVisible().catch(() => false)) test.skip();

    await premierBDC.locator(".cursor-pointer").first().click();
    await page.waitForTimeout(500);

    await expect(premierBDC.getByRole("button", { name: /sauvegarder assignations/i })).toBeVisible();
  });

  test("le bouton 'Générer Commandes Fournisseurs' est présent", async ({ page }) => {
    await navigateTo(page, "/admin/achats/bon-commandes");
    await waitForLoaded(page);

    const premierBDC = page.locator(".space-y-3 > div").first();
    if (!await premierBDC.isVisible().catch(() => false)) test.skip();

    await premierBDC.locator(".cursor-pointer").first().click();
    await page.waitForTimeout(500);

    await expect(
      premierBDC.getByRole("button", { name: /générer commandes fournisseurs|déjà transmis/i })
    ).toBeVisible();
  });
});
