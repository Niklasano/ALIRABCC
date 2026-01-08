import { BeloteRow, BeloteAnnonce } from "@/types/belote";

export const formatTableCell = (value: any, column: number, contrat: number): string => {
  if (value === null || value === undefined) return "";

  if (column === 1) { // Contrat
    if (value === 0) return "";
    if (value === 500) return "Capot";
    if (value === 1000) return "Générale";
    return String(value);
  } else if (column === 2) { // Chute
    if (contrat === 0) return "";
    return value === 0 ? "Non" : value === 1 ? "Oui" : String(value);
  } else if (column === 4 && value === 0) { // Ecart
    return "";
  } else if ((column === 6 || column === 7) && value === "N/A") { // Belote ou Remarques
    return "";
  }

  return String(value);
};

export const createNewBeloteRow = (
  previousData: BeloteRow[],
  mene: number,
  contratE1: number,
  chuteE1: number,
  realiseE1: number,
  ecartE1: number,
  ecartTheoE1: number,
  beloteE1: BeloteAnnonce,
  remarqueE1: string,
  pointsE1: number,
  contratE2: number,
  chuteE2: number,
  realiseE2: number,
  ecartE2: number,
  ecartTheoE2: number,
  beloteE2: BeloteAnnonce,
  remarqueE2: string,
  pointsE2: number,
  theoE1: number,
  theoE2: number,
  cardColorE1: string = "",
  cardColorE2: string = ""
): BeloteRow => {
  const prevTotal = previousData.length > 0 ? previousData[previousData.length - 1].Total : 0;
  const prevTotalE2 = previousData.length > 0 ? previousData[previousData.length - 1].Total_E2 : 0;
  const prevTheoE1 = previousData.length > 0 ? (previousData[previousData.length - 1]["Equipe n°1 Théorique"] || 0) : 0;
  const prevTheoE2 = previousData.length > 0 ? (previousData[previousData.length - 1]["Equipe n°2 Théorique"] || 0) : 0;

  return {
    Mène: mene,
    Contrat: contratE1,
    Chute: chuteE1,
    Réalisé: realiseE1,
    Ecart: ecartE1,
    "Ecarts Théorique": prevTheoE1 + ecartTheoE1,
    Belote: beloteE1,
    Remarques: remarqueE1,
    Points: pointsE1,
    Contrat_E2: contratE2,
    Chute_E2: chuteE2,
    Réalisé_E2: realiseE2,
    Ecart_E2: ecartE2,
    "Ecarts Théorique_E2": prevTheoE2 + ecartTheoE2,
    Belote_E2: beloteE2,
    Remarques_E2: remarqueE2,
    Points_E2: pointsE2,
    "Belote Equipe 1": beloteE1,
    "Belote Equipe 2": beloteE2,
    "Equipe n°1 Théorique": prevTheoE1 + ecartTheoE1,
    "Equipe n°2 Théorique": prevTheoE2 + ecartTheoE2,
    Total: prevTotal + pointsE1,
    Total_E2: prevTotalE2 + pointsE2,
    TheoE1: theoE1,
    TheoE2: theoE2,
    CardColor: cardColorE1,
    CardColor_E2: cardColorE2
  };
};

export const getNextDealer = (currentDealer: number): number => {
  return (currentDealer + 1) % 4;
};

export const getPreviousDealer = (currentDealer: number): number => {
  return (currentDealer - 1 + 4) % 4;
};

export const getCutterIndex = (dealerIndex: number): number => {
  return (dealerIndex + 3) % 4;
};

export const getOpenerIndex = (dealerIndex: number): number => {
  return (dealerIndex + 1) % 4;
};
