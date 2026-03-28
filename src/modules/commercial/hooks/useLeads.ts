/**
 * Hook d'abstraction pour les appels API leads/devis.
 * OCP : pour changer le transport (REST → GraphQL), modifier uniquement ce fichier.
 */
import { useState, useEffect, useCallback } from "react";

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

export function useTicketsOuverts() {
  const [leads, setLeads]     = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/leads/ouverts`, { headers: authHeaders() });
      const json = await res.json();
      const data = json.data ?? json;
      setLeads(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);
  return { leads, loading, reload };
}

export function useMesTickets() {
  const [leads, setLeads]     = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/leads/mes-tickets`, { headers: authHeaders() });
      const json = await res.json();
      const data = json.data ?? json;
      setLeads(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);
  return { leads, loading, reload };
}

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
  devisData: { prix_vente: number; frais_expedition: number; autres_charges: number; remise: number; duree_paiement: number }
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
