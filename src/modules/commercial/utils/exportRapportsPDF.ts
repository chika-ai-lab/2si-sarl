/**
 * Utilitaires pour l'export des rapports en PDF avec style
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  RapportEvolutionCA,
  ChiffreAffaire,
  VenteParProduit,
  VenteParClient,
  VenteParBanque,
  StatistiquesGlobales,
} from "../services/rapports.service";
import { formatCurrency } from "@/lib/currency";

// Couleurs du thème
const COLORS = {
  primary: [37, 99, 235], // bleu
  secondary: [100, 116, 139], // gris
  success: [22, 163, 74], // vert
  danger: [220, 38, 38], // rouge
  warning: [234, 88, 12], // orange
  light: [241, 245, 249], // gris clair
  dark: [15, 23, 42], // gris foncé
};

/**
 * Ajoute un en-tête au document PDF
 */
function addHeader(
  doc: jsPDF,
  title: string,
  filters?: { dateDebut?: string; dateFin?: string; banque?: string }
) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Rectangle de fond pour l'en-tête
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, "F");

  // Titre principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, 18);

  // Sous-titre avec la date de génération
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Généré le ${dateStr}`, 20, 28);

  // Filtres appliqués
  if (filters) {
    let filterText = "Période: ";
    if (filters.dateDebut && filters.dateFin) {
      filterText += `${filters.dateDebut} au ${filters.dateFin}`;
    } else {
      filterText += "Toutes";
    }
    if (filters.banque) {
      filterText += ` | Banque: ${filters.banque}`;
    }
    doc.text(filterText, 20, 35);
  }

  // Ligne de séparation
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(1);
  doc.line(0, 42, pageWidth, 42);
}

/**
 * Ajoute un pied de page au document
 */
function addFooter(doc: jsPDF, pageNumber: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.secondary);
  doc.setFont("helvetica", "normal");

  // Ligne de séparation
  doc.setDrawColor(...COLORS.light);
  doc.setLineWidth(0.5);
  doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);

  // Texte du pied de page
  doc.text("2SI SARL - Rapport Commercial", 20, pageHeight - 10);
  doc.text(`Page ${pageNumber}`, pageWidth - 40, pageHeight - 10);
}

/**
 * Ajoute une section avec titre
 */
function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...COLORS.light);
  doc.rect(15, y, doc.internal.pageSize.getWidth() - 30, 10, "F");

  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, y + 7);

  return y + 15;
}

/**
 * Ajoute une carte KPI
 */
function addKPICard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  title: string,
  value: string,
  evolution?: string,
  isPositive?: boolean
) {
  // Bordure de la carte
  doc.setDrawColor(...COLORS.light);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, width, 25, 3, 3);

  // Titre
  doc.setTextColor(...COLORS.secondary);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(title, x + 5, y + 8);

  // Valeur
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + 5, y + 18);

  // Évolution (si fournie)
  if (evolution) {
    const evolutionColor = isPositive ? COLORS.success : COLORS.danger;
    doc.setTextColor(...evolutionColor);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const evolutionText = `${isPositive ? "↑" : "↓"} ${evolution}`;
    doc.text(evolutionText, x + width - 30, y + 18);
  }
}

/**
 * Exporte le rapport complet en PDF
 */
export function exportRapportCompletPDF(
  rapport: RapportEvolutionCA,
  filters: { dateDebut?: string; dateFin?: string; banque?: string }
) {
  const doc = new jsPDF();
  let yPos = 50;
  let pageNumber = 1;

  // En-tête
  addHeader(doc, "Rapport Commercial Complet", filters);

  // ============================================
  // PAGE 1: STATISTIQUES GLOBALES
  // ============================================

  yPos = addSectionTitle(doc, "Statistiques Globales", yPos);

  // KPIs - Ligne 1
  const cardWidth = 45;
  const cardSpacing = 2;

  addKPICard(
    doc,
    20,
    yPos,
    cardWidth,
    "CA Total",
    formatCurrency(rapport.statistiques.chiffreAffaireTotal),
    `${rapport.statistiques.evolutionCA.toFixed(1)}%`,
    rapport.statistiques.evolutionCA >= 0
  );

  addKPICard(
    doc,
    20 + cardWidth + cardSpacing,
    yPos,
    cardWidth,
    "Commandes",
    rapport.statistiques.nombreCommandesTotal.toString(),
    `${rapport.statistiques.evolutionCommandes.toFixed(1)}%`,
    rapport.statistiques.evolutionCommandes >= 0
  );

  addKPICard(
    doc,
    20 + (cardWidth + cardSpacing) * 2,
    yPos,
    cardWidth,
    "Panier Moyen",
    formatCurrency(rapport.statistiques.panierMoyen),
    `${rapport.statistiques.evolutionPanierMoyen.toFixed(1)}%`,
    rapport.statistiques.evolutionPanierMoyen >= 0
  );

  addKPICard(
    doc,
    20 + (cardWidth + cardSpacing) * 3,
    yPos,
    cardWidth,
    "Taux Conversion",
    `${rapport.statistiques.tauxConversion.toFixed(1)}%`
  );

  yPos += 30;

  // KPIs - Ligne 2
  addKPICard(
    doc,
    20,
    yPos,
    cardWidth * 2 + cardSpacing,
    "CA du Mois",
    formatCurrency(rapport.statistiques.chiffreAffaireMois),
    `${rapport.statistiques.nombreCommandesMois} commandes`
  );

  addKPICard(
    doc,
    20 + (cardWidth * 2 + cardSpacing) + cardSpacing,
    yPos,
    cardWidth * 2 + cardSpacing,
    "Accréditifs Actifs",
    formatCurrency(rapport.statistiques.montantAccreditifsActifs),
    `${rapport.statistiques.nombreAccreditifsActifs} accréditifs`
  );

  yPos += 35;

  // ============================================
  // ÉVOLUTION MENSUELLE
  // ============================================

  yPos = addSectionTitle(doc, "Évolution Mensuelle du CA", yPos);

  const evolutionData = rapport.evolutionMensuelle.map((item) => [
    item.periode,
    formatCurrency(item.montant),
    item.nombreCommandes.toString(),
    formatCurrency(item.montantMoyen),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Période", "Montant", "Commandes", "Panier Moyen"]],
    body: evolutionData,
    theme: "grid",
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: COLORS.light,
    },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Pied de page
  addFooter(doc, pageNumber);

  // ============================================
  // PAGE 2: TOP PRODUITS ET CLIENTS
  // ============================================

  doc.addPage();
  pageNumber++;
  yPos = 50;
  addHeader(doc, "Rapport Commercial Complet", filters);

  yPos = addSectionTitle(doc, "Top 10 Produits", yPos);

  const topProduitsData = rapport.topProduits.slice(0, 10).map((p, index) => [
    (index + 1).toString(),
    p.produitNom,
    p.quantiteVendue.toString(),
    formatCurrency(p.chiffreAffaire),
    p.nombreCommandes.toString(),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["#", "Produit", "Qté Vendue", "CA", "Commandes"]],
    body: topProduitsData,
    theme: "grid",
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 80 },
      2: { cellWidth: 25, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
      4: { cellWidth: 25, halign: "right" },
    },
    alternateRowStyles: {
      fillColor: COLORS.light,
    },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  yPos = addSectionTitle(doc, "Top 10 Clients", yPos);

  const topClientsData = rapport.topClients.slice(0, 10).map((c, index) => [
    (index + 1).toString(),
    c.clientNom,
    formatCurrency(c.chiffreAffaire),
    c.nombreCommandes.toString(),
    c.dernierAchat,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["#", "Client", "CA", "Commandes", "Dernier Achat"]],
    body: topClientsData,
    theme: "grid",
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 80 },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 25, halign: "center" },
    },
    alternateRowStyles: {
      fillColor: COLORS.light,
    },
    margin: { left: 20, right: 20 },
  });

  addFooter(doc, pageNumber);

  // ============================================
  // PAGE 3: RÉPARTITION PAR BANQUE
  // ============================================

  doc.addPage();
  pageNumber++;
  yPos = 50;
  addHeader(doc, "Rapport Commercial Complet", filters);

  yPos = addSectionTitle(doc, "Répartition par Banque Partenaire", yPos);

  const banquesData = rapport.repartitionBanques.map((b) => [
    b.banque,
    formatCurrency(b.chiffreAffaire),
    b.nombreCommandes.toString(),
    b.nombreClients.toString(),
    formatCurrency(Math.round(b.chiffreAffaire / b.nombreClients)),
  ]);

  // Ajouter une ligne de total
  const totalCA = rapport.repartitionBanques.reduce((sum, b) => sum + b.chiffreAffaire, 0);
  const totalCommandes = rapport.repartitionBanques.reduce((sum, b) => sum + b.nombreCommandes, 0);
  const totalClients = rapport.repartitionBanques.reduce((sum, b) => sum + b.nombreClients, 0);

  banquesData.push([
    "TOTAL",
    formatCurrency(totalCA),
    totalCommandes.toString(),
    totalClients.toString(),
    formatCurrency(Math.round(totalCA / totalClients)),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Banque", "CA Total", "Commandes", "Clients", "CA Moyen/Client"]],
    body: banquesData,
    theme: "grid",
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40, halign: "right" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 40, halign: "right" },
    },
    alternateRowStyles: {
      fillColor: COLORS.light,
    },
    // Mettre la dernière ligne (TOTAL) en gras
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === banquesData.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = COLORS.light;
      }
    },
    margin: { left: 20, right: 20 },
  });

  addFooter(doc, pageNumber);

  // ============================================
  // SAUVEGARDER LE PDF
  // ============================================

  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Rapport_Commercial_${dateStr}.pdf`;

  doc.save(fileName);
}

