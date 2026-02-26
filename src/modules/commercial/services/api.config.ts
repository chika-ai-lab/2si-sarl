/**
 * Configuration API pour le module Commercial
 * Facilite la transition vers un vrai backend
 */

// Pour le moment, on utilise des mocks
// Quand le backend sera prêt, il suffira de changer USE_MOCK_API à false
export const USE_MOCK_API = true;

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Clients
  clients: {
    list: '/commercial/clients',
    getById: (id: string) => `/commercial/clients/${id}`,
    create: '/commercial/clients',
    update: (id: string) => `/commercial/clients/${id}`,
    delete: (id: string) => `/commercial/clients/${id}`,
  },

  // Commandes
  commandes: {
    list: '/commercial/commandes',
    getById: (id: string) => `/commercial/commandes/${id}`,
    create: '/commercial/commandes',
    update: (id: string) => `/commercial/commandes/${id}`,
    updateStatus: (id: string) => `/commercial/commandes/${id}/status`,
    delete: (id: string) => `/commercial/commandes/${id}`,
  },

  // Produits Catalogue
  produits: {
    list: '/commercial/catalogue',
    getById: (id: string) => `/commercial/catalogue/${id}`,
    getByBanque: (banque: string) => `/commercial/catalogue/banque/${banque}`,
  },

  // Bon de Livraison
  bonLivraison: {
    list: '/commercial/bl',
    getById: (id: string) => `/commercial/bl/${id}`,
    upload: '/commercial/bl/upload',
    associate: (id: string) => `/commercial/bl/${id}/associate`,
  },

  // Accréditifs
  accreditifs: {
    list: '/commercial/accreditifs',
    getById: (id: string) => `/commercial/accreditifs/${id}`,
    create: '/commercial/accreditifs',
    update: (id: string) => `/commercial/accreditifs/${id}`,
    uploadDocument: (id: string) => `/commercial/accreditifs/${id}/documents`,
  },

  // Simulations
  simulations: {
    list: '/commercial/simulations',
    getById: (id: string) => `/commercial/simulations/${id}`,
    create: '/commercial/simulations',
    update: (id: string) => `/commercial/simulations/${id}`,
    convertToOrder: (id: string) => `/commercial/simulations/${id}/convert`,
    generatePDF: (id: string) => `/commercial/simulations/${id}/pdf`,
  },

  // SAV
  sav: {
    list: '/commercial/sav',
    getById: (id: string) => `/commercial/sav/${id}`,
    create: '/commercial/sav',
    update: (id: string) => `/commercial/sav/${id}`,
    addIntervention: (id: string) => `/commercial/sav/${id}/interventions`,
    uploadPhoto: (id: string) => `/commercial/sav/${id}/photos`,
    close: (id: string) => `/commercial/sav/${id}/close`,
  },

  // Statistiques
  stats: {
    dashboard: '/commercial/stats/dashboard',
    clients: '/commercial/stats/clients',
    commandes: '/commercial/stats/commandes',
    revenue: '/commercial/stats/revenue',
  },
};

/**
 * Simule un délai réseau pour les mocks
 */
export const simulateNetworkDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
