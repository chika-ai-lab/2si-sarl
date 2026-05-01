import { test, expect } from "@playwright/test";
import { navigateTo, waitForLoaded } from "../helpers";

test.describe("Mme Barro — Page commandes à traiter", () => {

  test("affiche la liste des commandes avec les stats", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/commandes");
    await waitForLoaded(page);

    // Titre de la page
    await expect(page.getByRole("heading", { name: /commandes à traiter/i })).toBeVisible();

    // 4 KPI cards présents — utiliser des sélecteurs précis pour éviter les doublons
    await expect(page.getByText("Total commandes")).toBeVisible();
    await expect(page.locator("span").filter({ hasText: "Non assignées" }).first()).toBeVisible();
    await expect(page.locator("span").filter({ hasText: "Validées" }).first()).toBeVisible();
    await expect(page.getByText("Montant total")).toBeVisible();
  });

  test("les tabs filtrent correctement", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/commandes");
    await waitForLoaded(page);

    // Tab "Non assignées"
    await page.getByRole("button", { name: /non assignées/i }).click();
    const lignes = page.locator("tbody tr");
    const count = await lignes.count();
    if (count > 0) {
      // Vérifier que le badge "Non assignée" est présent dans chaque ligne
      const premiereLigne = lignes.first();
      await expect(premiereLigne.getByText(/non assignée/i)).toBeVisible();
    }
  });

  test("filtre par source (terrain / marketplace)", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/commandes");
    await waitForLoaded(page);

    // Clic sur "Terrain"
    await page.getByRole("button", { name: /^terrain$/i }).click();
    await waitForLoaded(page);

    const lignes = page.locator("tbody tr");
    const count = await lignes.count();
    if (count > 0) {
      await expect(lignes.first().getByText(/terrain/i)).toBeVisible();
    }

    // Clic sur "Marketplace"
    await page.getByRole("button", { name: /^marketplace$/i }).click();
    await waitForLoaded(page);
  });

  test("recherche par nom client filtre la table", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/commandes");
    await waitForLoaded(page);

    const lignesAvant = await page.locator("tbody tr").count();
    if (lignesAvant === 0) test.skip();

    // Récupérer le nom du premier client
    const premierClient = await page.locator("tbody tr").first()
      .locator("td").nth(3)
      .locator("p").first()
      .textContent();

    if (!premierClient) test.skip();

    // Saisir les 3 premiers caractères dans la recherche
    await page.getByPlaceholder(/référence, client/i).fill(premierClient.slice(0, 3));
    await page.waitForTimeout(500);

    const lignesApres = await page.locator("tbody tr").count();
    expect(lignesApres).toBeGreaterThanOrEqual(1);
    expect(lignesApres).toBeLessThanOrEqual(lignesAvant);
  });

  test("assigne une agence via le sélecteur inline", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/commandes");
    await waitForLoaded(page);

    // Cherche une ligne avec "Non assignée" (singulier exact — pas le tab "Non assignées")
    const btnNonAssignee = page.getByRole("button", { name: "Non assignée", exact: true }).first();
    const visible = await btnNonAssignee.isVisible({ timeout: 2000 }).catch(() => false);
    if (!visible) {
      test.skip();
      return;
    }

    // Ouvrir le sélecteur d'agence
    await btnNonAssignee.click();

    // Le popover de sélection d'agence doit s'ouvrir
    const popover = page.locator("[cmdk-root]").first();
    await expect(popover).toBeVisible({ timeout: 5_000 });

    // Sélectionner la première agence disponible
    const premiereAgence = page.locator("[cmdk-item]").first();
    const agenceNom = await premiereAgence.textContent();
    await premiereAgence.click();

    // Attendre la mise à jour
    await waitForLoaded(page);

    console.log(`Agence assignée : ${agenceNom}`);
  });

  test("sélection multiple et barre d'actions groupées", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/commandes");
    await waitForLoaded(page);

    const lignes = page.locator("tbody tr");
    const count = await lignes.count();
    if (count < 2) test.skip();

    // Cocher les 2 premières lignes — shadcn Checkbox = role="checkbox"
    await lignes.nth(0).locator('[role="checkbox"]').first().click();
    await lignes.nth(1).locator('[role="checkbox"]').first().click();

    // La barre d'action groupée doit apparaître
    await expect(page.getByText(/sélectionnée\(s\)/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /créer bdc/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /assigner agence/i })).toBeVisible();
  });

  test("tout sélectionner via la checkbox d'en-tête", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/commandes");
    await waitForLoaded(page);

    const lignes = page.locator("tbody tr");
    if (await lignes.count() === 0) test.skip();

    // Clic sur la checkbox du header — shadcn Checkbox = role="checkbox"
    await page.locator("thead [role='checkbox']").click();

    // Toutes les lignes doivent être cochées
    const total = await lignes.count();
    const cochees = await page.locator("tbody [role='checkbox'][data-state='checked']").count();
    expect(cochees).toBe(total);
  });

  test("accès à la comptabilité depuis le sidebar", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/commandes");

    // Le lien "Comptabilité" doit être dans le sidebar
    const lienCompta = page.getByRole("link", { name: /comptabilité/i });
    await expect(lienCompta).toBeVisible();
    await lienCompta.click();

    await expect(page).toHaveURL(/\/admin\/commercial\/compta/);
    await expect(page.getByRole("heading", { name: /comptabilité/i })).toBeVisible();
  });
});
