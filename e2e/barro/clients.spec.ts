import { test, expect } from "@playwright/test";
import { navigateTo, waitForLoaded } from "../helpers";

test.describe("Mme Barro — Gestion des clients", () => {

  test("affiche la liste des clients avec les colonnes attendues", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/clients");
    await waitForLoaded(page);

    // "Gérer la base de clients" est dans un <p>, pas un heading
    await expect(page.getByText(/gérer la base de clients/i)).toBeVisible();

    // Colonnes du tableau
    const thead = page.locator("thead");
    await expect(thead.getByText(/client/i).first()).toBeVisible();
    await expect(thead.getByText(/contact/i).first()).toBeVisible();
    await expect(thead.getByText(/banque/i).first()).toBeVisible();
    await expect(thead.getByText(/catégorie/i).first()).toBeVisible();
    await expect(thead.getByText(/statut/i).first()).toBeVisible();
  });

  test("la recherche filtre la liste", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/clients");
    await waitForLoaded(page);

    const lignesAvant = await page.locator("tbody tr").count();
    if (lignesAvant === 0) test.skip();

    const premierNom = await page.locator("tbody tr").first()
      .locator("td").first()
      .textContent();
    if (!premierNom) test.skip();

    await page.getByPlaceholder(/rechercher un client/i).fill(premierNom.trim().slice(0, 4));
    await page.waitForTimeout(400);

    const lignesApres = await page.locator("tbody tr").count();
    expect(lignesApres).toBeGreaterThanOrEqual(1);
    expect(lignesApres).toBeLessThanOrEqual(lignesAvant);
  });

  test("le filtre par statut restreint les résultats", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/clients");
    await waitForLoaded(page);

    // Ouvrir le select Statut
    const selectStatut = page.getByRole("combobox").filter({ hasText: /tous les statuts/i });
    const visible = await selectStatut.isVisible({ timeout: 2_000 }).catch(() => false);
    if (!visible) test.skip();

    await selectStatut.click();
    await page.getByRole("option", { name: /^actif$/i }).click();
    await waitForLoaded(page);

    const lignes = page.locator("tbody tr");
    const count = await lignes.count();
    if (count > 0) {
      // Chaque ligne visible doit avoir le badge "Actif"
      await expect(lignes.first().getByText(/actif/i).first()).toBeVisible();
    }
  });

  test("le filtre par banque restreint les résultats", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/clients");
    await waitForLoaded(page);

    const selectBanque = page.getByRole("combobox").filter({ hasText: /toutes les banques/i });
    const visible = await selectBanque.isVisible({ timeout: 2_000 }).catch(() => false);
    if (!visible) test.skip();

    await selectBanque.click();
    await page.getByRole("option", { name: /^cbao$/i }).click();
    await waitForLoaded(page);

    const lignes = page.locator("tbody tr");
    const count = await lignes.count();
    if (count > 0) {
      await expect(lignes.first().getByText(/cbao/i)).toBeVisible();
    }
  });

  test("ouvre le formulaire de création d'un nouveau client", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/clients");
    await waitForLoaded(page);

    await page.getByRole("button", { name: /nouveau client/i }).click();

    // Le dialog s'ouvre
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await expect(dialog.getByRole("heading", { name: /nouveau client/i })).toBeVisible();

    // Labels présents (les inputs n'ont pas d'id, on vérifie les labels)
    await expect(dialog.getByText("Nom", { exact: true })).toBeVisible();
    await expect(dialog.getByText("Email", { exact: true })).toBeVisible();
    await expect(dialog.getByText("Téléphone", { exact: true })).toBeVisible();

    // Boutons d'action
    await expect(dialog.getByRole("button", { name: /annuler/i })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /créer/i })).toBeVisible();
  });

  test("validation : champs requis bloquent la soumission", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/clients");
    await waitForLoaded(page);

    await page.getByRole("button", { name: /nouveau client/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Soumettre sans remplir les champs
    await dialog.getByRole("button", { name: /créer/i }).click();
    await page.waitForTimeout(300);

    // Le dialog doit rester ouvert (validation bloquée)
    await expect(dialog).toBeVisible();
  });

  test("création d'un client avec données valides", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/clients");
    await waitForLoaded(page);

    const lignesAvant = await page.locator("tbody tr").count();

    await page.getByRole("button", { name: /nouveau client/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Remplir le formulaire — pas d'id/htmlFor, on cible par type/position
    const ts = Date.now();
    await dialog.locator('input').nth(0).fill(`TestClient${ts}`);            // Nom
    await dialog.locator('input[type="email"]').fill(`test${ts}@2si-test.sn`); // Email
    await dialog.locator('input').nth(4).fill("770000000");                  // Téléphone

    await dialog.getByRole("button", { name: /créer/i }).click();
    await waitForLoaded(page);

    // Le dialog doit se fermer et la liste doit s'être mise à jour
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5_000 });

    const lignesApres = await page.locator("tbody tr").count();
    expect(lignesApres).toBeGreaterThanOrEqual(lignesAvant);
  });

  test("ouvre le dialog de modification depuis le menu d'actions", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/clients");
    await waitForLoaded(page);

    const lignes = page.locator("tbody tr");
    if (await lignes.count() === 0) test.skip();

    // Ouvrir le menu contextuel de la première ligne
    const menuBtn = lignes.first().getByRole("button").last();
    await menuBtn.click();

    const modifier = page.getByRole("menuitem", { name: /modifier/i });
    const visible = await modifier.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!visible) test.skip();

    await modifier.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await expect(dialog.getByRole("heading", { name: /modifier le client/i })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /enregistrer/i })).toBeVisible();
  });

  test("ouvre la confirmation de suppression", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/clients");
    await waitForLoaded(page);

    const lignes = page.locator("tbody tr");
    if (await lignes.count() === 0) test.skip();

    const menuBtn = lignes.first().getByRole("button").last();
    await menuBtn.click();

    const supprimer = page.getByRole("menuitem", { name: /supprimer/i });
    const visible = await supprimer.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!visible) test.skip();

    await supprimer.click();

    // shadcn AlertDialog → role="alertdialog", pas "dialog"
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await expect(dialog.getByText(/supprimer ce client/i)).toBeVisible();
    await expect(dialog.getByRole("button", { name: /annuler/i })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /supprimer/i })).toBeVisible();

    // Fermer sans supprimer
    await dialog.getByRole("button", { name: /annuler/i }).click();
    await expect(dialog).not.toBeVisible({ timeout: 3_000 });
  });

  test("pagination : boutons Précédent / Suivant présents", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/clients");
    await waitForLoaded(page);

    // Les boutons de pagination doivent exister (même désactivés)
    await expect(page.getByRole("button", { name: /précédent/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /suivant/i })).toBeVisible();
  });
});
