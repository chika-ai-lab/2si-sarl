import { useState, useMemo, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, Package, BookOpen, Plus, Minus, SlidersHorizontal, X, CheckCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export interface BackendArticle {
  id: number;
  libelle: string;
  reference?: string;
  marque?: string;
  prix: number;
  prix_achat?: number;
  quantite: number;
  statut?: string;
  banque?: string;
  categorie?: { id: number; categorie: string };
  images?: string[];
}

export interface LigneForm {
  article_id: string;
  quantite: number;
}

export function ProductPickerSheet({ open, onClose, articles, selected, onConfirm }: {
  open: boolean;
  onClose: () => void;
  articles: BackendArticle[];
  selected: LigneForm[];
  onConfirm: (lines: LigneForm[]) => void;
}) {
  const [search, setSearch]       = useState("");
  const [catFilter, setCat]       = useState("all");
  const [bankFilter, setBank]     = useState("all");
  const [brandFilter, setBrand]   = useState("all");
  const [onlyStock, setOnlyStock] = useState(true);
  const [localSel, setLocalSel]   = useState<LigneForm[]>([]);

  useEffect(() => { if (open) { setLocalSel(selected); setSearch(""); } }, [open]);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    articles.forEach((a) => { if (a.categorie) seen.set(String(a.categorie.id), a.categorie.categorie); });
    return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
  }, [articles]);

  const brands = useMemo(() => {
    const s = new Set<string>();
    articles.forEach((a) => { if (a.marque) s.add(a.marque); });
    return Array.from(s).sort();
  }, [articles]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return articles.filter((a) => {
      if (onlyStock && (a.statut === "rupture" || a.quantite <= 0)) return false;
      if (catFilter !== "all" && String(a.categorie?.id) !== catFilter) return false;
      if (bankFilter !== "all" && (a.banque ?? "").toUpperCase() !== bankFilter) return false;
      if (brandFilter !== "all" && a.marque !== brandFilter) return false;
      if (q && !a.libelle.toLowerCase().includes(q) && !(a.reference ?? "").toLowerCase().includes(q) && !(a.marque ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [articles, search, catFilter, bankFilter, brandFilter, onlyStock]);

  const getQty = (id: number) => localSel.find((l) => l.article_id === String(id))?.quantite ?? 0;

  const add = (id: number) => setLocalSel((p) => {
    const e = p.find((l) => l.article_id === String(id));
    return e ? p.map((l) => l.article_id === String(id) ? { ...l, quantite: l.quantite + 1 } : l)
             : [...p, { article_id: String(id), quantite: 1 }];
  });

  const remove = (id: number) => setLocalSel((p) => {
    const e = p.find((l) => l.article_id === String(id));
    if (!e) return p;
    return e.quantite <= 1 ? p.filter((l) => l.article_id !== String(id))
                           : p.map((l) => l.article_id === String(id) ? { ...l, quantite: l.quantite - 1 } : l);
  });

  const totalItems = localSel.reduce((s, l) => s + l.quantite, 0);
  const totalPrice = localSel.reduce((s, l) => {
    const a = articles.find((a) => String(a.id) === l.article_id);
    return s + (a?.prix || 0) * l.quantite;
  }, 0);
  const activeFilters = [catFilter !== "all", bankFilter !== "all", brandFilter !== "all", !onlyStock].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />Catalogue produits
            {totalItems > 0 && <Badge className="ml-auto bg-primary text-primary-foreground">{totalItems} sélectionné(s)</Badge>}
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 py-3 space-y-3 border-b bg-muted/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, référence, marque..." className="pl-9 h-9" />
            {search && <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}><X className="h-4 w-4 text-muted-foreground" /></button>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select value={catFilter} onValueChange={setCat}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={brandFilter} onValueChange={setBrand}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Marque" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes marques</SelectItem>
                {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border overflow-hidden text-xs h-8">
              {[{v:"all",l:"Tous"},{v:"CBAO",l:"CBAO"},{v:"CMS",l:"CMS"}].map(({v,l}) => (
                <button key={v} type="button" className={`px-3 transition-colors ${bankFilter===v?"bg-primary text-primary-foreground font-medium":"hover:bg-muted"}`} onClick={() => setBank(v)}>{l}</button>
              ))}
            </div>
            <button type="button" className={`flex items-center gap-1.5 text-xs px-3 h-8 rounded-lg border transition-colors ${onlyStock?"bg-green-50 text-green-700 border-green-200":"hover:bg-muted"}`} onClick={() => setOnlyStock((v) => !v)}>
              <Package className="h-3.5 w-3.5" />En stock
            </button>
            {activeFilters > 0 && (
              <button type="button" className="text-xs text-muted-foreground hover:text-foreground ml-auto" onClick={() => { setCat("all"); setBank("all"); setBrand("all"); setOnlyStock(true); }}>
                <SlidersHorizontal className="h-3.5 w-3.5 inline mr-1" />Réinitialiser ({activeFilters})
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} produit(s)</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun produit trouvé</p>
            </div>
          ) : filtered.map((a) => {
            const qty = getQty(a.id);
            const inCart = qty > 0;
            return (
              <div key={a.id} className={`flex items-center gap-3 rounded-lg border p-2.5 transition-colors ${inCart ? "border-primary/40 bg-primary/5" : "hover:bg-muted/40"}`}>
                <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
                  {a.images?.[0] ? <img src={a.images[0]} alt={a.libelle} className="h-full w-full object-cover" /> : <Package className="h-6 w-6 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{a.libelle}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {a.reference && <span className="text-xs font-mono text-muted-foreground">{a.reference}</span>}
                    {a.marque && <Badge variant="outline" className="text-xs px-1 py-0">{a.marque}</Badge>}
                    {a.banque && <Badge variant="outline" className="text-xs px-1 py-0 bg-blue-50 text-blue-700 border-blue-200">{a.banque}</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-semibold text-primary">{formatCurrency(a.prix)}</span>
                    <span className={`text-xs ${a.quantite > 0 ? "text-green-600" : "text-red-600"}`}>stock: {a.quantite}</span>
                  </div>
                </div>
                {inCart ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => remove(a.id)} className="h-7 w-7 rounded-full border flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-6 text-center text-sm font-bold">{qty}</span>
                    <button type="button" onClick={() => add(a.id)} className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => add(a.id)} className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0"><Plus className="h-4 w-4" /></button>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t px-4 py-3 bg-background">
          {localSel.length > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{totalItems} article(s) sélectionné(s)</span>
                <span className="font-semibold">{formatCurrency(totalPrice)}</span>
              </div>
              <Button className="w-full" onClick={() => { onConfirm(localSel); onClose(); }}>
                <CheckCircle className="h-4 w-4 mr-2" />Confirmer la sélection
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={onClose}>Fermer</Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
