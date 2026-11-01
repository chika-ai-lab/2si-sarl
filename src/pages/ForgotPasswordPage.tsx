import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Phone, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { demanderCode, erreurMotDePasse, reinitialiserMotDePasse } from "@/core/auth/services/passwordReset";
import { AuthShell, PasswordInput } from "@/components/auth/AuthShell";

/** Mot de passe oublié : téléphone → code reçu par WhatsApp → nouveau mot de passe. */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [etape, setEtape] = useState<"telephone" | "code">("telephone");
  const [telephone, setTelephone] = useState("");
  const [code, setCode] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const envoyerCode = async (e?: FormEvent) => {
    e?.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      const r = await demanderCode(telephone);
      toast({ title: "Code envoyé", description: r.message });
      setEtape("code");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setEnvoi(false);
    }
  };

  const reinitialiser = async (e: FormEvent) => {
    e.preventDefault();
    const regle = erreurMotDePasse(nouveau);
    if (regle) return setErreur(regle);
    if (nouveau !== confirmation) return setErreur("Les deux mots de passe ne correspondent pas.");

    setErreur(null);
    setEnvoi(true);
    try {
      const r = await reinitialiserMotDePasse(telephone, code, nouveau);
      toast({ title: "Mot de passe réinitialisé", description: r.message });
      navigate("/login", { replace: true });
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setEnvoi(false);
    }
  };

  const bouton = "w-full h-9 bg-gradient-to-r from-primary to-accent text-white shadow-md hover:shadow-lg transition-all";

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle={etape === "telephone"
        ? "Recevez un code par WhatsApp sur votre numéro."
        : `Saisissez le code reçu sur WhatsApp au ${telephone}.`}
    >
      {etape === "telephone" ? (
        <form onSubmit={envoyerCode} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="fp-tel" className="text-xs">Téléphone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="fp-tel"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="77 123 45 67"
                className="pl-9 h-9 text-sm"
                disabled={envoi}
              />
            </div>
          </div>
          {erreur && <p role="alert" className="text-xs text-destructive">{erreur}</p>}
          <Button type="submit" className={bouton} disabled={envoi || telephone.trim().length < 9}>
            {envoi ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Envoi...</> : "Recevoir un code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={reinitialiser} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="fp-code" className="text-xs">Code à 6 chiffres</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="fp-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="pl-9 h-9 text-sm tracking-widest"
                disabled={envoi}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="fp-nouveau" className="text-xs">Nouveau mot de passe</Label>
            <PasswordInput id="fp-nouveau" value={nouveau} onChange={setNouveau} disabled={envoi} autoComplete="new-password" />
            <p className="text-[11px] text-muted-foreground">8 caractères minimum, avec au moins une lettre et un chiffre.</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="fp-confirmation" className="text-xs">Confirmer le mot de passe</Label>
            <PasswordInput id="fp-confirmation" value={confirmation} onChange={setConfirmation} disabled={envoi} autoComplete="new-password" />
          </div>
          {erreur && <p role="alert" className="text-xs text-destructive">{erreur}</p>}
          <Button type="submit" className={bouton} disabled={envoi || code.length !== 6 || !nouveau || !confirmation}>
            {envoi ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enregistrement...</> : "Réinitialiser"}
          </Button>
          <button
            type="button"
            onClick={() => envoyerCode()}
            disabled={envoi}
            className="w-full text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Renvoyer un code
          </button>
        </form>
      )}

      <p className="text-center text-xs mt-4">
        <Link to="/login" className="text-muted-foreground hover:text-foreground">Retour à la connexion</Link>
      </p>
    </AuthShell>
  );
}
