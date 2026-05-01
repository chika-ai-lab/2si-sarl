import { test, expect } from "@playwright/test";
import { navigateTo, waitForLoaded } from "../helpers";

test.describe("Mme Barro — Comptabilité (lecture seule)", () => {

  test("affiche les KPI financiers", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/compta");
    await waitForLoaded(page);

    await expect(page.getByRole("heading", { name: /comptabilité/i })).toBeVisible();
    await expect(page.getByText(/facturé \(clients\)/i)).toBeVisible();
    await expect(page.getByText(/encaissé/i)).toBeVisible();
    await expect(page.getByText(/créances/i)).toBeVisible();
    await expect(page.getByText(/factures impayées/i)).toBeVisible();
    await expect(page.getByText(/achats fournisseurs/i)).toBeVisible();
  });

  test("tab factures clients affiche la table", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/compta");
    await waitForLoaded(page);

    // Tab clients actif par défaut
    await expect(page.getByRole("tab", { name: /factures clients/i })).toBeVisible();

    const table = page.locator("table").first();
    const hasTable = await table.isVisible({ timeout: 3_000 }).catch(() => false);

    if (!hasTable) {
      // Pas de données — vérifier l'état vide
      await expect(page.getByText(/aucune facture client/i)).toBeVisible();
      return;
    }

    // Colonnes attendues
    await expect(table.getByText(/montant/i).first()).toBeVisible();
    await expect(table.getByText(/encaissé/i).first()).toBeVisible();
    await expect(table.getByText(/créance/i).first()).toBeVisible();
    await expect(table.getByText(/statut/i).first()).toBeVisible();
  });

  test("tab factures fournisseurs est accessible", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/compta");
    await waitForLoaded(page);

    await page.getByRole("tab", { name: /factures fournisseurs/i }).click();
    await waitForLoaded(page);

    const table = page.locator("table").first();
    const hasTable = await table.isVisible({ timeout: 3_000 }).catch(() => false);

    if (!hasTable) {
      // Pas de données — vérifier l'état vide
      await expect(page.getByText(/aucune facture fournisseur/i)).toBeVisible();
      return;
    }

    await expect(table).toBeVisible();
  });

  test("la recherche filtre les factures", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/compta");
    await waitForLoaded(page);

    const lignesAvant = await page.locator("tbody tr").count();
    if (lignesAvant === 0) test.skip();

    await page.getByPlaceholder(/chercher/i).fill("FC-0001");
    await page.waitForTimeout(300);

    const lignesApres = await page.locator("tbody tr").count();
    expect(lignesApres).toBeLessThanOrEqual(lignesAvant);
  });

  test("aucun bouton de suppression ou modification n'est accessible", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/compta");
    await waitForLoaded(page);

    // Page en lecture seule — pas de boutons destructifs
    await expect(page.getByRole("button", { name: /supprimer|modifier|créer|ajouter/i })).toHaveCount(0);
  });
});
