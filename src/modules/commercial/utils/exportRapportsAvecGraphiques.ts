/**
 * Export PDF avec capture des graphiques et du style visuel
 * Design simple et épuré
 */

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/currency";
import type {
  RapportEvolutionCA,
  StatistiquesGlobales,
} from "../services/rapports.service";

// Marges et espacements
const MARGIN = 20;
const SPACING = 12;

// Couleurs du thème
const COLORS = {
  primary: [37, 99, 235] as const,
  secondary: [100, 116, 139] as const,
  success: [22, 163, 74] as const,
  danger: [220, 38, 38] as const,
  light: [241, 245, 249] as const,
  dark: [15, 23, 42] as const,
  border: [226, 232, 240] as const,
};

/**
 * Ajoute un en-tête simple et propre
 */
function addHeader(
  doc: jsPDF,
  title: string,
  filters?: { dateDebut?: string; dateFin?: string; banque?: string }
) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Fond bleu
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Nom entreprise (gauche)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("2SI SARL", MARGIN, 11);

  // Titre (centré)
  doc.setFontSize(15);
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, 19);

  // Date (droite)
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString("fr-FR");
  const timeStr = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateText = `${dateStr} - ${timeStr}`;
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, pageWidth - dateWidth - MARGIN, 11);

  // Filtres
  if (filters?.dateDebut && filters?.dateFin) {
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 28, pageWidth, 9, "F");

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);

    const debut = new Date(filters.dateDebut).toLocaleDateString("fr-FR");
    const fin = new Date(filters.dateFin).toLocaleDateString("fr-FR");
    const filterText = `Période: ${debut} au ${fin}${
      filters.banque ? ` | Banque: ${filters.banque}` : ""
    }`;
    doc.text(filterText, MARGIN, 34);
  }
}

/**
 * Ajoute un pied de page simple
 */
function addFooter(doc: jsPDF, pageNumber: number, totalPages?: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Ligne de séparation
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, pageHeight - 15, pageWidth - MARGIN, pageHeight - 15);

  // Texte
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");

  // Gauche
  doc.text("2SI SARL - Rapport Commercial", MARGIN, pageHeight - 8);

  // Droite
  const pageText = totalPages
    ? `Page ${pageNumber}/${totalPages}`
    : `Page ${pageNumber}`;
  const pageTextWidth = doc.getTextWidth(pageText);
  doc.text(pageText, pageWidth - pageTextWidth - MARGIN, pageHeight - 8);
}

/**
 * Ajoute un titre de section
 */
function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Fond gris clair
  doc.setFillColor(248, 250, 252);
  doc.rect(MARGIN, y, pageWidth - MARGIN * 2, 10, "F");

  // Barre bleue à gauche
  doc.setFillColor(37, 99, 235);
  doc.rect(MARGIN, y, 3, 10, "F");

  // Titre
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, MARGIN + 8, y + 7);

  return y + 16;
}

/**
 * Ajoute une carte KPI simple
 */
function addKPICard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  title: string,
  value: string,
  subtitle?: string,
  evolution?: string,
  isPositive?: boolean
) {
  const cardHeight = 30;

  // Fond blanc
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, width, cardHeight, 2, 2, "F");

  // Bordure
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, width, cardHeight, 2, 2);

  // Barre gauche
  doc.setFillColor(37, 99, 235);
  doc.rect(x + 2, y + 2, 2, cardHeight - 4, "F");

  // Titre
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), x + 6, y + 7);

  // Valeur - taille réduite pour éviter le débordement
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");

  // Ajuster la taille si le texte est trop long
  const valueWidth = doc.getTextWidth(value);
  if (valueWidth > width - 12) {
    doc.setFontSize(9);
  }

  doc.text(value, x + 6, y + 16);

  // Sous-titre ou évolution
  if (subtitle) {
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, x + 6, y + 25);
  } else if (evolution) {
    const color = isPositive ? [22, 163, 74] : [220, 38, 38];
    const bgColor = isPositive ? [220, 252, 231] : [254, 226, 226];

    const evolutionText = `${isPositive ? "↑" : "↓"} ${evolution}`;

    // Calculer la largeur du badge
    doc.setFontSize(6.5);
    const badgeWidth = doc.getTextWidth(evolutionText) + 4;
    const badgeX = x + width - badgeWidth - 3;

    // Badge
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.roundedRect(badgeX, y + 21, badgeWidth, 6, 1.5, 1.5, "F");

    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont("helvetica", "bold");
    doc.text(evolutionText, badgeX + 2, y + 25.5);
  }
}

/**
 * Capture un élément HTML
 */
