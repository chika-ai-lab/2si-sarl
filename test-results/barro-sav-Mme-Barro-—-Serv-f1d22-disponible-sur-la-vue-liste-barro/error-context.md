# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: barro\sav.spec.ts >> Mme Barro — Service Après-Vente >> pagination disponible sur la vue liste
- Location: e2e\barro\sav.spec.ts:180:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /précédent/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /précédent/i })

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
            - img [ref=e44]
            - generic [ref=e49]: Clients
          - link "Accréditif" [ref=e50] [cursor=pointer]:
            - /url: /admin/commercial/accreditif
            - img [ref=e51]
            - generic [ref=e53]: Accréditif
          - link "SAV" [ref=e54] [cursor=pointer]:
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
              - heading "Service Après-Vente" [level=2] [ref=e92]
              - paragraph [ref=e93]: Gestion des tickets SAV, interventions et suivi client
            - button "Nouveau ticket" [ref=e94] [cursor=pointer]:
              - img
              - text: Nouveau ticket
          - generic [ref=e95]:
            - generic [ref=e96]:
              - generic [ref=e97]:
                - heading "Total tickets" [level=3] [ref=e98]
                - img [ref=e99]
              - generic [ref=e102]: "0"
            - generic [ref=e103]:
              - generic [ref=e104]:
                - heading "Ouverts" [level=3] [ref=e105]
                - img [ref=e106]
              - generic [ref=e109]: "0"
            - generic [ref=e110]:
              - generic [ref=e111]:
                - heading "En cours" [level=3] [ref=e112]
                - img [ref=e113]
              - generic [ref=e117]: "0"
            - generic [ref=e118]:
              - generic [ref=e119]:
                - heading "Satisfaction" [level=3] [ref=e120]
                - img [ref=e121]
              - generic [ref=e124]: 0.0/5
            - generic [ref=e125]:
              - generic [ref=e126]:
                - heading "Coût total" [level=3] [ref=e127]
                - img [ref=e128]
              - generic [ref=e132]: 0 FCFA
          - generic [ref=e135]:
            - generic [ref=e136]:
              - generic [ref=e137]:
                - img [ref=e138]
                - textbox "Rechercher par numéro, sujet, description..." [ref=e141]
              - generic [ref=e142]:
                - button [ref=e143] [cursor=pointer]:
                  - img
                - button [ref=e144] [cursor=pointer]:
                  - img
            - generic [ref=e145]:
              - generic [ref=e146]:
                - generic [ref=e147]: Statut
                - combobox [ref=e148] [cursor=pointer]:
                  - generic: Tous les statuts
                  - img [ref=e149]
              - generic [ref=e151]:
                - generic [ref=e152]: Priorité
                - combobox [ref=e153] [cursor=pointer]:
                  - generic: Toutes les priorités
                  - img [ref=e154]
              - generic [ref=e156]:
                - generic [ref=e157]: Type
                - combobox [ref=e158] [cursor=pointer]:
                  - generic: Tous les types
                  - img [ref=e159]
          - generic [ref=e161]:
            - generic [ref=e162]:
              - generic [ref=e165]:
                - generic [ref=e166]:
                  - img [ref=e167]
                  - heading "Ouvert" [level=3] [ref=e169]
                - generic [ref=e170]: "0"
              - generic [ref=e172]: Aucun ticket
            - generic [ref=e173]:
              - generic [ref=e176]:
                - generic [ref=e177]:
                  - img [ref=e178]
                  - heading "En cours" [level=3] [ref=e181]
                - generic [ref=e182]: "0"
              - generic [ref=e184]: Aucun ticket
            - generic [ref=e185]:
              - generic [ref=e188]:
                - generic [ref=e189]:
                  - img [ref=e190]
                  - heading "En attente pièces" [level=3] [ref=e192]
                - generic [ref=e193]: "0"
              - generic [ref=e195]: Aucun ticket
            - generic [ref=e196]:
              - generic [ref=e199]:
                - generic [ref=e200]:
                  - img [ref=e201]
                  - heading "Résolu" [level=3] [ref=e204]
                - generic [ref=e205]: "0"
              - generic [ref=e207]: Aucun ticket
            - generic [ref=e208]:
              - generic [ref=e211]:
                - generic [ref=e212]:
                  - img [ref=e213]
                  - heading "Fermé" [level=3] [ref=e216]
                - generic [ref=e217]: "0"
              - generic [ref=e219]: Aucun ticket
```

# Test source

```ts
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
  139 |     await dialog.getByLabel(/sujet/i).fill(`Ticket test ${ts}`);
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
> 185 |     await expect(page.getByRole("button", { name: /précédent/i })).toBeVisible();
      |                                                                    ^ Error: expect(locator).toBeVisible() failed
  186 |     await expect(page.getByRole("button", { name: /suivant/i })).toBeVisible();
  187 |   });
  188 | });
  189 | 
```