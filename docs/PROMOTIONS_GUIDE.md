# Guide de Configuration des Promotions

Ce guide explique comment configurer et gérer les bannières promotionnelles affichées en haut du site.

## 📋 Vue d'Ensemble

Les promotions apparaissent dans une bannière colorée tout en haut du site, au-dessus du header principal. Vous pouvez configurer plusieurs promotions avec des dates de début et de fin, et elles s'affichent automatiquement pendant leur période active.

## ⚙️ Configuration Rapide

Fichier à modifier : `src/config/promotions.config.ts`

### Activer/Désactiver les Promotions

```typescript
export const promotionsConfig: PromotionsConfig = {
  enabled: true,  // ✅ Activer | ❌ false pour désactiver toutes les promos
  autoRotate: false,  // Rotation automatique entre plusieurs promos actives
  rotationInterval: 5000,  // Durée d'affichage en millisecondes (5000 = 5 secondes)
  promotions: [...]
};
```

## 🎯 Gérer les Promotions

### Structure d'une Promotion

```typescript
{
  id: "christmas-2024",           // ID unique
  enabled: true,                  // ✅ Activer cette promo
  title: {
    fr: "🎄 Promo Noël : Jusqu'à -30% !",
    en: "🎄 Christmas Sale: Up to -30% off!",
  },
  link: "/catalog?promo=christmas", // Optionnel : lien cliquable
  startDate: "2024-12-15",         // Date de début (YYYY-MM-DD)
  endDate: "2024-12-31",           // Date de fin (YYYY-MM-DD)
  backgroundColor: "#c41e3a",      // Couleur de fond
  textColor: "#ffffff",            // Couleur du texte
}
```

### Promotions Pré-configurées

Le fichier contient déjà 5 promotions prêtes à l'emploi :

| ID | Occasion | Dates par défaut |
|----|----------|------------------|
| `christmas-2024` | Noël | 15 déc - 31 déc |
| `newyear-2025` | Nouvel An | 1 jan - 15 jan |
| `ramadan-2025` | Ramadan | 10 mar - 9 avr |
| `independence-2025` | Indépendance | 4 avr - 5 avr |
| `free-delivery` | Livraison gratuite | Toujours active |

## 📅 Cas d'Usage Courants

### 1️⃣ Activer la Promo de Noël

```typescript
{
  id: "christmas-2024",
  enabled: true,  // 👈 Mettre à true
  title: {
    fr: "🎄 Promo Noël : Jusqu'à -30% sur une sélection d'articles !",
    en: "🎄 Christmas Sale: Up to -30% off selected items!",
  },
  link: "/catalog?promo=christmas",
  startDate: "2024-12-15",
  endDate: "2024-12-31",
  backgroundColor: "#c41e3a",  // Rouge Noël
  textColor: "#ffffff",
}
```

**Résultat** : Bannière rouge affichée du 15 au 31 décembre, cliquable vers le catalogue

---

### 2️⃣ Afficher une Promo Sans Date (Toujours Active)

```typescript
{
  id: "free-delivery",
  enabled: true,
  title: {
    fr: "📦 Livraison gratuite à partir de 500 000 FCFA",
    en: "📦 Free delivery from 500,000 FCFA",
  },
  // Pas de startDate ni endDate = toujours active
  backgroundColor: "#165b33",
  textColor: "#ffffff",
}
```

**Résultat** : Bannière verte affichée en permanence

---

### 3️⃣ Créer une Nouvelle Promo

Ajoutez un nouvel objet dans le tableau `promotions` :

```typescript
{
  id: "valentine-2025",
  enabled: true,
  title: {
    fr: "💝 Saint-Valentin : Offrez avec amour !",
    en: "💝 Valentine's Day: Give with love!",
  },
  link: "/catalog?promo=valentine",
  startDate: "2025-02-10",
  endDate: "2025-02-14",
  backgroundColor: "#ff69b4",  // Rose
  textColor: "#ffffff",
}
```

---

### 4️⃣ Rotation Automatique Entre Plusieurs Promos

Si vous avez plusieurs promos actives en même temps :

```typescript
export const promotionsConfig: PromotionsConfig = {
  enabled: true,
  autoRotate: true,  // ✅ Activer la rotation
  rotationInterval: 5000,  // Changer toutes les 5 secondes
  promotions: [
    { id: "promo1", enabled: true, ... },
    { id: "promo2", enabled: true, ... },
    { id: "promo3", enabled: true, ... },
  ]
};
```

**Résultat** : Les 3 promos s'affichent tour à tour, changeant toutes les 5 secondes

---

### 5️⃣ Désactiver Temporairement une Promo

```typescript
{
  id: "christmas-2024",
  enabled: false,  // 👈 Désactiver sans supprimer
  // ... reste de la config
}
```

---

### 6️⃣ Désactiver Toutes les Promos

```typescript
export const promotionsConfig: PromotionsConfig = {
  enabled: false,  // ❌ Toutes les promos désactivées
  // ... reste de la config
}
```

## 🎨 Personnalisation des Couleurs

### Couleurs Suggérées par Occasion

| Occasion | backgroundColor | textColor |
|----------|----------------|-----------|
| Noël | `#c41e3a` (rouge) | `#ffffff` |
| Nouvel An | `#4169e1` (bleu royal) | `#ffffff` |
| Ramadan | `#ffd700` (or) | `#000000` |
| Indépendance | `#00853f` (vert) | `#ffffff` |
| Soldes | `#ff4500` (orange) | `#ffffff` |
| Info | `#165b33` (vert foncé) | `#ffffff` |

