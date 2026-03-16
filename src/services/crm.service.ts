/**
 * Service pour les entités CRM étendues:
 * Projets, Notes, Documents, Transactions, Rapports Clients
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getHeaders = () => {
    const token = localStorage.getItem("auth-token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const ProjectsService = {
    getAll: async (clientId?: string): Promise<any[]> => {
        const url = clientId ? `${API_URL}/projects?client_id=${clientId}` : `${API_URL}/projects`;
        const r = await fetch(url, { headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur lors du chargement des projets");
        const j = await r.json(); return j.data ?? j;
    },
    getById: async (id: string): Promise<any> => {
        const r = await fetch(`${API_URL}/projects/${id}`, { headers: getHeaders() });
        if (!r.ok) throw new Error("Projet introuvable");
        const j = await r.json(); return j.data ?? j;
    },
    create: async (data: any): Promise<any> => {
        const r = await fetch(`${API_URL}/projects`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
        if (!r.ok) throw new Error("Erreur création projet");
        const j = await r.json(); return j.data ?? j;
    },
    update: async (id: string, data: any): Promise<any> => {
        const r = await fetch(`${API_URL}/projects/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
        if (!r.ok) throw new Error("Erreur mise à jour projet");
        const j = await r.json(); return j.data ?? j;
    },
    delete: async (id: string): Promise<void> => {
        const r = await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE', headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur suppression projet");
    },
};

// ─── Notes ────────────────────────────────────────────────────────────────────

export const NotesService = {
    getAll: async (clientId?: string): Promise<any[]> => {
        const url = clientId ? `${API_URL}/notes?client_id=${clientId}` : `${API_URL}/notes`;
        const r = await fetch(url, { headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur lors du chargement des notes");
        const j = await r.json(); return j.data ?? j;
    },
    create: async (data: any): Promise<any> => {
        const r = await fetch(`${API_URL}/notes`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
        if (!r.ok) throw new Error("Erreur création note");
        const j = await r.json(); return j.data ?? j;
    },
    update: async (id: string, data: any): Promise<any> => {
        const r = await fetch(`${API_URL}/notes/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
        if (!r.ok) throw new Error("Erreur mise à jour note");
        const j = await r.json(); return j.data ?? j;
    },
    delete: async (id: string): Promise<void> => {
        const r = await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE', headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur suppression note");
    },
};

// ─── Documents ────────────────────────────────────────────────────────────────

export const DocumentsService = {
    getAll: async (): Promise<any[]> => {
        const r = await fetch(`${API_URL}/documents`, { headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur documents");
        const j = await r.json(); return j.data ?? j;
    },
    uploadMedia: async (file: File): Promise<any> => {
        const token = localStorage.getItem("auth-token");
        const form = new FormData();
        form.append("file", file);
        const r = await fetch(`${API_URL}/documents/media`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form,
        });
        if (!r.ok) throw new Error("Erreur upload document");
        return r.json();
    },
    create: async (data: any): Promise<any> => {
        const r = await fetch(`${API_URL}/documents`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
        if (!r.ok) throw new Error("Erreur création document");
        const j = await r.json(); return j.data ?? j;
    },
    delete: async (id: string): Promise<void> => {
        const r = await fetch(`${API_URL}/documents/${id}`, { method: 'DELETE', headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur suppression document");
    },
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const TransactionsService = {
    getAll: async (): Promise<any[]> => {
        const r = await fetch(`${API_URL}/transactions`, { headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur transactions");
        const j = await r.json(); return j.data ?? j;
    },
    create: async (data: any): Promise<any> => {
        const r = await fetch(`${API_URL}/transactions`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
        if (!r.ok) throw new Error("Erreur création transaction");
        const j = await r.json(); return j.data ?? j;
    },
    update: async (id: string, data: any): Promise<any> => {
        const r = await fetch(`${API_URL}/transactions/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
        if (!r.ok) throw new Error("Erreur mise à jour transaction");
        const j = await r.json(); return j.data ?? j;
    },
    delete: async (id: string): Promise<void> => {
        const r = await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE', headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur suppression transaction");
    },
};

// ─── Rapports Clients ─────────────────────────────────────────────────────────

export const ClientReportsService = {
    getAll: async (): Promise<any[]> => {
        const r = await fetch(`${API_URL}/client-reports`, { headers: getHeaders() });
        if (!r.ok) throw new Error("Erreur client-reports");
        const j = await r.json(); return j.data ?? j;
    },
};
