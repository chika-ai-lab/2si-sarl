import { ReactNode, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";

/** Cadre commun aux écrans d'authentification (même habillage que LoginPage). */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <>
      <SEO title={title} noindex={true} />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-4">
            <div className="inline-flex h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent items-center justify-center shadow-lg shadow-primary/30 mb-3">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              2SI SARL
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Espace de gestion</p>
          </div>

          <Card className="shadow-xl border border-border/60">
            <CardHeader className="pb-1 pt-4 px-5">
              <CardTitle className="text-base font-semibold text-center">{title}</CardTitle>
              {subtitle && <p className="text-xs text-muted-foreground text-center">{subtitle}</p>}
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-3">{children}</CardContent>
          </Card>

          <p className="text-center text-[10px] text-muted-foreground mt-3">
            © {new Date().getFullYear()} Sen Services International — 2SI SARL
          </p>
        </div>
      </div>
    </>
  );
}

/** Champ mot de passe avec bouton afficher/masquer. */
export function PasswordInput({
  id, value, onChange, disabled, autoComplete, placeholder = "••••••••",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="flex w-full rounded-md border border-input bg-background pl-9 pr-9 h-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
