# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: logistique\livraisons.spec.ts >> Logistique — Livraisons >> un groupe BDC peut être expandé pour voir les BL
- Location: e2e\logistique\livraisons.spec.ts:57:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/n° bl/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/n° bl/i).first()

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - link "Logo 2SI.Sarl Logistique" [ref=e6] [cursor=pointer]:
          - /url: /
          - img "Logo" [ref=e8]
          - generic [ref=e10]:
            - generic [ref=e11]: 2SI.Sarl
            - generic [ref=e12]: Logistique
        - button [ref=e13] [cursor=pointer]:
          - img [ref=e14]
      - navigation [ref=e17]:
        - link "Tableau de Bord" [ref=e19] [cursor=pointer]:
          - /url: /admin
          - img [ref=e20]
          - generic [ref=e25]: Tableau de Bord
        - generic [ref=e26]:
          - link "Bons de Commande" [ref=e27] [cursor=pointer]:
            - /url: /admin/achats/bon-commandes
            - img [ref=e28]
            - generic [ref=e31]: Bons de Commande
          - link "Commandes Fournisseurs" [ref=e32] [cursor=pointer]:
            - /url: /admin/achats/commandes
            - img [ref=e33]
            - generic [ref=e37]: Commandes Fournisseurs
          - link "Livraisons" [ref=e38] [cursor=pointer]:
            - /url: /admin/achats/livraisons
            - img [ref=e40]
            - generic [ref=e45]: Livraisons
          - link "Catalogue" [ref=e46] [cursor=pointer]:
            - /url: /admin/commercial/catalogue
            - img [ref=e47]
            - generic [ref=e49]: Catalogue
          - link "Fournisseurs" [ref=e50] [cursor=pointer]:
            - /url: /admin/achats/fournisseurs
            - img [ref=e51]
            - generic [ref=e55]: Fournisseurs
          - link "Clients" [ref=e56] [cursor=pointer]:
            - /url: /admin/commercial/clients
            - img [ref=e57]
            - generic [ref=e62]: Clients
          - link "SAV" [ref=e63] [cursor=pointer]:
            - /url: /admin/commercial/sav
            - img [ref=e64]
            - generic [ref=e66]: SAV
      - generic [ref=e67]:
        - link "Retour au site" [ref=e68] [cursor=pointer]:
          - /url: /
          - img [ref=e69]
          - generic [ref=e72]: Retour au site
        - button "Déconnexion" [ref=e73] [cursor=pointer]:
          - img [ref=e74]
          - generic [ref=e77]: Déconnexion
    - generic [ref=e78]:
      - banner [ref=e79]:
        - generic [ref=e80]:
          - generic [ref=e81]:
            - heading "2SI.Sarl" [level=1] [ref=e82]
            - paragraph [ref=e83]: Logistique • 3 modules actifs
          - button "Fatou Sarr" [ref=e85] [cursor=pointer]:
            - img
            - generic [ref=e86]: Fatou Sarr
      - main [ref=e87]:
        - generic [ref=e88]:
          - generic [ref=e89]:
            - generic [ref=e90]:
              - heading "Livraisons" [level=1] [ref=e91]:
                - img [ref=e92]
                - text: Livraisons
              - paragraph [ref=e97]: 0 en attente · 0 en cours · 7 livrés
            - button "Actualiser" [ref=e98] [cursor=pointer]:
              - img
              - text: Actualiser
          - generic [ref=e99]:
            - generic [ref=e101] [cursor=pointer]:
              - img [ref=e102]
              - generic [ref=e105]:
                - paragraph [ref=e106]: "0"
                - paragraph [ref=e107]: En attente
            - generic [ref=e109] [cursor=pointer]:
              - img [ref=e110]
              - generic [ref=e115]:
                - paragraph [ref=e116]: "0"
                - paragraph [ref=e117]: En cours
            - generic [ref=e119] [cursor=pointer]:
              - img [ref=e120]
              - generic [ref=e123]:
                - paragraph [ref=e124]: "7"
                - paragraph [ref=e125]: Livrés
          - generic [ref=e126]:
            - generic [ref=e127]:
              - button "Tous(8)" [ref=e128] [cursor=pointer]:
                - text: Tous
                - generic [ref=e129]: (8)
              - button "En attente" [ref=e130] [cursor=pointer]
              - button "En cours" [ref=e131] [cursor=pointer]
              - button "Livrés(7)" [ref=e132] [cursor=pointer]:
                - text: Livrés
                - generic [ref=e133]: (7)
            - generic [ref=e134]:
              - img [ref=e135]
              - textbox "BDC, client, référence…" [ref=e138]
          - generic [ref=e140]:
            - img [ref=e141]
            - text: Aucun bordereau de livraison
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { navigateTo, waitForLoaded } from "../helpers";
  3   | 
  4   | test.describe("Logistique — Livraisons", () => {
  5   | 
  6   |   test("affiche le titre et les 3 KPI cards", async ({ page }) => {
  7   |     await navigateTo(page, "/admin/achats/livraisons");
  8   |     await waitForLoaded(page);
  9   | 
  10  |     await expect(page.getByRole("heading", { name: /livraisons/i })).toBeVisible();
  11  | 
  12  |     await expect(page.getByText(/en attente/i).first()).toBeVisible();
  13  |     await expect(page.getByText(/en cours/i).first()).toBeVisible();
  14  |     await expect(page.getByText(/livrés/i).first()).toBeVisible();
  15  |   });
  16  | 
  17  |   test("affiche les tabs de filtrage", async ({ page }) => {
  18  |     await navigateTo(page, "/admin/achats/livraisons");
  19  |     await waitForLoaded(page);
  20  | 
  21  |     await expect(page.getByRole("button", { name: /^tous/i }).first()).toBeVisible();
  22  |     await expect(page.getByRole("button", { name: /en attente/i }).first()).toBeVisible();
  23  |     await expect(page.getByRole("button", { name: /en cours/i }).first()).toBeVisible();
  24  |     await expect(page.getByRole("button", { name: /livrés/i }).first()).toBeVisible();
  25  |   });
  26  | 
  27  |   test("la recherche filtre les livraisons", async ({ page }) => {
  28  |     await navigateTo(page, "/admin/achats/livraisons");
  29  |     await waitForLoaded(page);
  30  | 
  31  |     const input = page.getByPlaceholder(/bdc, client, référence/i);
  32  |     await expect(input).toBeVisible();
  33  | 
  34  |     await input.fill("BDC");
  35  |     await page.waitForTimeout(400);
  36  | 
  37  |     // La page ne doit pas crasher
  38  |     await expect(page.getByRole("heading", { name: /livraisons/i })).toBeVisible();
  39  |     await input.clear();
  40  |   });
  41  | 
  42  |   test("le tab 'En attente' filtre les BL en attente", async ({ page }) => {
  43  |     await navigateTo(page, "/admin/achats/livraisons");
  44  |     await waitForLoaded(page);
  45  | 
  46  |     await page.getByRole("button", { name: /en attente/i }).first().click();
  47  |     await waitForLoaded(page);
  48  | 
  49  |     const groupes = page.locator(".space-y-4 > div, .space-y-3 > div").first();
  50  |     const hasData = await groupes.isVisible({ timeout: 3_000 }).catch(() => false);
  51  |     if (!hasData) {
  52  |       // Pas de livraisons en attente — vérifier l'état vide
  53  |       await expect(page.getByText(/aucune livraison/i)).toBeVisible();
  54  |     }
  55  |   });
  56  | 
  57  |   test("un groupe BDC peut être expandé pour voir les BL", async ({ page }) => {
  58  |     await navigateTo(page, "/admin/achats/livraisons");
  59  |     await waitForLoaded(page);
  60  | 
  61  |     // Trouver le premier groupe de livraison
  62  |     const premierGroupe = page.locator(".cursor-pointer").first();
  63  |     const hasGroupe = await premierGroupe.isVisible({ timeout: 3_000 }).catch(() => false);
  64  |     if (!hasGroupe) test.skip();
  65  | 
  66  |     await premierGroupe.click();
  67  |     await page.waitForTimeout(500);
  68  | 
  69  |     // Les colonnes du tableau interne doivent apparaître
> 70  |     await expect(page.getByText(/n° bl/i).first()).toBeVisible();
      |                                                    ^ Error: expect(locator).toBeVisible() failed
  71  |     await expect(page.getByText(/client/i).first()).toBeVisible();
  72  |     await expect(page.getByText(/statut/i).first()).toBeVisible();
  73  |   });
  74  | 
  75  |   test("transition En attente → En cours sur un BL", async ({ page }) => {
  76  |     await navigateTo(page, "/admin/achats/livraisons");
  77  |     await waitForLoaded(page);
  78  | 
  79  |     await page.getByRole("button", { name: /en attente/i }).first().click();
  80  |     await waitForLoaded(page);
  81  | 
  82  |     // Ouvrir le premier groupe
  83  |     const premierGroupe = page.locator(".cursor-pointer").first();
  84  |     const hasGroupe = await premierGroupe.isVisible({ timeout: 3_000 }).catch(() => false);
  85  |     if (!hasGroupe) test.skip();
  86  | 
  87  |     await premierGroupe.click();
  88  |     await page.waitForTimeout(500);
  89  | 
  90  |     // Trouver le bouton "En cours" sur la première ligne de BL
  91  |     const btnEnCours = page.getByRole("button", { name: /^en cours$/i }).first();
  92  |     const hasBtnEnCours = await btnEnCours.isVisible({ timeout: 3_000 }).catch(() => false);
  93  |     if (!hasBtnEnCours) test.skip();
  94  | 
  95  |     await btnEnCours.click();
  96  |     await waitForLoaded(page);
  97  | 
  98  |     // Toast ou changement de statut visible
  99  |     const toast = page.locator("[data-sonner-toast], [role='status']").first();
  100 |     await expect(toast).toBeVisible({ timeout: 5_000 }).catch(() => {
  101 |       // Certaines implémentations ne montrent pas de toast — acceptable
  102 |     });
  103 |   });
  104 | 
  105 |   test("transition En cours → Livré sur un BL", async ({ page }) => {
  106 |     await navigateTo(page, "/admin/achats/livraisons");
  107 |     await waitForLoaded(page);
  108 | 
  109 |     await page.getByRole("button", { name: /^en cours$/i }).first().click();
  110 |     await waitForLoaded(page);
  111 | 
  112 |     const premierGroupe = page.locator(".cursor-pointer").first();
  113 |     const hasGroupe = await premierGroupe.isVisible({ timeout: 3_000 }).catch(() => false);
  114 |     if (!hasGroupe) test.skip();
  115 | 
  116 |     await premierGroupe.click();
  117 |     await page.waitForTimeout(500);
  118 | 
  119 |     const btnLivre = page.getByRole("button", { name: /^livré$/i }).first();
  120 |     const hasBtnLivre = await btnLivre.isVisible({ timeout: 3_000 }).catch(() => false);
  121 |     if (!hasBtnLivre) test.skip();
  122 | 
  123 |     await btnLivre.click();
  124 |     await waitForLoaded(page);
  125 | 
  126 |     // Vérifier que le statut a changé dans l'onglet Livrés
  127 |     await page.getByRole("button", { name: /livrés/i }).first().click();
  128 |     await waitForLoaded(page);
  129 | 
  130 |     const livraisonsList = page.locator(".space-y-4 > div, .space-y-3 > div");
  131 |     expect(await livraisonsList.count()).toBeGreaterThanOrEqual(1);
  132 |   });
  133 | 
  134 |   test("le bouton Fiche ouvre le dialog d'impression BL", async ({ page }) => {
  135 |     await navigateTo(page, "/admin/achats/livraisons");
  136 |     await waitForLoaded(page);
  137 | 
  138 |     // Ouvrir un groupe
  139 |     const premierGroupe = page.locator(".cursor-pointer").first();
  140 |     const hasGroupe = await premierGroupe.isVisible({ timeout: 3_000 }).catch(() => false);
  141 |     if (!hasGroupe) test.skip();
  142 | 
  143 |     await premierGroupe.click();
  144 |     await page.waitForTimeout(500);
  145 | 
  146 |     const btnFiche = page.getByRole("button", { name: /fiche/i }).first();
  147 |     const hasFiche = await btnFiche.isVisible({ timeout: 3_000 }).catch(() => false);
  148 |     if (!hasFiche) test.skip();
  149 | 
  150 |     await btnFiche.click();
  151 |     await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });
  152 | 
  153 |     // Fermer le dialog
  154 |     await page.keyboard.press("Escape");
  155 |     await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3_000 });
  156 |   });
  157 | 
  158 |   test("le bouton 'Tout imprimer' est présent dans l'en-tête d'un groupe", async ({ page }) => {
  159 |     await navigateTo(page, "/admin/achats/livraisons");
  160 |     await waitForLoaded(page);
  161 | 
  162 |     const btnToutImprimer = page.getByRole("button", { name: /tout imprimer/i }).first();
  163 |     const hasBtn = await btnToutImprimer.isVisible({ timeout: 3_000 }).catch(() => false);
  164 |     if (!hasBtn) test.skip();
  165 | 
  166 |     await expect(btnToutImprimer).toBeVisible();
  167 |   });
  168 | 
  169 |   test("le bouton Actualiser recharge la liste", async ({ page }) => {
  170 |     await navigateTo(page, "/admin/achats/livraisons");
```