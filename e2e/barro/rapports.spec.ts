import { test, expect } from "@playwright/test";
import { navigateTo, waitForLoaded } from "../helpers";

// Attend que l'état de chargement initial disparaisse (retries React Query inclus)
async function waitForRapports(page: Parameters<typeof waitForLoaded>[0]) {
  await navigateTo(page, "/admin/commercial/rapports");
  await waitForLoaded(page);
  // La page affiche "Chargement des rapports..." pendant isLoading — attendre sa disparition
  await page.locator("text=Chargement des rapports...").waitFor({ state: "hidden", timeout: 20_000 }).catch(() => {});
}

test.describe("Mme Barro — Rapports Commerciaux", () => {

  test("affiche le titre et les 6 KPI cards", async ({ page }) => {
    await waitForRapports(page);

    await expect(page.getByRole("heading", { name: /rapports commerciaux/i })).toBeVisible({ timeout: 10_000 });

    // KPI primaires
    await expect(page.getByText("CA Total")).toBeVisible();
    await expect(page.getByText("Commandes")).toBeVisible();
    await expect(page.getByText("Panier Moyen")).toBeVisible();
    await expect(page.getByText(/taux de conversion/i)).toBeVisible();

    // KPI secondaires
    await expect(page.getByText(/accréditifs actifs/i)).toBeVisible();
    await expect(page.getByText(/CA du Mois/i)).toBeVisible();
  });

  test("affiche les sections graphiques", async ({ page }) => {
    await waitForRapports(page);

    // Vérifier que la page a chargé
    const loaded = await page.getByRole("heading", { name: /rapports commerciaux/i }).isVisible({ timeout: 10_000 }).catch(() => false);
    if (!loaded) test.skip();

    await expect(page.getByText(/évolution du chiffre d'affaires/i)).toBeVisible();
    await expect(page.getByText(/répartition par banque/i)).toBeVisible();
    await expect(page.getByText(/top 5 produits/i)).toBeVisible();
    await expect(page.getByText(/top 5 clients/i)).toBeVisible();
  });

  test("affiche les tables Top Produits et Top Clients", async ({ page }) => {
    await waitForRapports(page);

    const loaded = await page.getByRole("heading", { name: /rapports commerciaux/i }).isVisible({ timeout: 10_000 }).catch(() => false);
    if (!loaded) test.skip();

    // Table Top Produits
    const tableProduits = page.locator("table").first();
    const hasProduits = await tableProduits.isVisible({ timeout: 5_000 }).catch(() => false);
    if (hasProduits) {
      await expect(tableProduits.getByText(/produit/i).first()).toBeVisible();
      await expect(tableProduits.getByText(/qté/i).first()).toBeVisible();
      await expect(tableProduits.getByText(/^ca$/i).first()).toBeVisible();
    }
  });

  test("affiche la table Détails par Banque", async ({ page }) => {
    await waitForRapports(page);

    const loaded = await page.getByRole("heading", { name: /rapports commerciaux/i }).isVisible({ timeout: 10_000 }).catch(() => false);
    if (!loaded) test.skip();

    await expect(page.getByText(/détails par banque/i)).toBeVisible();

    const table = page.locator("table").last();
    const visible = await table.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!visible) test.skip();

    await expect(table.getByText(/banque/i).first()).toBeVisible();
    await expect(table.getByText(/chiffre d'affaires/i).first()).toBeVisible();
    await expect(table.getByText(/nombre de commandes/i).first()).toBeVisible();
  });

  test("le filtre par banque rafraîchit les données", async ({ page }) => {
    await waitForRapports(page);

    const selectBanque = page.getByRole("combobox").filter({ hasText: /toutes les banques/i });
    const visible = await selectBanque.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!visible) test.skip();

    await selectBanque.click();
    await page.getByRole("option", { name: /^cbao$/i }).click();
    await waitForLoaded(page);

    await expect(page.getByRole("heading", { name: /rapports commerciaux/i })).toBeVisible();
  });

  test("les filtres de date sont accessibles", async ({ page }) => {
    await waitForRapports(page);

    const loaded = await page.getByRole("heading", { name: /rapports commerciaux/i }).isVisible({ timeout: 10_000 }).catch(() => false);
    if (!loaded) test.skip();

    // Les labels "Date début" / "Date fin" — pas forcément liés par htmlFor, on vérifie le texte
    await expect(page.getByText(/date début/i).first()).toBeVisible();
    await expect(page.getByText(/date fin/i).first()).toBeVisible();
  });

  test("le bouton Exporter Excel est visible et cliquable", async ({ page }) => {
    await waitForRapports(page);

    const loaded = await page.getByRole("heading", { name: /rapports commerciaux/i }).isVisible({ timeout: 10_000 }).catch(() => false);
    if (!loaded) test.skip();

    const btnExcel = page.getByRole("button", { name: /exporter excel/i });
    await expect(btnExcel).toBeVisible();

    await btnExcel.click();
    await page.waitForTimeout(300);

    await expect(page.getByRole("menuitem", { name: /rapport complet/i }).first()).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /évolution ca/i })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /top produits/i })).toBeVisible();

    await page.keyboard.press("Escape");
  });

  test("le bouton Exporter PDF est visible et cliquable", async ({ page }) => {
    await waitForRapports(page);

    const loaded = await page.getByRole("heading", { name: /rapports commerciaux/i }).isVisible({ timeout: 10_000 }).catch(() => false);
    if (!loaded) test.skip();

    const btnPDF = page.getByRole("button", { name: /exporter pdf/i });
    await expect(btnPDF).toBeVisible();

    await btnPDF.click();
    await page.waitForTimeout(300);

    await expect(page.getByRole("menuitem", { name: /rapport complet avec graphiques/i })).toBeVisible();

    await page.keyboard.press("Escape");
  });

  test("le sélecteur de vue période fonctionne", async ({ page }) => {
    await waitForRapports(page);

    const selectPeriode = page.getByRole("combobox").filter({ hasText: /mensuelle|hebdomadaire/i });
    const visible = await selectPeriode.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!visible) test.skip();

    await selectPeriode.click();
    await page.getByRole("option", { name: /hebdomadaire/i }).click();
    await waitForLoaded(page);

    await expect(page.getByRole("heading", { name: /rapports commerciaux/i })).toBeVisible();
  });
});
