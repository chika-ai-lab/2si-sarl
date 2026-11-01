import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/core/auth/providers/AuthProviderV2";
import { erreurMotDePasse } from "@/core/auth/services/passwordReset";
import { AuthShell, PasswordInput } from "@/components/auth/AuthShell";

/**
 * Changement de mot de passe. Obligatoire après un mot de passe provisoire
 * (création du compte, réinitialisation par un administrateur) : l'API refuse
 * toute autre requête tant qu'il n'est pas fait.
 */
export default function ChangePasswordPage() {
  const { user, isAuthenticated, isLoading, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  if (!isLoading && !isAuthenticated) return <Navigate to="/login" replace />;

  const obligatoire = !!user?.mustChangePassword;
  const destination = (location.state as any)?.from?.pathname || "/admin/dashboard";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const regle = erreurMotDePasse(nouveau);
    if (regle) return setErreur(regle);
    if (nouveau !== confirmation) return setErreur("Les deux mots de passe ne correspondent pas.");
    if (nouveau === actuel) return setErreur("Choisissez un mot de passe différent de l'actuel.");

    setErreur(null);
    setEnvoi(true);
    try {
      await changePassword(actuel, nouveau);
      toast({ title: "Mot de passe modifié", description: "Votre nouveau mot de passe est actif." });
      navigate(destination, { replace: true });
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <AuthShell
      title={obligatoire ? "Choisissez votre mot de passe" : "Changer le mot de passe"}
      subtitle={obligatoire ? "Le mot de passe reçu par WhatsApp est provisoire." : undefined}
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="mdp-actuel" className="text-xs">
            {obligatoire ? "Mot de passe provisoire" : "Mot de passe actuel"}
          </Label>
          <PasswordInput id="mdp-actuel" value={actuel} onChange={setActuel} disabled={envoi} autoComplete="current-password" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="mdp-nouveau" className="text-xs">Nouveau mot de passe</Label>
          <PasswordInput id="mdp-nouveau" value={nouveau} onChange={setNouveau} disabled={envoi} autoComplete="new-password" />
          <p className="text-[11px] text-muted-foreground">8 caractères minimum, avec au moins une lettre et un chiffre.</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="mdp-confirmation" className="text-xs">Confirmer le mot de passe</Label>
          <PasswordInput id="mdp-confirmation" value={confirmation} onChange={setConfirmation} disabled={envoi} autoComplete="new-password" />
        </div>

        {erreur && <p role="alert" className="text-xs text-destructive">{erreur}</p>}

        <Button
          type="submit"
          className="w-full h-9 bg-gradient-to-r from-primary to-accent text-white shadow-md hover:shadow-lg transition-all"
          disabled={envoi || !actuel || !nouveau || !confirmation}
        >
          {envoi ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enregistrement...</> : "Enregistrer"}
        </Button>

        {obligatoire ? (
          <button
            type="button"
            onClick={async () => { await logout(); navigate("/login", { replace: true }); }}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            Se déconnecter
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            Annuler
          </button>
        )}
      </form>
    </AuthShell>
  );
}
