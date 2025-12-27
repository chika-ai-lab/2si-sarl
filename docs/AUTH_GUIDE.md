# Guide d'authentification - Admin Dashboard

## Vue d'ensemble

Le système d'authentification sécurise l'accès à l'interface d'administration du site 2SI.Sarl. Seuls les utilisateurs authentifiés avec le rôle "admin" peuvent accéder au tableau de bord administrateur.

## Architecture

### Composants principaux

1. **AuthProvider** (`src/providers/AuthProvider.tsx`)
   - Contexte React pour la gestion de l'état d'authentification
   - Stockage persistant dans localStorage
   - Fonctions de connexion et déconnexion

2. **LoginPage** (`src/pages/LoginPage.tsx`)
   - Interface de connexion avec validation de formulaire
   - Redirection automatique après connexion
   - Affichage des identifiants de démonstration

3. **ProtectedRoute** (`src/components/auth/ProtectedRoute.tsx`)
   - Composant wrapper pour protéger les routes
   - Vérification de l'authentification et des rôles
   - Redirection vers la page de connexion si non authentifié

4. **AdminLayout** (`src/components/layout/AdminLayout.tsx`)
   - Affichage des informations utilisateur
   - Bouton de déconnexion
   - Menu déroulant de profil

## Identifiants de démonstration

Pour accéder au tableau de bord administrateur en mode démonstration :

- **Email** : `admin@2si.sarl`
- **Mot de passe** : `admin123`

## Flux d'authentification

### 1. Connexion

```
1. L'utilisateur accède à /login
2. Saisit ses identifiants (email + mot de passe)
3. Clique sur "Se connecter"
4. Le système vérifie les identifiants (simulation API)
5. Si valide : stockage de l'utilisateur dans localStorage + redirection
6. Si invalide : affichage d'un message d'erreur
```

### 2. Protection des routes

```
1. L'utilisateur tente d'accéder à /admin/*
2. ProtectedRoute vérifie l'authentification
3. Si non authentifié : redirection vers /login
4. Si authentifié mais pas admin : page "Accès non autorisé"
5. Si authentifié et admin : affichage de la page demandée
```

### 3. Déconnexion

```
1. L'utilisateur clique sur "Déconnexion"
2. Le contexte Auth supprime l'utilisateur
3. localStorage est nettoyé
4. Redirection vers /login
5. Affichage d'une notification de déconnexion
```

## Utilisation du contexte Auth

### Dans un composant

```typescript
import { useAuth } from "@/providers/AuthProvider";

function MyComponent() {
  const { user, isAuthenticated, login, logout, isAdmin } = useAuth();

  // Vérifier si l'utilisateur est connecté
  if (!isAuthenticated) {
    return <div>Non connecté</div>;
  }

  // Vérifier si l'utilisateur est admin
  if (isAdmin()) {
    return <div>Vous êtes administrateur</div>;
  }

  // Afficher les informations utilisateur
  return (
    <div>
      <p>Nom : {user?.name}</p>
      <p>Email : {user?.email}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

## Structure de l'utilisateur

```typescript
interface User {
  id: string;           // Identifiant unique
  email: string;        // Email de l'utilisateur
  name: string;         // Nom complet
  role: "admin" | "user"; // Rôle de l'utilisateur
}
```

## Protection des routes

### Protéger une route simple

```typescript
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### Protéger avec vérification admin

```typescript
<Route
  path="/admin"
  element={
    <ProtectedRoute requireAdmin>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<DashboardPage />} />
  <Route path="products" element={<ProductsPage />} />
  {/* ... autres routes admin ... */}
</Route>
```

## Stockage persistant

L'état d'authentification est stocké dans `localStorage` sous la clé `2si-auth-user`.

### Structure stockée

```json
{
  "id": "1",
  "email": "admin@2si.sarl",
  "name": "Administrateur",
  "role": "admin"
}
```

### Avantages

- **Persistance** : L'utilisateur reste connecté après rechargement de la page
- **Performance** : Pas besoin d'appel API à chaque chargement
- **Simplicité** : Gestion facile de l'état

### Sécurité

⚠️ **Important** : Dans un environnement de production, vous devriez :

1. Utiliser des tokens JWT stockés de manière sécurisée
2. Implémenter un refresh token system
3. Ajouter une expiration de session
4. Utiliser HTTPS uniquement
5. Valider les tokens côté serveur

