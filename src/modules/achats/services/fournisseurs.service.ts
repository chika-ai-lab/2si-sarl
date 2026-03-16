const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getHeaders = () => {
    const token = localStorage.getItem("auth-token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

export interface Fournisseur {
    id: number | string;
    nom: string;
    email?: string;
    telephone?: string;
    adresse?: string;
    ville?: string;
    pays?: string;
    created_at?: string;
}

export const FournisseursService = {
    getAll: async (): Promise<Fournisseur[]> => {
        const response = await fetch(`${API_URL}/fournisseurs`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Erreur de récupération des fournisseurs");
        const json = await response.json();
        return json.data ?? json;
    },

    getById: async (id: string): Promise<Fournisseur> => {
        const response = await fetch(`${API_URL}/fournisseurs/${id}`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Fournisseur introuvable");
        const json = await response.json();
        return json.data ?? json;
    },

    create: async (data: Partial<Fournisseur>): Promise<Fournisseur> => {
        const response = await fetch(`${API_URL}/fournisseurs`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Erreur de création du fournisseur");
        const json = await response.json();
        return json.data ?? json;
    },

    update: async (id: string, data: Partial<Fournisseur>): Promise<Fournisseur> => {
        const response = await fetch(`${API_URL}/fournisseurs/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Erreur de mise à jour du fournisseur");
        const json = await response.json();
        return json.data ?? json;
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/fournisseurs/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Erreur de suppression du fournisseur");
    },
};
