# Guide d'importation de produits

## Vue d'ensemble

La fonctionnalité d'importation de produits permet aux administrateurs d'importer en masse des produits dans le catalogue via des fichiers Excel (.xlsx, .xls) ou CSV (.csv).

## Comment accéder à la fonctionnalité

1. Connectez-vous au tableau de bord administrateur
2. Allez dans la section **Produits**
3. Cliquez sur le bouton **Importer** en haut à droite

## Format du fichier

### Colonnes requises

Le fichier doit contenir les colonnes suivantes (noms exacts) :

| Colonne | Type | Requis | Description | Exemple |
|---------|------|--------|-------------|---------|
| `name` | Texte | ✓ | Nom du produit | "Ordinateur Portable Dell XPS 15" |
| `description` | Texte | ✓ | Description détaillée du produit | "Ordinateur portable haute performance avec processeur Intel Core i7..." |
| `reference` | Texte | ✓ | Référence unique du produit | "DELL-XPS15-001" |
| `category` | Texte | ✓ | Catégorie du produit | "electronics" |
| `price` | Nombre | ✓ | Prix en FCFA | 1299000 |
| `imageUrl` | URL | ✓ | URL de l'image du produit | "https://example.com/images/dell-xps15.jpg" |
| `stockQuantity` | Nombre | ✗ | Quantité en stock | 25 |
| `tags` | Texte | ✗ | Tags séparés par des virgules | "laptop, dell, gaming" |
| `isNew` | Booléen | ✗ | Produit nouveau | true ou false |
| `isBestSeller` | Booléen | ✗ | Produit best-seller | true ou false |

### Catégories valides

Les catégories suivantes sont acceptées :
- `electronics` - Électronique
- `furniture` - Mobilier
- `kitchen` - Équipement de cuisine
- `office` - Fournitures de bureau
- `tools` - Outils

## Étapes d'importation

### 1. Télécharger le modèle

1. Cliquez sur **Télécharger le modèle** dans la boîte de dialogue d'importation
2. Un fichier Excel nommé `template_import_produits.xlsx` sera téléchargé
3. Utilisez ce fichier comme base pour votre importation

### 2. Remplir le fichier

1. Ouvrez le fichier template dans Excel, Google Sheets ou LibreOffice
2. Remplissez les données de vos produits ligne par ligne
3. Assurez-vous que :
   - Toutes les colonnes requises sont remplies
   - Les catégories correspondent aux valeurs valides
   - Les prix sont des nombres positifs
   - Les URLs d'images sont valides
   - Les références sont uniques

### 3. Importer le fichier

1. Cliquez sur **Sélectionner un fichier** dans la zone de dépôt
2. Choisissez votre fichier Excel ou CSV
3. Le système affichera un aperçu des données détectées
4. Vérifiez l'aperçu pour vous assurer que les données sont correctes
5. Cliquez sur **Importer X produit(s)** pour lancer l'importation

### 4. Vérifier les résultats

- Une notification s'affichera avec le nombre de produits importés avec succès
- En cas d'erreurs, elles seront listées avec le numéro de ligne concerné
- Les produits valides seront importés même si certaines lignes contiennent des erreurs

## Exemple de fichier CSV

```csv
name,description,reference,category,price,stockQuantity,imageUrl,tags,isNew,isBestSeller
"Ordinateur Portable Dell XPS 15","Ordinateur portable haute performance avec processeur Intel Core i7, 16GB RAM, SSD 512GB","DELL-XPS15-001",electronics,1299000,25,"https://example.com/dell-xps15.jpg","laptop, dell, gaming",true,false
"Bureau en Chêne Massif","Bureau professionnel en chêne massif avec tiroirs intégrés, dimensions 150x80cm","BUR-OAK-150",furniture,450000,10,"https://example.com/oak-desk.jpg","bureau, chêne, professionnel",false,true
"Machine à Café Expresso","Machine à expresso automatique avec broyeur intégré et mousseur à lait","CAFE-ESP-001",kitchen,289000,50,"https://example.com/espresso.jpg","café, expresso, cuisine",true,true
```

## Bonnes pratiques

### Préparation des données

1. **Utilisez le template** - Commencez toujours avec le fichier template fourni
2. **Vérifiez les URLs d'images** - Assurez-vous que toutes les URLs sont accessibles
3. **Références uniques** - Chaque produit doit avoir une référence unique
4. **Descriptions complètes** - Fournissez des descriptions détaillées (minimum 10 caractères)
5. **Prix réalistes** - Vérifiez que les prix sont corrects (en FCFA)

### Validation

1. **Testez avec peu de produits** - Commencez par importer 5-10 produits pour tester
2. **Vérifiez l'aperçu** - Examinez toujours l'aperçu avant d'importer
3. **Catégories correctes** - Utilisez uniquement les catégories valides listées
4. **Format cohérent** - Maintenez un format cohérent pour tous les produits

### Gestion des erreurs

Si l'importation échoue :

1. **Vérifiez le format du fichier** - Excel (.xlsx, .xls) ou CSV uniquement
2. **Colonnes manquantes** - Assurez-vous que toutes les colonnes requises sont présentes
3. **Données invalides** - Vérifiez les prix, catégories et URLs
4. **Encodage** - Pour les CSV, utilisez l'encodage UTF-8

## Limitations

- **Taille de fichier** - Recommandé : maximum 1000 produits par importation
- **Images** - Les images doivent être hébergées en ligne (URLs uniquement)
- **Format** - Excel (.xlsx, .xls) ou CSV uniquement
- **Catégories** - Limitées aux 5 catégories prédéfinies

## Support

En cas de problème :

1. Vérifiez que votre fichier respecte le format requis
2. Téléchargez à nouveau le template et comparez
3. Testez avec un fichier contenant seulement 2-3 produits
4. Vérifiez la console pour les messages d'erreur détaillés

## Exemple de template Excel

Le template téléchargeable contient un exemple de produit pré-rempli :

- **Nom** : Exemple Produit
- **Description** : Description détaillée du produit
- **Référence** : REF-12345
- **Catégorie** : electronics
- **Prix** : 599000
- **Quantité en stock** : 50
- **URL image** : https://example.com/image.jpg
- **Tags** : tag1, tag2, tag3
- **Nouveau** : true
- **Best Seller** : false

Utilisez cet exemple comme guide pour structurer vos propres données.
