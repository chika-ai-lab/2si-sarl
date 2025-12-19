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
import { Search, MoreVertical, Eye, Mail, Phone } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export function CustomersPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const customers = [
    {
      id: "CUST-001",
      name: "Entreprise ABC",
      email: "contact@abc.com",
      phone: "+221 77 123 45 67",
      joinDate: "2024-06-15",
      totalOrders: 12,
      totalSpent: 8450000,
      status: "active" as const,
    },
    {
      id: "CUST-002",
      name: "SARL Martin",
      email: "martin@sarl.sn",
      phone: "+221 77 234 56 78",
      joinDate: "2024-08-22",
      totalOrders: 8,
      totalSpent: 5230000,
      status: "active" as const,
    },
    {
      id: "CUST-003",
      name: "SCI Diallo",
      email: "diallo@sci.sn",
      phone: "+221 77 345 67 89",
      joinDate: "2024-11-10",
      totalOrders: 3,
      totalSpent: 9870000,
      status: "new" as const,
    },
    {
      id: "CUST-004",
      name: "Tech Solutions",
      email: "tech@solutions.com",
      phone: "+221 77 456 78 90",
      joinDate: "2024-03-05",
      totalOrders: 25,
      totalSpent: 15670000,
      status: "vip" as const,
    },
  ];

  const statusConfig = {
    active: { label: "Actif", color: "bg-green-100 text-green-800" },
    new: { label: "Nouveau", color: "bg-blue-100 text-blue-800" },
    vip: { label: "VIP", color: "bg-primary/10 text-primary" },
    inactive: { label: "Inactif", color: "bg-gray-100 text-gray-800" },
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("admin.customers")}
        </h2>
        <p className="text-muted-foreground">Gérer la base de clients</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>{filteredCustomers.length} client(s)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>Total dépensé</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.joinDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.totalOrders}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(customer.totalSpent)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusConfig[customer.status].color}
                    >
                      {statusConfig[customer.status].label}
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir profil
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Envoyer email
                        </DropdownMenuItem>
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
  );
}
