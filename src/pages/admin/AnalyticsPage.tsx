import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp, TrendingDown, Users, ShoppingCart, Package,
  BarChart3, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

type Period = "7j" | "30j" | "90j" | "365j";

const PERIOD_LABELS: Record<Period, string> = {
  "7j":  "7 derniers jours",
  "30j": "30 derniers jours",
  "90j": "3 derniers mois",
  "365j": "12 derniers mois",
};

const PERIOD_DATA: Record<Period, {
  revenue: number; revenueDelta: number;
  orders: number; ordersDelta: number;
  clients: number; clientsDelta: number;
  panier: number; panierDelta: number;
  topProduits: { nom: string; ventes: number; ca: number }[];
  topClients: { nom: string; commandes: number; ca: number }[];
  parMois: { mois: string; ca: number; commandes: number }[];
}> = {
  "7j": {
    revenue: 18400000, revenueDelta: 12.4,
    orders: 14, ordersDelta: 5.2,
    clients: 8, clientsDelta: -1.1,
    panier: 1314285, panierDelta: 7.2,
    topProduits: [
      { nom: "Ordinateur Portable Pro", ventes: 12, ca: 10200000 },
      { nom: "Imprimante Multifonction", ventes: 6, ca: 4800000 },
      { nom: "Écran 27\"", ventes: 8, ca: 1480000 },
    ],
    topClients: [
      { nom: "SARL Diallo & Frères", commandes: 4, ca: 8500000 },
      { nom: "Groupe TechAfrique", commandes: 2, ca: 5200000 },
    ],
    parMois: [
      { mois: "Lun", ca: 2100000, commandes: 2 },
      { mois: "Mar", ca: 3400000, commandes: 3 },
      { mois: "Mer", ca: 1800000, commandes: 1 },
      { mois: "Jeu", ca: 4200000, commandes: 4 },
      { mois: "Ven", ca: 3900000, commandes: 3 },
      { mois: "Sam", ca: 2100000, commandes: 1 },
      { mois: "Dim", ca: 900000, commandes: 0 },
    ],
  },
  "30j": {
    revenue: 78600000, revenueDelta: 8.7,
    orders: 62, ordersDelta: 3.1,
    clients: 34, clientsDelta: 12.5,
    panier: 1267741, panierDelta: 5.4,
    topProduits: [
      { nom: "Ordinateur Portable Pro", ventes: 45, ca: 38250000 },
      { nom: "Imprimante Multifonction", ventes: 22, ca: 17600000 },
      { nom: "Écran 27\"", ventes: 31, ca: 5735000 },
      { nom: "Serveur NAS 4 baies", ventes: 8, ca: 12000000 },
    ],
    topClients: [
      { nom: "SARL Diallo & Frères", commandes: 12, ca: 22000000 },
      { nom: "Groupe TechAfrique", commandes: 8, ca: 18500000 },
      { nom: "Import Export Co", commandes: 6, ca: 15000000 },
    ],
    parMois: [
      { mois: "S1", ca: 18200000, commandes: 14 },
      { mois: "S2", ca: 21400000, commandes: 17 },
      { mois: "S3", ca: 19800000, commandes: 15 },
      { mois: "S4", ca: 19200000, commandes: 16 },
    ],
  },
  "90j": {
    revenue: 245680000, revenueDelta: 18.2,
    orders: 187, ordersDelta: 14.6,
    clients: 89, clientsDelta: 21.3,
    panier: 1313797, panierDelta: 3.1,
    topProduits: [
      { nom: "Ordinateur Portable Pro", ventes: 135, ca: 114750000 },
      { nom: "Imprimante Multifonction", ventes: 72, ca: 57600000 },
      { nom: "Serveur NAS 4 baies", ventes: 24, ca: 36000000 },
      { nom: "Écran 27\"", ventes: 95, ca: 17575000 },
      { nom: "Switch 24 ports", ventes: 18, ca: 9000000 },
    ],
    topClients: [
      { nom: "SARL Diallo & Frères", commandes: 38, ca: 68000000 },
      { nom: "Groupe TechAfrique", commandes: 25, ca: 52000000 },
      { nom: "Import Export Co", commandes: 18, ca: 42000000 },
      { nom: "BTP Solutions", commandes: 12, ca: 28000000 },
    ],
    parMois: [
      { mois: "Nov", ca: 72000000, commandes: 58 },
      { mois: "Déc", ca: 95000000, commandes: 74 },
      { mois: "Jan", ca: 78680000, commandes: 55 },
    ],
  },
  "365j": {
    revenue: 890000000, revenueDelta: 24.5,
    orders: 748, ordersDelta: 19.2,
    clients: 156, clientsDelta: 35.7,
    panier: 1190107, panierDelta: 4.4,
    topProduits: [
      { nom: "Ordinateur Portable Pro", ventes: 490, ca: 416500000 },
      { nom: "Imprimante Multifonction", ventes: 280, ca: 224000000 },
      { nom: "Serveur NAS 4 baies", ventes: 95, ca: 142500000 },
      { nom: "Écran 27\"", ventes: 380, ca: 70300000 },
      { nom: "Switch 24 ports", ventes: 75, ca: 37500000 },
    ],
    topClients: [
      { nom: "SARL Diallo & Frères", commandes: 145, ca: 245000000 },
      { nom: "Groupe TechAfrique", commandes: 98, ca: 195000000 },
      { nom: "Import Export Co", commandes: 72, ca: 165000000 },
      { nom: "BTP Solutions", commandes: 48, ca: 110000000 },
      { nom: "Cabinet MF Consulting", commandes: 35, ca: 78000000 },
    ],
    parMois: [
      { mois: "Fév", ca: 58000000, commandes: 46 },
      { mois: "Mar", ca: 65000000, commandes: 52 },
      { mois: "Avr", ca: 72000000, commandes: 58 },
      { mois: "Mai", ca: 78000000, commandes: 62 },
      { mois: "Jun", ca: 82000000, commandes: 65 },
      { mois: "Jul", ca: 68000000, commandes: 54 },
      { mois: "Aoû", ca: 55000000, commandes: 44 },
      { mois: "Sep", ca: 71000000, commandes: 57 },
      { mois: "Oct", ca: 85000000, commandes: 68 },
      { mois: "Nov", ca: 90000000, commandes: 72 },
      { mois: "Déc", ca: 98000000, commandes: 78 },
      { mois: "Jan", ca: 68000000, commandes: 55 },
    ],
  },
};

