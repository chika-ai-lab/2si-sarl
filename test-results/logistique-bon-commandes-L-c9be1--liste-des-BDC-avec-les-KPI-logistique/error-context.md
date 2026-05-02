# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: logistique\bon-commandes.spec.ts >> Logistique — Bons de Commande >> affiche la liste des BDC avec les KPI
- Location: e2e\logistique\bon-commandes.spec.ts:6:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/en cours/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/en cours/i)

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
            - img [ref=e29]
            - generic [ref=e32]: Bons de Commande
          - link "Commandes Fournisseurs" [ref=e33] [cursor=pointer]:
            - /url: /admin/achats/commandes
            - img [ref=e34]
            - generic [ref=e38]: Commandes Fournisseurs
          - link "Livraisons" [ref=e39] [cursor=pointer]:
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
              - heading "Bons de Commande" [level=1] [ref=e91]:
                - img [ref=e92]
                - text: Bons de Commande
              - paragraph [ref=e95]: Regroupement des commandes par agence — assignation fournisseurs et génération des achats
            - button "Actualiser" [ref=e96] [cursor=pointer]:
              - img
              - text: Actualiser
          - generic [ref=e97]:
            - generic [ref=e99]:
              - img [ref=e100]
              - generic [ref=e103]:
                - paragraph [ref=e104]: "15"
                - paragraph [ref=e105]: Total BDC
            - generic [ref=e107]:
              - img [ref=e108]
              - generic [ref=e111]:
                - paragraph [ref=e112]: "15"
                - paragraph [ref=e113]: Transmis
            - generic [ref=e115]:
              - img [ref=e116]
              - generic [ref=e119]:
                - paragraph [ref=e120]: "0"
                - paragraph [ref=e121]: Terminés
          - generic [ref=e122]:
            - generic [ref=e124] [cursor=pointer]:
              - generic [ref=e125]:
                - img [ref=e126]
                - generic [ref=e128]:
                  - paragraph [ref=e129]: BDC-120013
                  - paragraph [ref=e130]: 2026-05-01 · 10 ligne(s) · 24 500 000 FCFA
              - generic [ref=e131]:
                - generic [ref=e132]: 10/10 fournisseurs assignés
                - img [ref=e133]
                - generic [ref=e136]: Transmis
            - generic [ref=e138] [cursor=pointer]:
              - generic [ref=e139]:
                - img [ref=e140]
                - generic [ref=e142]:
                  - paragraph [ref=e143]: BDC-120010
                  - paragraph [ref=e144]: 2026-05-01 · 1 ligne(s) · 2 169 000 FCFA
              - generic [ref=e145]:
                - generic [ref=e146]: 1/1 fournisseurs assignés
                - img [ref=e147]
                - generic [ref=e150]: Transmis
            - generic [ref=e152] [cursor=pointer]:
              - generic [ref=e153]:
                - img [ref=e154]
                - generic [ref=e156]:
                  - paragraph [ref=e157]: BDC-120009
                  - paragraph [ref=e158]: 2026-05-01 · 1 ligne(s) · 2 500 000 FCFA
              - generic [ref=e159]:
                - generic [ref=e160]: 1/1 fournisseurs assignés
                - img [ref=e161]
                - generic [ref=e164]: Transmis
            - generic [ref=e166] [cursor=pointer]:
              - generic [ref=e167]:
                - img [ref=e168]
                - generic [ref=e170]:
                  - paragraph [ref=e171]: BDC-120008
                  - paragraph [ref=e172]: 2026-05-01 · 3 ligne(s) · 14 800 000 FCFA
              - generic [ref=e173]:
                - generic [ref=e174]: 3/3 fournisseurs assignés
                - img [ref=e175]
                - generic [ref=e178]: Transmis
            - generic [ref=e180] [cursor=pointer]:
              - generic [ref=e181]:
                - img [ref=e182]
                - generic [ref=e184]:
                  - paragraph [ref=e185]: BDC-90009
                  - paragraph [ref=e186]: 2026-05-01 · 1 ligne(s) · 2 500 000 FCFA
              - generic [ref=e187]:
                - generic [ref=e188]: 0/1 fournisseurs assignés
                - img [ref=e189]
                - generic [ref=e191]: Transmis
            - generic [ref=e193] [cursor=pointer]:
              - generic [ref=e194]:
                - img [ref=e195]
                - generic [ref=e197]:
                  - paragraph [ref=e198]: BDC-90008
                  - paragraph [ref=e199]: 2026-05-01 · 2 ligne(s) · 12 800 000 FCFA
              - generic [ref=e200]:
                - generic [ref=e201]: 2/2 fournisseurs assignés
                - img [ref=e202]
                - generic [ref=e205]: Transmis
            - generic [ref=e207] [cursor=pointer]:
              - generic [ref=e208]:
                - img [ref=e209]
                - generic [ref=e211]:
                  - paragraph [ref=e212]: BDC-60010
                  - paragraph [ref=e213]: 2026-05-01 · 2 ligne(s) · 5 969 000 FCFA
              - generic [ref=e214]:
                - generic [ref=e215]: 2/2 fournisseurs assignés
                - img [ref=e216]
                - generic [ref=e219]: Transmis
            - generic [ref=e221] [cursor=pointer]:
              - generic [ref=e222]:
                - img [ref=e223]
                - generic [ref=e225]:
                  - paragraph [ref=e226]: BDC-60009
                  - paragraph [ref=e227]: 2026-05-01 · 1 ligne(s) · 2 500 000 FCFA
              - generic [ref=e228]:
                - generic [ref=e229]: 0/1 fournisseurs assignés
                - img [ref=e230]
                - generic [ref=e232]: Transmis
            - generic [ref=e234] [cursor=pointer]:
              - generic [ref=e235]:
                - img [ref=e236]
                - generic [ref=e238]:
                  - paragraph [ref=e239]: BDC-60008
                  - paragraph [ref=e240]: 2026-05-01 · 5 ligne(s) · 18 800 000 FCFA
              - generic [ref=e241]:
                - generic [ref=e242]: 5/5 fournisseurs assignés
                - img [ref=e243]
                - generic [ref=e246]: Transmis
            - generic [ref=e248] [cursor=pointer]:
              - generic [ref=e249]:
                - img [ref=e250]
                - generic [ref=e252]:
                  - paragraph [ref=e253]: BDC-30009
                  - paragraph [ref=e254]: 2026-05-01 · 1 ligne(s) · 2 500 000 FCFA
              - generic [ref=e255]:
                - generic [ref=e256]: 1/1 fournisseurs assignés
                - img [ref=e257]
                - generic [ref=e260]: Transmis
            - generic [ref=e262] [cursor=pointer]:
              - generic [ref=e263]:
                - img [ref=e264]
                - generic [ref=e266]:
                  - paragraph [ref=e267]: BDC-30008
                  - paragraph [ref=e268]: 2026-05-01 · 1 ligne(s) · 10 800 000 FCFA
              - generic [ref=e269]:
                - generic [ref=e270]: 1/1 fournisseurs assignés
                - img [ref=e271]
                - generic [ref=e274]: Transmis
            - generic [ref=e276] [cursor=pointer]:
              - generic [ref=e277]:
                - img [ref=e278]
                - generic [ref=e280]:
                  - paragraph [ref=e281]: BDC-9
                  - paragraph [ref=e282]: 2026-05-01 · 3 ligne(s) · 14 800 000 FCFA
              - generic [ref=e283]:
                - generic [ref=e284]: 0/3 fournisseurs assignés
                - img [ref=e285]
                - generic [ref=e287]: Transmis
            - generic [ref=e289] [cursor=pointer]:
              - generic [ref=e290]:
                - img [ref=e291]
                - generic [ref=e293]:
                  - paragraph [ref=e294]: BDC-8
                  - paragraph [ref=e295]: 2026-05-01 · 3 ligne(s) · 14 800 000 FCFA
              - generic [ref=e296]:
                - generic [ref=e297]: 0/3 fournisseurs assignés
                - img [ref=e298]
                - generic [ref=e300]: Transmis
            - generic [ref=e302] [cursor=pointer]:
              - generic [ref=e303]:
                - img [ref=e304]
                - generic [ref=e306]:
                  - paragraph [ref=e307]: BDC-2025-002
                  - paragraph [ref=e308]: 2025-03-22 · 3 ligne(s) · 3 250 000 FCFA
              - generic [ref=e309]:
                - generic [ref=e310]: 3/3 fournisseurs assignés
                - img [ref=e311]
                - generic [ref=e314]: Transmis
            - generic [ref=e316] [cursor=pointer]:
              - generic [ref=e317]:
                - img [ref=e318]
                - generic [ref=e320]:
                  - paragraph [ref=e321]: BDC-2025-001
                  - paragraph [ref=e322]: 2025-03-15 · 6 ligne(s) · 3 335 000 FCFA
              - generic [ref=e323]:
                - generic [ref=e324]: 6/6 fournisseurs assignés
                - img [ref=e325]
                - generic [ref=e328]: Transmis
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { navigateTo, waitForLoaded } from "../helpers";
  3  | 
  4  | test.describe("Logistique — Bons de Commande", () => {
  5  | 
  6  |   test("affiche la liste des BDC avec les KPI", async ({ page }) => {
  7  |     await navigateTo(page, "/admin/achats/bon-commandes");
  8  |     await waitForLoaded(page);
  9  | 
  10 |     await expect(page.getByRole("heading", { name: /bons de commande/i })).toBeVisible();
  11 | 
  12 |     // KPI cards
  13 |     await expect(page.getByText(/total bdc/i)).toBeVisible();
> 14 |     await expect(page.getByText(/en cours/i)).toBeVisible();
     |                                               ^ Error: expect(locator).toBeVisible() failed
  15 |     await expect(page.getByText(/transmis/i).first()).toBeVisible();
  16 |     await expect(page.getByText(/terminés/i)).toBeVisible();
  17 |   });
  18 | 
  19 |   test("un BDC peut être ouvert (accordéon) pour voir ses lignes", async ({ page }) => {
  20 |     await navigateTo(page, "/admin/achats/bon-commandes");
  21 |     await waitForLoaded(page);
  22 | 
  23 |     const premierBDC = page.locator(".space-y-3 > div").first();
  24 |     if (!await premierBDC.isVisible().catch(() => false)) {
  25 |       test.skip();
  26 |       return;
  27 |     }
  28 | 
  29 |     // Clic pour ouvrir
  30 |     await premierBDC.locator(".cursor-pointer").first().click();
  31 |     await page.waitForTimeout(500);
  32 | 
  33 |     // Le tableau de lignes doit apparaître avec les colonnes attendues
  34 |     await expect(premierBDC.getByText(/client/i)).toBeVisible();
  35 |     await expect(premierBDC.getByText(/produit/i)).toBeVisible();
  36 |     await expect(premierBDC.getByText(/fournisseur/i).first()).toBeVisible();
  37 |   });
  38 | 
  39 |   test("assigner un fournisseur à une ligne BDC", async ({ page }) => {
  40 |     await navigateTo(page, "/admin/achats/bon-commandes");
  41 |     await waitForLoaded(page);
  42 | 
  43 |     const premierBDC = page.locator(".space-y-3 > div").first();
  44 |     if (!await premierBDC.isVisible().catch(() => false)) test.skip();
  45 | 
  46 |     await premierBDC.locator(".cursor-pointer").first().click();
  47 |     await page.waitForTimeout(500);
  48 | 
  49 |     // Chercher le sélecteur de fournisseur sur la première ligne
  50 |     const selectFourn = premierBDC.getByRole("combobox").first();
  51 |     if (!await selectFourn.isVisible().catch(() => false)) test.skip();
  52 | 
  53 |     await selectFourn.click();
  54 | 
  55 |     // Le popover de sélection fournisseur s'ouvre
  56 |     const premiereOption = page.locator("[cmdk-item]").first();
  57 |     if (await premiereOption.isVisible()) {
  58 |       await premiereOption.click();
  59 |       await waitForLoaded(page);
  60 |     }
  61 |   });
  62 | 
  63 |   test("le bouton 'Sauvegarder assignations' est présent dans le détail", async ({ page }) => {
  64 |     await navigateTo(page, "/admin/achats/bon-commandes");
  65 |     await waitForLoaded(page);
  66 | 
  67 |     const premierBDC = page.locator(".space-y-3 > div").first();
  68 |     if (!await premierBDC.isVisible().catch(() => false)) test.skip();
  69 | 
  70 |     await premierBDC.locator(".cursor-pointer").first().click();
  71 |     await page.waitForTimeout(500);
  72 | 
  73 |     await expect(premierBDC.getByRole("button", { name: /sauvegarder assignations/i })).toBeVisible();
  74 |   });
  75 | 
  76 |   test("le bouton 'Générer Commandes Fournisseurs' est présent", async ({ page }) => {
  77 |     await navigateTo(page, "/admin/achats/bon-commandes");
  78 |     await waitForLoaded(page);
  79 | 
  80 |     const premierBDC = page.locator(".space-y-3 > div").first();
  81 |     if (!await premierBDC.isVisible().catch(() => false)) test.skip();
  82 | 
  83 |     await premierBDC.locator(".cursor-pointer").first().click();
  84 |     await page.waitForTimeout(500);
  85 | 
  86 |     await expect(
  87 |       premierBDC.getByRole("button", { name: /générer commandes fournisseurs|déjà transmis/i })
  88 |     ).toBeVisible();
  89 |   });
  90 | });
  91 | 
```