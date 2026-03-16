import { User } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getHeaders = () => {
    const token = localStorage.getItem("auth-token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

export const UsersService = {
    // Get all users
    getUsers: async (): Promise<User[]> => {
        const response = await fetch(`${API_URL}/users`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Erreur de récupération des utilisateurs");
        const json = await response.json();
        return json.data;
    },

    // Temporarily stubbed - complete later with proper models
    getRoles: async (): Promise<any[]> => {
        const response = await fetch(`${API_URL}/roles`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Erreur de récupération des rôles");
        const json = await response.json();
        return json.data;
    },
};
