/**
 * Service de gestion du SAV (Service Après-Vente)
 * Architecture API-ready avec mocks
 */

import type {
  TicketSAV,
  InterventionSAV,
  StatutTicketSAV,
  TypeTicketSAV,
  PrioriteTicket,
  PaginatedResponse,
  ApiResponse,
  SAVFilters,
} from '../types';
import { USE_MOCK_API, simulateNetworkDelay } from './api.config';

// ============================================
// MOCK DATA
// ============================================

const MOCK_TICKETS: TicketSAV[] = [
  {
    id: 'sav-001',
    numero: 'SAV-2024-001',

    // Client et produit
    clientId: 'cli-001',
    produitId: 'prod-001',
    commandeId: 'cmd-001',

    // Type
    type: 'reparation',
    priorite: 'haute',

    // Description
    sujet: 'Ordinateur portable ne démarre plus',
    description: 'Le client signale que son ordinateur portable ne démarre plus depuis hier. Aucun voyant lumineux ne s\'allume lorsqu\'il appuie sur le bouton power.',
    symptomes: 'Pas d\'affichage, pas de LED, aucun bruit de ventilateur',

    // Pièces jointes
    photos: ['/uploads/sav-001-photo1.jpg', '/uploads/sav-001-photo2.jpg'],
    documents: ['/uploads/sav-001-facture.pdf'],

    // Statut
    statut: 'en_cours',

    // Interventions
    interventions: [
      {
        id: 'int-001-1',
        date: '2024-12-21',
        technicienId: 'tech-001',
        technicien: 'Amadou Diop',
        description: 'Diagnostic initial : batterie HS et alimentation défectueuse',
        piecesUtilisees: [
          {
            nom: 'Batterie Dell XPS 15',
            reference: 'BAT-DELL-XPS15',
            quantite: 1,
            prix: 45000,
          },
        ],
        tempsIntervention: 2,
        cout: 50000,
      },
    ],

    // Dates
    dateOuverture: '2024-12-20',
    datePrevueResolution: '2024-12-27',

    // Garantie
    sousGarantie: true,
    dateFinGarantie: '2025-06-15',

    // Coûts
    coutPieces: 45000,
    coutMainOeuvre: 5000,
    coutTotal: 50000,

    // Métadonnées
    assigneA: 'tech-001',
    creePar: 'user-001',
    notes: 'Client prioritaire - catégorie A',
  },
  {
    id: 'sav-002',
    numero: 'SAV-2024-002',

    clientId: 'cli-002',
    produitId: 'prod-008',

    type: 'retour',
    priorite: 'normale',

    sujet: 'Demande de retour - écran défectueux',
    description: 'L\'écran présente des pixels morts dans le coin supérieur gauche. Le client souhaite un remplacement.',
    symptomes: '5 pixels morts zone supérieure gauche',

    photos: ['/uploads/sav-002-photo1.jpg'],
    documents: ['/uploads/sav-002-bon-livraison.pdf'],

    statut: 'ouvert',

    interventions: [],

    dateOuverture: '2024-12-22',
    datePrevueResolution: '2024-12-29',

    sousGarantie: true,
    dateFinGarantie: '2025-12-15',

    coutPieces: 0,
    coutMainOeuvre: 0,
    coutTotal: 0,

    assigneA: 'tech-002',
    creePar: 'user-002',
  },
  {
    id: 'sav-003',
    numero: 'SAV-2024-003',

    clientId: 'cli-001',
    produitId: 'prod-003',
    commandeId: 'cmd-001',

    type: 'garantie',
    priorite: 'urgente',

    sujet: 'Serveur en panne - perte de données',
    description: 'Serveur principal de l\'entreprise ne répond plus. Disques durs qui cliquent. Risque de perte de données critique.',
    symptomes: 'Claquement disques durs, pas de boot, LED erreur clignotante',

    photos: [],
    documents: ['/uploads/sav-003-rapport.pdf'],

    statut: 'en_attente_pieces',

    interventions: [
      {
        id: 'int-003-1',
        date: '2024-12-19',
        technicienId: 'tech-003',
        technicien: 'Ibrahima Fall',
        description: 'Récupération des données sur disques endommagés. Commande de nouveaux disques RAID.',
        piecesUtilisees: [],
        tempsIntervention: 8,
        cout: 150000,
      },
    ],

    dateOuverture: '2024-12-19',
    datePrevueResolution: '2024-12-26',

    sousGarantie: true,
    dateFinGarantie: '2025-03-20',

    coutPieces: 320000,
    coutMainOeuvre: 150000,
    coutTotal: 470000,

    noteSatisfaction: 4,
    commentaireSatisfaction: 'Intervention rapide, données récupérées avec succès',

    assigneA: 'tech-003',
    creePar: 'user-001',
    notes: 'Intervention urgente - client premium',
  },
  {
    id: 'sav-004',
    numero: 'SAV-2024-004',

    clientId: 'cli-003',
    produitId: 'prod-005',

    type: 'reclamation',
    priorite: 'basse',

    sujet: 'Clavier défectueux - touches qui collent',
    description: 'Plusieurs touches du clavier ne répondent pas correctement ou restent enfoncées.',
    symptomes: 'Touches A, S, D non fonctionnelles',

    photos: [],
    documents: [],

    statut: 'resolu',

    interventions: [
      {
        id: 'int-004-1',
        date: '2024-12-18',
        technicienId: 'tech-001',
        technicien: 'Amadou Diop',
        description: 'Remplacement du clavier complet',
        piecesUtilisees: [
          {
            nom: 'Clavier HP Pavilion',
            reference: 'KB-HP-PAV',
            quantite: 1,
            prix: 8500,
          },
        ],
        tempsIntervention: 1,
        cout: 10000,
      },
    ],

    dateOuverture: '2024-12-17',
    datePrevueResolution: '2024-12-20',
    dateResolution: '2024-12-18',

    sousGarantie: false,

    coutPieces: 8500,
    coutMainOeuvre: 1500,
    coutTotal: 10000,

    noteSatisfaction: 5,
    commentaireSatisfaction: 'Excellent service, très rapide',

    assigneA: 'tech-001',
    creePar: 'user-003',
  },
];

