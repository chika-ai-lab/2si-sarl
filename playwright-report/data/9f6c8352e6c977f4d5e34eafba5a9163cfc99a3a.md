# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: barro\clients.spec.ts >> Mme Barro — Gestion des clients >> ouvre le formulaire de création d'un nouveau client
- Location: e2e\barro\clients.spec.ts:81:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog').getByLabel(/nom/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('dialog').getByLabel(/nom/i)

```

# Page snapshot

```yaml
- generic:
  - generic:
    - list
    - region "Notifications alt+T"
    - generic:
      - complementary:
        - generic:
          - link:
            - /url: /
            - generic:
              - img
            - generic:
              - generic: 2SI.Sarl
              - generic: Commercial
          - button:
            - img
        - navigation:
          - generic:
            - link:
              - /url: /admin
              - img
              - generic: Tableau de Bord
          - generic:
            - link:
              - /url: /admin/commercial/commandes
              - img
              - generic: Commandes
            - link:
              - /url: /admin/achats/bon-commandes
              - img
              - generic: Bons de Commande
            - link:
              - /url: /admin/commercial/ventes
              - img
              - generic: Mes Ventes
            - link:
              - /url: /admin/commercial/clients
              - img
              - generic: Clients
            - link:
              - /url: /admin/commercial/accreditif
              - img
              - generic: Accréditif
            - link:
              - /url: /admin/commercial/sav
              - img
              - generic: SAV
            - link:
              - /url: /admin/commercial/compta
              - img
              - generic: Comptabilité
            - link:
              - /url: /admin/commercial/rapports
              - img
              - generic: Rapports
        - generic:
          - link:
            - /url: /
            - img
            - generic: Retour au site
          - button:
            - img
            - generic: Déconnexion
      - generic:
        - banner:
          - generic:
            - generic:
              - heading [level=1]: 2SI.Sarl
              - paragraph: Commercial • 4 modules actifs
            - generic:
              - button:
                - img
                - generic: Aissatou Camara
        - main:
          - generic:
            - generic:
              - generic:
                - heading [level=2]: Clients
                - paragraph: Gérer la base de clients
              - button:
                - img
                - text: Nouveau client
            - generic:
              - generic:
                - generic:
                  - generic:
                    - img
                    - textbox:
                      - /placeholder: Rechercher un client (nom, email, code)...
                  - generic:
                    - generic:
                      - generic: Statut
                      - combobox:
                        - generic: Tous les statuts
                        - img
                    - generic:
                      - generic: Catégorie
                      - combobox:
                        - generic: Toutes les catégories
                        - img
                    - generic:
                      - generic: Banque
                      - combobox:
                        - generic: Toutes les banques
                        - img
            - generic:
              - generic:
                - heading [level=3]: 83 client(s)
              - generic:
                - generic:
                  - table:
                    - rowgroup:
                      - row:
                        - columnheader: Client
                        - columnheader: Contact
                        - columnheader: Banque
                        - columnheader: Catégorie
                        - columnheader: Crédit
                        - columnheader: Total achats
                        - columnheader: Statut
                        - columnheader: Actions
                    - rowgroup:
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - img
                            - generic:
                              - generic: CISS MAMADOU
                              - generic: CLT-30094
                        - cell:
                          - generic:
                            - generic:
                              - img
                              - text: mamadouciss30@gmail.com
                            - generic:
                              - img
                              - text: "766000372"
                        - cell:
                          - generic: Autre
                        - cell:
                          - generic: B — Standard
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: / 0 FCFA
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: 0 commande(s)
                        - cell:
                          - generic: Actif
                        - cell:
                          - button:
                            - img
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - img
                            - generic:
                              - generic: "Client #42 #42"
                              - generic: CLT-042
                        - cell:
                          - generic:
                            - generic:
                              - img
                              - text: client.42@2si-sarl.sn
                            - generic:
                              - img
                        - cell:
                          - generic: Autre
                        - cell:
                          - generic: B — Standard
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: / 0 FCFA
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: 0 commande(s)
                        - cell:
                          - generic: Actif
                        - cell:
                          - button:
                            - img
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - img
                            - generic:
                              - generic: "Client #41 #41"
                              - generic: CLT-041
                        - cell:
                          - generic:
                            - generic:
                              - img
                              - text: client.41@2si-sarl.sn
                            - generic:
                              - img
                        - cell:
                          - generic: Autre
                        - cell:
                          - generic: B — Standard
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: / 0 FCFA
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: 0 commande(s)
                        - cell:
                          - generic: Actif
                        - cell:
                          - button:
                            - img
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - img
                            - generic:
                              - generic: "Client #39 #39"
                              - generic: CLT-039
                        - cell:
                          - generic:
                            - generic:
                              - img
                              - text: client.39@2si-sarl.sn
                            - generic:
                              - img
                        - cell:
                          - generic: Autre
                        - cell:
                          - generic: B — Standard
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: / 0 FCFA
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: 0 commande(s)
                        - cell:
                          - generic: Actif
                        - cell:
                          - button:
                            - img
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - img
                            - generic:
                              - generic: "Client #36 #36"
                              - generic: CLT-036
                        - cell:
                          - generic:
                            - generic:
                              - img
                              - text: client.36@2si-sarl.sn
                            - generic:
                              - img
                        - cell:
                          - generic: Autre
                        - cell:
                          - generic: B — Standard
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: / 0 FCFA
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: 0 commande(s)
                        - cell:
                          - generic: Actif
                        - cell:
                          - button:
                            - img
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - img
                            - generic:
                              - generic: "Client #35 #35"
                              - generic: CLT-035
                        - cell:
                          - generic:
                            - generic:
                              - img
                              - text: client.35@2si-sarl.sn
                            - generic:
                              - img
                        - cell:
                          - generic: Autre
                        - cell:
                          - generic: B — Standard
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: / 0 FCFA
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: 0 commande(s)
                        - cell:
                          - generic: Actif
                        - cell:
                          - button:
                            - img
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - img
                            - generic:
                              - generic: "Client #33 #33"
                              - generic: CLT-033
                        - cell:
                          - generic:
                            - generic:
                              - img
                              - text: client.33@2si-sarl.sn
                            - generic:
                              - img
                        - cell:
                          - generic: Autre
                        - cell:
                          - generic: B — Standard
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: / 0 FCFA
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: 0 commande(s)
                        - cell:
                          - generic: Actif
                        - cell:
                          - button:
                            - img
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - img
                            - generic:
                              - generic: "Client #38 #38"
                              - generic: CLT-038
                        - cell:
                          - generic:
                            - generic:
                              - img
                              - text: client.38@2si-sarl.sn
                            - generic:
                              - img
                        - cell:
                          - generic: Autre
                        - cell:
                          - generic: B — Standard
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: / 0 FCFA
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: 0 commande(s)
                        - cell:
                          - generic: Actif
                        - cell:
                          - button:
                            - img
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - img
                            - generic:
                              - generic: "Client #37 #37"
                              - generic: CLT-037
                        - cell:
                          - generic:
                            - generic:
                              - img
                              - text: client.37@2si-sarl.sn
                            - generic:
                              - img
                        - cell:
                          - generic: Autre
                        - cell:
                          - generic: B — Standard
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: / 0 FCFA
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: 0 commande(s)
                        - cell:
                          - generic: Actif
                        - cell:
                          - button:
                            - img
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - img
                            - generic:
                              - generic: "Client #40 #40"
                              - generic: CLT-040
                        - cell:
                          - generic:
                            - generic:
                              - img
                              - text: client.40@2si-sarl.sn
                            - generic:
                              - img
                        - cell:
                          - generic: Autre
                        - cell:
                          - generic: B — Standard
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: / 0 FCFA
                        - cell:
                          - generic:
                            - generic: 0 FCFA
                            - generic: 0 commande(s)
                        - cell:
                          - generic: Actif
                        - cell:
                          - button:
                            - img
                - generic:
                  - generic: Page 1 sur 9
                  - generic:
                    - button [disabled]: Précédent
                    - button: Suivant
  - dialog "Nouveau client" [ref=e2]:
    - heading "Nouveau client" [level=2] [ref=e4]
    - generic [ref=e5]:
      - generic [ref=e6]:
        - text: Type
        - combobox [active] [ref=e7] [cursor=pointer]:
          - generic: Particulier
          - img [ref=e8]
      - generic [ref=e10]:
        - text: Nom
        - textbox [ref=e11]
      - generic [ref=e12]:
        - text: Prénom
        - textbox [ref=e13]
      - generic [ref=e14]:
        - text: Raison sociale
        - textbox [ref=e15]
      - generic [ref=e16]:
        - text: Email
        - textbox [ref=e17]
      - generic [ref=e18]:
        - text: Téléphone
        - textbox [ref=e19]
      - generic [ref=e20]:
        - text: Tél. secondaire
        - textbox [ref=e21]
      - generic [ref=e22]:
        - text: N° Compte
        - textbox [ref=e23]
      - generic [ref=e24]:
        - text: Limite crédit (FCFA)
        - spinbutton [ref=e25]: "0"
      - generic [ref=e26]:
        - text: Catégorie
        - combobox [ref=e27] [cursor=pointer]:
          - generic: B — Standard
          - img [ref=e28]
      - generic [ref=e30]:
        - text: Banque
        - combobox [ref=e31] [cursor=pointer]:
          - generic: Autre
          - img [ref=e32]
      - generic [ref=e34]:
        - text: Adresse
        - textbox "Rue" [ref=e35]
        - generic [ref=e36]:
          - textbox "Ville" [ref=e37]: Dakar
          - textbox "Pays" [ref=e38]: Sénégal
      - generic [ref=e39]:
        - text: Notes
        - textbox [ref=e40]
    - generic [ref=e41]:
      - button "Annuler" [ref=e42] [cursor=pointer]
      - button "Créer" [ref=e43] [cursor=pointer]
    - button "Close" [ref=e44] [cursor=pointer]:
      - img [ref=e45]
      - generic [ref=e48]: Close
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
  10  |     await expect(page.getByRole("heading", { name: /gérer la base de clients/i })).toBeVisible();
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
> 93  |     await expect(dialog.getByLabel(/nom/i)).toBeVisible();
      |                                             ^ Error: expect(locator).toBeVisible() failed
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
  111 |     // Soumettre sans remplir les champs
  112 |     await dialog.getByRole("button", { name: /créer/i }).click();
  113 |     await page.waitForTimeout(300);
  114 | 
  115 |     // Le dialog doit rester ouvert (validation bloquée)
  116 |     await expect(dialog).toBeVisible();
  117 |   });
  118 | 
  119 |   test("création d'un client avec données valides", async ({ page }) => {
  120 |     await navigateTo(page, "/admin/commercial/clients");
  121 |     await waitForLoaded(page);
  122 | 
  123 |     const lignesAvant = await page.locator("tbody tr").count();
  124 | 
  125 |     await page.getByRole("button", { name: /nouveau client/i }).click();
  126 | 
  127 |     const dialog = page.getByRole("dialog");
  128 |     await expect(dialog).toBeVisible({ timeout: 5_000 });
  129 | 
  130 |     // Remplir le formulaire
  131 |     const ts = Date.now();
  132 |     await dialog.getByLabel(/nom/i).fill(`Test Client ${ts}`);
  133 |     await dialog.getByLabel(/email/i).fill(`test${ts}@2si-test.sn`);
  134 |     await dialog.getByLabel(/téléphone/i).fill("770000000");
  135 | 
  136 |     await dialog.getByRole("button", { name: /créer/i }).click();
  137 |     await waitForLoaded(page);
  138 | 
  139 |     // Le dialog doit se fermer et la liste doit s'être mise à jour
  140 |     await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5_000 });
  141 | 
  142 |     const lignesApres = await page.locator("tbody tr").count();
  143 |     expect(lignesApres).toBeGreaterThanOrEqual(lignesAvant);
  144 |   });
  145 | 
  146 |   test("ouvre le dialog de modification depuis le menu d'actions", async ({ page }) => {
  147 |     await navigateTo(page, "/admin/commercial/clients");
  148 |     await waitForLoaded(page);
  149 | 
  150 |     const lignes = page.locator("tbody tr");
  151 |     if (await lignes.count() === 0) test.skip();
  152 | 
  153 |     // Ouvrir le menu contextuel de la première ligne
  154 |     const menuBtn = lignes.first().getByRole("button").last();
  155 |     await menuBtn.click();
  156 | 
  157 |     const modifier = page.getByRole("menuitem", { name: /modifier/i });
  158 |     const visible = await modifier.isVisible({ timeout: 3_000 }).catch(() => false);
  159 |     if (!visible) test.skip();
  160 | 
  161 |     await modifier.click();
  162 | 
  163 |     const dialog = page.getByRole("dialog");
  164 |     await expect(dialog).toBeVisible({ timeout: 5_000 });
  165 |     await expect(dialog.getByRole("heading", { name: /modifier le client/i })).toBeVisible();
  166 |     await expect(dialog.getByRole("button", { name: /enregistrer/i })).toBeVisible();
  167 |   });
  168 | 
  169 |   test("ouvre la confirmation de suppression", async ({ page }) => {
  170 |     await navigateTo(page, "/admin/commercial/clients");
  171 |     await waitForLoaded(page);
  172 | 
  173 |     const lignes = page.locator("tbody tr");
  174 |     if (await lignes.count() === 0) test.skip();
  175 | 
  176 |     const menuBtn = lignes.first().getByRole("button").last();
  177 |     await menuBtn.click();
  178 | 
  179 |     const supprimer = page.getByRole("menuitem", { name: /supprimer/i });
  180 |     const visible = await supprimer.isVisible({ timeout: 3_000 }).catch(() => false);
  181 |     if (!visible) test.skip();
  182 | 
  183 |     await supprimer.click();
  184 | 
  185 |     const dialog = page.getByRole("dialog");
  186 |     await expect(dialog).toBeVisible({ timeout: 5_000 });
  187 |     await expect(dialog.getByText(/supprimer ce client/i)).toBeVisible();
  188 |     await expect(dialog.getByRole("button", { name: /annuler/i })).toBeVisible();
  189 |     await expect(dialog.getByRole("button", { name: /supprimer/i })).toBeVisible();
  190 | 
  191 |     // Fermer sans supprimer
  192 |     await dialog.getByRole("button", { name: /annuler/i }).click();
  193 |     await expect(dialog).not.toBeVisible({ timeout: 3_000 });
```