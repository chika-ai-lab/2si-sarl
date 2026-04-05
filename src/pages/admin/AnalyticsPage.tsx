import { WipBadge } from "@/components/ui/WipBadge";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Analytiques</h1>
            <WipBadge />
          </div>
          <p className="text-muted-foreground mt-1">Tableaux de bord et rapports avancés.</p>
        </div>
      </div>

      <div className="flex items-center justify-center rounded-xl border border-dashed bg-muted/30 py-24 text-muted-foreground">
        <div className="text-center space-y-2">
          <BarChart3 className="h-12 w-12 mx-auto opacity-30" />
          <p className="font-medium">Module en cours de développement</p>
          <p className="text-sm">Les analytiques seront disponibles prochainement.</p>
        </div>
      </div>
    </div>
  );
}
