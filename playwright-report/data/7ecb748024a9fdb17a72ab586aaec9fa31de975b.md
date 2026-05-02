# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: barro\rapports.spec.ts >> Mme Barro — Rapports Commerciaux >> le bouton Exporter Excel est visible et cliquable
- Location: e2e\barro\rapports.spec.ts:86:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /exporter excel/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /exporter excel/i })

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
            - img [ref=e55]
            - generic [ref=e57]: SAV
          - link "Comptabilité" [ref=e58] [cursor=pointer]:
            - /url: /admin/commercial/compta
            - img [ref=e59]
            - generic [ref=e62]: Comptabilité
          - link "Rapports" [ref=e63] [cursor=pointer]:
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
          - link "Retour au tableau de bord" [ref=e90] [cursor=pointer]:
            - /url: /admin
            - img [ref=e91]
            - text: Retour au tableau de bord
          - generic [ref=e93]:
            - generic [ref=e94]:
              - img [ref=e98]
              - heading "Page non trouvée" [level=3] [ref=e102]
              - paragraph [ref=e103]: La page "/admin/commercial/rapports" que vous recherchez n'existe pas ou n'a pas encore été créée.
            - generic [ref=e104]:
              - generic [ref=e105]:
                - img [ref=e106]
                - generic [ref=e111]:
                  - heading "Page en construction" [level=3] [ref=e112]
                  - paragraph [ref=e113]: Notre équipe travaille activement sur cette fonctionnalité. Elle sera disponible prochainement.
              - generic [ref=e114]:
                - generic [ref=e115]:
                  - img [ref=e116]
                  - generic [ref=e118]: "Fonctionnalités prévues :"
                - list [ref=e119]:
                  - listitem [ref=e120]:
                    - generic [ref=e121]: →
                    - generic [ref=e122]: Vérifiez l'URL saisie
                  - listitem [ref=e123]:
                    - generic [ref=e124]: →
                    - generic [ref=e125]: Retournez au tableau de bord
                  - listitem [ref=e126]:
                    - generic [ref=e127]: →
                    - generic [ref=e128]: Utilisez le menu de navigation pour trouver la page souhaitée
                  - listitem [ref=e129]:
                    - generic [ref=e130]: →
                    - generic [ref=e131]: Contactez l'administrateur si vous pensez qu'il s'agit d'une erreur
              - generic [ref=e132]:
                - link "Retour au tableau de bord" [ref=e133] [cursor=pointer]:
                  - /url: /admin
                  - img
                  - text: Retour au tableau de bord
                - link "Tableau de bord" [ref=e134] [cursor=pointer]:
                  - /url: /admin
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { navigateTo, waitForLoaded } from "../helpers";
  3   | 
  4   | test.describe("Mme Barro — Rapports Commerciaux", () => {
  5   | 
  6   |   test("affiche le titre et les 6 KPI cards", async ({ page }) => {
  7   |     await navigateTo(page, "/admin/commercial/rapports");
  8   |     await waitForLoaded(page);
  9   | 
  10  |     await expect(page.getByRole("heading", { name: /rapports commerciaux/i })).toBeVisible();
  11  | 
  12  |     // KPI primaires
  13  |     await expect(page.getByText("CA Total")).toBeVisible();
  14  |     await expect(page.getByText("Commandes")).toBeVisible();
  15  |     await expect(page.getByText("Panier Moyen")).toBeVisible();
  16  |     await expect(page.getByText(/taux de conversion/i)).toBeVisible();
  17  | 
  18  |     // KPI secondaires
  19  |     await expect(page.getByText(/accréditifs actifs/i)).toBeVisible();
  20  |     await expect(page.getByText(/CA du Mois/i)).toBeVisible();
  21  |   });
  22  | 
  23  |   test("affiche les sections graphiques", async ({ page }) => {
  24  |     await navigateTo(page, "/admin/commercial/rapports");
  25  |     await waitForLoaded(page);
  26  | 
  27  |     await expect(page.getByText(/évolution du chiffre d'affaires/i)).toBeVisible();
  28  |     await expect(page.getByText(/répartition par banque/i)).toBeVisible();
  29  |     await expect(page.getByText(/top 5 produits/i)).toBeVisible();
  30  |     await expect(page.getByText(/top 5 clients/i)).toBeVisible();
  31  |   });
  32  | 
  33  |   test("affiche les tables Top Produits et Top Clients", async ({ page }) => {
  34  |     await navigateTo(page, "/admin/commercial/rapports");
  35  |     await waitForLoaded(page);
  36  | 
  37  |     // Table Top Produits
  38  |     const tableProduits = page.locator("table").first();
  39  |     const hasProduits = await tableProduits.isVisible({ timeout: 5_000 }).catch(() => false);
  40  |     if (hasProduits) {
  41  |       await expect(tableProduits.getByText(/produit/i).first()).toBeVisible();
  42  |       await expect(tableProduits.getByText(/qté/i).first()).toBeVisible();
  43  |       await expect(tableProduits.getByText(/^ca$/i).first()).toBeVisible();
  44  |     }
  45  |   });
  46  | 
  47  |   test("affiche la table Détails par Banque", async ({ page }) => {
  48  |     await navigateTo(page, "/admin/commercial/rapports");
  49  |     await waitForLoaded(page);
  50  | 
  51  |     await expect(page.getByText(/détails par banque/i)).toBeVisible();
  52  | 
  53  |     const table = page.locator("table").last();
  54  |     const visible = await table.isVisible({ timeout: 3_000 }).catch(() => false);
  55  |     if (!visible) test.skip();
  56  | 
  57  |     await expect(table.getByText(/banque/i).first()).toBeVisible();
  58  |     await expect(table.getByText(/chiffre d'affaires/i).first()).toBeVisible();
  59  |     await expect(table.getByText(/nombre de commandes/i).first()).toBeVisible();
  60  |   });
  61  | 
  62  |   test("le filtre par banque rafraîchit les données", async ({ page }) => {
  63  |     await navigateTo(page, "/admin/commercial/rapports");
  64  |     await waitForLoaded(page);
  65  | 
  66  |     const selectBanque = page.getByRole("combobox").filter({ hasText: /toutes les banques/i });
  67  |     const visible = await selectBanque.isVisible({ timeout: 3_000 }).catch(() => false);
  68  |     if (!visible) test.skip();
  69  | 
  70  |     await selectBanque.click();
  71  |     await page.getByRole("option", { name: /^cbao$/i }).click();
  72  |     await waitForLoaded(page);
  73  | 
  74  |     // La page doit toujours afficher le titre (pas de crash)
  75  |     await expect(page.getByRole("heading", { name: /rapports commerciaux/i })).toBeVisible();
  76  |   });
  77  | 
  78  |   test("les filtres de date sont accessibles", async ({ page }) => {
  79  |     await navigateTo(page, "/admin/commercial/rapports");
  80  |     await waitForLoaded(page);
  81  | 
  82  |     await expect(page.getByLabel(/date début/i)).toBeVisible();
  83  |     await expect(page.getByLabel(/date fin/i)).toBeVisible();
  84  |   });
  85  | 
  86  |   test("le bouton Exporter Excel est visible et cliquable", async ({ page }) => {
  87  |     await navigateTo(page, "/admin/commercial/rapports");
  88  |     await waitForLoaded(page);
  89  | 
  90  |     const btnExcel = page.getByRole("button", { name: /exporter excel/i });
> 91  |     await expect(btnExcel).toBeVisible();
      |                            ^ Error: expect(locator).toBeVisible() failed
  92  | 
  93  |     await btnExcel.click();
  94  |     await page.waitForTimeout(300);
  95  | 
  96  |     // Le sous-menu doit afficher les options d'export
  97  |     await expect(page.getByRole("menuitem", { name: /rapport complet/i }).first()).toBeVisible();
  98  |     await expect(page.getByRole("menuitem", { name: /évolution ca/i })).toBeVisible();
  99  |     await expect(page.getByRole("menuitem", { name: /top produits/i })).toBeVisible();
  100 | 
  101 |     // Fermer le menu
  102 |     await page.keyboard.press("Escape");
  103 |   });
  104 | 
  105 |   test("le bouton Exporter PDF est visible et cliquable", async ({ page }) => {
  106 |     await navigateTo(page, "/admin/commercial/rapports");
  107 |     await waitForLoaded(page);
  108 | 
  109 |     const btnPDF = page.getByRole("button", { name: /exporter pdf/i });
  110 |     await expect(btnPDF).toBeVisible();
  111 | 
  112 |     await btnPDF.click();
  113 |     await page.waitForTimeout(300);
  114 | 
  115 |     // Le sous-menu doit afficher les options PDF
  116 |     await expect(page.getByRole("menuitem", { name: /rapport complet avec graphiques/i })).toBeVisible();
  117 | 
  118 |     await page.keyboard.press("Escape");
  119 |   });
  120 | 
  121 |   test("le sélecteur de vue période fonctionne", async ({ page }) => {
  122 |     await navigateTo(page, "/admin/commercial/rapports");
  123 |     await waitForLoaded(page);
  124 | 
  125 |     const selectPeriode = page.getByRole("combobox").filter({ hasText: /mensuelle|hebdomadaire/i });
  126 |     const visible = await selectPeriode.isVisible({ timeout: 3_000 }).catch(() => false);
  127 |     if (!visible) test.skip();
  128 | 
  129 |     await selectPeriode.click();
  130 |     await page.getByRole("option", { name: /hebdomadaire/i }).click();
  131 |     await waitForLoaded(page);
  132 | 
  133 |     // Vérifier que la page ne crashe pas après changement de vue
  134 |     await expect(page.getByRole("heading", { name: /rapports commerciaux/i })).toBeVisible();
  135 |   });
  136 | });
  137 | 
```