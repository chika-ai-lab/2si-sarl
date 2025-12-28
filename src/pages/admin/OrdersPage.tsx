import { useState } from "react";
import { useTranslation } from "@/providers/I18nProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, MoreVertical, Eye, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";
import { toast } from "@/hooks/use-toast";

export function OrdersPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const orders = [
    {
      id: "ORD-001",
      date: "2025-01-15",
      customer: "Entreprise ABC",
      email: "contact@abc.com",
      amount: 4599000,
      status: "pending" as const,
      items: 3,
    },
    {
      id: "ORD-002",
      date: "2025-01-14",
      customer: "SARL Martin",
      email: "martin@sarl.sn",
      amount: 1299000,
      status: "approved" as const,
      items: 1,
    },
    {
      id: "ORD-003",
      date: "2025-01-14",
      customer: "SCI Diallo",
      email: "diallo@sci.sn",
      amount: 8750000,
      status: "in_progress" as const,
      items: 5,
    },
    {
      id: "ORD-004",
      date: "2025-01-13",
      customer: "Tech Solutions",
      email: "tech@solutions.com",
      amount: 3200000,
      status: "completed" as const,
      items: 2,
    },
    {
      id: "ORD-005",
      date: "2025-01-13",
      customer: "Import Export Co",
      email: "import@export.sn",
      amount: 950000,
      status: "rejected" as const,
      items: 1,
    },
  ];

  const statusConfig = {
    pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
    approved: { label: "Approuvé", color: "bg-green-100 text-green-800" },
    in_progress: { label: "En cours", color: "bg-blue-100 text-blue-800" },
    completed: { label: "Complété", color: "bg-primary/10 text-primary" },
    rejected: { label: "Rejeté", color: "bg-red-100 text-red-800" },
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: any) => {
    setSelectedOrder({
      ...order,
      phone: "+221 77 123 45 67",
      address: "Dakar, Sénégal",
      items: [
        { name: "Écran Moniteur 32\" 4K", quantity: 2, price: 589000 },
        { name: "Ordinateur Portable Pro", quantity: 1, price: 1299000 },
      ],
      paymentPlan: "12 mois",
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = (orderId: string, newStatus: any) => {
    console.log(`Changing order ${orderId} to status ${newStatus}`);
    toast({
      title: "Statut mis à jour",
      description: `La commande ${orderId} a été mise à jour.`,
    });
  };

  return (
    <>
      <OrderDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
      />

      <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("admin.orders")}
        </h2>
        <p className="text-muted-foreground">
          Gérer toutes les commandes et demandes de crédit
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par n° commande ou client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Statut: {statusFilter === "all" ? "Tous" : statusConfig[statusFilter as keyof typeof statusConfig]?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  Tous
                </DropdownMenuItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setStatusFilter(key)}
                  >
                    {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredOrders.length} commande(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Commande</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(order.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusConfig[order.status].color}
                    >
                      {statusConfig[order.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
                        </DropdownMenuItem>
                        {order.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, "approved")}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approuver
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleStatusChange(order.id, "rejected")}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Rejeter
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </>
  );
}

export default OrdersPage;
