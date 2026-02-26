/**
 * Utilitaires pour l'export des rapports en Excel
 */

import * as XLSX from "xlsx";
import type {
  RapportEvolutionCA,
  ChiffreAffaire,
  VenteParProduit,
  VenteParClient,
  VenteParBanque,
  StatistiquesGlobales,
} from "../services/rapports.service";
import { formatCurrency } from "@/lib/currency";

/**
 * Formate une date pour l'export
 */
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR");
}

/**
 * Exporte le rapport complet d'évolution du CA en Excel
 */
export function exportRapportCompletExcel(
  rapport: RapportEvolutionCA,
  filters: { dateDebut?: string; dateFin?: string; banque?: string }
) {
  // Créer un nouveau workbook
  const wb = XLSX.utils.book_new();

  // ============================================
  // FEUILLE 1: STATISTIQUES GLOBALES
  // ============================================
  const statsData = [
    ["STATISTIQUES GLOBALES"],
    [],
    ["Indicateur", "Valeur", "Évolution"],
    [
      "Chiffre d'Affaires Total",
      formatCurrency(rapport.statistiques.chiffreAffaireTotal),
      `${rapport.statistiques.evolutionCA.toFixed(2)}%`,
    ],
    [
      "Chiffre d'Affaires du Mois",
      formatCurrency(rapport.statistiques.chiffreAffaireMois),
      "",
    ],
    [
      "Nombre de Commandes Total",
      rapport.statistiques.nombreCommandesTotal,
      `${rapport.statistiques.evolutionCommandes.toFixed(2)}%`,
    ],
    [
      "Nombre de Commandes du Mois",
      rapport.statistiques.nombreCommandesMois,
      "",
    ],
    [
      "Panier Moyen",
      formatCurrency(rapport.statistiques.panierMoyen),
      `${rapport.statistiques.evolutionPanierMoyen.toFixed(2)}%`,
    ],
    [
      "Taux de Conversion",
      `${rapport.statistiques.tauxConversion.toFixed(2)}%`,
      "",
    ],
    [
      "Nombre de Clients Actifs",
      rapport.statistiques.nombreClientsActifs,
      "",
    ],
    [
      "Accréditifs Actifs",
      rapport.statistiques.nombreAccreditifsActifs,
      "",
    ],
    [
      "Montant Accréditifs Actifs",
      formatCurrency(rapport.statistiques.montantAccreditifsActifs),
      "",
    ],
    [],
    ["Période d'analyse"],
    ["Date début", filters.dateDebut || "Non spécifiée"],
    ["Date fin", filters.dateFin || "Non spécifiée"],
    ["Banque", filters.banque || "Toutes"],
    [],
    ["Rapport généré le", new Date().toLocaleString("fr-FR")],
  ];

  const wsStats = XLSX.utils.aoa_to_sheet(statsData);

  // Définir les largeurs de colonnes
  wsStats["!cols"] = [
    { wch: 30 }, // Colonne A
    { wch: 20 }, // Colonne B
    { wch: 15 }, // Colonne C
  ];

  XLSX.utils.book_append_sheet(wb, wsStats, "Statistiques");

  // ============================================
  // FEUILLE 2: ÉVOLUTION MENSUELLE
  // ============================================
  const evolutionMensuelleData = [
    ["ÉVOLUTION MENSUELLE DU CHIFFRE D'AFFAIRES"],
    [],
    ["Période", "Montant (FCFA)", "Nombre de Commandes", "Montant Moyen (FCFA)"],
    ...rapport.evolutionMensuelle.map((item) => [
      item.periode,
      item.montant,
      item.nombreCommandes,
      item.montantMoyen,
    ]),
    [],
    ["TOTAL",
      rapport.evolutionMensuelle.reduce((sum, item) => sum + item.montant, 0),
      rapport.evolutionMensuelle.reduce((sum, item) => sum + item.nombreCommandes, 0),
      "",
    ],
  ];

  const wsEvolutionMens = XLSX.utils.aoa_to_sheet(evolutionMensuelleData);
  wsEvolutionMens["!cols"] = [
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, wsEvolutionMens, "Évolution Mensuelle");

  // ============================================
  // FEUILLE 3: ÉVOLUTION HEBDOMADAIRE
  // ============================================
  const evolutionHebdoData = [
    ["ÉVOLUTION HEBDOMADAIRE DU CHIFFRE D'AFFAIRES"],
    [],
    ["Semaine", "Montant (FCFA)", "Nombre de Commandes", "Montant Moyen (FCFA)"],
    ...rapport.evolutionHebdomadaire.map((item) => [
      item.periode,
      item.montant,
      item.nombreCommandes,
      item.montantMoyen,
    ]),
    [],
    ["TOTAL",
      rapport.evolutionHebdomadaire.reduce((sum, item) => sum + item.montant, 0),
      rapport.evolutionHebdomadaire.reduce((sum, item) => sum + item.nombreCommandes, 0),
      "",
    ],
  ];

  const wsEvolutionHebdo = XLSX.utils.aoa_to_sheet(evolutionHebdoData);
  wsEvolutionHebdo["!cols"] = [
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, wsEvolutionHebdo, "Évolution Hebdomadaire");

  // ============================================
  // FEUILLE 4: TOP PRODUITS
  // ============================================
  const topProduitsData = [
    ["TOP PRODUITS PAR CHIFFRE D'AFFAIRES"],
    [],
    ["Rang", "Produit", "Quantité Vendue", "Chiffre d'Affaires (FCFA)", "Nombre de Commandes"],
    ...rapport.topProduits.map((produit, index) => [
      index + 1,
      produit.produitNom,
      produit.quantiteVendue,
      produit.chiffreAffaire,
      produit.nombreCommandes,
    ]),
    [],
    ["TOTAL",
      "",
      rapport.topProduits.reduce((sum, p) => sum + p.quantiteVendue, 0),
      rapport.topProduits.reduce((sum, p) => sum + p.chiffreAffaire, 0),
      rapport.topProduits.reduce((sum, p) => sum + p.nombreCommandes, 0),
    ],
  ];

  const wsTopProduits = XLSX.utils.aoa_to_sheet(topProduitsData);
  wsTopProduits["!cols"] = [
    { wch: 8 },
    { wch: 40 },
    { wch: 18 },
    { wch: 25 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, wsTopProduits, "Top Produits");

  // ============================================
  // FEUILLE 5: TOP CLIENTS
  // ============================================
  const topClientsData = [
    ["TOP CLIENTS PAR CHIFFRE D'AFFAIRES"],
    [],
    ["Rang", "Client", "Chiffre d'Affaires (FCFA)", "Nombre de Commandes", "Dernier Achat"],
    ...rapport.topClients.map((client, index) => [
      index + 1,
      client.clientNom,
      client.chiffreAffaire,
      client.nombreCommandes,
      client.dernierAchat,
    ]),
    [],
    ["TOTAL",
      "",
      rapport.topClients.reduce((sum, c) => sum + c.chiffreAffaire, 0),
      rapport.topClients.reduce((sum, c) => sum + c.nombreCommandes, 0),
      "",
    ],
  ];

  const wsTopClients = XLSX.utils.aoa_to_sheet(topClientsData);
  wsTopClients["!cols"] = [
    { wch: 8 },
    { wch: 40 },
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, wsTopClients, "Top Clients");

  // ============================================
  // FEUILLE 6: RÉPARTITION PAR BANQUE
  // ============================================
  const repartitionBanquesData = [
    ["RÉPARTITION PAR BANQUE PARTENAIRE"],
    [],
    ["Banque", "Chiffre d'Affaires (FCFA)", "Nombre de Commandes", "Nombre de Clients", "CA Moyen par Client (FCFA)"],
    ...rapport.repartitionBanques.map((banque) => [
      banque.banque,
      banque.chiffreAffaire,
      banque.nombreCommandes,
      banque.nombreClients,
      Math.round(banque.chiffreAffaire / banque.nombreClients),
    ]),
    [],
    ["TOTAL",
      rapport.repartitionBanques.reduce((sum, b) => sum + b.chiffreAffaire, 0),
      rapport.repartitionBanques.reduce((sum, b) => sum + b.nombreCommandes, 0),
      rapport.repartitionBanques.reduce((sum, b) => sum + b.nombreClients, 0),
      "",
    ],
  ];

  const wsRepartitionBanques = XLSX.utils.aoa_to_sheet(repartitionBanquesData);
  wsRepartitionBanques["!cols"] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 20 },
    { wch: 18 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(wb, wsRepartitionBanques, "Répartition Banques");

  // ============================================
  // GÉNÉRER LE FICHIER
  // ============================================
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Rapport_Commercial_${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * Exporte uniquement l'évolution du CA
 */
export function exportEvolutionCAExcel(
  evolution: ChiffreAffaire[],
  type: "mensuelle" | "hebdomadaire"
) {
  const wb = XLSX.utils.book_new();

  const titre = type === "mensuelle"
    ? "ÉVOLUTION MENSUELLE DU CHIFFRE D'AFFAIRES"
    : "ÉVOLUTION HEBDOMADAIRE DU CHIFFRE D'AFFAIRES";

  const data = [
    [titre],
    [],
    ["Période", "Montant (FCFA)", "Nombre de Commandes", "Montant Moyen (FCFA)"],
    ...evolution.map((item) => [
      item.periode,
      item.montant,
      item.nombreCommandes,
      item.montantMoyen,
    ]),
    [],
    ["TOTAL",
      evolution.reduce((sum, item) => sum + item.montant, 0),
      evolution.reduce((sum, item) => sum + item.nombreCommandes, 0),
      "",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(wb, ws, "Évolution CA");

  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Evolution_CA_${type}_${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * Exporte le top produits
 */
export function exportTopProduitsExcel(produits: VenteParProduit[]) {
  const wb = XLSX.utils.book_new();

  const data = [
    ["TOP PRODUITS PAR CHIFFRE D'AFFAIRES"],
    [],
    ["Rang", "Produit", "Quantité Vendue", "Chiffre d'Affaires (FCFA)", "Nombre de Commandes"],
    ...produits.map((produit, index) => [
      index + 1,
      produit.produitNom,
      produit.quantiteVendue,
      produit.chiffreAffaire,
      produit.nombreCommandes,
    ]),
    [],
    ["TOTAL",
      "",
      produits.reduce((sum, p) => sum + p.quantiteVendue, 0),
      produits.reduce((sum, p) => sum + p.chiffreAffaire, 0),
      produits.reduce((sum, p) => sum + p.nombreCommandes, 0),
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 8 }, { wch: 40 }, { wch: 18 }, { wch: 25 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(wb, ws, "Top Produits");

  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Top_Produits_${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * Exporte le top clients
 */
export function exportTopClientsExcel(clients: VenteParClient[]) {
  const wb = XLSX.utils.book_new();

  const data = [
    ["TOP CLIENTS PAR CHIFFRE D'AFFAIRES"],
    [],
    ["Rang", "Client", "Chiffre d'Affaires (FCFA)", "Nombre de Commandes", "Dernier Achat"],
    ...clients.map((client, index) => [
      index + 1,
      client.clientNom,
      client.chiffreAffaire,
      client.nombreCommandes,
      client.dernierAchat,
    ]),
    [],
    ["TOTAL",
      "",
      clients.reduce((sum, c) => sum + c.chiffreAffaire, 0),
      clients.reduce((sum, c) => sum + c.nombreCommandes, 0),
      "",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 8 }, { wch: 40 }, { wch: 25 }, { wch: 20 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, ws, "Top Clients");

  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Top_Clients_${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * Exporte la répartition par banque
 */
export function exportRepartitionBanquesExcel(banques: VenteParBanque[]) {
  const wb = XLSX.utils.book_new();

  const data = [
    ["RÉPARTITION PAR BANQUE PARTENAIRE"],
    [],
    ["Banque", "Chiffre d'Affaires (FCFA)", "Nombre de Commandes", "Nombre de Clients", "CA Moyen par Client (FCFA)"],
    ...banques.map((banque) => [
      banque.banque,
      banque.chiffreAffaire,
      banque.nombreCommandes,
      banque.nombreClients,
      Math.round(banque.chiffreAffaire / banque.nombreClients),
    ]),
    [],
    ["TOTAL",
      banques.reduce((sum, b) => sum + b.chiffreAffaire, 0),
      banques.reduce((sum, b) => sum + b.nombreCommandes, 0),
      banques.reduce((sum, b) => sum + b.nombreClients, 0),
      "",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 18 }, { wch: 25 }];

  XLSX.utils.book_append_sheet(wb, ws, "Répartition Banques");

  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Repartition_Banques_${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
