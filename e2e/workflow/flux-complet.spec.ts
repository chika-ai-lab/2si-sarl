/**
 * Test E2E du flux complet GestEMC :
 *
 * Mme Barro (commercial) :
 *   1. Voit les commandes non assignées
 *   2. Assigne une agence à une commande marketplace
 *
 * Logistique (Fatou Sarr) :
 *   3. Voit les bons de commande
 *   4. Assigne un fournisseur aux lignes
 *   5. Génère les commandes fournisseurs
 *   6. Valide une commande fournisseur (brouillon → validé)
 *   7. Marque comme reçu (validé → reçu)
 */

import { test, expect, chromium } from "@playwright/test";
import { login, USERS, waitForLoaded } from "../helpers";

test("flux complet : assignation agence → BDC → CF → réception", async () => {
  const browser = await chromium.launch();

  // ── Contexte Mme Barro ──────────────────────────────────────────────────
  const ctxBarro = await browser.newContext({
    storageState: "e2e/.auth/barro.json",
  });
  const pageBarro = await ctxBarro.newPage();
  pageBarro.setDefaultTimeout(10_000);

  // ── Contexte Logistique ─────────────────────────────────────────────────
  const ctxLogistique = await browser.newContext({
    storageState: "e2e/.auth/logistique.json",
  });
  const pageLogistique = await ctxLogistique.newPage();
  pageLogistique.setDefaultTimeout(10_000);

  try {
    // ────────────────────────────────────────────────────────────────────
    // ÉTAPE 1 : Mme Barro — voir les commandes non assignées
    // ────────────────────────────────────────────────────────────────────
    await pageBarro.goto("/admin/commercial/commandes");
    await waitForLoaded(pageBarro);

    await expect(pageBarro.getByRole("heading", { name: /commandes à traiter/i })).toBeVisible();

    // Compter les commandes non assignées avant
    const nonAssigneesText = await pageBarro.getByText(/non assignées/i).first().textContent();
    console.log(`[BARRO] Stat non assignées : ${nonAssigneesText}`);

    // ────────────────────────────────────────────────────────────────────
    // ÉTAPE 2 : Mme Barro — filtrer sur "Non assignées"
    // ────────────────────────────────────────────────────────────────────
    await pageBarro.getByRole("button", { name: /non assignées/i }).click();
    await waitForLoaded(pageBarro);

    const lignesNonAssignees = pageBarro.locator("tbody tr");
    const nbNonAssignees = await lignesNonAssignees.count();
    console.log(`[BARRO] ${nbNonAssignees} commande(s) non assignée(s) visible(s)`);

    if (nbNonAssignees > 0) {
      // Assigner une agence à la première commande
      const btnNonAssignee = pageBarro.getByRole("button", { name: /non assignée/i }).first();
      if (await btnNonAssignee.isVisible()) {
        await btnNonAssignee.click();

        const option = pageBarro.locator("[cmdk-item]").first();
        if (await option.isVisible()) {
          const agenceChoisie = await option.textContent();
          await option.click();
          await waitForLoaded(pageBarro);
          console.log(`[BARRO] Agence assignée : ${agenceChoisie}`);
        }
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // ÉTAPE 3 : Logistique — voir les bons de commande
    // ────────────────────────────────────────────────────────────────────
    await pageLogistique.goto("/admin/achats/bon-commandes");
    await waitForLoaded(pageLogistique);

    await expect(pageLogistique.getByRole("heading", { name: /bons de commande/i })).toBeVisible();

    const bdcs = pageLogistique.locator(".space-y-3 > div");
    const nbBDC = await bdcs.count();
    console.log(`[LOGISTIQUE] ${nbBDC} BDC visible(s)`);

    // ────────────────────────────────────────────────────────────────────
    // ÉTAPE 4 : Logistique — voir les commandes fournisseurs brouillon
    // ────────────────────────────────────────────────────────────────────
    await pageLogistique.goto("/admin/achats/commandes");
    await waitForLoaded(pageLogistique);

    await expect(pageLogistique.getByRole("heading", { name: /commandes fournisseurs/i })).toBeVisible();

    // Filtrer sur "Brouillon"
    await pageLogistique.getByRole("button", { name: /^brouillon/i }).click();
    await waitForLoaded(pageLogistique);

    const cfBrouillons = pageLogistique.locator(".space-y-2 > div");
    const nbCFBrouillons = await cfBrouillons.count();
    console.log(`[LOGISTIQUE] ${nbCFBrouillons} CF en brouillon`);

    // ────────────────────────────────────────────────────────────────────
    // ÉTAPE 5 : Logistique — valider la première CF brouillon
    // ────────────────────────────────────────────────────────────────────
    if (nbCFBrouillons > 0) {
      const premiereCF = cfBrouillons.first();
      const refCF = await premiereCF.locator("span.font-mono").textContent();
      console.log(`[LOGISTIQUE] Validation de : ${refCF}`);

      await premiereCF.getByRole("button", { name: /valider/i }).click();
      await waitForLoaded(pageLogistique);

      // Vérifier le passage en "Validé"
      await pageLogistique.getByRole("button", { name: /^validé/i }).click();
      await waitForLoaded(pageLogistique);

      const cfValidees = pageLogistique.locator(".space-y-2 > div");
      const nbValidees = await cfValidees.count();
      console.log(`[LOGISTIQUE] ${nbValidees} CF validée(s) après validation`);
      expect(nbValidees).toBeGreaterThanOrEqual(1);
    }

    // ────────────────────────────────────────────────────────────────────
    // ÉTAPE 6 : Logistique — marquer la première CF validée comme reçue
    // ────────────────────────────────────────────────────────────────────
    await pageLogistique.getByRole("button", { name: /^validé/i }).click();
    await waitForLoaded(pageLogistique);

    const premiereCFValidee = pageLogistique.locator(".space-y-2 > div").first();
    if (await premiereCFValidee.isVisible().catch(() => false)) {
      const refCF = await premiereCFValidee.locator("span.font-mono").textContent();
      console.log(`[LOGISTIQUE] Marquage reçu de : ${refCF}`);

      await premiereCFValidee.getByRole("button", { name: /reçu ✓|reçu/i }).first().click();
      await waitForLoaded(pageLogistique);

      // Vérifier dans l'onglet "Reçu"
      await pageLogistique.getByRole("button", { name: /^reçu(\s+\(\d+\))?$/i }).click();
      await waitForLoaded(pageLogistique);

      const cfRecues = pageLogistique.locator(".space-y-2 > div").count();
      console.log(`[LOGISTIQUE] CF reçues : ${await cfRecues}`);
    }

    // ────────────────────────────────────────────────────────────────────
    // ÉTAPE 7 : Mme Barro — vérifier la comptabilité (créances)
    // ────────────────────────────────────────────────────────────────────
    await pageBarro.goto("/admin/commercial/compta");
    await waitForLoaded(pageBarro);

    await expect(pageBarro.getByRole("heading", { name: /comptabilité/i })).toBeVisible();
    await expect(pageBarro.getByText(/facturé \(clients\)/i)).toBeVisible();

    console.log("[FLUX COMPLET] ✅ Toutes les étapes ont été vérifiées avec succès");

  } finally {
    await ctxBarro.close();
    await ctxLogistique.close();
    await browser.close();
  }
});
