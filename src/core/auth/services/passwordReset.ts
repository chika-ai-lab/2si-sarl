/**
 * Mot de passe oublié : code à 6 chiffres envoyé par WhatsApp.
 * Ces appels se font sans session.
 */
const API_URL = import.meta.env.VITE_API_URL || "https://api.sen-services.com/api/v2";

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || `Erreur ${response.status}`);
  return json as T;
}

/** Même réponse que le numéro ait un compte ou non. */
export function demanderCode(telephone: string) {
  return post<{ message: string }>("/auth/forgot-password", { telephone });
}

export function reinitialiserMotDePasse(telephone: string, code: string, newPassword: string) {
  return post<{ message: string }>("/auth/reset-password", { telephone, code, new_password: newPassword });
}

/** Même règle que l'API : 8 caractères, une lettre et un chiffre. */
export function erreurMotDePasse(mdp: string): string | null {
  if (mdp.length < 8) return "Au moins 8 caractères.";
  if (!/[A-Za-z]/.test(mdp) || !/\d/.test(mdp)) return "Au moins une lettre et un chiffre.";
  return null;
}
