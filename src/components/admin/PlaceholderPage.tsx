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
    <div className="container max-w-4xl mx-auto py-8">
      {/* Back Button */}
      <Link to={backLink} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      {/* Main Card */}
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <IconComponent className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">{title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Construction Notice */}
          <div className="flex items-start gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
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
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span>Fonctionnalités prévues :</span>
              </div>
              <ul className="space-y-2 ml-6">
                {suggestedFeatures.map((feature, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button asChild variant="default">
              <Link to={backLink}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {backLabel}
              </Link>
            </Button>
            <Button asChild variant="outline">
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