## Intégration avec l'API (Production)

Pour connecter le système à une vraie API :

### 1. Modifier la fonction login

```typescript
const login = async (email: string, password: string): Promise<void> => {
  try {
    // Appel API réel
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Identifiants invalides");
    }

    const data = await response.json();

    // data contient : { user, token }
    const user: User = data.user;

    setUser(user);
    saveUserToStorage(user);

    // Stocker le token pour les futures requêtes
    localStorage.setItem("auth-token", data.token);

    toast({
      title: "Connexion réussie",
      description: `Bienvenue, ${user.name}`,
    });
  } catch (error) {
    throw error;
  }
};
```

### 2. Ajouter une vérification de token au chargement

```typescript
useEffect(() => {
  const verifyToken = async () => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const { user } = await response.json();
        setUser(user);
      } else {
        // Token invalide, nettoyer le stockage
        localStorage.removeItem("auth-token");
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Token verification failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  verifyToken();
}, []);
```

## Pages accessibles

### Pages publiques (sans authentification)

- `/` - Page d'accueil
- `/catalog` - Catalogue de produits
- `/cart` - Panier
- `/order` - Formulaire de commande
- `/login` - Page de connexion

### Pages protégées (admin uniquement)

- `/admin` ou `/admin/dashboard` - Tableau de bord
- `/admin/orders` - Gestion des commandes
- `/admin/products` - Gestion des produits
- `/admin/customers` - Gestion des clients
- `/admin/reports` - Rapports
- `/admin/credit-requests` - Demandes de crédit
- `/admin/settings` - Paramètres

## Messages de notification

Le système affiche des notifications toast pour :

- ✅ **Connexion réussie** : "Bienvenue, [Nom]"
- ✅ **Déconnexion** : "Vous avez été déconnecté avec succès"
- ❌ **Erreur de connexion** : "Email ou mot de passe incorrect"

## États du système

### isLoading

Indique si le système est en train de vérifier l'authentification au chargement initial.

```typescript
if (isLoading) {
  return <LoadingSpinner />;
}
```

### isAuthenticated

Booléen indiquant si un utilisateur est connecté.

```typescript
if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
```

### user

Objet contenant les informations de l'utilisateur connecté ou `null`.

```typescript
{user && (
  <div>Connecté en tant que {user.name}</div>
)}
```

## Personnalisation

### Changer les identifiants de démo

Modifiez la fonction `login` dans `AuthProvider.tsx` :

```typescript
if (email === "votre-email@domaine.com" && password === "votre-mot-de-passe") {
  // ...
}
```

### Ajouter des rôles supplémentaires

1. Modifier le type `User` :

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "manager" | "editor"; // Ajoutez vos rôles
}
```

2. Ajouter des vérifications de rôles :

```typescript
const isManager = (): boolean => {
  return user?.role === "manager";
};
```

3. Protéger les routes avec le nouveau rôle :

```typescript
<ProtectedRoute requireRole="manager">
  <ManagerPage />
</ProtectedRoute>
```

## Dépannage

### L'utilisateur reste connecté après suppression du localStorage

Rechargez complètement la page (Ctrl+F5) pour réinitialiser l'état React.

### Redirection en boucle vers /login

Vérifiez que l'utilisateur a bien le rôle "admin" dans le localStorage.

### Message "Accès non autorisé"

L'utilisateur connecté n'a pas le rôle "admin". Vérifiez la propriété `role` de l'utilisateur.

## Sécurité - Bonnes pratiques

Pour la production, implémentez :

1. **HTTPS obligatoire** - Toutes les communications doivent être chiffrées
2. **Tokens JWT** - Utilisez des tokens signés avec expiration
3. **Refresh tokens** - Pour renouveler les sessions sans re-connexion
4. **Rate limiting** - Limitez les tentatives de connexion
5. **2FA optionnel** - Authentification à deux facteurs pour les admins
6. **Logging** - Enregistrez toutes les tentatives de connexion
7. **Validation côté serveur** - Ne faites jamais confiance au client
8. **CORS strict** - Configurez correctement les origines autorisées

## Support

Pour toute question concernant l'authentification, référez-vous à la documentation officielle de React Context API et localStorage.