/**
 * Exporte uniquement l'évolution du CA en PDF
 */
export function exportEvolutionCAPDF(
  evolution: ChiffreAffaire[],
  type: "mensuelle" | "hebdomadaire"
) {
  const doc = new jsPDF();

  const titre =
    type === "mensuelle"
      ? "Évolution Mensuelle du Chiffre d'Affaires"
      : "Évolution Hebdomadaire du Chiffre d'Affaires";

  addHeader(doc, titre);

  const data = evolution.map((item) => [
    item.periode,
    formatCurrency(item.montant),
    item.nombreCommandes.toString(),
    formatCurrency(item.montantMoyen),
  ]);

  // Ajouter une ligne de total
  const totalMontant = evolution.reduce((sum, item) => sum + item.montant, 0);
  const totalCommandes = evolution.reduce((sum, item) => sum + item.nombreCommandes, 0);

  data.push([
    "TOTAL",
    formatCurrency(totalMontant),
    totalCommandes.toString(),
    formatCurrency(Math.round(totalMontant / totalCommandes)),
  ]);

  autoTable(doc, {
    startY: 55,
    head: [["Période", "Montant", "Commandes", "Panier Moyen"]],
    body: data,
    theme: "grid",
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: COLORS.light,
    },
    didParseCell: (tableData) => {
      if (tableData.section === "body" && tableData.row.index === data.length - 1) {
        tableData.cell.styles.fontStyle = "bold";
        tableData.cell.styles.fillColor = COLORS.light;
      }
    },
    margin: { left: 20, right: 20 },
  });

  addFooter(doc, 1);

  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Evolution_CA_${type}_${dateStr}.pdf`;

  doc.save(fileName);
}

/**
 * Exporte le top produits en PDF
 */
export function exportTopProduitsPDF(produits: VenteParProduit[]) {
  const doc = new jsPDF();

  addHeader(doc, "Top Produits par Chiffre d'Affaires");

  const data = produits.map((p, index) => [
    (index + 1).toString(),
    p.produitNom,
    p.quantiteVendue.toString(),
    formatCurrency(p.chiffreAffaire),
    p.nombreCommandes.toString(),
  ]);

  // Totaux
  const totalQte = produits.reduce((sum, p) => sum + p.quantiteVendue, 0);
  const totalCA = produits.reduce((sum, p) => sum + p.chiffreAffaire, 0);
  const totalCmd = produits.reduce((sum, p) => sum + p.nombreCommandes, 0);

  data.push(["", "TOTAL", totalQte.toString(), formatCurrency(totalCA), totalCmd.toString()]);

  autoTable(doc, {
    startY: 55,
    head: [["#", "Produit", "Qté Vendue", "CA", "Commandes"]],
    body: data,
    theme: "grid",
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 90 },
      2: { cellWidth: 25, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
      4: { cellWidth: 25, halign: "right" },
    },
    alternateRowStyles: {
      fillColor: COLORS.light,
    },
    didParseCell: (tableData) => {
      if (tableData.section === "body" && tableData.row.index === data.length - 1) {
        tableData.cell.styles.fontStyle = "bold";
        tableData.cell.styles.fillColor = COLORS.light;
      }
    },
    margin: { left: 20, right: 20 },
  });

  addFooter(doc, 1);

  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Top_Produits_${dateStr}.pdf`;

  doc.save(fileName);
}

