# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: logistique\bon-commandes.spec.ts >> Logistique — Bons de Commande >> un BDC peut être ouvert (accordéon) pour voir ses lignes
- Location: e2e\logistique\bon-commandes.spec.ts:19:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.space-y-3 > div').first().getByText(/client/i)
Expected: visible
Error: strict mode violation: locator('.space-y-3 > div').first().getByText(/client/i) resolved to 11 elements:
    1) <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Client</th> aka getByRole('columnheader', { name: 'Client' })
    2) <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">Client #53</td> aka getByRole('cell', { name: 'Client #53' })
    3) <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">Client #50</td> aka getByRole('cell', { name: 'Client #50' })
    4) <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">Client #57</td> aka getByRole('cell', { name: 'Client #57' })
    5) <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">Client #56</td> aka getByRole('cell', { name: 'Client #56' })
    6) <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">Client #55</td> aka getByRole('cell', { name: 'Client #55' })
    7) <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">Client #54</td> aka getByRole('cell', { name: 'Client #54' })
    8) <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">Client #49</td> aka getByRole('cell', { name: 'Client #49' })
    9) <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">Client #52</td> aka getByRole('cell', { name: 'Client #52' })
    10) <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">Client #51</td> aka getByRole('cell', { name: 'Client #51' })
    ...

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.space-y-3 > div').first().getByText(/client/i)

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
            - generic [ref=e123]:
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
              - generic [ref=e138]:
                - table [ref=e141]:
                  - rowgroup [ref=e142]:
                    - row "Client Produit / Référence Qté Prix Adresse livraison Fournisseur" [ref=e143]:
                      - columnheader "Client" [ref=e144]
                      - columnheader "Produit / Référence" [ref=e145]
                      - columnheader "Qté" [ref=e146]
                      - columnheader "Prix" [ref=e147]
                      - columnheader "Adresse livraison" [ref=e148]
                      - columnheader "Fournisseur" [ref=e149]
                  - rowgroup [ref=e150]:
                    - 'row "Client #53 1 1 4 600 000 FCFA —" [ref=e151]':
                      - 'cell "Client #53" [ref=e152]'
                      - cell "1" [ref=e153]
                      - cell "1" [ref=e154]
                      - cell "4 600 000 FCFA" [ref=e155]
                      - cell "—" [ref=e156]
                      - cell [ref=e157]:
                        - combobox [ref=e158] [cursor=pointer]:
                          - generic [ref=e159]: Hager Group Afrique
                          - img
                    - 'row "Client #50 1 1 2 300 000 FCFA —" [ref=e160]':
                      - 'cell "Client #50" [ref=e161]'
                      - cell "1" [ref=e162]
                      - cell "1" [ref=e163]
                      - cell "2 300 000 FCFA" [ref=e164]
                      - cell "—" [ref=e165]
                      - cell [ref=e166]:
                        - combobox [ref=e167] [cursor=pointer]:
                          - generic [ref=e168]: Legrand Senegal
                          - img
                    - 'row "Client #57 1 1 2 300 000 FCFA —" [ref=e169]':
                      - 'cell "Client #57" [ref=e170]'
                      - cell "1" [ref=e171]
                      - cell "1" [ref=e172]
                      - cell "2 300 000 FCFA" [ref=e173]
                      - cell "—" [ref=e174]
                      - cell [ref=e175]:
                        - combobox [ref=e176] [cursor=pointer]:
                          - generic [ref=e177]: Chint Electric Co.
                          - img
                    - 'row "Client #56 1 1 2 300 000 FCFA —" [ref=e178]':
                      - 'cell "Client #56" [ref=e179]'
                      - cell "1" [ref=e180]
                      - cell "1" [ref=e181]
                      - cell "2 300 000 FCFA" [ref=e182]
                      - cell "—" [ref=e183]
                      - cell [ref=e184]:
                        - combobox [ref=e185] [cursor=pointer]:
                          - generic [ref=e186]: Chint Electric Co.
                          - img
                    - 'row "Client #55 1 1 1 500 000 FCFA —" [ref=e187]':
                      - 'cell "Client #55" [ref=e188]'
                      - cell "1" [ref=e189]
                      - cell "1" [ref=e190]
                      - cell "1 500 000 FCFA" [ref=e191]
                      - cell "—" [ref=e192]
                      - cell [ref=e193]:
                        - combobox [ref=e194] [cursor=pointer]:
                          - generic [ref=e195]: Hager Group Afrique
                          - img
                    - 'row "Client #54 1 1 2 300 000 FCFA —" [ref=e196]':
                      - 'cell "Client #54" [ref=e197]'
                      - cell "1" [ref=e198]
                      - cell "1" [ref=e199]
                      - cell "2 300 000 FCFA" [ref=e200]
                      - cell "—" [ref=e201]
                      - cell [ref=e202]:
                        - combobox [ref=e203] [cursor=pointer]:
                          - generic [ref=e204]: Hager Group Afrique
                          - img
                    - 'row "Client #49 1 1 2 300 000 FCFA —" [ref=e205]':
                      - 'cell "Client #49" [ref=e206]'
                      - cell "1" [ref=e207]
                      - cell "1" [ref=e208]
                      - cell "2 300 000 FCFA" [ref=e209]
                      - cell "—" [ref=e210]
                      - cell [ref=e211]:
                        - combobox [ref=e212] [cursor=pointer]:
                          - generic [ref=e213]: Legrand Senegal
                          - img
                    - 'row "Client #52 1 1 2 300 000 FCFA —" [ref=e214]':
                      - 'cell "Client #52" [ref=e215]'
                      - cell "1" [ref=e216]
                      - cell "1" [ref=e217]
                      - cell "2 300 000 FCFA" [ref=e218]
                      - cell "—" [ref=e219]
                      - cell [ref=e220]:
                        - combobox [ref=e221] [cursor=pointer]:
                          - generic [ref=e222]: Legrand Senegal
                          - img
                    - 'row "Client #51 1 1 2 300 000 FCFA —" [ref=e223]':
                      - 'cell "Client #51" [ref=e224]'
                      - cell "1" [ref=e225]
                      - cell "1" [ref=e226]
                      - cell "2 300 000 FCFA" [ref=e227]
                      - cell "—" [ref=e228]
                      - cell [ref=e229]:
                        - combobox [ref=e230] [cursor=pointer]:
                          - generic [ref=e231]: Legrand Senegal
                          - img
                    - 'row "Client #58 1 1 2 300 000 FCFA —" [ref=e232]':
                      - 'cell "Client #58" [ref=e233]'
                      - cell "1" [ref=e234]
                      - cell "1" [ref=e235]
                      - cell "2 300 000 FCFA" [ref=e236]
                      - cell "—" [ref=e237]
                      - cell [ref=e238]:
                        - combobox [ref=e239] [cursor=pointer]:
                          - generic [ref=e240]: Chint Electric Co.
                          - img
                - generic [ref=e241]:
                  - button "Sauvegarder assignations" [ref=e242] [cursor=pointer]
                  - button "Générer Commandes Fournisseurs" [ref=e243] [cursor=pointer]:
                    - img
                    - text: Générer Commandes Fournisseurs
            - generic [ref=e245] [cursor=pointer]:
              - generic [ref=e246]:
                - img [ref=e247]
                - generic [ref=e249]:
                  - paragraph [ref=e250]: BDC-120010
                  - paragraph [ref=e251]: 2026-05-01 · 1 ligne(s) · 2 169 000 FCFA
              - generic [ref=e252]:
                - generic [ref=e253]: 1/1 fournisseurs assignés
                - img [ref=e254]
                - generic [ref=e257]: Transmis
            - generic [ref=e259] [cursor=pointer]:
              - generic [ref=e260]:
                - img [ref=e261]
                - generic [ref=e263]:
                  - paragraph [ref=e264]: BDC-120009
                  - paragraph [ref=e265]: 2026-05-01 · 1 ligne(s) · 2 500 000 FCFA
              - generic [ref=e266]:
                - generic [ref=e267]: 1/1 fournisseurs assignés
                - img [ref=e268]
                - generic [ref=e271]: Transmis
            - generic [ref=e273] [cursor=pointer]:
              - generic [ref=e274]:
                - img [ref=e275]
                - generic [ref=e277]:
                  - paragraph [ref=e278]: BDC-120008
                  - paragraph [ref=e279]: 2026-05-01 · 3 ligne(s) · 14 800 000 FCFA
              - generic [ref=e280]:
                - generic [ref=e281]: 3/3 fournisseurs assignés
                - img [ref=e282]
                - generic [ref=e285]: Transmis
            - generic [ref=e287] [cursor=pointer]:
              - generic [ref=e288]:
                - img [ref=e289]
                - generic [ref=e291]:
                  - paragraph [ref=e292]: BDC-90009
                  - paragraph [ref=e293]: 2026-05-01 · 1 ligne(s) · 2 500 000 FCFA
              - generic [ref=e294]:
                - generic [ref=e295]: 0/1 fournisseurs assignés
                - img [ref=e296]
                - generic [ref=e298]: Transmis
            - generic [ref=e300] [cursor=pointer]:
              - generic [ref=e301]:
                - img [ref=e302]
                - generic [ref=e304]:
                  - paragraph [ref=e305]: BDC-90008
                  - paragraph [ref=e306]: 2026-05-01 · 2 ligne(s) · 12 800 000 FCFA
              - generic [ref=e307]:
                - generic [ref=e308]: 2/2 fournisseurs assignés
                - img [ref=e309]
                - generic [ref=e312]: Transmis
            - generic [ref=e314] [cursor=pointer]:
              - generic [ref=e315]:
                - img [ref=e316]
                - generic [ref=e318]:
                  - paragraph [ref=e319]: BDC-60010
                  - paragraph [ref=e320]: 2026-05-01 · 2 ligne(s) · 5 969 000 FCFA
              - generic [ref=e321]:
                - generic [ref=e322]: 2/2 fournisseurs assignés
                - img [ref=e323]
                - generic [ref=e326]: Transmis
            - generic [ref=e328] [cursor=pointer]:
              - generic [ref=e329]:
                - img [ref=e330]
                - generic [ref=e332]:
                  - paragraph [ref=e333]: BDC-60009
                  - paragraph [ref=e334]: 2026-05-01 · 1 ligne(s) · 2 500 000 FCFA
              - generic [ref=e335]:
                - generic [ref=e336]: 0/1 fournisseurs assignés
                - img [ref=e337]
                - generic [ref=e339]: Transmis
            - generic [ref=e341] [cursor=pointer]:
              - generic [ref=e342]:
                - img [ref=e343]
                - generic [ref=e345]:
                  - paragraph [ref=e346]: BDC-60008
                  - paragraph [ref=e347]: 2026-05-01 · 5 ligne(s) · 18 800 000 FCFA
              - generic [ref=e348]:
                - generic [ref=e349]: 5/5 fournisseurs assignés
                - img [ref=e350]
                - generic [ref=e353]: Transmis
            - generic [ref=e355] [cursor=pointer]:
              - generic [ref=e356]:
                - img [ref=e357]
                - generic [ref=e359]:
                  - paragraph [ref=e360]: BDC-30009
                  - paragraph [ref=e361]: 2026-05-01 · 1 ligne(s) · 2 500 000 FCFA
              - generic [ref=e362]:
                - generic [ref=e363]: 1/1 fournisseurs assignés
                - img [ref=e364]
                - generic [ref=e367]: Transmis
            - generic [ref=e369] [cursor=pointer]:
              - generic [ref=e370]:
                - img [ref=e371]
                - generic [ref=e373]:
                  - paragraph [ref=e374]: BDC-30008
                  - paragraph [ref=e375]: 2026-05-01 · 1 ligne(s) · 10 800 000 FCFA
              - generic [ref=e376]:
                - generic [ref=e377]: 1/1 fournisseurs assignés
                - img [ref=e378]
                - generic [ref=e381]: Transmis
            - generic [ref=e383] [cursor=pointer]:
              - generic [ref=e384]:
                - img [ref=e385]
                - generic [ref=e387]:
                  - paragraph [ref=e388]: BDC-9
                  - paragraph [ref=e389]: 2026-05-01 · 3 ligne(s) · 14 800 000 FCFA
              - generic [ref=e390]:
                - generic [ref=e391]: 0/3 fournisseurs assignés
                - img [ref=e392]
                - generic [ref=e394]: Transmis
            - generic [ref=e396] [cursor=pointer]:
              - generic [ref=e397]:
                - img [ref=e398]
                - generic [ref=e400]:
                  - paragraph [ref=e401]: BDC-8
                  - paragraph [ref=e402]: 2026-05-01 · 3 ligne(s) · 14 800 000 FCFA
              - generic [ref=e403]:
                - generic [ref=e404]: 0/3 fournisseurs assignés
                - img [ref=e405]
                - generic [ref=e407]: Transmis
            - generic [ref=e409] [cursor=pointer]:
              - generic [ref=e410]:
                - img [ref=e411]
                - generic [ref=e413]:
                  - paragraph [ref=e414]: BDC-2025-002
                  - paragraph [ref=e415]: 2025-03-22 · 3 ligne(s) · 3 250 000 FCFA
              - generic [ref=e416]:
                - generic [ref=e417]: 3/3 fournisseurs assignés
                - img [ref=e418]
                - generic [ref=e421]: Transmis
            - generic [ref=e423] [cursor=pointer]:
              - generic [ref=e424]:
                - img [ref=e425]
                - generic [ref=e427]:
                  - paragraph [ref=e428]: BDC-2025-001
                  - paragraph [ref=e429]: 2025-03-15 · 6 ligne(s) · 3 335 000 FCFA
              - generic [ref=e430]:
                - generic [ref=e431]: 6/6 fournisseurs assignés
                - img [ref=e432]
                - generic [ref=e435]: Transmis
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
  14 |     await expect(page.getByText(/en cours/i)).toBeVisible();
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
> 34 |     await expect(premierBDC.getByText(/client/i)).toBeVisible();
     |                                                   ^ Error: expect(locator).toBeVisible() failed
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