// ============================================
// API FUNCTIONS (Mock)
// ============================================

/**
 * Récupère la liste des tickets SAV avec filtres et pagination
 */
export async function getTicketsSAV(
  filters: SAVFilters = {}
): Promise<PaginatedResponse<TicketSAV>> {
  if (!USE_MOCK_API) {
    const response = await fetch('/api/commercial/sav?' + new URLSearchParams(filters as any));
    return response.json();
  }

  await simulateNetworkDelay();

  let filtered = [...MOCK_TICKETS];

  // Filtres
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (ticket) =>
        ticket.numero.toLowerCase().includes(search) ||
        ticket.sujet.toLowerCase().includes(search) ||
        ticket.description.toLowerCase().includes(search)
    );
  }

  if (filters.statut) {
    filtered = filtered.filter((ticket) => ticket.statut === filters.statut);
  }

  if (filters.priorite) {
    filtered = filtered.filter((ticket) => ticket.priorite === filters.priorite);
  }

  if (filters.type) {
    filtered = filtered.filter((ticket) => ticket.type === filters.type);
  }

  if (filters.clientId) {
    filtered = filtered.filter((ticket) => ticket.clientId === filters.clientId);
  }

  if (filters.assigneA) {
    filtered = filtered.filter((ticket) => ticket.assigneA === filters.assigneA);
  }

  // Tri
  const sortBy = filters.sortBy || 'dateOuverture';
  const sortOrder = filters.sortOrder || 'desc';

  filtered.sort((a, b) => {
    let aVal: any = a[sortBy as keyof TicketSAV];
    let bVal: any = b[sortBy as keyof TicketSAV];

    if (sortBy === 'priorite') {
      const prioriteOrder = { urgente: 4, haute: 3, normale: 2, basse: 1 };
      aVal = prioriteOrder[a.priorite];
      bVal = prioriteOrder[b.priorite];
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filtered.slice(start, end);

  return {
    data: paginated,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

/**
 * Récupère un ticket SAV par son ID
 */
export async function getTicketSAV(id: string): Promise<ApiResponse<TicketSAV>> {
  if (!USE_MOCK_API) {
    const response = await fetch(`/api/commercial/sav/${id}`);
    return response.json();
  }

  await simulateNetworkDelay();

  const ticket = MOCK_TICKETS.find((t) => t.id === id);

  if (!ticket) {
    return {
      success: false,
      message: 'Ticket SAV non trouvé',
    };
  }

  return {
    success: true,
    data: ticket,
  };
}

/**
 * Crée un nouveau ticket SAV
 */
export async function createTicketSAV(
  data: Partial<TicketSAV>
): Promise<ApiResponse<TicketSAV>> {
  if (!USE_MOCK_API) {
    const response = await fetch('/api/commercial/sav', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  await simulateNetworkDelay();

  const newTicket: TicketSAV = {
    id: `sav-${Date.now()}`,
    numero: `SAV-2024-${String(MOCK_TICKETS.length + 1).padStart(3, '0')}`,
    clientId: data.clientId || '',
    produitId: data.produitId,
    commandeId: data.commandeId,
    type: data.type || 'reclamation',
    priorite: data.priorite || 'normale',
    sujet: data.sujet || '',
    description: data.description || '',
    symptomes: data.symptomes,
    photos: data.photos || [],
    documents: data.documents || [],
    statut: 'ouvert',
    interventions: [],
    dateOuverture: new Date().toISOString().split('T')[0],
    sousGarantie: data.sousGarantie || false,
    dateFinGarantie: data.dateFinGarantie,
    coutPieces: 0,
    coutMainOeuvre: 0,
    coutTotal: 0,
    assigneA: data.assigneA,
    creePar: data.creePar || 'user-001',
    notes: data.notes,
  };

  MOCK_TICKETS.unshift(newTicket);

  return {
    success: true,
    data: newTicket,
    message: 'Ticket SAV créé avec succès',
  };
}

/**
 * Met à jour un ticket SAV
 */
export async function updateTicketSAV(
  id: string,
  data: Partial<TicketSAV>
): Promise<ApiResponse<TicketSAV>> {
  if (!USE_MOCK_API) {
    const response = await fetch(`/api/commercial/sav/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  await simulateNetworkDelay();

  const index = MOCK_TICKETS.findIndex((t) => t.id === id);

  if (index === -1) {
    return {
      success: false,
      message: 'Ticket SAV non trouvé',
    };
  }

  MOCK_TICKETS[index] = {
    ...MOCK_TICKETS[index],
    ...data,
  };

  return {
    success: true,
    data: MOCK_TICKETS[index],
    message: 'Ticket SAV mis à jour avec succès',
  };
}

/**
 * Change le statut d'un ticket SAV
 */
export async function changeStatutTicket(
  id: string,
  statut: StatutTicketSAV
): Promise<ApiResponse<TicketSAV>> {
  if (!USE_MOCK_API) {
    const response = await fetch(`/api/commercial/sav/${id}/statut`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut }),
    });
    return response.json();
  }

  await simulateNetworkDelay();

  const index = MOCK_TICKETS.findIndex((t) => t.id === id);

  if (index === -1) {
    return {
      success: false,
      message: 'Ticket SAV non trouvé',
    };
  }

  MOCK_TICKETS[index].statut = statut;

  if (statut === 'resolu' || statut === 'ferme') {
    MOCK_TICKETS[index].dateResolution = new Date().toISOString().split('T')[0];
  }

  return {
    success: true,
    data: MOCK_TICKETS[index],
    message: 'Statut mis à jour avec succès',
  };
}

/**
 * Ajoute une intervention à un ticket SAV
 */
export async function addIntervention(
  ticketId: string,
  intervention: Omit<InterventionSAV, 'id'>
): Promise<ApiResponse<TicketSAV>> {
  if (!USE_MOCK_API) {
    const response = await fetch(`/api/commercial/sav/${ticketId}/interventions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intervention),
    });
    return response.json();
  }

  await simulateNetworkDelay();

  const index = MOCK_TICKETS.findIndex((t) => t.id === ticketId);

  if (index === -1) {
    return {
      success: false,
      message: 'Ticket SAV non trouvé',
    };
  }

  const newIntervention: InterventionSAV = {
    id: `int-${ticketId}-${MOCK_TICKETS[index].interventions.length + 1}`,
    ...intervention,
  };

  MOCK_TICKETS[index].interventions.push(newIntervention);

  // Recalculer les coûts
  const coutPieces = MOCK_TICKETS[index].interventions.reduce(
    (sum, int) =>
      sum + (int.piecesUtilisees?.reduce((s, p) => s + p.prix * p.quantite, 0) || 0),
    0
  );

  const coutMainOeuvre = MOCK_TICKETS[index].interventions.reduce(
    (sum, int) => sum + int.cout,
    0
  );

  MOCK_TICKETS[index].coutPieces = coutPieces;
  MOCK_TICKETS[index].coutMainOeuvre = coutMainOeuvre;
  MOCK_TICKETS[index].coutTotal = coutPieces + coutMainOeuvre;

  return {
    success: true,
    data: MOCK_TICKETS[index],
    message: 'Intervention ajoutée avec succès',
  };
}

/**
 * Assigne un ticket à un technicien
 */
export async function assignerTicket(
  id: string,
  technicienId: string
): Promise<ApiResponse<TicketSAV>> {
  if (!USE_MOCK_API) {
    const response = await fetch(`/api/commercial/sav/${id}/assigner`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ technicienId }),
    });
    return response.json();
  }

  await simulateNetworkDelay();

  const index = MOCK_TICKETS.findIndex((t) => t.id === id);

  if (index === -1) {
    return {
      success: false,
      message: 'Ticket SAV non trouvé',
    };
  }

  MOCK_TICKETS[index].assigneA = technicienId;

  if (MOCK_TICKETS[index].statut === 'ouvert') {
    MOCK_TICKETS[index].statut = 'en_cours';
  }

  return {
    success: true,
    data: MOCK_TICKETS[index],
    message: 'Ticket assigné avec succès',
  };
}

/**
 * Ajoute une note de satisfaction au ticket
 */
export async function ajouterSatisfaction(
  id: string,
  note: 1 | 2 | 3 | 4 | 5,
  commentaire?: string
): Promise<ApiResponse<TicketSAV>> {
  if (!USE_MOCK_API) {
    const response = await fetch(`/api/commercial/sav/${id}/satisfaction`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note, commentaire }),
    });
    return response.json();
  }

  await simulateNetworkDelay();

  const index = MOCK_TICKETS.findIndex((t) => t.id === id);

  if (index === -1) {
    return {
      success: false,
      message: 'Ticket SAV non trouvé',
    };
  }

  MOCK_TICKETS[index].noteSatisfaction = note;
  MOCK_TICKETS[index].commentaireSatisfaction = commentaire;

  return {
    success: true,
    data: MOCK_TICKETS[index],
    message: 'Satisfaction enregistrée avec succès',
  };
}

