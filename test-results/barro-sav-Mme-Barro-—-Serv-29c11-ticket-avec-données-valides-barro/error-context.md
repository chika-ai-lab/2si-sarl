# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: barro\sav.spec.ts >> Mme Barro — Service Après-Vente >> création d'un ticket avec données valides
- Location: e2e\barro\sav.spec.ts:118:3

# Error details

```
TimeoutError: locator.fill: Timeout 10000ms exceeded.
Call log:
  - waiting for getByRole('dialog').getByLabel(/sujet/i)

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
                - heading [level=2]: Service Après-Vente
                - paragraph: Gestion des tickets SAV, interventions et suivi client
              - button:
                - img
                - text: Nouveau ticket
            - generic:
              - generic:
                - generic:
                  - heading [level=3]: Total tickets
                  - img
                - generic:
                  - generic: "0"
              - generic:
                - generic:
                  - heading [level=3]: Ouverts
                  - img
                - generic:
                  - generic: "0"
              - generic:
                - generic:
                  - heading [level=3]: En cours
                  - img
                - generic:
                  - generic: "0"
              - generic:
                - generic:
                  - heading [level=3]: Satisfaction
                  - img
                - generic:
                  - generic: 0.0/5
              - generic:
                - generic:
                  - heading [level=3]: Coût total
                  - img
                - generic:
                  - generic: 0 FCFA
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - img
                      - textbox:
                        - /placeholder: Rechercher par numéro, sujet, description...
                    - generic:
                      - button:
                        - img
                      - button:
                        - img
                  - generic:
                    - generic:
                      - generic: Statut
                      - combobox:
                        - generic: Tous les statuts
                        - img
                    - generic:
                      - generic: Priorité
                      - combobox:
                        - generic: Toutes les priorités
                        - img
                    - generic:
                      - generic: Type
                      - combobox:
                        - generic: Tous les types
                        - img
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - img
                        - heading [level=3]: Ouvert
                      - generic: "0"
                - generic:
                  - generic: Aucun ticket
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - img
                        - heading [level=3]: En cours
                      - generic: "0"
                - generic:
                  - generic: Aucun ticket
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - img
                        - heading [level=3]: En attente pièces
                      - generic: "0"
                - generic:
                  - generic: Aucun ticket
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - img
                        - heading [level=3]: Résolu
                      - generic: "0"
                - generic:
                  - generic: Aucun ticket
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - img
                        - heading [level=3]: Fermé
                      - generic: "0"
                - generic:
                  - generic: Aucun ticket
  - dialog:
    - generic:
      - heading [level=2]: Nouveau ticket SAV
    - generic:
      - generic:
        - generic: Client *
        - combobox [expanded]:
          - generic: Sélectionner un client
          - img
      - generic:
        - generic:
          - text: Type de ticket
          - combobox:
            - generic: Réclamation
            - img
        - generic:
          - text: Priorité
          - combobox:
            - generic: Normale
            - img
      - generic:
        - generic: Sujet *
        - textbox:
          - /placeholder: "Ex: Ordinateur ne démarre plus"
      - generic:
        - generic: Description *
        - textbox:
          - /placeholder: Décrivez le problème en détail...
      - generic:
        - checkbox
        - generic: Produit sous garantie
    - generic:
      - button: Annuler
      - button: Créer le ticket
    - button:
      - img
      - generic: Close
  - listbox [ref=e2]:
    - option "CISS - mamadouciss30@gmail.com" [active] [ref=e3]:
      - generic [ref=e5]: CISS - mamadouciss30@gmail.com
    - 'option "Client #62 - client.62@2si-sarl.sn" [ref=e6]':
      - generic [ref=e8]: "Client #62 - client.62@2si-sarl.sn"
    - 'option "Client #65 - client.65@2si-sarl.sn" [ref=e9]':
      - generic [ref=e11]: "Client #65 - client.65@2si-sarl.sn"
    - 'option "Client #93 - client.93@2si-sarl.sn" [ref=e12]':
      - generic [ref=e14]: "Client #93 - client.93@2si-sarl.sn"
    - 'option "Client #91 - client.91@2si-sarl.sn" [ref=e15]':
      - generic [ref=e17]: "Client #91 - client.91@2si-sarl.sn"
    - 'option "Client #90 - client.90@2si-sarl.sn" [ref=e18]':
      - generic [ref=e20]: "Client #90 - client.90@2si-sarl.sn"
    - 'option "Client #88 - client.88@2si-sarl.sn" [ref=e21]':
      - generic [ref=e23]: "Client #88 - client.88@2si-sarl.sn"
    - 'option "Client #87 - client.87@2si-sarl.sn" [ref=e24]':
      - generic [ref=e26]: "Client #87 - client.87@2si-sarl.sn"
    - 'option "Client #86 - client.86@2si-sarl.sn" [ref=e27]':
      - generic [ref=e29]: "Client #86 - client.86@2si-sarl.sn"
    - 'option "Client #83 - client.83@2si-sarl.sn" [ref=e30]':
      - generic [ref=e32]: "Client #83 - client.83@2si-sarl.sn"
    - 'option "Client #80 - client.80@2si-sarl.sn" [ref=e33]':
      - generic [ref=e35]: "Client #80 - client.80@2si-sarl.sn"
    - 'option "Client #79 - client.79@2si-sarl.sn" [ref=e36]':
      - generic [ref=e38]: "Client #79 - client.79@2si-sarl.sn"
    - 'option "Client #77 - client.77@2si-sarl.sn" [ref=e39]':
      - generic [ref=e41]: "Client #77 - client.77@2si-sarl.sn"
    - 'option "Client #76 - client.76@2si-sarl.sn" [ref=e42]':
      - generic [ref=e44]: "Client #76 - client.76@2si-sarl.sn"
    - 'option "Client #75 - client.75@2si-sarl.sn" [ref=e45]':
      - generic [ref=e47]: "Client #75 - client.75@2si-sarl.sn"
    - 'option "Client #74 - client.74@2si-sarl.sn" [ref=e48]':
      - generic [ref=e50]: "Client #74 - client.74@2si-sarl.sn"
    - 'option "Client #73 - client.73@2si-sarl.sn" [ref=e51]':
      - generic [ref=e53]: "Client #73 - client.73@2si-sarl.sn"
    - 'option "Client #72 - client.72@2si-sarl.sn" [ref=e54]':
      - generic [ref=e56]: "Client #72 - client.72@2si-sarl.sn"
    - 'option "Client #71 - client.71@2si-sarl.sn" [ref=e57]':
      - generic [ref=e59]: "Client #71 - client.71@2si-sarl.sn"
    - 'option "Client #43 - client.43@2si-sarl.sn" [ref=e60]':
      - generic [ref=e62]: "Client #43 - client.43@2si-sarl.sn"
    - 'option "Client #70 - client.70@2si-sarl.sn" [ref=e63]':
      - generic [ref=e65]: "Client #70 - client.70@2si-sarl.sn"
    - 'option "Client #68 - client.68@2si-sarl.sn" [ref=e66]':
      - generic [ref=e68]: "Client #68 - client.68@2si-sarl.sn"
    - 'option "Client #67 - client.67@2si-sarl.sn" [ref=e69]':
      - generic [ref=e71]: "Client #67 - client.67@2si-sarl.sn"
    - 'option "Client #63 - client.63@2si-sarl.sn" [ref=e72]':
      - generic [ref=e74]: "Client #63 - client.63@2si-sarl.sn"
    - 'option "Client #44 - client.44@2si-sarl.sn" [ref=e75]':
      - generic [ref=e77]: "Client #44 - client.44@2si-sarl.sn"
    - 'option "Client #60 - client.60@2si-sarl.sn" [ref=e78]':
      - generic [ref=e80]: "Client #60 - client.60@2si-sarl.sn"
    - 'option "Client #59 - client.59@2si-sarl.sn" [ref=e81]':
      - generic [ref=e83]: "Client #59 - client.59@2si-sarl.sn"
    - 'option "Client #58 - client.58@2si-sarl.sn" [ref=e84]':
      - generic [ref=e86]: "Client #58 - client.58@2si-sarl.sn"
    - 'option "Client #57 - client.57@2si-sarl.sn" [ref=e87]':
      - generic [ref=e89]: "Client #57 - client.57@2si-sarl.sn"
    - 'option "Client #56 - client.56@2si-sarl.sn" [ref=e90]':
      - generic [ref=e92]: "Client #56 - client.56@2si-sarl.sn"
    - 'option "Client #55 - client.55@2si-sarl.sn" [ref=e93]':
      - generic [ref=e95]: "Client #55 - client.55@2si-sarl.sn"
    - 'option "Client #54 - client.54@2si-sarl.sn" [ref=e96]':
      - generic [ref=e98]: "Client #54 - client.54@2si-sarl.sn"
    - 'option "Client #33 - client.33@2si-sarl.sn" [ref=e99]':
      - generic [ref=e101]: "Client #33 - client.33@2si-sarl.sn"
    - 'option "Client #35 - client.35@2si-sarl.sn" [ref=e102]':
      - generic [ref=e104]: "Client #35 - client.35@2si-sarl.sn"
    - 'option "Client #36 - client.36@2si-sarl.sn" [ref=e105]':
      - generic [ref=e107]: "Client #36 - client.36@2si-sarl.sn"
    - 'option "Client #37 - client.37@2si-sarl.sn" [ref=e108]':
      - generic [ref=e110]: "Client #37 - client.37@2si-sarl.sn"
    - 'option "Client #38 - client.38@2si-sarl.sn" [ref=e111]':
      - generic [ref=e113]: "Client #38 - client.38@2si-sarl.sn"
    - 'option "Client #39 - client.39@2si-sarl.sn" [ref=e114]':
      - generic [ref=e116]: "Client #39 - client.39@2si-sarl.sn"
    - 'option "Client #40 - client.40@2si-sarl.sn" [ref=e117]':
      - generic [ref=e119]: "Client #40 - client.40@2si-sarl.sn"
    - 'option "Client #41 - client.41@2si-sarl.sn" [ref=e120]':
      - generic [ref=e122]: "Client #41 - client.41@2si-sarl.sn"
    - 'option "Client #42 - client.42@2si-sarl.sn" [ref=e123]':
      - generic [ref=e125]: "Client #42 - client.42@2si-sarl.sn"
    - 'option "Client #53 - client.53@2si-sarl.sn" [ref=e126]':
      - generic [ref=e128]: "Client #53 - client.53@2si-sarl.sn"
    - 'option "Client #45 - client.45@2si-sarl.sn" [ref=e129]':
      - generic [ref=e131]: "Client #45 - client.45@2si-sarl.sn"
    - 'option "Client #61 - client.61@2si-sarl.sn" [ref=e132]':
      - generic [ref=e134]: "Client #61 - client.61@2si-sarl.sn"
    - 'option "Client #46 - client.46@2si-sarl.sn" [ref=e135]':
      - generic [ref=e137]: "Client #46 - client.46@2si-sarl.sn"
    - 'option "Client #47 - client.47@2si-sarl.sn" [ref=e138]':
      - generic [ref=e140]: "Client #47 - client.47@2si-sarl.sn"
    - 'option "Client #48 - client.48@2si-sarl.sn" [ref=e141]':
      - generic [ref=e143]: "Client #48 - client.48@2si-sarl.sn"
    - 'option "Client #49 - client.49@2si-sarl.sn" [ref=e144]':
      - generic [ref=e146]: "Client #49 - client.49@2si-sarl.sn"
    - 'option "Client #50 - client.50@2si-sarl.sn" [ref=e147]':
      - generic [ref=e149]: "Client #50 - client.50@2si-sarl.sn"
    - 'option "Client #51 - client.51@2si-sarl.sn" [ref=e150]':
      - generic [ref=e152]: "Client #51 - client.51@2si-sarl.sn"
    - 'option "Client #52 - client.52@2si-sarl.sn" [ref=e153]':
      - generic [ref=e155]: "Client #52 - client.52@2si-sarl.sn"
    - option "sd - client.32@2si-sarl.sn" [ref=e156]:
      - generic [ref=e158]: sd - client.32@2si-sarl.sn
    - option "sd - client.31@2si-sarl.sn" [ref=e159]:
      - generic [ref=e161]: sd - client.31@2si-sarl.sn
    - option "Faye - nfaye13@gmail.com" [ref=e162]:
      - generic [ref=e164]: Faye - nfaye13@gmail.com
    - option "sd - client.29@2si-sarl.sn" [ref=e165]:
      - generic [ref=e167]: sd - client.29@2si-sarl.sn
    - option "sd - client.28@2si-sarl.sn" [ref=e168]:
      - generic [ref=e170]: sd - client.28@2si-sarl.sn
    - option "sd - client.27@2si-sarl.sn" [ref=e171]:
      - generic [ref=e173]: sd - client.27@2si-sarl.sn
    - option "sd - client.26@2si-sarl.sn" [ref=e174]:
      - generic [ref=e176]: sd - client.26@2si-sarl.sn
    - option "sd - client.25@2si-sarl.sn" [ref=e177]:
      - generic [ref=e179]: sd - client.25@2si-sarl.sn
    - option "sd - client.24@2si-sarl.sn" [ref=e180]:
      - generic [ref=e182]: sd - client.24@2si-sarl.sn
    - option "sd - client.23@2si-sarl.sn" [ref=e183]:
      - generic [ref=e185]: sd - client.23@2si-sarl.sn
    - option "sd - client.22@2si-sarl.sn" [ref=e186]:
      - generic [ref=e188]: sd - client.22@2si-sarl.sn
    - option "sd - client.21@2si-sarl.sn" [ref=e189]:
      - generic [ref=e191]: sd - client.21@2si-sarl.sn
    - option "sd - client.20@2si-sarl.sn" [ref=e192]:
      - generic [ref=e194]: sd - client.20@2si-sarl.sn
    - option "pape - papi@papi.com" [ref=e195]:
      - generic [ref=e197]: pape - papi@papi.com
    - option "sd - client.18@2si-sarl.sn" [ref=e198]:
      - generic [ref=e200]: sd - client.18@2si-sarl.sn
    - option "sd - client.17@2si-sarl.sn" [ref=e201]:
      - generic [ref=e203]: sd - client.17@2si-sarl.sn
    - option "sd - client.16@2si-sarl.sn" [ref=e204]:
      - generic [ref=e206]: sd - client.16@2si-sarl.sn
    - option "sd - client.15@2si-sarl.sn" [ref=e207]:
      - generic [ref=e209]: sd - client.15@2si-sarl.sn
    - option "sd - client.14@2si-sarl.sn" [ref=e210]:
      - generic [ref=e212]: sd - client.14@2si-sarl.sn
    - option "sd - client.13@2si-sarl.sn" [ref=e213]:
      - generic [ref=e215]: sd - client.13@2si-sarl.sn
    - option "sd - client.12@2si-sarl.sn" [ref=e216]:
      - generic [ref=e218]: sd - client.12@2si-sarl.sn
    - option "sd - client.11@2si-sarl.sn" [ref=e219]:
      - generic [ref=e221]: sd - client.11@2si-sarl.sn
    - option "sd - client.10@2si-sarl.sn" [ref=e222]:
      - generic [ref=e224]: sd - client.10@2si-sarl.sn
    - option "sd - client.9@2si-sarl.sn" [ref=e225]:
      - generic [ref=e227]: sd - client.9@2si-sarl.sn
    - option "sd - client.8@2si-sarl.sn" [ref=e228]:
      - generic [ref=e230]: sd - client.8@2si-sarl.sn
    - option "pape - pai@hotmail.fr" [ref=e231]:
      - generic [ref=e233]: pape - pai@hotmail.fr
    - option "sd - client.6@2si-sarl.sn" [ref=e234]:
      - generic [ref=e236]: sd - client.6@2si-sarl.sn
    - option "sd - client.5@2si-sarl.sn" [ref=e237]:
      - generic [ref=e239]: sd - client.5@2si-sarl.sn
    - option "sd - client.4@2si-sarl.sn" [ref=e240]:
      - generic [ref=e242]: sd - client.4@2si-sarl.sn
    - option "sd - client.3@2si-sarl.sn" [ref=e243]:
      - generic [ref=e245]: sd - client.3@2si-sarl.sn
    - option "sd - client.2@2si-sarl.sn" [ref=e246]:
      - generic [ref=e248]: sd - client.2@2si-sarl.sn
    - option "sd - ds@sd.sd" [ref=e249]:
      - generic [ref=e251]: sd - ds@sd.sd
    - img [ref=e253]
```

