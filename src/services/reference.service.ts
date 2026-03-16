/**
 * Service centralisé pour les données de référence (lookup data).
 * Currencies, Régions, Agences, Commissions, Objectifs, etc.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getHeaders = () => {
    const token = localStorage.getItem("auth-token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

const fetchList = async (endpoint: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/${endpoint}`, { headers: getHeaders() });
    if (!response.ok) throw new Error(`Erreur lors du chargement de ${endpoint}`);
    const json = await response.json();
    return json.data ?? json;
};

const postItem = async (endpoint: string, data: any): Promise<any> => {
    const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Erreur lors de la création dans ${endpoint}`);
    const json = await response.json();
    return json.data ?? json;
};

const putItem = async (endpoint: string, id: string, data: any): Promise<any> => {
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Erreur lors de la mise à jour dans ${endpoint}`);
    const json = await response.json();
    return json.data ?? json;
};

const deleteItem = async (endpoint: string, id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Erreur lors de la suppression dans ${endpoint}`);
};

export const ReferenceService = {
    // Devises
    currencies: {
        getAll: () => fetchList('currencies'),
        create: (data: any) => postItem('currencies', data),
        update: (id: string, data: any) => putItem('currencies', id, data),
        delete: (id: string) => deleteItem('currencies', id),
    },

    // Régions
    regions: {
        getAll: () => fetchList('regions'),
        create: (data: any) => postItem('regions', data),
        update: (id: string, data: any) => putItem('regions', id, data),
        delete: (id: string) => deleteItem('regions', id),
    },

    // Agences
    agences: {
        getAll: () => fetchList('agences'),
        create: (data: any) => postItem('agences', data),
        update: (id: string, data: any) => putItem('agences', id, data),
        delete: (id: string) => deleteItem('agences', id),
    },

    // Commissions
    commissions: {
        getAll: () => fetchList('commissions'),
        create: (data: any) => postItem('commissions', data),
        update: (id: string, data: any) => putItem('commissions', id, data),
        delete: (id: string) => deleteItem('commissions', id),
    },

    // Objectifs
    objectifs: {
        getAll: () => fetchList('objectifs'),
        create: (data: any) => postItem('objectifs', data),
        update: (id: string, data: any) => putItem('objectifs', id, data),
        delete: (id: string) => deleteItem('objectifs', id),
    },

    // Statuts client
    clientStatuses: {
        getAll: () => fetchList('client-statuses'),
        create: (data: any) => postItem('client-statuses', data),
        update: (id: string, data: any) => putItem('client-statuses', id, data),
        delete: (id: string) => deleteItem('client-statuses', id),
    },

    // Statuts projets
    projectStatuses: {
        getAll: () => fetchList('project-statuses'),
        create: (data: any) => postItem('project-statuses', data),
        update: (id: string, data: any) => putItem('project-statuses', id, data),
        delete: (id: string) => deleteItem('project-statuses', id),
    },

    // Types de transaction
    transactionTypes: {
        getAll: () => fetchList('transaction-types'),
        create: (data: any) => postItem('transaction-types', data),
        update: (id: string, data: any) => putItem('transaction-types', id, data),
        delete: (id: string) => deleteItem('transaction-types', id),
    },

    // Sources de revenus
    incomeSources: {
        getAll: () => fetchList('income-sources'),
        create: (data: any) => postItem('income-sources', data),
        update: (id: string, data: any) => putItem('income-sources', id, data),
        delete: (id: string) => deleteItem('income-sources', id),
    },
};
