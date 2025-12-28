import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft, Lightbulb } from "lucide-react";
import * as Icons from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: string;
  suggestedFeatures?: string[];
  backLink?: string;
  backLabel?: string;
}

export function PlaceholderPage({
  title,
  description = "Cette page est en cours de développement et sera bientôt disponible.",
  icon = "Construction",
  suggestedFeatures = [],
  backLink = "/admin",
  backLabel = "Retour au tableau de bord"
}: PlaceholderPageProps) {
  const IconComponent = (Icons as any)[icon] || Construction;

  return (
    <div className="container max-w-4xl mx-auto py-4 md:py-8 px-4">
      {/* Back Button */}
      <Link to={backLink} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-all hover:gap-3">
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      {/* Main Card */}
      <Card className="shadow-2xl border-2 border-border/50 overflow-hidden">
        <CardHeader className="text-center pb-8 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <IconComponent className="h-12 w-12 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-2xl opacity-30 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {title}
          </CardTitle>
          <CardDescription className="text-sm md:text-base mt-2">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-4 md:p-6">
          {/* Construction Notice */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg shadow-sm">
            <Construction className="h-6 w-6 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">
                Page en construction
              </h3>
              <p className="text-sm text-yellow-800">
                Notre équipe travaille activement sur cette fonctionnalité. Elle sera disponible prochainement.
              </p>
            </div>
          </div>

          {/* Suggested Features */}
          {suggestedFeatures.length > 0 && (
            <div className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Lightbulb className="h-5 w-5 text-accent" />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Fonctionnalités prévues :
                </span>
              </div>
              <ul className="space-y-2 ml-1">
                {suggestedFeatures.map((feature, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-3">
                    <span className="text-primary mt-1 font-bold">→</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild variant="default" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all">
              <Link to={backLink}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {backLabel}
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-2 hover:bg-primary/5 hover:border-primary/50">
              <Link to="/admin">
                Tableau de bord
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PlaceholderPage;