async function captureElement(elementId: string): Promise<string | null> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element ${elementId} not found`);
    return null;
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const rect = element.getBoundingClientRect();

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: Math.ceil(rect.width),
      height: Math.ceil(rect.height),
      windowWidth: Math.ceil(rect.width),
      windowHeight: Math.ceil(rect.height),
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    });

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error(`Error capturing ${elementId}:`, error);
    return null;
  }
}

/**
 * Exporte le rapport complet
 */
export async function exportRapportCompletAvecGraphiquesPDF(
  rapport: RapportEvolutionCA,
  stats: StatistiquesGlobales,
  filters: { dateDebut?: string; dateFin?: string; banque?: string }
) {
  const doc = new jsPDF();
  const totalPages = 4;
  let yPos = filters?.dateDebut && filters?.dateFin ? 45 : 36;
  let pageNumber = 1;

  // En-tête
  addHeader(doc, "Rapport Commercial Complet", filters);

  // ============================================
  // PAGE 1: KPIS
  // ============================================

  yPos = addSectionTitle(doc, "Indicateurs Clés de Performance", yPos);

  // Ligne 1 - 4 cartes
  const cardWidth = 42;
  const cardSpacing = 3;

  addKPICard(
    doc,
    MARGIN,
    yPos,
    cardWidth,
    "CA Total",
    formatCurrency(stats.chiffreAffaireTotal),
    undefined,
    `${Math.abs(stats.evolutionCA).toFixed(1)}%`,
    stats.evolutionCA >= 0
  );

  addKPICard(
    doc,
    MARGIN + cardWidth + cardSpacing,
    yPos,
    cardWidth,
    "Commandes",
    stats.nombreCommandesTotal?.toString() || "0",
    undefined,
    `${Math.abs(stats.evolutionCommandes || 0).toFixed(1)}%`,
    (stats.evolutionCommandes || 0) >= 0
  );

  addKPICard(
    doc,
    MARGIN + (cardWidth + cardSpacing) * 2,
    yPos,
    cardWidth,
    "Panier Moyen",
    formatCurrency(stats.panierMoyen),
    undefined,
    `${Math.abs(stats.evolutionPanierMoyen || 0).toFixed(1)}%`,
    (stats.evolutionPanierMoyen || 0) >= 0
  );

  addKPICard(
    doc,
    MARGIN + (cardWidth + cardSpacing) * 3,
    yPos,
    cardWidth,
    "Taux Conversion",
    `${(stats.tauxConversion || 0).toFixed(1)}%`
  );

  yPos += 34;

  // Ligne 2 - 2 cartes larges
  const wideCardWidth = cardWidth * 2 + cardSpacing;

  addKPICard(
    doc,
    MARGIN,
    yPos,
    wideCardWidth,
    "Accréditifs Actifs",
    stats.nombreAccreditifsActifs?.toString() || "0",
    `Montant: ${formatCurrency(stats.montantAccreditifsActifs)}`
  );

  addKPICard(
    doc,
    MARGIN + wideCardWidth + cardSpacing,
    yPos,
    wideCardWidth,
    "Taux de Conversion",
    `${(stats.tauxConversion || 0).toFixed(1)}%`,
    "Visites converties en commandes"
  );

  addFooter(doc, pageNumber, totalPages);

  // ============================================
  // PAGE 2: GRAPHIQUES
  // ============================================

  doc.addPage();
  pageNumber++;
  yPos = filters?.dateDebut && filters?.dateFin ? 45 : 36;
  addHeader(doc, "Rapport Commercial Complet", filters);

  // Évolution CA
  yPos = addSectionTitle(doc, "Évolution du Chiffre d'Affaires", yPos);

  const evolutionCAImage = await captureElement("chart-evolution-ca");
  if (evolutionCAImage) {
    doc.addImage(evolutionCAImage, "PNG", MARGIN, yPos, 170, 75);
    yPos += 75 + SPACING + 4;
  }

  // Analyses détaillées
  yPos = addSectionTitle(doc, "Analyses Détaillées", yPos);

  const repartitionBanqueImage = await captureElement(
    "chart-repartition-banque"
  );
  if (repartitionBanqueImage) {
    doc.addImage(repartitionBanqueImage, "PNG", MARGIN, yPos, 81, 65);
  }

  const panierMoyenImage = await captureElement("chart-panier-moyen");
  if (panierMoyenImage) {
    doc.addImage(panierMoyenImage, "PNG", MARGIN + 86, yPos, 81, 65);
  }

  addFooter(doc, pageNumber, totalPages);

  // ============================================
  // PAGE 3: TABLEAUX
  // ============================================

  doc.addPage();
  pageNumber++;
  yPos = filters?.dateDebut && filters?.dateFin ? 45 : 36;
  addHeader(doc, "Rapport Commercial Complet", filters);

  // Top 5 Produits
  yPos = addSectionTitle(doc, "Top 5 Produits", yPos);

  const topProduitsData = rapport.topProduits
    .slice(0, 5)
    .map((p, index) => [
      (index + 1).toString(),
      p.produitNom,
      p.quantiteVendue.toString(),
      formatCurrency(p.chiffreAffaire),
    ]);

  autoTable(doc, {
    startY: yPos,
    head: [["#", "Produit", "Qté Vendue", "CA"]],
    body: topProduitsData,
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 100 },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPos = (doc as any).lastAutoTable.finalY + SPACING + 4;

  // Top 5 Clients
  yPos = addSectionTitle(doc, "Top 5 Clients", yPos);

  const topClientsData = rapport.topClients
    .slice(0, 5)
    .map((c, index) => [
      (index + 1).toString(),
      c.clientNom,
      formatCurrency(c.chiffreAffaire),
      c.nombreCommandes.toString(),
    ]);

  autoTable(doc, {
    startY: yPos,
    head: [["#", "Client", "CA", "Commandes"]],
    body: topClientsData,
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 115 },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 25, halign: "right" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  addFooter(doc, pageNumber, totalPages);

  // ============================================
  // PAGE 4: BANQUES
  // ============================================

  doc.addPage();
  pageNumber++;
  yPos = filters?.dateDebut && filters?.dateFin ? 45 : 36;
  addHeader(doc, "Rapport Commercial Complet", filters);

  yPos = addSectionTitle(doc, "Détails par Banque Partenaire", yPos);

  const totalCA = rapport.repartitionBanques.reduce(
    (sum, b) => sum + b.chiffreAffaire,
    0
  );
  const banquesData = rapport.repartitionBanques.map((b) => [
    b.banque,
    formatCurrency(b.chiffreAffaire),
    b.nombreCommandes.toString(),
    `${((b.chiffreAffaire / totalCA) * 100).toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Banque", "CA", "Commandes", "Part de Marché"]],
    body: banquesData,
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 50, halign: "right" },
      2: { cellWidth: 35, halign: "center" },
      3: { cellWidth: 40, halign: "right" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  addFooter(doc, pageNumber, totalPages);

  // Sauvegarder
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Rapport_Commercial_Complet_${dateStr}.pdf`;
  doc.save(fileName);
}

/**
 * Exporte uniquement l'évolution CA avec graphique
 */
export async function exportEvolutionCAAvecGraphiquePDF() {
  const doc = new jsPDF();

  addHeader(doc, "Évolution du Chiffre d'Affaires");

  const chartImage = await captureElement("chart-evolution-ca");
  if (chartImage) {
    doc.addImage(chartImage, "PNG", MARGIN, 45, 170, 90);
  }

  addFooter(doc, 1);

  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`Evolution_CA_${dateStr}.pdf`);
}

/**
 * Exporte top produits avec style
 */
export async function exportTopProduitsAvecStylePDF() {
  const doc = new jsPDF();

  addHeader(doc, "Top Produits");

  const tableImage = await captureElement("table-top-produits");
  if (tableImage) {
    doc.addImage(tableImage, "PNG", MARGIN, 45, 170, 60);
  }

  addFooter(doc, 1);

  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`Top_Produits_${dateStr}.pdf`);
}

/**
 * Exporte top clients avec style
 */
export async function exportTopClientsAvecStylePDF() {
  const doc = new jsPDF();

  addHeader(doc, "Top Clients");

  const tableImage = await captureElement("table-top-clients");
  if (tableImage) {
    doc.addImage(tableImage, "PNG", MARGIN, 45, 170, 60);
  }

  addFooter(doc, 1);

  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`Top_Clients_${dateStr}.pdf`);
}

/**
 * Exporte tous les graphiques
 */
export async function exportTousGraphiquesPDF() {
  const doc = new jsPDF();
  let pageNumber = 1;

  // Page 1: Évolution CA
  addHeader(doc, "Graphiques - Rapport Commercial");

  let yPos = addSectionTitle(doc, "Évolution du Chiffre d'Affaires", 45);

  const evolutionCAImage = await captureElement("chart-evolution-ca");
  if (evolutionCAImage) {
    doc.addImage(evolutionCAImage, "PNG", MARGIN, yPos, 170, 75);
  }

  addFooter(doc, pageNumber, 2);

  // Page 2: Autres graphiques
  doc.addPage();
  pageNumber++;
  addHeader(doc, "Graphiques - Rapport Commercial");

  yPos = addSectionTitle(doc, "Analyses Détaillées", 45);

  const repartitionBanqueImage = await captureElement(
    "chart-repartition-banque"
  );
  if (repartitionBanqueImage) {
    doc.addImage(repartitionBanqueImage, "PNG", MARGIN, yPos, 81, 65);
  }

  const panierMoyenImage = await captureElement("chart-panier-moyen");
  if (panierMoyenImage) {
    doc.addImage(panierMoyenImage, "PNG", MARGIN + 86, yPos, 81, 65);
  }

  addFooter(doc, pageNumber, 2);

  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`Graphiques_Complets_${dateStr}.pdf`);
}
