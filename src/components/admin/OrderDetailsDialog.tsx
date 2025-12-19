import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";
import { Package, User, MapPin, Phone, Mail, Calendar, Printer } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { OrderPDF } from "./OrderPDF";
import { toast } from "@/hooks/use-toast";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items?: OrderItem[];
  paymentPlan?: string;
}

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onStatusChange?: (orderId: string, newStatus: Order["status"]) => void;
}

const statusConfig = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  processing: { label: "En cours", color: "bg-blue-100 text-blue-800" },
  shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800" },
};

export function OrderDetailsDialog({
  open,
  onOpenChange,
  order,
  onStatusChange,
}: OrderDetailsDialogProps) {
  if (!order) return null;

  const handlePrintOrder = async () => {
    try {
      const blob = await pdf(<OrderPDF order={order} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Commande_${order.id}_${order.customer.replace(/\s+/g, "_")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "PDF généré",
        description: "La commande a été téléchargée avec succès.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Commande {order.id}</span>
            <Badge variant="outline" className={statusConfig[order.status].color}>
              {statusConfig[order.status].label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Informations client
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Nom</p>
                <p className="font-medium">{order.customer}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date de commande</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {order.date}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </p>
                <p className="font-medium">{order.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Téléphone
                </p>
                <p className="font-medium">{order.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Adresse de livraison
                </p>
                <p className="font-medium">{order.address}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {order.items && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Articles commandés
              </h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantité: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan de paiement</span>
              <span className="font-medium">{order.paymentPlan || "12 mois"}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">{formatCurrency(order.total || order.amount || 0)}</span>
            </div>
          </div>

          {/* Status Update */}
          {onStatusChange && (
            <div className="space-y-3">
              <h3 className="font-semibold">Modifier le statut</h3>
              <Select
                defaultValue={order.status}
                onValueChange={(value) => onStatusChange(order.id, value as Order["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={handlePrintOrder}
            >
              <Printer className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
