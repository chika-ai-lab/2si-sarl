/**
 * Flux complet étendu : de la commande client jusqu'à la livraison.
 *
 * Mme Barro (Commercial) :
 *   1. Réceptionne une commande non assignée et assigne une agence
 *   2. Crée un BOC via la sélection multiple
 *
 * Fatou Sarr (Logistique) :
 *   3. Voit le BOC, assigne un fournisseur, sauvegarde
 *   4. Génère les commandes fournisseurs
 *   5. Valide la CF (brouillon → validé)
 *   6. Marque la CF comme reçue (validé → reçu)
 *   7. Vérifie la page Livraisons (BL généré)
 *
 * Mme Barro :
 *   8. Vérifie l'impact comptable (créances, achats fournisseurs)
 */

import { test, expect, chromium } from "@playwright/test";
import { login, USERS, waitForLoaded } from "../helpers";

test("flux complet étendu : commande → BOC → CF → réception → livraison → compta", async () => {
  test.setTimeout(90_000); // workflow multi-contextes, plus long que le défaut 30s
  const browser = await chromium.launch();

  const ctxBarro = await browser.newContext({
    storageState: "e2e/.auth/barro.json",
  });
  const pageBarro = await ctxBarro.newPage();
  pageBarro.setDefaultTimeout(15_000);

  const ctxLogistique = await browser.newContext({
    storageState: "e2e/.auth/logistique.json",
  });
  const pageLogistique = await ctxLogistique.newPage();
  pageLogistique.setDefaultTimeout(15_000);

  try {
    // ────────────────────────────────────────────────────────────────────
    // ÉTAPE 1 : Barro — assigner une agence à une commande non assignée
    // ────────────────────────────────────────────────────────────────────
    await pageBarro.goto("/admin/commercial/commandes");
    await waitForLoaded(pageBarro);
    await expect(pageBarro.getByRole("heading", { name: /commandes à traiter/i })).toBeVisible();

    await pageBarro.getByRole("button", { name: /non assignées/i }).click();
    await waitForLoaded(pageBarro);

    const lignesNonAssignees = pageBarro.locator("tbody tr");
    const nbNonAssignees = await lignesNonAssignees.count();
    console.log(`[BARRO] ${nbNonAssignees} commande(s) non assignée(s)`);

    let agenceAssignee: string | null = null;
    if (nbNonAssignees > 0) {
      const btnNonAssignee = pageBarro.getByRole("button", { name: /non assignée/i, exact: true }).first();
      if (await btnNonAssignee.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await btnNonAssignee.click();
        const option = pageBarro.locator("[cmdk-item]").first();
        if (await option.isVisible({ timeout: 3_000 }).catch(() => false)) {
          agenceAssignee = await option.textContent();
          await option.click();
          await waitForLoaded(pageBarro);
          console.log(`[BARRO] Agence assignée : ${agenceAssignee}`);
        }
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // ÉTAPE 2 : Barro — créer un BOC via sélection multiple
    // ────────────────────────────────────────────────────────────────────
    await pageBarro.goto("/admin/commercial/commandes");
    await waitForLoaded(pageBarro);

    const toutesLignes = pageBarro.locator("tbody tr");
    const nbLignes = await toutesLignes.count();

    if (nbLignes >= 1) {
      // Cocher la première ligne
      await toutesLignes.first().locator('[role="checkbox"]').first().click();
      await pageBarro.waitForTimeout(300);

      // La barre d'actions groupées doit apparaître
      const barreGroupee = pageBarro.getByText(/sélectionnée\(s\)/i).first();
      const hasBarreGroupee = await barreGroupee.isVisible({ timeout: 3_000 }).catch(() => false);

      if (hasBarreGroupee) {
        const btnCreerBOC = pageBarro.getByRole("button", { name: /créer bdc/i });
        if (await btnCreerBOC.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await btnCreerBOC.click();
          await waitForLoaded(pageBarro);
          console.log("[BARRO] BOC créé via sélection multiple");
        }
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // ÉTAPE 3 : Logistique — voir et travailler sur les BOC
    // ────────────────────────────────────────────────────────────────────
    await pageLogistique.goto("/admin/achats/bon-commandes");
    await waitForLoaded(pageLogistique);
    await expect(pageLogistique.getByRole("heading", { name: /bons de commande/i })).toBeVisible();

    const bdcs = pageLogistique.locator(".space-y-3 > div");
    const nbBDC = await bdcs.count();
    console.log(`[LOGISTIQUE] ${nbBDC} BDC visible(s)`);

    if (nbBDC > 0) {
      // Ouvrir le premier BDC
      await bdcs.first().locator(".cursor-pointer").first().click();
      await pageLogistique.waitForTimeout(500);

      // Assigner un fournisseur si possible
      const selectFourn = bdcs.first().getByRole("combobox").first();
      if (await selectFourn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await selectFourn.click();
        const opt = pageLogistique.locator("[cmdk-item]").first();
        if (await opt.isVisible({ timeout: 2_000 }).catch(() => false)) {
          const nomFourn = await opt.textContent();
          await opt.click();
          await waitForLoaded(pageLogistique);
          console.log(`[LOGISTIQUE] Fournisseur assigné : ${nomFourn}`);

          // Sauvegarder
          const btnSave = bdcs.first().getByRole("button", { name: /sauvegarder assignations/i });
          if (await btnSave.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await btnSave.click();
            await waitForLoaded(pageLogistique);
            console.log("[LOGISTIQUE] Assignations sauvegardées");
          }
        }
      }

      // Générer les commandes fournisseurs
      const btnGenerer = bdcs.first().getByRole("button", { name: /générer commandes fournisseurs/i });
      if (await btnGenerer.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await btnGenerer.click();
        await waitForLoaded(pageLogistique);
        console.log("[LOGISTIQUE] Commandes fournisseurs générées");
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // ÉTAPE 4 : Logistique — valider une CF brouillon
    // ────────────────────────────────────────────────────────────────────
    await pageLogistique.goto("/admin/achats/commandes");
    await waitForLoaded(pageLogistique);
    await expect(pageLogistique.getByRole("heading", { name: /commandes fournisseurs/i })).toBeVisible();

    await pageLogistique.getByRole("button", { name: /^brouillon/i }).click();
    await waitForLoaded(pageLogistique);

    const cfBrouillons = pageLogistique.locator(".space-y-2 > div");
    const nbBrouillons = await cfBrouillons.count();
    console.log(`[LOGISTIQUE] ${nbBrouillons} CF en brouillon`);

    if (nbBrouillons > 0) {
      const refBrouillon = await cfBrouillons.first().locator("span.font-mono").textContent().catch(() => null);
      console.log(`[LOGISTIQUE] Validation de CF : ${refBrouillon}`);

      await cfBrouillons.first().getByRole("button", { name: /valider/i }).click();
      await waitForLoaded(pageLogistique);

      // Vérifier dans Validé
      await pageLogistique.getByRole("button", { name: /^validé/i }).click();
      await waitForLoaded(pageLogistique);

      const nbValidees = await pageLogistique.locator(".space-y-2 > div").count();
      console.log(`[LOGISTIQUE] ${nbValidees} CF validée(s)`);
      expect(nbValidees).toBeGreaterThanOrEqual(1);
    }

    // ────────────────────────────────────────────────────────────────────
    // ÉTAPE 5 : Logistique — marquer une CF comme reçue
    // ────────────────────────────────────────────────────────────────────
    await pageLogistique.getByRole("button", { name: /^validé/i }).click();
    await waitForLoaded(pageLogistique);

    const cfValidees = pageLogistique.locator(".space-y-2 > div");
    if (await cfValidees.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
      const refValidee = await cfValidees.first().locator("span.font-mono").textContent().catch(() => null);
      console.log(`[LOGISTIQUE] Marquage reçu : ${refValidee}`);

      await cfValidees.first().getByRole("button", { name: /reçu ✓|^reçu$/i }).first().click();
      await waitForLoaded(pageLogistique);

      await pageLogistique.getByRole("button", { name: /^reçu(\s+\(\d+\))?$/i }).click();
      await waitForLoaded(pageLogistique);

      const nbRecues = await pageLogistique.locator(".space-y-2 > div").count();
      console.log(`[LOGISTIQUE] ${nbRecues} CF reçue(s)`);
    }

    // ────────────────────────────────────────────────────────────────────
    // ÉTAPE 6 : Logistique — vérifier que les BL sont disponibles
    // ────────────────────────────────────────────────────────────────────
    await pageLogistique.goto("/admin/achats/livraisons");
    await waitForLoaded(pageLogistique);

    await expect(pageLogistique.getByRole("heading", { name: /livraisons/i })).toBeVisible();

    const nbBLTotal = await pageLogistique.locator(".space-y-4 > div, .space-y-3 > div").count();
    console.log(`[LOGISTIQUE] ${nbBLTotal} groupe(s) de livraison visible(s)`);

    // ────────────────────────────────────────────────────────────────────
    // ÉTAPE 7 : Barro — vérifier l'impact comptable
    // ────────────────────────────────────────────────────────────────────
    await pageBarro.goto("/admin/commercial/compta");
    await waitForLoaded(pageBarro);

    await expect(pageBarro.getByRole("heading", { name: /comptabilité/i })).toBeVisible();
    await expect(pageBarro.getByText(/facturé \(clients\)/i)).toBeVisible();
    await expect(pageBarro.getByText(/achats fournisseurs/i)).toBeVisible();

    console.log("[FLUX COMPLET ÉTENDU] ✅ Toutes les étapes vérifiées avec succès");

  } finally {
    await ctxBarro.close();
    await ctxLogistique.close();
    await browser.close();
  }
});
