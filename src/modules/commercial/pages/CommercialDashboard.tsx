import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Users,
  ShoppingCart,
  BookOpen,
  FileText,
  Calculator,
  Wrench,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function CommercialDashboard() {
  // Statistiques de démonstration
  const stats = {
    totalClients: 156,
    clientsActifs: 142,
    commandesEnCours: 23,
    commandesValidees: 187,
    ticketsSAV: 12,
    ticketsSAVOuverts: 5
  };

  const quickActions = [
    {
      label: "Clients",
      description: "Gérer les clients",
      icon: Users,
      path: "/admin/commercial/clients",
      color: "from-blue-500 to-blue-600"
    },
    {
      label: "Commandes",
      description: "Voir les commandes",
      icon: ShoppingCart,
      path: "/admin/commercial/commandes",
      color: "from-green-500 to-green-600"
    },
    {
      label: "Catalogue",
      description: "Parcourir le catalogue",
      icon: BookOpen,
      path: "/admin/commercial/catalogue",
      color: "from-orange-500 to-orange-600"
    },
    {
      label: "Accréditif",
      description: "Documents accréditifs",
      icon: FileText,
      path: "/admin/commercial/accreditif",
      color: "from-pink-500 to-pink-600"
    },
    {
      label: "Simulation",
      description: "Tableau de simulation",
      icon: Calculator,
      path: "/admin/commercial/simulation",
      color: "from-teal-500 to-teal-600"
    },
    {
      label: "S.A.V",
      description: "Service après-vente",
      icon: Wrench,
      path: "/admin/commercial/sav",
      color: "from-red-500 to-red-600"
    },
    {
      label: "Rapports",
      description: "Voir les rapports",
      icon: BarChart3,
      path: "/admin/commercial/rapports",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      label: "Promotions",
      description: "Gérer les bannières",
      icon: FileText,
      path: "/admin/commercial/promotions",
      color: "from-amber-500 to-amber-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Module Commercial
        </h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble de l'activité commerciale
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Clients */}
        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs flex items-center gap-1 mt-1">
              <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                {stats.clientsActifs} actifs
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Commandes en cours */}
        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes en cours</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.commandesEnCours}</div>
            <p className="text-xs flex items-center gap-1 mt-1 text-muted-foreground">
              En cours de traitement
            </p>
          </CardContent>
        </Card>

        {/* Commandes validées */}
        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes validées</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.commandesValidees}</div>
            <p className="text-xs flex items-center gap-1 mt-1">
              <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                +12% ce mois
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Tickets SAV */}
        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets SAV</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
              <Wrench className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ticketsSAV}</div>
            <p className="text-xs flex items-center gap-1 mt-1">
              <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                {stats.ticketsSAVOuverts} ouverts
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Chiffre d'affaires */}
        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA du mois</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245M FCFA</div>
            <p className="text-xs flex items-center gap-1 mt-1">
              <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                +8.5%
              </span>
              <span className="text-muted-foreground">vs mois dernier</span>
            </p>
          </CardContent>
        </Card>

        {/* Alertes */}
        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-md">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nécessitent votre attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Accès rapide</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.path} to={action.path}>
                <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div
                        className={`h-12 w-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{action.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