function Delta({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`flex items-center gap-1 text-sm font-semibold ${positive ? "text-green-600" : "text-red-500"}`}>
      {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30j");
  const d = PERIOD_DATA[period];
  const maxCa = Math.max(...d.parMois.map((m) => m.ca));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-7 w-7" /> Analytiques
          </h2>
          <p className="text-muted-foreground">Performances et métriques de l'activité</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(PERIOD_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: <TrendingUp className="h-5 w-5 text-green-600" />, bg: "bg-green-100", label: "Chiffre d'affaires", value: formatCurrency(d.revenue), delta: d.revenueDelta },
          { icon: <ShoppingCart className="h-5 w-5 text-blue-600" />, bg: "bg-blue-100",  label: "Commandes",         value: d.orders.toString(),          delta: d.ordersDelta },
          { icon: <Users className="h-5 w-5 text-purple-600" />,     bg: "bg-purple-100", label: "Clients actifs",   value: d.clients.toString(),         delta: d.clientsDelta },
          { icon: <Package className="h-5 w-5 text-orange-600" />,   bg: "bg-orange-100", label: "Panier moyen",     value: formatCurrency(d.panier),     delta: d.panierDelta },
        ].map(({ icon, bg, label, value, delta }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>{icon}</div>
                <Delta value={delta} />
              </div>
              <p className="text-sm text-muted-foreground mt-3">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphique CA + Top produits */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Bar chart CA */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Évolution du CA — {PERIOD_LABELS[period]}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {d.parMois.map((m) => {
                const pct = maxCa > 0 ? (m.ca / maxCa) * 100 : 0;
                return (
                  <div key={m.mois} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">{formatCurrency(m.ca / 1000000).replace(" FCFA", "M")}</span>
                    <div
                      className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                      style={{ height: `${Math.max(pct, 4)}%` }}
                      title={`${m.mois}: ${formatCurrency(m.ca)}`}
                    />
                    <span className="text-xs text-muted-foreground">{m.mois}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top produits */}
        <Card>
          <CardHeader><CardTitle>Top Produits</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {d.topProduits.slice(0, 5).map((p, i) => (
              <div key={p.nom}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary" className="w-5 h-5 flex items-center justify-center p-0 text-xs">{i + 1}</Badge>
                    <span className="truncate max-w-28">{p.nom}</span>
                  </span>
                  <span className="font-semibold text-xs">{p.ventes} vtes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${(p.ventes / d.topProduits[0].ventes) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-20 text-right">
                    {formatCurrency(p.ca / 1000000).replace(" FCFA", "M FCFA")}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top clients */}
      <Card>
        <CardHeader><CardTitle>Top Clients</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y">
            {d.topClients.map((c, i) => (
              <div key={c.nom} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium">{c.nom}</p>
                    <p className="text-xs text-muted-foreground">{c.commandes} commandes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(c.ca)}</p>
                  <div className="flex items-center justify-end gap-1 text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3" />
                    {((c.ca / d.revenue) * 100).toFixed(1)}% du CA
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsPage;
