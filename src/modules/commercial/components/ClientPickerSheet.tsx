import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck, CheckCircle, X } from "lucide-react";

export function ClientPickerSheet({ open, onClose, clients, selectedId, onSelect }: {
  open: boolean;
  onClose: () => void;
  clients: any[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch]   = useState("");
  const [typeFilter, setType] = useState("all");
  const [bankFilter, setBank] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) => {
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (bankFilter !== "all" && (c.banquePartenaire ?? "").toUpperCase() !== bankFilter) return false;
      if (q) {
        const h = [c.nom, c.prenom, c.raisonSociale, c.telephone, c.email, c.code]
          .filter(Boolean).join(" ").toLowerCase();
        if (!h.includes(q)) return false;
      }
      return true;
    });
  }, [clients, search, typeFilter, bankFilter]);

  const selected = clients.find((c) => c.id === selectedId);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />Choisir un client
            {selected && (
              <Badge className="ml-auto bg-primary text-primary-foreground truncate max-w-[140px]">
                {selected.nom} {selected.prenom ?? ""}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 py-3 space-y-3 border-b bg-muted/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, téléphone, email..." className="pl-9 h-9" />
            {search && <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}><X className="h-4 w-4 text-muted-foreground" /></button>}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border overflow-hidden text-xs h-8">
              {[{v:"all",l:"Tous"},{v:"particulier",l:"Particulier"},{v:"entreprise",l:"Entreprise"}].map(({v,l}) => (
                <button key={v} type="button" className={`px-3 transition-colors ${typeFilter===v?"bg-primary text-primary-foreground font-medium":"hover:bg-muted"}`} onClick={() => setType(v)}>{l}</button>
              ))}
            </div>
            <div className="flex rounded-lg border overflow-hidden text-xs h-8">
              {[{v:"all",l:"Banque"},{v:"CBAO",l:"CBAO"},{v:"CMS",l:"CMS"}].map(({v,l}) => (
                <button key={v} type="button" className={`px-3 transition-colors ${bankFilter===v?"bg-primary text-primary-foreground font-medium":"hover:bg-muted"}`} onClick={() => setBank(v)}>{l}</button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} client(s)</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun client trouvé</p>
            </div>
          ) : filtered.map((c) => {
            const isSel = c.id === selectedId;
            return (
              <button key={c.id} type="button"
                className={`w-full text-left flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${isSel ? "border-primary/60 bg-primary/5 ring-1 ring-primary/30" : "hover:bg-muted/50"}`}
                onClick={() => { onSelect(c.id); onClose(); }}>
                <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${isSel ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {(c.nom?.[0] ?? "?").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{c.nom}{c.prenom ? ` ${c.prenom}` : ""}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {c.telephone && <span className="text-xs text-muted-foreground">{c.telephone}</span>}
                    {c.banquePartenaire && c.banquePartenaire !== "Autre" && (
                      <Badge variant="outline" className="text-xs px-1 py-0 bg-blue-50 text-blue-700 border-blue-200">{c.banquePartenaire}</Badge>
                    )}
                  </div>
                </div>
                {isSel && <CheckCircle className="h-4 w-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