/**
 * Récupère les statistiques SAV
 */
export async function getStatistiquesSAV(): Promise<
  ApiResponse<{
    total: number;
    ouverts: number;
    enCours: number;
    resolus: number;
    fermes: number;
    satisfactionMoyenne: number;
    coutTotalMois: number;
    tempsResolutionMoyen: number;
  }>
> {
  if (!USE_MOCK_API) {
    const response = await fetch('/api/commercial/sav/statistiques');
    return response.json();
  }

  await simulateNetworkDelay();

  const stats = {
    total: MOCK_TICKETS.length,
    ouverts: MOCK_TICKETS.filter((t) => t.statut === 'ouvert').length,
    enCours:
      MOCK_TICKETS.filter((t) => t.statut === 'en_cours' || t.statut === 'en_attente_pieces')
        .length,
    resolus: MOCK_TICKETS.filter((t) => t.statut === 'resolu').length,
    fermes: MOCK_TICKETS.filter((t) => t.statut === 'ferme').length,
    satisfactionMoyenne:
      MOCK_TICKETS.filter((t) => t.noteSatisfaction).reduce(
        (sum, t) => sum + (t.noteSatisfaction || 0),
        0
      ) / MOCK_TICKETS.filter((t) => t.noteSatisfaction).length || 0,
    coutTotalMois: MOCK_TICKETS.reduce((sum, t) => sum + t.coutTotal, 0),
    tempsResolutionMoyen: 3.5,
  };

  return {
    success: true,
    data: stats,
  };
}