### Utiliser des Couleurs Personnalisées

```typescript
{
  backgroundColor: "#your-color-hex",
  textColor: "#your-text-color",
}
```

**Conseil** : Assurez-vous d'un bon contraste entre fond et texte pour la lisibilité.

## 🔗 Liens et Actions

### Lien vers une Page Spécifique

```typescript
link: "/catalog?promo=christmas"  // Vers le catalogue avec filtre
```

### Lien vers une Catégorie

```typescript
link: "/catalog?categories=electronics"
```

### Pas de Lien (Bannière Non Cliquable)

```typescript
// Ne pas inclure la propriété link
title: { ... },
backgroundColor: "#165b33",
textColor: "#ffffff",
// Pas de link = bannière informative seulement
```

## 📱 Comportement Responsive

- **Desktop** : Bannière pleine largeur en haut du header
- **Mobile** : Bannière pleine largeur, texte adapté
- **Bouton Fermer** : Visible sur toutes les tailles d'écran

## ⚡ Fonctionnalités Avancées

### Icônes dans le Titre

Utilisez des emojis directement dans le texte :

```typescript
title: {
  fr: "🎄 Promo Noël",  // Emoji au début
  en: "🎊 New Year Sale",
}
```

### Gestion Automatique par Date

Le système vérifie automatiquement :
- Si la date actuelle est dans la plage `startDate` - `endDate`
- Si `enabled: true`
- N'affiche que les promos qui répondent à ces critères

**Vous n'avez pas besoin de désactiver manuellement après la date de fin !**

## 🛠️ Workflow Recommandé

### Préparation pour une Promotion

1. **Une semaine avant** : Configurer la promo avec `enabled: false`
2. **Le jour J** : Passer `enabled: true`
3. **Après la promo** : La date de fin désactive automatiquement

### Configuration Annuelle (Recommandée)

```typescript
promotions: [
  // Noël
  {
    id: "christmas-2024",
    enabled: true,  // ✅ Laisser activé
    startDate: "2024-12-15",
    endDate: "2024-12-31",
    // S'affichera automatiquement du 15 au 31 décembre
  },

  // Nouvel An
  {
    id: "newyear-2025",
    enabled: true,  // ✅ Laisser activé
    startDate: "2025-01-01",
    endDate: "2025-01-15",
    // S'affichera automatiquement du 1 au 15 janvier
  },

  // Ramadan (⚠️ Mettre à jour chaque année)
  {
    id: "ramadan-2025",
    enabled: true,
    startDate: "2025-03-10",  // 👈 Ajuster annuellement
    endDate: "2025-04-09",    // 👈 Ajuster annuellement
  },
]
```

**Avantage** : Configurez une fois, les promos s'affichent automatiquement aux bonnes périodes !

## 🎯 Exemples Complets

### Exemple 1 : Promo Flash (Courte Durée)

```typescript
{
  id: "flash-sale-2025",
  enabled: true,
  title: {
    fr: "⚡ FLASH : -50% pendant 24h seulement !",
    en: "⚡ FLASH: -50% for 24 hours only!",
  },
  link: "/catalog?promo=flash",
  startDate: "2025-01-20",
  endDate: "2025-01-20",  // Même jour = 24h
  backgroundColor: "#ff4500",
  textColor: "#ffffff",
}
```

### Exemple 2 : Promo Saisonnière (Longue Durée)

```typescript
{
  id: "summer-sale-2025",
  enabled: true,
  title: {
    fr: "☀️ Soldes d'Été : Profitez de -20% tout l'été !",
    en: "☀️ Summer Sale: Enjoy -20% all summer!",
  },
  link: "/catalog?promo=summer",
  startDate: "2025-06-01",
  endDate: "2025-08-31",  // Tout l'été
  backgroundColor: "#ffa500",
  textColor: "#ffffff",
}
```

### Exemple 3 : Information Permanente

```typescript
{
  id: "new-showroom",
  enabled: true,
  title: {
    fr: "🏪 Nouveau showroom ouvert à Dakar !",
    en: "🏪 New showroom now open in Dakar!",
  },
  link: "/about",
  // Pas de dates = toujours visible
  backgroundColor: "#4169e1",
  textColor: "#ffffff",
}
```

## 🐛 Dépannage

**Problème** : La bannière ne s'affiche pas

**Solutions** :
1. ✅ Vérifier : `promotionsConfig.enabled: true`
2. ✅ Vérifier : au moins une promo a `enabled: true`
3. ✅ Vérifier : la date actuelle est dans la plage `startDate` - `endDate`
4. ✅ Vérifier : les dates sont au format `YYYY-MM-DD`
5. ✅ Vider le cache et recharger (Ctrl+Shift+R)

**Problème** : Plusieurs promos s'affichent en même temps

**Solution** : Activer la rotation automatique ou désactiver les promos supplémentaires

```typescript
autoRotate: true,  // Rotation entre promos actives
// OU
{ id: "promo2", enabled: false }  // Désactiver les autres
```

## 📝 Checklist de Maintenance

### Mensuelle
- [ ] Vérifier les promos actives
- [ ] Mettre à jour les dates si nécessaire
- [ ] Tester l'affichage sur desktop et mobile

### Annuelle
- [ ] Mettre à jour les dates du Ramadan
- [ ] Planifier les promos pour l'année
- [ ] Archiver les anciennes promos (ou les désactiver)

---

Pour toute question, consultez le code source dans :
- `src/config/promotions.config.ts` - Configuration
- `src/components/promo/PromoBanner.tsx` - Composant d'affichage
