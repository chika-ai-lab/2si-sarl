/**
 * Configuration API pour le module Commercial
 */

export const USE_MOCK_API = false;

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
  clients: {
    list: '/clients',
    getById: (id: string) => `/clients/${id}`,
    create: '/clients',
    update: (id: string) => `/clients/${id}`,
    delete: (id: string) => `/clients/${id}`,
    stats: '/stats/clients',
  },

  commandes: {
    list: '/commande-clients',
    getById: (id: string) => `/commande-clients/${id}`,
    create: '/commande-clients',
    update: (id: string) => `/commande-clients/${id}`,
    delete: (id: string) => `/commande-clients/${id}`,
    valider: (id: string) => `/commande-clients/${id}/valider`,
    livrer: (id: string) => `/commande-clients/${id}/livrer`,
    brouillon: (id: string) => `/commande-clients/${id}/brouillon`,
    lignes: '/commande-article-clients',
    stats: '/stats/commandes',
    bl: '/bordereau-livraisons',
  },

  produits: {
    list: '/articles',
    getById: (id: string) => `/articles/${id}`,
    create: '/articles',
    update: (id: string) => `/articles/${id}`,
    delete: (id: string) => `/articles/${id}`,
    getByBanque: (banque: string) => `/articles?banque=${banque}`,
    categories: '/categories',
    stats: '/stats/produits',
  },

  bonLivraison: {
    list: '/bordereau-livraisons',
    getById: (id: string) => `/bordereau-livraisons/${id}`,
  },

  accreditifs: {
    list: '/accreditifs',
    getById: (id: string) => `/accreditifs/${id}`,
    create: '/accreditifs',
    update: (id: string) => `/accreditifs/${id}`,
    delete: (id: string) => `/accreditifs/${id}`,
    uploadDocument: (id: string) => `/accreditifs/${id}/documents`,
    alertes: '/accreditifs/alertes',
  },

  simulations: {
    list: '/simulations',
    getById: (id: string) => `/simulations/${id}`,
    create: '/simulations',
    update: (id: string) => `/simulations/${id}`,
    delete: (id: string) => `/simulations/${id}`,
    send: (id: string) => `/simulations/${id}/send`,
    convertToOrder: (id: string) => `/simulations/${id}/convert`,
  },

  sav: {
    list: '/sav',
    getById: (id: string) => `/sav/${id}`,
    create: '/sav',
    update: (id: string) => `/sav/${id}`,
    delete: (id: string) => `/sav/${id}`,
    addIntervention: (id: string) => `/sav/${id}/interventions`,
    close: (id: string) => `/sav/${id}/close`,
  },

  stats: {
    clients: '/stats/clients',
    commandes: '/stats/commandes',
    produits: '/stats/produits',
  },

  rapports: {
    evolutionCA: '/rapports/evolution-ca',
    statistiques: '/rapports/statistiques',
    topProduits: '/rapports/top-produits',
    topClients: '/rapports/top-clients',
    repartitionBanques: '/rapports/repartition-banques',
    export: (type: string) => `/rapports/export/${type}`,
  },
};

/**
 * Simule un délai réseau (conservé pour compatibilité)
 */
export const simulateNetworkDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
