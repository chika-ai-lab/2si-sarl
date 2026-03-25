import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, ShoppingCart, BookOpen, BarChart3, FileText,
  Calculator, Wrench, Tag, ArrowRight, ArrowLeft,
  CheckCircle2, Package, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "gestemc_onboarding_v1";

/* ─── Steps definition ──────────────────────────────────────────── */
const STEPS = [
  {
    id: "bienvenue",
    icon: Building2,
    iconBg: "bg-primary/10 text-primary",
    title: "Bienvenue dans GestEMC",
    subtitle: "Votre outil de gestion commerciale",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          GestEMC est la plateforme de gestion commerciale de <strong>2SI SARL</strong>.
          Elle centralise tous vos processus : clients, commandes, catalogue produits,
          accréditifs, SAV et rapports.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Users,        label: "Gestion clients",   color: "text-blue-600" },
            { icon: ShoppingCart, label: "Commandes",         color: "text-green-600" },
            { icon: Package,      label: "Catalogue produits",color: "text-orange-600" },
            { icon: BarChart3,    label: "Rapports & analyses",color: "text-purple-600" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
              <Icon className={cn("h-4 w-4 shrink-0", color)} />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "acces",
    icon: CheckCircle2,
    iconBg: "bg-green-100 text-green-700",
    title: "Vos identifiants de connexion",
    subtitle: "Trois rôles disponibles selon les responsabilités",
    content: (
      <div className="space-y-3">
        {[
          {
            role: "Administrateur",
            email: "admin@2si.sarl",
            pass: "admin123",
            color: "border-primary/30 bg-primary/5",
            badge: "bg-primary text-primary-foreground",
            desc: "Accès complet — paramètres, utilisateurs, tous les modules",
          },
          {
            role: "Commercial",
            email: "commercial@2si.sarl",
            pass: "commercial123",
            color: "border-blue-200 bg-blue-50/50",
            badge: "bg-blue-600 text-white",
            desc: "Clients, commandes, catalogue, accréditifs, SAV",
          },
          {
            role: "Comptabilité",
            email: "comptabilite@2si.sarl",
            pass: "compta123",
            color: "border-purple-200 bg-purple-50/50",
            badge: "bg-purple-600 text-white",
            desc: "Rapports financiers, factures, suivi des paiements",
          },
        ].map((u) => (
          <div key={u.role} className={cn("rounded-lg border p-3 space-y-1", u.color)}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{u.role}</span>
              <Badge className={cn("text-xs", u.badge)}>{u.role}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{u.desc}</p>
            <div className="text-xs font-mono bg-background/60 rounded px-2 py-1 inline-block">
              {u.email} · {u.pass}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "commercial",
    icon: ShoppingCart,
    iconBg: "bg-green-100 text-green-700",
    title: "Module Commercial",
    subtitle: "Le cœur de votre activité quotidienne",
    content: (
      <div className="space-y-3">
        {[
          {
            icon: Users,
            label: "Clients",
            path: "/admin/commercial/clients",
            desc: "Créer et gérer votre portefeuille client. Consulter l'historique des achats, les crédits et les statuts.",
          },
          {
            icon: ShoppingCart,
            label: "Commandes",
            path: "/admin/commercial/commandes",
            desc: "Saisir une nouvelle commande, ajouter les produits, appliquer des remises et suivre l'état (en cours, validée, livrée).",
          },
          {
            icon: BookOpen,
            label: "Catalogue",
            path: "/admin/commercial/catalogue",
            desc: "Gérer les produits disponibles à la vente : référence, prix d'achat, stock, statut.",
          },
          {
            icon: FileText,
            label: "Accréditif",
            path: "/admin/commercial/accreditif",
            desc: "Suivre les lettres de crédit et les dossiers d'importation.",
          },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
            <div className="mt-0.5 shrink-0 rounded-md p-1.5 bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "outils",
    icon: Calculator,
    iconBg: "bg-orange-100 text-orange-700",
    title: "Outils & Suivi",
    subtitle: "Simulation, SAV, Promotions et Rapports",
    content: (
      <div className="space-y-3">
        {[
          {
            icon: Calculator,
            label: "Simulation",
            desc: "Calculez le coût de revient, la marge et le prix de vente d'un produit avant de valider une commande.",
          },
          {
            icon: Wrench,
            label: "S.A.V",
            desc: "Gérer les demandes de service après-vente, les retours et les réclamations clients.",
          },
          {
            icon: Tag,
            label: "Promotions",
            desc: "Créer et gérer les offres promotionnelles et remises applicables aux commandes.",
          },
          {
            icon: BarChart3,
            label: "Rapports",
            desc: "Tableaux de bord commerciaux : chiffre d'affaires, top clients, top produits, évolution des ventes.",
          },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
            <div className="mt-0.5 shrink-0 rounded-md p-1.5 bg-orange-100">
              <Icon className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "flux",
    icon: ArrowRight,
    iconBg: "bg-blue-100 text-blue-700",
    title: "Flux de travail recommandé",
    subtitle: "Par où commencer pour une première utilisation",
    content: (
      <div className="space-y-2">
        {[
          { num: "1", title: "Configurer le catalogue", detail: "Ajoutez vos produits avec référence et prix d'achat dans Catalogue." },
          { num: "2", title: "Créer les clients",       detail: "Enregistrez vos clients avec type (particulier / entreprise) et limite de crédit." },
          { num: "3", title: "Passer une commande",     detail: "Créez une commande, sélectionnez les produits, renseignez le prix de vente et validez." },
          { num: "4", title: "Suivre & livrer",         detail: "Changez le statut de la commande : En cours → Validée → Livrée." },
          { num: "5", title: "Consulter les rapports",  detail: "Analysez les performances commerciales dans le module Rapports." },
        ].map((step) => (
          <div key={step.num} className="flex gap-3 items-start p-3 rounded-lg border bg-muted/20">
            <div className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {step.num}
            </div>
            <div>
              <p className="text-sm font-semibold">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "pret",
    icon: CheckCircle2,
    iconBg: "bg-green-100 text-green-700",
    title: "Vous êtes prêt !",
    subtitle: "GestEMC est configuré et prêt à l'emploi",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          L'application est connectée à votre base de données cloud. Vos données sont
          sauvegardées en temps réel et accessibles depuis n'importe quel appareil.
        </p>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2">
          <p className="text-sm font-semibold text-green-800">État du système</p>
          {[
            "Base de données TiDB Cloud connectée",
            "API Railway déployée et opérationnelle",
            "Application Netlify accessible en ligne",
            "Authentification sécurisée (OAuth2 Passport)",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
              <span className="text-xs text-green-700">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Pour revoir ce guide à tout moment, cliquez sur votre avatar en haut à droite
          et sélectionnez <strong>Guide d'utilisation</strong>.
        </p>
      </div>
    ),
  },
];

/* ─── Component ─────────────────────────────────────────────────── */
export function WelcomeOnboarding() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setOpen(true);
  }, []);

  const close = (goToDashboard = false) => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
    if (goToDashboard) navigate("/admin/dashboard");
  };

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden [&>button.absolute]:hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between mb-4">
            <div className={cn("p-3 rounded-xl", current.iconBg)}>
              <Icon className="h-6 w-6" />
            </div>
            <Button variant="ghost" size="sm" onClick={() => close()} className="text-xs text-muted-foreground h-7 px-2">
              Passer
            </Button>
          </div>
          <h2 className="text-xl font-bold tracking-tight">{current.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{current.subtitle}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[50vh] overflow-y-auto">
          {current.content}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between gap-4">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={cn(
                  "rounded-full transition-all",
                  i === step
                    ? "w-5 h-2 bg-primary"
                    : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Précédent
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={() => close(true)}>
                Commencer <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep(step + 1)}>
                Suivant <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Re-open trigger ───────────────────────────────────────────── */
export function reopenOnboarding() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
