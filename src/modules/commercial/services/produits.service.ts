/**
 * Service de gestion des produits catalogue
 * Architecture API-ready avec mocks
 */

import type {
  ProduitCatalogue,
  ProduitFilters,
  PaginatedResponse,
  ApiResponse,
  BanquePartenaire,
} from '../types';
import { USE_MOCK_API, simulateNetworkDelay } from './api.config';
import { products, type Product } from '@/data/products';

// ============================================
// DATA MAPPING
// ============================================

// Note: Banque = garant financier (CBAO ou CMS), pas lié aux produits vendus
// Les produits réels de 2SI sont: climatisation, groupes électrogènes, matériels informatiques, etc.

/**
 * Map des banques partenaires par produit (garants financiers)
 * Alternance entre CBAO, CMS et Autre pour la variété des filtres
 */
const PRODUCT_BANQUE_MAP: Record<string, BanquePartenaire> = {
  'prod-001': 'CBAO',   // Ordinateur Portable Pro
  'prod-002': 'CMS',    // Bureau Ergonomique
  'prod-003': 'CBAO',   // Imprimante Multifonction
  'prod-004': 'CMS',    // Fauteuil Direction
  'prod-005': 'CBAO',   // Serveur NAS
  'prod-006': 'CMS',    // Chariot Élévateur
  'prod-007': 'Autre',  // Perceuse Colonne
  'prod-008': 'CBAO',   // Écran Moniteur
};

/**
 * Convertit un produit V1 en produit catalogue V2
 */
function mapProductToProduitCatalogue(product: Product): ProduitCatalogue {
  // Calcul du prix d'achat (environ 70% du prix de vente pour une marge de 30%)
  const prixAchat = product.compareAtPrice
    ? Math.round(product.compareAtPrice * 0.65)
    : Math.round(product.price * 0.70);

  const prixVente = product.price;
  const marge = prixVente - prixAchat;

  // Extraction des URLs d'images
  const images = product.images.map(img => img.url);

  // Détermination du statut
  let statut: 'actif' | 'inactif' | 'rupture';
  if (!product.inStock) {
    statut = 'rupture';
  } else if (product.stockQuantity && product.stockQuantity < 5) {
    statut = 'actif'; // En stock mais faible
  } else {
    statut = 'actif';
  }

  // Mapping de la catégorie en français
  const categorieMap: Record<string, string> = {
    'electronics': 'Électronique',
    'furniture': 'Mobilier',
    'equipment': 'Équipement',
    'vehicles': 'Véhicules',
    'tools': 'Outillage',
  };

  return {
    id: product.id,
    reference: product.reference,
    nom: product.name,
    description: product.description,

    categorie: categorieMap[product.category] || product.category,
    sousCategorie: product.subCategory,
    marque: extractBrandFromProduct(product),
    banque: PRODUCT_BANQUE_MAP[product.id] || 'Autre',

    prixAchat,
    prixVente,
    prixPromo: product.onSale ? product.price : undefined,
    marge,

    stock: {
      quantite: product.stockQuantity || 0,
      seuilAlerte: Math.max(5, Math.round((product.stockQuantity || 10) * 0.3)),
      unite: 'piece',
    },

    specifications: product.specifications,
    images,

    statut,
    dateAjout: '2024-01-15',
    derniereModification: new Date().toISOString().split('T')[0],
  };
}

/**
 * Extrait la marque du produit à partir de ses spécifications ou nom
 */
function extractBrandFromProduct(product: Product): string | undefined {
  // Chercher dans les spécifications
  if (product.specifications) {
    const brandKeys = ['Marque', 'Brand', 'Fabricant', 'Manufacturer'];
    for (const key of brandKeys) {
      if (product.specifications[key]) {
        return product.specifications[key];
      }
    }
  }

  // Marques connues à extraire du nom ou description
  const knownBrands = ['Intel', 'Dell', 'HP', 'Lenovo', 'Samsung', 'LG', 'Daikin', 'Mitsubishi'];
  const text = `${product.name} ${product.description}`;

  for (const brand of knownBrands) {
    if (text.includes(brand)) {
      return brand;
    }
  }

  return undefined;
}

// Conversion des produits existants
export const MOCK_PRODUITS: ProduitCatalogue[] = products.map(mapProductToProduitCatalogue);

// ============================================
// API FUNCTIONS (Mock)
// ============================================

/**
 * Récupère la liste des produits avec filtres et pagination
 */
export async function getProduits(
  filters: ProduitFilters = {}
): Promise<PaginatedResponse<ProduitCatalogue>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    let filtered = [...MOCK_PRODUITS];

    // Filtres
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nom.toLowerCase().includes(search) ||
          p.reference.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.categorie.toLowerCase().includes(search)
      );
    }

    if (filters.banque) {
      filtered = filtered.filter((p) => p.banque === filters.banque);
    }

    if (filters.categorie) {
      filtered = filtered.filter((p) => p.categorie === filters.categorie);
    }

    if (filters.statut) {
      filtered = filtered.filter((p) => p.statut === filters.statut);
    }

    if (filters.prixMin !== undefined) {
      filtered = filtered.filter((p) => p.prixVente >= filters.prixMin!);
    }

    if (filters.prixMax !== undefined) {
      filtered = filtered.filter((p) => p.prixVente <= filters.prixMax!);
    }

    // Tri
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[filters.sortBy!];
        const bVal = b[filters.sortBy!];
        const order = filters.sortOrder === 'desc' ? -1 : 1;
        return aVal > bVal ? order : -order;
      });
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filtered.slice(start, end);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/catalogue?${new URLSearchParams(filters as any)}`);
  return response.json();
}

/**
 * Récupère un produit par son ID
 */
export async function getProduitById(id: string): Promise<ApiResponse<ProduitCatalogue>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const produit = MOCK_PRODUITS.find((p) => p.id === id);

    if (!produit) {
      return {
        success: false,
        message: 'Produit non trouvé',
      };
    }

    return {
      success: true,
      data: produit,
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/catalogue/${id}`);
  return response.json();
}

/**
 * Récupère les produits par banque
 */
export async function getProduitsByBanque(banque: string): Promise<PaginatedResponse<ProduitCatalogue>> {
  return getProduits({ banque: banque as any });
}

/**
 * Récupère les catégories de produits
 */
export async function getCategories() {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const categories = [...new Set(MOCK_PRODUITS.map(p => p.categorie))];

    return {
      success: true,
      data: categories,
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch('/api/commercial/catalogue/categories');
  return response.json();
}

/**
 * Récupère les statistiques produits
 */
export async function getProduitsStats() {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    return {
      total: MOCK_PRODUITS.length,
      actifs: MOCK_PRODUITS.filter((p) => p.statut === 'actif').length,
      cbao: MOCK_PRODUITS.filter((p) => p.banque === 'CBAO').length,
      cms: MOCK_PRODUITS.filter((p) => p.banque === 'CMS').length,
      valeurStock: MOCK_PRODUITS.reduce((acc, p) => acc + (p.prixAchat * p.stock.quantite), 0),
      margeTotal: MOCK_PRODUITS.reduce((acc, p) => acc + p.marge, 0),
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch('/api/commercial/stats/produits');
  return response.json();
}
