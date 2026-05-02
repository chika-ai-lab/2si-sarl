# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: barro\clients.spec.ts >> Mme Barro — Gestion des clients >> ouvre la confirmation de suppression
- Location: e2e\barro\clients.spec.ts:169:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('dialog')

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
  - alertdialog "Supprimer ce client ?" [ref=e2]:
    - generic [ref=e3]:
      - heading "Supprimer ce client ?" [level=2] [ref=e4]
      - paragraph [ref=e5]:
        - text: Cette action est irréversible. Toutes les données de
        - strong [ref=e6]: CISS
        - text: seront supprimées.
    - generic [ref=e7]:
      - button "Annuler" [active] [ref=e8] [cursor=pointer]
      - button "Supprimer" [ref=e9] [cursor=pointer]
```

# Test source

```ts
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
> 186 |     await expect(dialog).toBeVisible({ timeout: 5_000 });
      |                          ^ Error: expect(locator).toBeVisible() failed
  187 |     await expect(dialog.getByText(/supprimer ce client/i)).toBeVisible();
  188 |     await expect(dialog.getByRole("button", { name: /annuler/i })).toBeVisible();
  189 |     await expect(dialog.getByRole("button", { name: /supprimer/i })).toBeVisible();
  190 | 
  191 |     // Fermer sans supprimer
  192 |     await dialog.getByRole("button", { name: /annuler/i }).click();
  193 |     await expect(dialog).not.toBeVisible({ timeout: 3_000 });
  194 |   });
  195 | 
  196 |   test("pagination : boutons Précédent / Suivant présents", async ({ page }) => {
  197 |     await navigateTo(page, "/admin/commercial/clients");
  198 |     await waitForLoaded(page);
  199 | 
  200 |     // Les boutons de pagination doivent exister (même désactivés)
  201 |     await expect(page.getByRole("button", { name: /précédent/i })).toBeVisible();
  202 |     await expect(page.getByRole("button", { name: /suivant/i })).toBeVisible();
  203 |   });
  204 | });
  205 | 
```