/**
 * Exporte le top clients en PDF
 */
export function exportTopClientsPDF(clients: VenteParClient[]) {
  const doc = new jsPDF();

  addHeader(doc, "Top Clients par Chiffre d'Affaires");

  const data = clients.map((c, index) => [
    (index + 1).toString(),
    c.clientNom,
    formatCurrency(c.chiffreAffaire),
    c.nombreCommandes.toString(),
    c.dernierAchat,
  ]);

  // Totaux
  const totalCA = clients.reduce((sum, c) => sum + c.chiffreAffaire, 0);
  const totalCmd = clients.reduce((sum, c) => sum + c.nombreCommandes, 0);

  data.push(["", "TOTAL", formatCurrency(totalCA), totalCmd.toString(), ""]);

  autoTable(doc, {
    startY: 55,
    head: [["#", "Client", "CA", "Commandes", "Dernier Achat"]],
    body: data,
    theme: "grid",
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 90 },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 25, halign: "center" },
    },
    alternateRowStyles: {
      fillColor: COLORS.light,
    },
    didParseCell: (tableData) => {
      if (tableData.section === "body" && tableData.row.index === data.length - 1) {
        tableData.cell.styles.fontStyle = "bold";
        tableData.cell.styles.fillColor = COLORS.light;
      }
    },
    margin: { left: 20, right: 20 },
  });

  addFooter(doc, 1);

  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Top_Clients_${dateStr}.pdf`;

  doc.save(fileName);
}

/**
 * Exporte la répartition par banque en PDF
 */
export function exportRepartitionBanquesPDF(banques: VenteParBanque[]) {
  const doc = new jsPDF();

  addHeader(doc, "Répartition par Banque Partenaire");

  const data = banques.map((b) => [
    b.banque,
    formatCurrency(b.chiffreAffaire),
    b.nombreCommandes.toString(),
    b.nombreClients.toString(),
    formatCurrency(Math.round(b.chiffreAffaire / b.nombreClients)),
  ]);

  // Totaux
  const totalCA = banques.reduce((sum, b) => sum + b.chiffreAffaire, 0);
  const totalCmd = banques.reduce((sum, b) => sum + b.nombreCommandes, 0);
  const totalClients = banques.reduce((sum, b) => sum + b.nombreClients, 0);

  data.push([
    "TOTAL",
    formatCurrency(totalCA),
    totalCmd.toString(),
    totalClients.toString(),
    formatCurrency(Math.round(totalCA / totalClients)),
  ]);

  autoTable(doc, {
    startY: 55,
    head: [["Banque", "CA Total", "Commandes", "Clients", "CA Moyen/Client"]],
    body: data,
    theme: "grid",
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40, halign: "right" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 40, halign: "right" },
    },
    alternateRowStyles: {
      fillColor: COLORS.light,
    },
    didParseCell: (tableData) => {
      if (tableData.section === "body" && tableData.row.index === data.length - 1) {
        tableData.cell.styles.fontStyle = "bold";
        tableData.cell.styles.fillColor = COLORS.light;
      }
    },
    margin: { left: 20, right: 20 },
  });

  addFooter(doc, 1);

  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Repartition_Banques_${dateStr}.pdf`;

  doc.save(fileName);
}
