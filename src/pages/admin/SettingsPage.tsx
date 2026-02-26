import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  Bell,
  Shield,
  Palette,
  Save,
  RefreshCw,
  Download,
  RotateCcw,
} from "lucide-react";
import {
  loadSettings,
  updateCompanySettings,
  updatePaymentSettings,
  updateNotificationSettings,
  updateSystemSettings,
  exportSettings,
  resetSettings,
} from "@/services/settingsService";

export function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  // Company Settings
  const [companyName, setCompanyName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [ninea, setNinea] = useState("");

  // Payment Settings
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [defaultPlan, setDefaultPlan] = useState("");

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // System Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const settings = loadSettings();

    // Company
    setCompanyName(settings.company.name);
    setLegalName(settings.company.legalName);
    setEmail(settings.company.email);
    setPhone(settings.company.phone);
    setAddress(settings.company.address);
    setNinea(settings.company.ninea);

    // Payment
    setMinAmount(settings.payment.minAmount.toString());
    setMaxAmount(settings.payment.maxAmount.toString());
    setDefaultPlan(settings.payment.defaultPlanId);

    // Notifications
    setEmailNotifications(settings.notifications.emailNotifications);
    setOrderNotifications(settings.notifications.orderNotifications);
    setStockAlerts(settings.notifications.stockAlerts);
    setMarketingEmails(settings.notifications.marketingEmails);

    // System
    setMaintenanceMode(settings.system.maintenanceMode);
    setAllowRegistration(settings.system.allowRegistration);
    setRequireApproval(settings.system.requireApproval);
  }, []);

  const handleSaveCompanySettings = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateCompanySettings({
        name: companyName,
        legalName,
        email,
        phone,
        address,
        ninea,
      });
      toast({
        title: "Paramètres enregistrés",
        description: "Les informations de l'entreprise ont été mises à jour.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      updatePaymentSettings({
        minAmount: parseInt(minAmount),
        maxAmount: parseInt(maxAmount),
        defaultPlanId: defaultPlan,
      });
      toast({
        title: "Paramètres enregistrés",
        description: "Les paramètres de paiement ont été mis à jour.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateNotificationSettings({
        emailNotifications,
        orderNotifications,
        stockAlerts,
        marketingEmails,
      });
      toast({
        title: "Paramètres enregistrés",
        description: "Les préférences de notification ont été mises à jour.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateSystemSettings({
        maintenanceMode,
        allowRegistration,
        requireApproval,
      });
      toast({
        title: "Paramètres enregistrés",
        description: "Les paramètres système ont été mis à jour.",
      });

      if (maintenanceMode) {
        toast({
          title: "⚠️ Mode maintenance activé",
          description: "Le site public est maintenant inaccessible.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportSettings = () => {
    try {
      const data = exportSettings();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().split("T")[0];
      link.download = `2SI_Settings_${date}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Les paramètres ont été exportés avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les paramètres.",
        variant: "destructive",
      });
    }
  };

  const handleResetCache = () => {
    if (confirm("Êtes-vous sûr de vouloir vider le cache ? Cette action est irréversible.")) {
      localStorage.removeItem("2si-cart-state");
      localStorage.removeItem("2si-wishlist-items");
      toast({
        title: "Cache vidé",
        description: "Le cache a été réinitialisé avec succès.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">
          Gérer les paramètres de l'application et de l'entreprise
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Entreprise</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Paiement</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Système</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations de l'entreprise
              </CardTitle>
              <CardDescription>
                Gérer les informations légales et de contact de votre entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom commercial</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="2SI"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalName">Raison sociale</Label>
                  <Input
                    id="legalName"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Sen Services International"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@sen-services.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 33 864 48 48"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Adresse
                </Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="En face Auto Pont BRT Liberté 5 Villa N°5492, Dakar, Sénégal"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ninea">NINEA</Label>
                <Input
                  id="ninea"
                  value={ninea}
                  onChange={(e) => setNinea(e.target.value)}
                  placeholder="007835162"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveCompanySettings}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Paramètres de paiement
              </CardTitle>
              <CardDescription>
                Configurer les options de paiement et les plans de crédit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Limites de crédit</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Montant minimum (FCFA)</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      placeholder="100000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Montant maximum (FCFA)</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      placeholder="10000000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultPlan">Plan de paiement par défaut</Label>
                <Select value={defaultPlan} onValueChange={setDefaultPlan}>
                  <SelectTrigger id="defaultPlan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 mois</SelectItem>
                    <SelectItem value="6">6 mois</SelectItem>
                    <SelectItem value="12">12 mois</SelectItem>
                    <SelectItem value="18">18 mois</SelectItem>
                    <SelectItem value="24">24 mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Les modifications des paramètres de paiement
                  affecteront les nouvelles commandes uniquement. Les commandes existantes
                  conserveront leurs conditions initiales.
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSavePaymentSettings}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Préférences de notification
              </CardTitle>
              <CardDescription>
                Gérer les notifications et les alertes du système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir les notifications importantes par email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="orderNotifications">Alertes de commandes</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir une alerte pour chaque nouvelle commande
                    </p>
                  </div>
                  <Switch
                    id="orderNotifications"
                    checked={orderNotifications}
                    onCheckedChange={setOrderNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="stockAlerts">Alertes de stock</Label>
                    <p className="text-sm text-muted-foreground">
                      Être notifié quand un produit est en rupture de stock
                    </p>
                  </div>
                  <Switch
                    id="stockAlerts"
                    checked={stockAlerts}
                    onCheckedChange={setStockAlerts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketingEmails">Emails marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des conseils et des actualités produits
                    </p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveNotificationSettings}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Paramètres système
              </CardTitle>
              <CardDescription>
                Gérer les paramètres avancés et la sécurité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenanceMode">Mode maintenance</Label>
                    <p className="text-sm text-muted-foreground">
                      Désactiver temporairement l'accès au site public
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowRegistration">Autoriser les inscriptions</Label>
                    <p className="text-sm text-muted-foreground">
                      Permettre aux nouveaux utilisateurs de créer un compte
                    </p>
                  </div>
                  <Switch
                    id="allowRegistration"
                    checked={allowRegistration}
                    onCheckedChange={setAllowRegistration}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireApproval">Approbation requise</Label>
                    <p className="text-sm text-muted-foreground">
                      Les nouvelles commandes nécessitent une approbation manuelle
                    </p>
                  </div>
                  <Switch
                    id="requireApproval"
                    checked={requireApproval}
                    onCheckedChange={setRequireApproval}
                  />
                </div>
              </div>

              {maintenanceMode && (
                <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
                  <p className="text-sm text-orange-800">
                    <strong>⚠️ Attention:</strong> Le mode maintenance est activé. Les
                    utilisateurs ne peuvent pas accéder au site.
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSystemSettings}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Zone de danger</CardTitle>
              <CardDescription>
                Actions irréversibles - utiliser avec précaution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Réinitialiser le cache</p>
                  <p className="text-sm text-muted-foreground">
                    Vider tous les caches du système
                  </p>
                </div>
                <Button variant="outline" onClick={handleResetCache}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Exporter les paramètres</p>
                  <p className="text-sm text-muted-foreground">
                    Télécharger une copie JSON des paramètres
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportSettings}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPage;