# Test source

```ts
  39  |     const selectStatut = page.getByRole("combobox").filter({ hasText: /tous les statuts/i });
  40  |     const visible = await selectStatut.isVisible({ timeout: 3_000 }).catch(() => false);
  41  |     if (!visible) test.skip();
  42  | 
  43  |     await selectStatut.click();
  44  |     await page.getByRole("option", { name: /^ouvert$/i }).click();
  45  |     await waitForLoaded(page);
  46  | 
  47  |     await expect(page.getByRole("heading", { name: /service après-vente/i })).toBeVisible();
  48  |   });
  49  | 
  50  |   test("le filtre par priorité fonctionne", async ({ page }) => {
  51  |     await navigateTo(page, "/admin/commercial/sav");
  52  |     await waitForLoaded(page);
  53  | 
  54  |     const selectPriorite = page.getByRole("combobox").filter({ hasText: /toutes les priorités/i });
  55  |     const visible = await selectPriorite.isVisible({ timeout: 3_000 }).catch(() => false);
  56  |     if (!visible) test.skip();
  57  | 
  58  |     await selectPriorite.click();
  59  |     await page.getByRole("option", { name: /haute/i }).click();
  60  |     await waitForLoaded(page);
  61  | 
  62  |     await expect(page.getByRole("heading", { name: /service après-vente/i })).toBeVisible();
  63  |   });
  64  | 
  65  |   test("le filtre par type fonctionne", async ({ page }) => {
  66  |     await navigateTo(page, "/admin/commercial/sav");
  67  |     await waitForLoaded(page);
  68  | 
  69  |     const selectType = page.getByRole("combobox").filter({ hasText: /tous les types/i });
  70  |     const visible = await selectType.isVisible({ timeout: 3_000 }).catch(() => false);
  71  |     if (!visible) test.skip();
  72  | 
  73  |     await selectType.click();
  74  |     await page.getByRole("option", { name: /réclamation/i }).click();
  75  |     await waitForLoaded(page);
  76  | 
  77  |     await expect(page.getByRole("heading", { name: /service après-vente/i })).toBeVisible();
  78  |   });
  79  | 
  80  |   test("ouvre le formulaire de création d'un ticket", async ({ page }) => {
  81  |     await navigateTo(page, "/admin/commercial/sav");
  82  |     await waitForLoaded(page);
  83  | 
  84  |     await page.getByRole("button", { name: /nouveau ticket/i }).click();
  85  | 
  86  |     const dialog = page.getByRole("dialog");
  87  |     await expect(dialog).toBeVisible({ timeout: 5_000 });
  88  |     await expect(dialog.getByRole("heading", { name: /nouveau ticket sav/i })).toBeVisible();
  89  | 
  90  |     // Champs du formulaire
  91  |     await expect(dialog.getByText(/client/i).first()).toBeVisible();
  92  |     await expect(dialog.getByText(/type de ticket/i)).toBeVisible();
  93  |     await expect(dialog.getByText(/priorité/i)).toBeVisible();
  94  |     await expect(dialog.getByLabel(/sujet/i)).toBeVisible();
  95  |     await expect(dialog.getByLabel(/description/i)).toBeVisible();
  96  | 
  97  |     await expect(dialog.getByRole("button", { name: /annuler/i })).toBeVisible();
  98  |     await expect(dialog.getByRole("button", { name: /créer le ticket/i })).toBeVisible();
  99  |   });
  100 | 
  101 |   test("validation : sujet requis bloque la soumission", async ({ page }) => {
  102 |     await navigateTo(page, "/admin/commercial/sav");
  103 |     await waitForLoaded(page);
  104 | 
  105 |     await page.getByRole("button", { name: /nouveau ticket/i }).click();
  106 | 
  107 |     const dialog = page.getByRole("dialog");
  108 |     await expect(dialog).toBeVisible({ timeout: 5_000 });
  109 | 
  110 |     // Soumettre sans remplir les champs
  111 |     await dialog.getByRole("button", { name: /créer le ticket/i }).click();
  112 |     await page.waitForTimeout(300);
  113 | 
  114 |     // Le dialog reste ouvert
  115 |     await expect(dialog).toBeVisible();
  116 |   });
  117 | 
  118 |   test("création d'un ticket avec données valides", async ({ page }) => {
  119 |     await navigateTo(page, "/admin/commercial/sav");
  120 |     await waitForLoaded(page);
  121 | 
  122 |     await page.getByRole("button", { name: /nouveau ticket/i }).click();
  123 | 
  124 |     const dialog = page.getByRole("dialog");
  125 |     await expect(dialog).toBeVisible({ timeout: 5_000 });
  126 | 
  127 |     // Sélectionner un client
  128 |     const selectClient = dialog.getByRole("combobox").filter({ hasText: /sélectionner un client/i });
  129 |     const hasClient = await selectClient.isVisible({ timeout: 2_000 }).catch(() => false);
  130 |     if (hasClient) {
  131 |       await selectClient.click();
  132 |       const premiereOption = page.locator("[cmdk-item]").first();
  133 |       if (await premiereOption.isVisible({ timeout: 2_000 }).catch(() => false)) {
  134 |         await premiereOption.click();
  135 |       }
  136 |     }
  137 | 
  138 |     const ts = Date.now();
> 139 |     await dialog.getByLabel(/sujet/i).fill(`Ticket test ${ts}`);
      |                                       ^ TimeoutError: locator.fill: Timeout 10000ms exceeded.
  140 |     await dialog.getByLabel(/description/i).fill("Problème de test automatisé Playwright.");
  141 | 
  142 |     await dialog.getByRole("button", { name: /créer le ticket/i }).click();
  143 |     await waitForLoaded(page);
  144 | 
  145 |     // Le dialog doit se fermer
  146 |     await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5_000 });
  147 |   });
  148 | 
  149 |   test("fermeture du dialog via Annuler", async ({ page }) => {
  150 |     await navigateTo(page, "/admin/commercial/sav");
  151 |     await waitForLoaded(page);
  152 | 
  153 |     await page.getByRole("button", { name: /nouveau ticket/i }).click();
  154 | 
  155 |     const dialog = page.getByRole("dialog");
  156 |     await expect(dialog).toBeVisible({ timeout: 5_000 });
  157 | 
  158 |     await dialog.getByRole("button", { name: /annuler/i }).click();
  159 |     await expect(dialog).not.toBeVisible({ timeout: 3_000 });
  160 |   });
  161 | 
  162 |   test("bascule vers la vue Kanban", async ({ page }) => {
  163 |     await navigateTo(page, "/admin/commercial/sav");
  164 |     await waitForLoaded(page);
  165 | 
  166 |     // Les boutons de vue sont des icônes — chercher le container de toggle
  167 |     const toggleKanban = page.locator('[aria-label*="kanban" i], [title*="kanban" i], button:has([data-lucide="layout-grid"])').first();
  168 |     const hasToggle = await toggleKanban.isVisible({ timeout: 2_000 }).catch(() => false);
  169 |     if (!hasToggle) test.skip();
  170 | 
  171 |     await toggleKanban.click();
  172 |     await waitForLoaded(page);
  173 | 
  174 |     // Colonnes Kanban attendues
  175 |     await expect(page.getByText(/^ouvert$/i).first()).toBeVisible();
  176 |     await expect(page.getByText(/^en cours$/i).first()).toBeVisible();
  177 |     await expect(page.getByText(/^résolu$/i)).toBeVisible();
  178 |   });
  179 | 
  180 |   test("pagination disponible sur la vue liste", async ({ page }) => {
  181 |     await navigateTo(page, "/admin/commercial/sav");
  182 |     await waitForLoaded(page);
  183 | 
  184 |     // Les boutons de pagination doivent exister
  185 |     await expect(page.getByRole("button", { name: /précédent/i })).toBeVisible();
  186 |     await expect(page.getByRole("button", { name: /suivant/i })).toBeVisible();
  187 |   });
  188 | });
  189 | 
```