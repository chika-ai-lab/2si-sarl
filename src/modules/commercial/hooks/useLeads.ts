/**
 * Hook d'abstraction pour les appels API leads/devis.
 * Migré vers React Query pour bénéficier du cache + déduplication des requêtes.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

function getToken(): string {
  return localStorage.getItem("auth-token") ?? "";
}

export interface ArticleLead {
  id: number;
  article_id: number;
  quantite: number;
  article?: { id: number; libelle: string; reference: string; prix_achat?: number };
}

export interface Lead {
  id: number;
  reference: string;
  source: "commercial" | "marketplace";
  canal_acquisition?: string;
  localisation?: string;
  etat: string;
  etat_ticket: "ouvert" | "assigne" | "en_cours" | "ferme";
  prix_vente?: number;
  frais_expedition?: number;
  autres_charges?: number;
  duree_paiement?: number;
  devis_envoye_at?: string;
  created_at: string;
  client?: {
    id: number; nom: string; prenom?: string;
    email?: string; telephone?: string;
  };
  commercial?: { id: number; name: string };
  articles?: ArticleLead[];
}

export interface Modalite {
  duree: number;
  mensualite: number;
  total: number;
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json", Accept: "application/json" };
}

async function fetchLeadsOuverts(): Promise<Lead[]> {
  const res  = await fetch(`${API_BASE}/leads/ouverts`, { headers: authHeaders() });
  const json = await res.json();
  const data = json.data ?? json;
  return Array.isArray(data) ? data : [];
}

async function fetchMesTickets(): Promise<Lead[]> {
  const res  = await fetch(`${API_BASE}/leads/mes-tickets`, { headers: authHeaders() });
  const json = await res.json();
  const data = json.data ?? json;
  return Array.isArray(data) ? data : [];
}

// ── Query keys ────────────────────────────────────────────────
export const leadsKeys = {
  all:        ['leads'] as const,
  ouverts:    () => [...leadsKeys.all, 'ouverts']     as const,
  mesTickets: () => [...leadsKeys.all, 'mes-tickets'] as const,
};

// ── Hooks ────────────────────────────────────────────────────

export function useTicketsOuverts() {
  const qc = useQueryClient();
  const q  = useQuery({
    queryKey: leadsKeys.ouverts(),
    queryFn:  fetchLeadsOuverts,
    staleTime: 30 * 1000,   // 30s — tickets changent fréquemment
  });

  const setLeads = (updater: Lead[] | ((prev: Lead[]) => Lead[])) => {
    if (typeof updater === "function") {
      qc.setQueryData<Lead[]>(leadsKeys.ouverts(), (old) => updater(old ?? []));
    } else {
      qc.setQueryData<Lead[]>(leadsKeys.ouverts(), updater);
    }
  };

  return {
    leads:   q.data ?? [],
    loading: q.isLoading,
    reload:  () => qc.invalidateQueries({ queryKey: leadsKeys.ouverts() }),
    setLeads,
  };
}

export function useMesTickets() {
  const qc = useQueryClient();
  const q  = useQuery({
    queryKey: leadsKeys.mesTickets(),
    queryFn:  fetchMesTickets,
    staleTime: 30 * 1000,
  });

  const setLeads = (updater: Lead[] | ((prev: Lead[]) => Lead[])) => {
    if (typeof updater === "function") {
      qc.setQueryData<Lead[]>(leadsKeys.mesTickets(), (old) => updater(old ?? []));
    } else {
      qc.setQueryData<Lead[]>(leadsKeys.mesTickets(), updater);
    }
  };

  return {
    leads:   q.data ?? [],
    loading: q.isLoading,
    reload:  () => qc.invalidateQueries({ queryKey: leadsKeys.mesTickets() }),
    setLeads,
  };
}

// ── Fonctions API pures (non-hooks) ──────────────────────────

export async function autoAssignerLead(id: number): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads/${id}/auto-assigner`, {
    method: "POST", headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Erreur");
  return json.data ?? json;
}

export async function assignerLead(id: number, commercialId: number): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads/${id}/assigner`, {
    method: "POST", headers: authHeaders(),
    body: JSON.stringify({ commercial_id: commercialId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Erreur");
  return json.data ?? json;
}

export async function enregistrerDevis(
  id: number,
  devisData: {
    prix_vente: number;
    frais_expedition: number;
    autres_charges: number;
    remise: number;
    duree_paiement: number;
    lignes?: { article_id: number; prix_achat: number; quantite: number }[];
  }
): Promise<{ modalites: Modalite[] }> {
  const res = await fetch(`${API_BASE}/leads/${id}/devis`, {
    method: "POST", headers: authHeaders(),
    body: JSON.stringify(devisData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Erreur");
  return json;
}

export async function confirmerLead(id: number): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads/${id}/confirmer`, {
    method: "POST", headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Erreur");
  return json.data ?? json;
}
