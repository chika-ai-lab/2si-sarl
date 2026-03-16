/**
 * Service for financial operations:
 * Factures (sales and purchase invoices), Expeditions, Historiques
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getHeaders = () => {
    const token = localStorage.getItem("auth-token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

// ─── Factures Clients ─────────────────────────────────────────────────────────

export const FacturesClientsService = {
    getAll: async (): Promise<any[]> => {
        const r = await fetch(`${API_URL}/facture-clients`, { headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur factures clients");
        const j = await r.json(); return j.data ?? j;
    },
    getById: async (id: string): Promise<any> => {
        const r = await fetch(`${API_URL}/facture-clients/${id}`, { headers: getHeaders() });
        if (!r.ok) throw new Error("Facture client introuvable");
        const j = await r.json(); return j.data ?? j;
    },
    create: async (data: any): Promise<any> => {
        const r = await fetch(`${API_URL}/facture-clients`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
        if (!r.ok) throw new Error("Erreur création facture client");
        const j = await r.json(); return j.data ?? j;
    },
    update: async (id: string, data: any): Promise<any> => {
        const r = await fetch(`${API_URL}/facture-clients/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
        if (!r.ok) throw new Error("Erreur mise à jour facture client");
        const j = await r.json(); return j.data ?? j;
    },
    delete: async (id: string): Promise<void> => {
        const r = await fetch(`${API_URL}/facture-clients/${id}`, { method: 'DELETE', headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur suppression facture client");
    },
};

// ─── Factures Fournisseurs ────────────────────────────────────────────────────

export const FacturesFournisseursService = {
    getAll: async (): Promise<any[]> => {
        const r = await fetch(`${API_URL}/facture-fournisseurs`, { headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur factures fournisseurs");
        const j = await r.json(); return j.data ?? j;
    },
    getById: async (id: string): Promise<any> => {
        const r = await fetch(`${API_URL}/facture-fournisseurs/${id}`, { headers: getHeaders() });
        if (!r.ok) throw new Error("Facture fournisseur introuvable");
        const j = await r.json(); return j.data ?? j;
    },
    create: async (data: any): Promise<any> => {
        const r = await fetch(`${API_URL}/facture-fournisseurs`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
        if (!r.ok) throw new Error("Erreur création facture fournisseur");
        const j = await r.json(); return j.data ?? j;
    },
    update: async (id: string, data: any): Promise<any> => {
        const r = await fetch(`${API_URL}/facture-fournisseurs/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
        if (!r.ok) throw new Error("Erreur mise à jour facture fournisseur");
        const j = await r.json(); return j.data ?? j;
    },
    delete: async (id: string): Promise<void> => {
        const r = await fetch(`${API_URL}/facture-fournisseurs/${id}`, { method: 'DELETE', headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur suppression facture fournisseur");
    },
};

// ─── Expéditions ──────────────────────────────────────────────────────────────

export const ExpeditionsService = {
    getAll: async (): Promise<any[]> => {
        const r = await fetch(`${API_URL}/expeditions`, { headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur expéditions");
        const j = await r.json(); return j.data ?? j;
    },
    getById: async (id: string): Promise<any> => {
        const r = await fetch(`${API_URL}/expeditions/${id}`, { headers: getHeaders() });
        if (!r.ok) throw new Error("Expédition introuvable");
        const j = await r.json(); return j.data ?? j;
    },
    create: async (data: any): Promise<any> => {
        const r = await fetch(`${API_URL}/expeditions`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
        if (!r.ok) throw new Error("Erreur création expédition");
        const j = await r.json(); return j.data ?? j;
    },
    update: async (id: string, data: any): Promise<any> => {
        const r = await fetch(`${API_URL}/expeditions/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
        if (!r.ok) throw new Error("Erreur mise à jour expédition");
        const j = await r.json(); return j.data ?? j;
    },
    delete: async (id: string): Promise<void> => {
        const r = await fetch(`${API_URL}/expeditions/${id}`, { method: 'DELETE', headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur suppression expédition");
    },
};

// ─── Historiques ──────────────────────────────────────────────────────────────

export const HistoriquesService = {
    getAll: async (): Promise<any[]> => {
        const r = await fetch(`${API_URL}/historiques`, { headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur historiques");
        const j = await r.json(); return j.data ?? j;
    },
};
