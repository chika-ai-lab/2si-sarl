import { Settings, Clock, Mail, Phone } from "lucide-react";
import { companyConfig } from "@/config/company.config";
import { SEO } from "@/components/SEO";

export function MaintenancePage() {
  return (
    <>
      <SEO
        title="Maintenance en cours"
        description="Le site est temporairement en maintenance. Nous serons de retour sous peu."
        noindex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="h-16 w-16 text-primary animate-spin" style={{ animationDuration: "3s" }} />
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-900" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Maintenance en cours
            </h1>
            <p className="text-xl text-muted-foreground max-w-md mx-auto">
              Notre site est actuellement en maintenance pour vous offrir une meilleure expérience.
            </p>
          </div>

          {/* Details */}
          <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-lg mb-2">Que se passe-t-il ?</h3>
                <p className="text-muted-foreground">
                  Nous effectuons des mises à jour importantes pour améliorer nos services.
                  Cette maintenance est nécessaire pour garantir la sécurité et les performances optimales de notre plateforme.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-lg mb-2">Quand serons-nous de retour ?</h3>
                <p className="text-muted-foreground">
                  Nous prévoyons de rétablir le service dans les plus brefs délais.
                  Nous vous remercions de votre patience et de votre compréhension.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
            <h3 className="font-semibold text-lg mb-4">Besoin d'aide urgente ?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href={`mailto:${companyConfig.email}`}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="font-medium">{companyConfig.email}</span>
              </a>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <a
                href={`tel:${companyConfig.phone}`}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span className="font-medium">{companyConfig.phone}</span>
              </a>
            </div>
          </div>

          {/* Company Info */}
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{companyConfig.legalName}</strong>
              <br />
              {companyConfig.address.street}, {companyConfig.address.city}, {companyConfig.address.country}
            </p>
          </div>

          {/* Progress Animation */}
          <div className="w-full max-w-md mx-auto">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/60 animate-pulse"
                style={{ width: "75%" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Progression de la maintenance...
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
