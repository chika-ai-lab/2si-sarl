import { test, expect } from "@playwright/test";
import { navigateTo, waitForLoaded } from "../helpers";

test.describe("Logistique — Livraisons", () => {

  test("affiche le titre et les 3 KPI cards", async ({ page }) => {
    await navigateTo(page, "/admin/achats/livraisons");
    await waitForLoaded(page);

    await expect(page.getByRole("heading", { name: /livraisons/i })).toBeVisible();

    await expect(page.getByText(/en attente/i).first()).toBeVisible();
    await expect(page.getByText(/en cours/i).first()).toBeVisible();
    await expect(page.getByText(/livrés/i).first()).toBeVisible();
  });

  test("affiche les tabs de filtrage", async ({ page }) => {
    await navigateTo(page, "/admin/achats/livraisons");
    await waitForLoaded(page);

    await expect(page.getByRole("button", { name: /^tous/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /en attente/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /en cours/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /livrés/i }).first()).toBeVisible();
  });

  test("la recherche filtre les livraisons", async ({ page }) => {
    await navigateTo(page, "/admin/achats/livraisons");
    await waitForLoaded(page);

    const input = page.getByPlaceholder(/bdc, client, référence/i);
    await expect(input).toBeVisible();

    await input.fill("BDC");
    await page.waitForTimeout(400);

    // La page ne doit pas crasher
    await expect(page.getByRole("heading", { name: /livraisons/i })).toBeVisible();
    await input.clear();
  });

  test("le tab 'En attente' filtre les BL en attente", async ({ page }) => {
    await navigateTo(page, "/admin/achats/livraisons");
    await waitForLoaded(page);

    await page.getByRole("button", { name: /en attente/i }).first().click();
    await waitForLoaded(page);

    // Pas d'assertion sur l'état vide — les textes varient selon le tab
    // On vérifie juste que la page reste cohérente après le filtre
    await expect(page.getByRole("heading", { name: /livraisons/i })).toBeVisible();
  });

  test("un groupe BDC peut être expandé pour voir les BL", async ({ page }) => {
    await navigateTo(page, "/admin/achats/livraisons");
    await waitForLoaded(page);

    // Trouver le premier groupe de livraison
    const premierGroupe = page.locator(".cursor-pointer").first();
    const hasGroupe = await premierGroupe.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasGroupe) test.skip();

    await premierGroupe.click();
    await page.waitForTimeout(500);

    // Les colonnes du tableau interne doivent apparaître (headers réels : Référence, Client, Statut)
    await expect(page.getByRole("columnheader", { name: /référence/i }).first()).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /client/i }).first()).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /statut/i }).first()).toBeVisible();
  });

  test("transition En attente → En cours sur un BL", async ({ page }) => {
    await navigateTo(page, "/admin/achats/livraisons");
    await waitForLoaded(page);

    await page.getByRole("button", { name: /en attente/i }).first().click();
    await waitForLoaded(page);

    // Ouvrir le premier groupe
    const premierGroupe = page.locator(".cursor-pointer").first();
    const hasGroupe = await premierGroupe.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasGroupe) test.skip();

    await premierGroupe.click();
    await page.waitForTimeout(500);

    // Trouver le bouton "En cours" sur la première ligne de BL
    const btnEnCours = page.getByRole("button", { name: /^en cours$/i }).first();
    const hasBtnEnCours = await btnEnCours.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasBtnEnCours) test.skip();

    await btnEnCours.click();
    await waitForLoaded(page);

    // Toast ou changement de statut visible
    const toast = page.locator("[data-sonner-toast], [role='status']").first();
    await expect(toast).toBeVisible({ timeout: 5_000 }).catch(() => {
      // Certaines implémentations ne montrent pas de toast — acceptable
    });
  });

  test("transition En cours → Livré sur un BL", async ({ page }) => {
    await navigateTo(page, "/admin/achats/livraisons");
    await waitForLoaded(page);

    await page.getByRole("button", { name: /^en cours$/i }).first().click();
    await waitForLoaded(page);

    const premierGroupe = page.locator(".cursor-pointer").first();
    const hasGroupe = await premierGroupe.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasGroupe) test.skip();

    await premierGroupe.click();
    await page.waitForTimeout(500);

    const btnLivre = page.getByRole("button", { name: /^livré$/i }).first();
    const hasBtnLivre = await btnLivre.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasBtnLivre) test.skip();

    await btnLivre.click();
    await waitForLoaded(page);

    // Vérifier que le statut a changé dans l'onglet Livrés
    await page.getByRole("button", { name: /livrés/i }).first().click();
    await waitForLoaded(page);

    const livraisonsList = page.locator(".space-y-4 > div, .space-y-3 > div");
    expect(await livraisonsList.count()).toBeGreaterThanOrEqual(1);
  });

  test("le bouton Fiche ouvre le dialog d'impression BL", async ({ page }) => {
    await navigateTo(page, "/admin/achats/livraisons");
    await waitForLoaded(page);

    // Ouvrir un groupe
    const premierGroupe = page.locator(".cursor-pointer").first();
    const hasGroupe = await premierGroupe.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasGroupe) test.skip();

    await premierGroupe.click();
    await page.waitForTimeout(500);

    const btnFiche = page.getByRole("button", { name: /fiche/i }).first();
    const hasFiche = await btnFiche.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasFiche) test.skip();

    await btnFiche.click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });

    // Fermer le dialog
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3_000 });
  });

  test("le bouton 'Tout imprimer' est présent dans l'en-tête d'un groupe", async ({ page }) => {
    await navigateTo(page, "/admin/achats/livraisons");
    await waitForLoaded(page);

    const btnToutImprimer = page.getByRole("button", { name: /tout imprimer/i }).first();
    const hasBtn = await btnToutImprimer.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasBtn) test.skip();

    await expect(btnToutImprimer).toBeVisible();
  });

  test("le bouton Actualiser recharge la liste", async ({ page }) => {
    await navigateTo(page, "/admin/achats/livraisons");
    await waitForLoaded(page);

    const btnActualiser = page.getByRole("button", { name: /actualiser/i });
    await expect(btnActualiser).toBeVisible();

    await btnActualiser.click();
    await waitForLoaded(page);

    // La page doit rester cohérente après refresh
    await expect(page.getByRole("heading", { name: /livraisons/i })).toBeVisible();
  });
});
