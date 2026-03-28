/**
 * Service d'abstraction pour la soumission de demandes marketplace.
 * OCP : pour changer le transport (ex: GraphQL, WebSocket), modifier
 * uniquement ce fichier — les composants appelants ne changent pas.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export interface ArticleDemande {
  id: number;
  quantite: number;
}

export interface DemandePayload {
  nom: string;
  prenom?: string;
  email: string;
  telephone: string;
  localisation: string;
  canal_acquisition?: string;
  message?: string;
  articles: ArticleDemande[];
}

export interface DemandeResponse {
  message: string;
  reference: string;
}

export async function soumettreDemandeMarketplace(
  payload: DemandePayload
): Promise<DemandeResponse> {
  const res = await fetch(`${API_BASE}/public/demandes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    const message =
      json?.message ??
      Object.values(json?.errors ?? {}).flat().join(" ") ??
      "Erreur lors de la soumission.";
    throw new Error(message);
  }

  return json as DemandeResponse;
}
