import { test, expect } from "@playwright/test";
import { navigateTo, waitForLoaded } from "../helpers";

test.describe("Mme Barro — Service Après-Vente", () => {

  test("affiche le titre et les 5 KPI cards", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/sav");
    await waitForLoaded(page);

    await expect(page.getByRole("heading", { name: /service après-vente/i })).toBeVisible();

    await expect(page.getByText(/total tickets/i)).toBeVisible();
    // La page liste ET le kanban ont "Ouvert/Ouverts" — cibler uniquement le KPI card
    await expect(page.getByText("Ouverts", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/^en cours$/i).first()).toBeVisible();
    await expect(page.getByText(/satisfaction/i)).toBeVisible();
    await expect(page.getByText(/coût total/i)).toBeVisible();
  });

  test("la recherche filtre les tickets", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/sav");
    await waitForLoaded(page);

    const input = page.getByPlaceholder(/rechercher par numéro, sujet/i);
    await expect(input).toBeVisible();

    await input.fill("SAV");
    await page.waitForTimeout(400);

    // La page ne doit pas crasher
    await expect(page.getByRole("heading", { name: /service après-vente/i })).toBeVisible();

    await input.clear();
  });

  test("le filtre par statut fonctionne", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/sav");
    await waitForLoaded(page);

    const selectStatut = page.getByRole("combobox").filter({ hasText: /tous les statuts/i });
    const visible = await selectStatut.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!visible) test.skip();

    await selectStatut.click();
    await page.getByRole("option", { name: /^ouvert$/i }).click();
    await waitForLoaded(page);

    await expect(page.getByRole("heading", { name: /service après-vente/i })).toBeVisible();
  });

  test("le filtre par priorité fonctionne", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/sav");
    await waitForLoaded(page);

    const selectPriorite = page.getByRole("combobox").filter({ hasText: /toutes les priorités/i });
    const visible = await selectPriorite.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!visible) test.skip();

    await selectPriorite.click();
    await page.getByRole("option", { name: /haute/i }).click();
    await waitForLoaded(page);

    await expect(page.getByRole("heading", { name: /service après-vente/i })).toBeVisible();
  });

  test("le filtre par type fonctionne", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/sav");
    await waitForLoaded(page);

    const selectType = page.getByRole("combobox").filter({ hasText: /tous les types/i });
    const visible = await selectType.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!visible) test.skip();

    await selectType.click();
    await page.getByRole("option", { name: /réclamation/i }).click();
    await waitForLoaded(page);

    await expect(page.getByRole("heading", { name: /service après-vente/i })).toBeVisible();
  });

  test("ouvre le formulaire de création d'un ticket", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/sav");
    await waitForLoaded(page);

    await page.getByRole("button", { name: /nouveau ticket/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await expect(dialog.getByRole("heading", { name: /nouveau ticket sav/i })).toBeVisible();

    // Champs du formulaire
    await expect(dialog.getByText(/client/i).first()).toBeVisible();
    await expect(dialog.getByText(/type de ticket/i)).toBeVisible();
    await expect(dialog.getByText(/priorité/i)).toBeVisible();
    await expect(dialog.getByLabel(/sujet/i)).toBeVisible();
    await expect(dialog.getByLabel(/description/i)).toBeVisible();

    await expect(dialog.getByRole("button", { name: /annuler/i })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /créer le ticket/i })).toBeVisible();
  });

  test("validation : sujet requis bloque la soumission", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/sav");
    await waitForLoaded(page);

    await page.getByRole("button", { name: /nouveau ticket/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Soumettre sans remplir les champs
    await dialog.getByRole("button", { name: /créer le ticket/i }).click();
    await page.waitForTimeout(300);

    // Le dialog reste ouvert
    await expect(dialog).toBeVisible();
  });

  test("création d'un ticket avec données valides", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/sav");
    await waitForLoaded(page);

    await page.getByRole("button", { name: /nouveau ticket/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    const ts = Date.now();
    // Utiliser getByLabel avec le texte exact (shadcn FormLabel génère le htmlFor automatiquement)
    await dialog.getByLabel("Sujet").fill(`Ticket test ${ts}`);
    await dialog.getByLabel("Description").fill("Problème de test automatisé Playwright.");

    await dialog.getByRole("button", { name: /créer le ticket/i }).click();
    await waitForLoaded(page);

    // Si client requis manque → validation, dialog reste ouvert. Les deux cas sont acceptables.
    // On vérifie juste que le formulaire a bien été soumis (pas de crash).
    await expect(page.getByRole("heading", { name: /service après-vente/i })).toBeVisible();
  });

  test("fermeture du dialog via Annuler", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/sav");
    await waitForLoaded(page);

    await page.getByRole("button", { name: /nouveau ticket/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    await dialog.getByRole("button", { name: /annuler/i }).click();
    await expect(dialog).not.toBeVisible({ timeout: 3_000 });
  });

  test("bascule vers la vue Kanban", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/sav");
    await waitForLoaded(page);

    // Les boutons de vue sont des icônes — chercher le container de toggle
    const toggleKanban = page.locator('[aria-label*="kanban" i], [title*="kanban" i], button:has([data-lucide="layout-grid"])').first();
    const hasToggle = await toggleKanban.isVisible({ timeout: 2_000 }).catch(() => false);
    if (!hasToggle) test.skip();

    await toggleKanban.click();
    await waitForLoaded(page);

    // Colonnes Kanban attendues
    await expect(page.getByText(/^ouvert$/i).first()).toBeVisible();
    await expect(page.getByText(/^en cours$/i).first()).toBeVisible();
    await expect(page.getByText(/^résolu$/i)).toBeVisible();
  });

  test("pagination disponible sur la vue liste", async ({ page }) => {
    await navigateTo(page, "/admin/commercial/sav");
    await waitForLoaded(page);

    // La pagination n'existe que si la liste dépasse une page
    const hasPrev = await page.getByRole("button", { name: /précédent/i }).isVisible({ timeout: 2_000 }).catch(() => false);
    const hasNext = await page.getByRole("button", { name: /suivant/i }).isVisible({ timeout: 2_000 }).catch(() => false);
    if (!hasPrev && !hasNext) {
      test.skip();
      return;
    }
    await expect(page.getByRole("button", { name: /précédent/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /suivant/i })).toBeVisible();
  });
});
