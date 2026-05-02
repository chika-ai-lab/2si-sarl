# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: barro\clients.spec.ts >> Mme Barro — Gestion des clients >> affiche la liste des clients avec les colonnes attendues
- Location: e2e\barro\clients.spec.ts:6:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /gérer la base de clients/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /gérer la base de clients/i })

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
        - link "Logo 2SI.Sarl Commercial" [ref=e6] [cursor=pointer]:
          - /url: /
          - img "Logo" [ref=e8]
          - generic [ref=e10]:
            - generic [ref=e11]: 2SI.Sarl
            - generic [ref=e12]: Commercial
        - button [ref=e13] [cursor=pointer]:
          - img [ref=e14]
      - navigation [ref=e17]:
        - link "Tableau de Bord" [ref=e19] [cursor=pointer]:
          - /url: /admin
          - img [ref=e20]
          - generic [ref=e25]: Tableau de Bord
        - generic [ref=e26]:
          - link "Commandes" [ref=e27] [cursor=pointer]:
            - /url: /admin/commercial/commandes
            - img [ref=e28]
            - generic [ref=e31]: Commandes
          - link "Bons de Commande" [ref=e32] [cursor=pointer]:
            - /url: /admin/achats/bon-commandes
            - img [ref=e33]
            - generic [ref=e37]: Bons de Commande
          - link "Mes Ventes" [ref=e38] [cursor=pointer]:
            - /url: /admin/commercial/ventes
            - img [ref=e39]
            - generic [ref=e42]: Mes Ventes
          - link "Clients" [ref=e43] [cursor=pointer]:
            - /url: /admin/commercial/clients
            - img [ref=e45]
            - generic [ref=e50]: Clients
          - link "Accréditif" [ref=e51] [cursor=pointer]:
            - /url: /admin/commercial/accreditif
            - img [ref=e52]
            - generic [ref=e54]: Accréditif
          - link "SAV" [ref=e55] [cursor=pointer]:
            - /url: /admin/commercial/sav
            - img [ref=e56]
            - generic [ref=e58]: SAV
          - link "Comptabilité" [ref=e59] [cursor=pointer]:
            - /url: /admin/commercial/compta
            - img [ref=e60]
            - generic [ref=e63]: Comptabilité
          - link "Rapports" [ref=e64] [cursor=pointer]:
            - /url: /admin/commercial/rapports
            - img [ref=e65]
            - generic [ref=e67]: Rapports
      - generic [ref=e68]:
        - link "Retour au site" [ref=e69] [cursor=pointer]:
          - /url: /
          - img [ref=e70]
          - generic [ref=e73]: Retour au site
        - button "Déconnexion" [ref=e74] [cursor=pointer]:
          - img [ref=e75]
          - generic [ref=e78]: Déconnexion
    - generic [ref=e79]:
      - banner [ref=e80]:
        - generic [ref=e81]:
          - generic [ref=e82]:
            - heading "2SI.Sarl" [level=1] [ref=e83]
            - paragraph [ref=e84]: Commercial • 4 modules actifs
          - button "Aissatou Camara" [ref=e86] [cursor=pointer]:
            - img
            - generic [ref=e87]: Aissatou Camara
      - main [ref=e88]:
        - generic [ref=e89]:
          - generic [ref=e90]:
            - generic [ref=e91]:
              - heading "Clients" [level=2] [ref=e92]
              - paragraph [ref=e93]: Gérer la base de clients
            - button "Nouveau client" [ref=e94] [cursor=pointer]:
              - img
              - text: Nouveau client
          - generic [ref=e97]:
            - generic [ref=e98]:
              - img [ref=e99]
              - textbox "Rechercher un client (nom, email, code)..." [ref=e102]
            - generic [ref=e103]:
              - generic [ref=e104]:
                - generic [ref=e105]: Statut
                - combobox [ref=e106] [cursor=pointer]:
                  - generic: Tous les statuts
                  - img [ref=e107]
              - generic [ref=e109]:
                - generic [ref=e110]: Catégorie
                - combobox [ref=e111] [cursor=pointer]:
                  - generic: Toutes les catégories
                  - img [ref=e112]
              - generic [ref=e114]:
                - generic [ref=e115]: Banque
                - combobox [ref=e116] [cursor=pointer]:
                  - generic: Toutes les banques
                  - img [ref=e117]
          - generic [ref=e119]:
            - heading "83 client(s)" [level=3] [ref=e121]
            - generic [ref=e122]:
              - table [ref=e124]:
                - rowgroup [ref=e125]:
                  - row "Client Contact Banque Catégorie Crédit Total achats Statut Actions" [ref=e126]:
                    - columnheader "Client" [ref=e127]
                    - columnheader "Contact" [ref=e128]
                    - columnheader "Banque" [ref=e129]
                    - columnheader "Catégorie" [ref=e130]
                    - columnheader "Crédit" [ref=e131]
                    - columnheader "Total achats" [ref=e132]
                    - columnheader "Statut" [ref=e133]
                    - columnheader "Actions" [ref=e134]
                - rowgroup [ref=e135]:
                  - row "CISS MAMADOU CLT-30094 mamadouciss30@gmail.com 766000372 Autre B — Standard 0 FCFA / 0 FCFA 0 FCFA 0 commande(s) Actif" [ref=e136] [cursor=pointer]:
                    - cell "CISS MAMADOU CLT-30094" [ref=e137]:
                      - generic [ref=e138]:
                        - img [ref=e140]
                        - generic [ref=e143]:
                          - generic [ref=e144]: CISS MAMADOU
                          - generic [ref=e145]: CLT-30094
                    - cell "mamadouciss30@gmail.com 766000372" [ref=e146]:
                      - generic [ref=e147]:
                        - generic [ref=e148]:
                          - img [ref=e149]
                          - text: mamadouciss30@gmail.com
                        - generic [ref=e152]:
                          - img [ref=e153]
                          - text: "766000372"
                    - cell "Autre" [ref=e155]:
                      - generic [ref=e156]: Autre
                    - cell "B — Standard" [ref=e157]:
                      - generic [ref=e158]: B — Standard
                    - cell "0 FCFA / 0 FCFA" [ref=e159]:
                      - generic [ref=e160]:
                        - generic [ref=e161]: 0 FCFA
                        - generic [ref=e162]: / 0 FCFA
                    - cell "0 FCFA 0 commande(s)" [ref=e163]:
                      - generic [ref=e164]:
                        - generic [ref=e165]: 0 FCFA
                        - generic [ref=e166]: 0 commande(s)
                    - cell "Actif" [ref=e167]:
                      - generic [ref=e168]: Actif
                    - cell [ref=e169]:
                      - button [ref=e170]:
                        - img
                  - 'row "Client #42 #42 CLT-042 client.42@2si-sarl.sn Autre B — Standard 0 FCFA / 0 FCFA 0 FCFA 0 commande(s) Actif" [ref=e171] [cursor=pointer]':
                    - 'cell "Client #42 #42 CLT-042" [ref=e172]':
                      - generic [ref=e173]:
                        - img [ref=e175]
                        - generic [ref=e178]:
                          - generic [ref=e179]: "Client #42 #42"
                          - generic [ref=e180]: CLT-042
                    - cell "client.42@2si-sarl.sn" [ref=e181]:
                      - generic [ref=e182]:
                        - generic [ref=e183]:
                          - img [ref=e184]
                          - text: client.42@2si-sarl.sn
                        - img [ref=e188]
                    - cell "Autre" [ref=e190]:
                      - generic [ref=e191]: Autre
                    - cell "B — Standard" [ref=e192]:
                      - generic [ref=e193]: B — Standard
                    - cell "0 FCFA / 0 FCFA" [ref=e194]:
                      - generic [ref=e195]:
                        - generic [ref=e196]: 0 FCFA
                        - generic [ref=e197]: / 0 FCFA
                    - cell "0 FCFA 0 commande(s)" [ref=e198]:
                      - generic [ref=e199]:
                        - generic [ref=e200]: 0 FCFA
                        - generic [ref=e201]: 0 commande(s)
                    - cell "Actif" [ref=e202]:
                      - generic [ref=e203]: Actif
                    - cell [ref=e204]:
                      - button [ref=e205]:
                        - img
                  - 'row "Client #41 #41 CLT-041 client.41@2si-sarl.sn Autre B — Standard 0 FCFA / 0 FCFA 0 FCFA 0 commande(s) Actif" [ref=e206] [cursor=pointer]':
                    - 'cell "Client #41 #41 CLT-041" [ref=e207]':
                      - generic [ref=e208]:
                        - img [ref=e210]
                        - generic [ref=e213]:
                          - generic [ref=e214]: "Client #41 #41"
                          - generic [ref=e215]: CLT-041
                    - cell "client.41@2si-sarl.sn" [ref=e216]:
                      - generic [ref=e217]:
                        - generic [ref=e218]:
                          - img [ref=e219]
                          - text: client.41@2si-sarl.sn
                        - img [ref=e223]
                    - cell "Autre" [ref=e225]:
                      - generic [ref=e226]: Autre
                    - cell "B — Standard" [ref=e227]:
                      - generic [ref=e228]: B — Standard
                    - cell "0 FCFA / 0 FCFA" [ref=e229]:
                      - generic [ref=e230]:
                        - generic [ref=e231]: 0 FCFA
                        - generic [ref=e232]: / 0 FCFA
                    - cell "0 FCFA 0 commande(s)" [ref=e233]:
                      - generic [ref=e234]:
                        - generic [ref=e235]: 0 FCFA
                        - generic [ref=e236]: 0 commande(s)
                    - cell "Actif" [ref=e237]:
                      - generic [ref=e238]: Actif
                    - cell [ref=e239]:
                      - button [ref=e240]:
                        - img
                  - 'row "Client #39 #39 CLT-039 client.39@2si-sarl.sn Autre B — Standard 0 FCFA / 0 FCFA 0 FCFA 0 commande(s) Actif" [ref=e241] [cursor=pointer]':
                    - 'cell "Client #39 #39 CLT-039" [ref=e242]':
                      - generic [ref=e243]:
                        - img [ref=e245]
                        - generic [ref=e248]:
                          - generic [ref=e249]: "Client #39 #39"
                          - generic [ref=e250]: CLT-039
                    - cell "client.39@2si-sarl.sn" [ref=e251]:
                      - generic [ref=e252]:
                        - generic [ref=e253]:
                          - img [ref=e254]
                          - text: client.39@2si-sarl.sn
                        - img [ref=e258]
                    - cell "Autre" [ref=e260]:
                      - generic [ref=e261]: Autre
                    - cell "B — Standard" [ref=e262]:
                      - generic [ref=e263]: B — Standard
                    - cell "0 FCFA / 0 FCFA" [ref=e264]:
                      - generic [ref=e265]:
                        - generic [ref=e266]: 0 FCFA
                        - generic [ref=e267]: / 0 FCFA
                    - cell "0 FCFA 0 commande(s)" [ref=e268]:
                      - generic [ref=e269]:
                        - generic [ref=e270]: 0 FCFA
                        - generic [ref=e271]: 0 commande(s)
                    - cell "Actif" [ref=e272]:
                      - generic [ref=e273]: Actif
                    - cell [ref=e274]:
                      - button [ref=e275]:
                        - img
                  - 'row "Client #36 #36 CLT-036 client.36@2si-sarl.sn Autre B — Standard 0 FCFA / 0 FCFA 0 FCFA 0 commande(s) Actif" [ref=e276] [cursor=pointer]':
                    - 'cell "Client #36 #36 CLT-036" [ref=e277]':
                      - generic [ref=e278]:
                        - img [ref=e280]
                        - generic [ref=e283]:
                          - generic [ref=e284]: "Client #36 #36"
                          - generic [ref=e285]: CLT-036
                    - cell "client.36@2si-sarl.sn" [ref=e286]:
                      - generic [ref=e287]:
                        - generic [ref=e288]:
                          - img [ref=e289]
                          - text: client.36@2si-sarl.sn
                        - img [ref=e293]
                    - cell "Autre" [ref=e295]:
                      - generic [ref=e296]: Autre
                    - cell "B — Standard" [ref=e297]:
                      - generic [ref=e298]: B — Standard
                    - cell "0 FCFA / 0 FCFA" [ref=e299]:
                      - generic [ref=e300]:
                        - generic [ref=e301]: 0 FCFA
                        - generic [ref=e302]: / 0 FCFA
                    - cell "0 FCFA 0 commande(s)" [ref=e303]:
                      - generic [ref=e304]:
                        - generic [ref=e305]: 0 FCFA
                        - generic [ref=e306]: 0 commande(s)
                    - cell "Actif" [ref=e307]:
                      - generic [ref=e308]: Actif
                    - cell [ref=e309]:
                      - button [ref=e310]:
                        - img
                  - 'row "Client #35 #35 CLT-035 client.35@2si-sarl.sn Autre B — Standard 0 FCFA / 0 FCFA 0 FCFA 0 commande(s) Actif" [ref=e311] [cursor=pointer]':
                    - 'cell "Client #35 #35 CLT-035" [ref=e312]':
                      - generic [ref=e313]:
                        - img [ref=e315]
                        - generic [ref=e318]:
                          - generic [ref=e319]: "Client #35 #35"
                          - generic [ref=e320]: CLT-035
                    - cell "client.35@2si-sarl.sn" [ref=e321]:
                      - generic [ref=e322]:
                        - generic [ref=e323]:
                          - img [ref=e324]
                          - text: client.35@2si-sarl.sn
                        - img [ref=e328]
                    - cell "Autre" [ref=e330]:
                      - generic [ref=e331]: Autre
                    - cell "B — Standard" [ref=e332]:
                      - generic [ref=e333]: B — Standard
                    - cell "0 FCFA / 0 FCFA" [ref=e334]:
                      - generic [ref=e335]:
                        - generic [ref=e336]: 0 FCFA
                        - generic [ref=e337]: / 0 FCFA
                    - cell "0 FCFA 0 commande(s)" [ref=e338]:
                      - generic [ref=e339]:
                        - generic [ref=e340]: 0 FCFA
                        - generic [ref=e341]: 0 commande(s)
                    - cell "Actif" [ref=e342]:
                      - generic [ref=e343]: Actif
                    - cell [ref=e344]:
                      - button [ref=e345]:
                        - img
                  - 'row "Client #33 #33 CLT-033 client.33@2si-sarl.sn Autre B — Standard 0 FCFA / 0 FCFA 0 FCFA 0 commande(s) Actif" [ref=e346] [cursor=pointer]':
                    - 'cell "Client #33 #33 CLT-033" [ref=e347]':
                      - generic [ref=e348]:
                        - img [ref=e350]
                        - generic [ref=e353]:
                          - generic [ref=e354]: "Client #33 #33"
                          - generic [ref=e355]: CLT-033
                    - cell "client.33@2si-sarl.sn" [ref=e356]:
                      - generic [ref=e357]:
                        - generic [ref=e358]:
                          - img [ref=e359]
                          - text: client.33@2si-sarl.sn
                        - img [ref=e363]
                    - cell "Autre" [ref=e365]:
                      - generic [ref=e366]: Autre
                    - cell "B — Standard" [ref=e367]:
                      - generic [ref=e368]: B — Standard
                    - cell "0 FCFA / 0 FCFA" [ref=e369]:
                      - generic [ref=e370]:
                        - generic [ref=e371]: 0 FCFA
                        - generic [ref=e372]: / 0 FCFA
                    - cell "0 FCFA 0 commande(s)" [ref=e373]:
                      - generic [ref=e374]:
                        - generic [ref=e375]: 0 FCFA
                        - generic [ref=e376]: 0 commande(s)
                    - cell "Actif" [ref=e377]:
                      - generic [ref=e378]: Actif
                    - cell [ref=e379]:
                      - button [ref=e380]:
                        - img
                  - 'row "Client #38 #38 CLT-038 client.38@2si-sarl.sn Autre B — Standard 0 FCFA / 0 FCFA 0 FCFA 0 commande(s) Actif" [ref=e381] [cursor=pointer]':
                    - 'cell "Client #38 #38 CLT-038" [ref=e382]':
                      - generic [ref=e383]:
                        - img [ref=e385]
                        - generic [ref=e388]:
                          - generic [ref=e389]: "Client #38 #38"
                          - generic [ref=e390]: CLT-038
                    - cell "client.38@2si-sarl.sn" [ref=e391]:
                      - generic [ref=e392]:
                        - generic [ref=e393]:
                          - img [ref=e394]
                          - text: client.38@2si-sarl.sn
                        - img [ref=e398]
                    - cell "Autre" [ref=e400]:
                      - generic [ref=e401]: Autre
                    - cell "B — Standard" [ref=e402]:
                      - generic [ref=e403]: B — Standard
                    - cell "0 FCFA / 0 FCFA" [ref=e404]:
                      - generic [ref=e405]:
                        - generic [ref=e406]: 0 FCFA
                        - generic [ref=e407]: / 0 FCFA
                    - cell "0 FCFA 0 commande(s)" [ref=e408]:
                      - generic [ref=e409]:
                        - generic [ref=e410]: 0 FCFA
                        - generic [ref=e411]: 0 commande(s)
                    - cell "Actif" [ref=e412]:
                      - generic [ref=e413]: Actif
                    - cell [ref=e414]:
                      - button [ref=e415]:
                        - img
                  - 'row "Client #37 #37 CLT-037 client.37@2si-sarl.sn Autre B — Standard 0 FCFA / 0 FCFA 0 FCFA 0 commande(s) Actif" [ref=e416] [cursor=pointer]':
                    - 'cell "Client #37 #37 CLT-037" [ref=e417]':
                      - generic [ref=e418]:
                        - img [ref=e420]
                        - generic [ref=e423]:
                          - generic [ref=e424]: "Client #37 #37"
                          - generic [ref=e425]: CLT-037
                    - cell "client.37@2si-sarl.sn" [ref=e426]:
                      - generic [ref=e427]:
                        - generic [ref=e428]:
                          - img [ref=e429]
                          - text: client.37@2si-sarl.sn
                        - img [ref=e433]
                    - cell "Autre" [ref=e435]:
                      - generic [ref=e436]: Autre
                    - cell "B — Standard" [ref=e437]:
                      - generic [ref=e438]: B — Standard
                    - cell "0 FCFA / 0 FCFA" [ref=e439]:
                      - generic [ref=e440]:
                        - generic [ref=e441]: 0 FCFA
                        - generic [ref=e442]: / 0 FCFA
                    - cell "0 FCFA 0 commande(s)" [ref=e443]:
                      - generic [ref=e444]:
                        - generic [ref=e445]: 0 FCFA
                        - generic [ref=e446]: 0 commande(s)
                    - cell "Actif" [ref=e447]:
                      - generic [ref=e448]: Actif
                    - cell [ref=e449]:
                      - button [ref=e450]:
                        - img
                  - 'row "Client #40 #40 CLT-040 client.40@2si-sarl.sn Autre B — Standard 0 FCFA / 0 FCFA 0 FCFA 0 commande(s) Actif" [ref=e451] [cursor=pointer]':
                    - 'cell "Client #40 #40 CLT-040" [ref=e452]':
                      - generic [ref=e453]:
                        - img [ref=e455]
                        - generic [ref=e458]:
                          - generic [ref=e459]: "Client #40 #40"
                          - generic [ref=e460]: CLT-040
                    - cell "client.40@2si-sarl.sn" [ref=e461]:
                      - generic [ref=e462]:
                        - generic [ref=e463]:
                          - img [ref=e464]
                          - text: client.40@2si-sarl.sn
                        - img [ref=e468]
                    - cell "Autre" [ref=e470]:
                      - generic [ref=e471]: Autre
                    - cell "B — Standard" [ref=e472]:
                      - generic [ref=e473]: B — Standard
                    - cell "0 FCFA / 0 FCFA" [ref=e474]:
                      - generic [ref=e475]:
                        - generic [ref=e476]: 0 FCFA
                        - generic [ref=e477]: / 0 FCFA
                    - cell "0 FCFA 0 commande(s)" [ref=e478]:
                      - generic [ref=e479]:
                        - generic [ref=e480]: 0 FCFA
                        - generic [ref=e481]: 0 commande(s)
                    - cell "Actif" [ref=e482]:
                      - generic [ref=e483]: Actif
                    - cell [ref=e484]:
                      - button [ref=e485]:
                        - img
              - generic [ref=e486]:
                - generic [ref=e487]: Page 1 sur 9
                - generic [ref=e488]:
                  - button "Précédent" [disabled]
                  - button "Suivant" [ref=e489] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { navigateTo, waitForLoaded } from "../helpers";
  3   | 
  4   | test.describe("Mme Barro — Gestion des clients", () => {
  5   | 
  6   |   test("affiche la liste des clients avec les colonnes attendues", async ({ page }) => {
  7   |     await navigateTo(page, "/admin/commercial/clients");
  8   |     await waitForLoaded(page);
  9   | 
> 10  |     await expect(page.getByRole("heading", { name: /gérer la base de clients/i })).toBeVisible();
      |                                                                                    ^ Error: expect(locator).toBeVisible() failed
  11  | 
  12  |     // Colonnes du tableau
  13  |     const thead = page.locator("thead");
  14  |     await expect(thead.getByText(/client/i).first()).toBeVisible();
  15  |     await expect(thead.getByText(/contact/i).first()).toBeVisible();
  16  |     await expect(thead.getByText(/banque/i).first()).toBeVisible();
  17  |     await expect(thead.getByText(/catégorie/i).first()).toBeVisible();
  18  |     await expect(thead.getByText(/statut/i).first()).toBeVisible();
  19  |   });
  20  | 
  21  |   test("la recherche filtre la liste", async ({ page }) => {
  22  |     await navigateTo(page, "/admin/commercial/clients");
  23  |     await waitForLoaded(page);
  24  | 
  25  |     const lignesAvant = await page.locator("tbody tr").count();
  26  |     if (lignesAvant === 0) test.skip();
  27  | 
  28  |     const premierNom = await page.locator("tbody tr").first()
  29  |       .locator("td").first()
  30  |       .textContent();
  31  |     if (!premierNom) test.skip();
  32  | 
  33  |     await page.getByPlaceholder(/rechercher un client/i).fill(premierNom.trim().slice(0, 4));
  34  |     await page.waitForTimeout(400);
  35  | 
  36  |     const lignesApres = await page.locator("tbody tr").count();
  37  |     expect(lignesApres).toBeGreaterThanOrEqual(1);
  38  |     expect(lignesApres).toBeLessThanOrEqual(lignesAvant);
  39  |   });
  40  | 
  41  |   test("le filtre par statut restreint les résultats", async ({ page }) => {
  42  |     await navigateTo(page, "/admin/commercial/clients");
  43  |     await waitForLoaded(page);
  44  | 
  45  |     // Ouvrir le select Statut
  46  |     const selectStatut = page.getByRole("combobox").filter({ hasText: /tous les statuts/i });
  47  |     const visible = await selectStatut.isVisible({ timeout: 2_000 }).catch(() => false);
  48  |     if (!visible) test.skip();
  49  | 
  50  |     await selectStatut.click();
  51  |     await page.getByRole("option", { name: /^actif$/i }).click();
  52  |     await waitForLoaded(page);
  53  | 
  54  |     const lignes = page.locator("tbody tr");
  55  |     const count = await lignes.count();
  56  |     if (count > 0) {
  57  |       // Chaque ligne visible doit avoir le badge "Actif"
  58  |       await expect(lignes.first().getByText(/actif/i).first()).toBeVisible();
  59  |     }
  60  |   });
  61  | 
  62  |   test("le filtre par banque restreint les résultats", async ({ page }) => {
  63  |     await navigateTo(page, "/admin/commercial/clients");
  64  |     await waitForLoaded(page);
  65  | 
  66  |     const selectBanque = page.getByRole("combobox").filter({ hasText: /toutes les banques/i });
  67  |     const visible = await selectBanque.isVisible({ timeout: 2_000 }).catch(() => false);
  68  |     if (!visible) test.skip();
  69  | 
  70  |     await selectBanque.click();
  71  |     await page.getByRole("option", { name: /^cbao$/i }).click();
  72  |     await waitForLoaded(page);
  73  | 
  74  |     const lignes = page.locator("tbody tr");
  75  |     const count = await lignes.count();
  76  |     if (count > 0) {
  77  |       await expect(lignes.first().getByText(/cbao/i)).toBeVisible();
  78  |     }
  79  |   });
  80  | 
  81  |   test("ouvre le formulaire de création d'un nouveau client", async ({ page }) => {
  82  |     await navigateTo(page, "/admin/commercial/clients");
  83  |     await waitForLoaded(page);
  84  | 
  85  |     await page.getByRole("button", { name: /nouveau client/i }).click();
  86  | 
  87  |     // Le dialog s'ouvre
  88  |     const dialog = page.getByRole("dialog");
  89  |     await expect(dialog).toBeVisible({ timeout: 5_000 });
  90  |     await expect(dialog.getByRole("heading", { name: /nouveau client/i })).toBeVisible();
  91  | 
  92  |     // Champs obligatoires présents
  93  |     await expect(dialog.getByLabel(/nom/i)).toBeVisible();
  94  |     await expect(dialog.getByLabel(/email/i)).toBeVisible();
  95  |     await expect(dialog.getByLabel(/téléphone/i)).toBeVisible();
  96  | 
  97  |     // Boutons d'action
  98  |     await expect(dialog.getByRole("button", { name: /annuler/i })).toBeVisible();
  99  |     await expect(dialog.getByRole("button", { name: /créer/i })).toBeVisible();
  100 |   });
  101 | 
  102 |   test("validation : champs requis bloquent la soumission", async ({ page }) => {
  103 |     await navigateTo(page, "/admin/commercial/clients");
  104 |     await waitForLoaded(page);
  105 | 
  106 |     await page.getByRole("button", { name: /nouveau client/i }).click();
  107 | 
  108 |     const dialog = page.getByRole("dialog");
  109 |     await expect(dialog).toBeVisible({ timeout: 5_000 });
  110 | 
```