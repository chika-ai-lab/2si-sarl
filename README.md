# Configurable Commerce Hub - 2SI.Sarl

Développé par **Kreatify.sn** - Agence de développement digital

## À propos du projet

**Configurable Commerce Hub** est une plateforme e-commerce innovante spécialisée dans la vente d'équipements professionnels avec paiement échelonné. Cette solution permet aux entreprises et professionnels d'acquérir leur équipement en répartissant le paiement sur 6, 12, 24 ou 36 mois.

## Technologies utilisées

Ce projet est construit avec les technologies modernes suivantes :

- **Vite** - Build tool ultra-rapide
- **TypeScript** - Typage statique pour JavaScript
- **React** - Bibliothèque UI composable
- **shadcn-ui** - Composants UI accessibles et personnalisables
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Navigation côté client
- **React Query** - Gestion d'état serveur
- **React Hook Form** - Gestion de formulaires performante
- **Zod** - Validation de schémas TypeScript

## Installation et démarrage

### Prérequis

- Node.js 18+ et npm installés - [installer avec nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Étapes d'installation

```sh
# Étape 1 : Cloner le dépôt
git clone <VOTRE_URL_GIT>

# Étape 2 : Naviguer dans le répertoire du projet
cd configurable-commerce-hub

# Étape 3 : Installer les dépendances
npm install

# Étape 4 : Démarrer le serveur de développement
npm run dev
```

Le serveur de développement démarrera sur `http://localhost:8080`

## Scripts disponibles

```sh
npm run dev          # Démarre le serveur de développement
npm run build        # Compile pour la production
npm run build:dev    # Compile en mode développement
npm run preview      # Prévisualise la build de production
npm run lint         # Analyse le code avec ESLint
```

## Structure du projet

```
configurable-commerce-hub/
├── src/
│   ├── components/     # Composants React réutilisables
│   ├── pages/          # Pages de l'application
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilitaires et configurations
│   ├── locales/        # Fichiers de traduction (i18n)
│   └── main.tsx        # Point d'entrée de l'application
├── public/             # Ressources statiques
└── index.html          # Template HTML
```

## Développement

### Contribuer au projet

1. Créer une branche pour votre fonctionnalité : `git checkout -b feature/ma-fonctionnalite`
2. Commiter vos changements : `git commit -m 'Ajout de ma fonctionnalité'`
3. Pousser vers la branche : `git push origin feature/ma-fonctionnalite`
4. Ouvrir une Pull Request

### Standards de code

- Utiliser TypeScript pour tous les nouveaux fichiers
- Suivre les conventions ESLint configurées
- Utiliser les composants shadcn-ui pour l'UI
- Appliquer les classes Tailwind CSS pour le styling

## Déploiement

Le dashboard est déployé sur **Cloudflare Workers** (SPA statique servie depuis `./dist`).

| Élément | Valeur |
|---|---|
| Plateforme | Cloudflare Workers (Worker Builds — build automatique depuis le repo git) |
| Compte Cloudflare | **kantecheikh** |
| Nom du worker | `emc-store` (voir [`wrangler.json`](./wrangler.json)) |
| URL publique | https://dashboard.sen-services.com |
| DNS | OVH (enregistrements A) + Cloudflare |

> L'app commerciale (PWA) `2si-pwa` est déployée séparément (worker `commercial-emc`, `app.sen-services.com`).
> L'API (`gestemc-api`) est déployée à part — voir `gestemc-api/DEPLOYMENT.md`.

### Commandes de build

```sh
npm run build        # Génère le build de production dans /dist
```

### Déploiement manuel (depuis ce dossier)

```sh
npm run build
npx wrangler deploy  # publie ./dist sur le worker emc-store (compte kantecheikh)
```

### Feature flags / activation des fonctionnalités

L'activation des modules et fonctionnalités est **en dur** dans
[`src/config/features.config.ts`](./src/config/features.config.ts) — **ni variables
d'environnement, ni base de données**. Pour masquer une fonctionnalité, passer sa
valeur à `false` dans ce fichier, puis rebuild + redeploy.

### Dépannage — « build token deleted or rolled »

Erreur Cloudflare : *« The build token selected for this build has been deleted or
rolled and cannot be used for this build. »*

C'est un problème de **réglage Cloudflare**, pas de code. Le jeton que Worker Builds
utilise pour builder a été supprimé/régénéré. Correction :

1. Cloudflare Dashboard → **Workers & Pages** → worker `emc-store` → **Settings** → **Build**.
2. Rubrique **Build token** : cliquer **Update / reconnect** et générer un nouveau jeton
   (ou reconnecter l'intégration Git GitHub).
3. Relancer le build (**Retry**).

Alternative immédiate : déployer en local avec `npx wrangler deploy` (le build local
ne dépend pas du build token Cloudflare).

## Support et Contact

Développé avec ❤️ par [Kreatify.sn](https://kreatify.sn)

Pour toute question ou support technique, contactez-nous à : **support@kreatify.sn**

## Licence

Copyright © 2025 Kreatify.sn - Tous droits réservés
