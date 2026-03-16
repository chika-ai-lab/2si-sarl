const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getHeaders = () => {
    const token = localStorage.getItem("auth-token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

export interface CommandeFournisseur {
    id: number | string;
    reference?: string;
    fournisseur_id: number | string;
    statut?: string;
    montant_total?: number;
    articles?: CommandeArticleFournisseur[];
    created_at?: string;
}

export interface CommandeArticleFournisseur {
    id?: number | string;
    article_id: number | string;
    quantite: number;
    prix_unitaire: number;
}

export const CommandesFournisseursService = {
    getAll: async (): Promise<CommandeFournisseur[]> => {
        const response = await fetch(`${API_URL}/commande-fournisseurs`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Erreur de récupération des commandes fournisseurs");
        const json = await response.json();
        return json.data ?? json;
    },

    getById: async (id: string): Promise<CommandeFournisseur> => {
        const response = await fetch(`${API_URL}/commande-fournisseurs/${id}`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Commande introuvable");
        const json = await response.json();
        return json.data ?? json;
    },

    create: async (data: Partial<CommandeFournisseur>): Promise<CommandeFournisseur> => {
        const response = await fetch(`${API_URL}/commande-fournisseurs`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Erreur de création de la commande");
        const json = await response.json();
        return json.data ?? json;
    },

    update: async (id: string, data: Partial<CommandeFournisseur>): Promise<CommandeFournisseur> => {
        const response = await fetch(`${API_URL}/commande-fournisseurs/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Erreur de mise à jour de la commande");
        const json = await response.json();
        return json.data ?? json;
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/commande-fournisseurs/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Erreur de suppression de la commande");
    },

    // Workflow actions
    valider: async (id: string): Promise<CommandeFournisseur> => {
        const response = await fetch(`${API_URL}/commande-fournisseurs/${id}/valider`, {
            method: 'POST',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Erreur lors de la validation");
        const json = await response.json();
        return json.data ?? json;
    },

    marquerRecu: async (id: string): Promise<CommandeFournisseur> => {
        const response = await fetch(`${API_URL}/commande-fournisseurs/${id}/recu`, {
            method: 'POST',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Erreur lors de la réception");
        const json = await response.json();
        return json.data ?? json;
    },

    marquerNonRecu: async (id: string): Promise<CommandeFournisseur> => {
        const response = await fetch(`${API_URL}/commande-fournisseurs/${id}/non-recu`, {
            method: 'POST',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Erreur");
        const json = await response.json();
        return json.data ?? json;
    },
};
