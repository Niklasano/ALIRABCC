import { useState } from 'react';
import { BeloteRow, DisplayRow, ExtendedRemarque, AlertType } from '@/types/belote';
import {
  calculerEcart,
  calculerEcartTheorique,
  calculerPoints,
  calculerPointsAdverse,
  calculerPointsTheoriques,
  formatTableCell,
  createNewBeloteRow,
  getNextDealer,
  getPreviousDealer
} from '@/utils/beloteUtils';

export const useGameActions = () => {
  const [epicierAlert, setEpicierAlert] = useState<{
    show: boolean;
    teamName: string;
    ecartTheo: number;
  } | null>(null);

  const [vousEtesNulsAlert, setVousEtesNulsAlert] = useState<{
    show: boolean;
  } | null>(null);

  const [laChatteAlert, setLaChatteAlert] = useState<{
    show: boolean;
  } | null>(null);

  /**
   * Vérifie si une alerte épicier doit être affichée
   * Signature correspondant à BeloteApp.txt
   * 
   * Retourne true si une alerte a été affichée (pour bloquer les autres alertes)
   */
  const checkEpicierCondition = (
    ecartTheoE1: number,
    ecartTheoE2: number,
    prevEcartTheoE1: number,
    prevEcartTheoE2: number,
    contratE1: string,
    realiseE1: string,
    contratE2: string,
    realiseE2: string,
    team1Name: string,
    team2Name: string
  ): boolean => {
    const contratE1Val = parseInt(contratE1) || 0;
    const contratE2Val = parseInt(contratE2) || 0;

    // Calcul de l'écart de la mène
    const ecartMeneE1 = ecartTheoE1 - prevEcartTheoE1;
    const ecartMeneE2 = ecartTheoE2 - prevEcartTheoE2;

    // Ne pas afficher si Capot/Générale annoncé ou si réalisé est Capot/Générale
    // (car c'est "Vous êtes nuls" ou "La Chatte" qui s'applique)
    if (realiseE1 === "Capot" || realiseE1 === "Générale") return false;
    if (realiseE2 === "Capot" || realiseE2 === "Générale") return false;

    // Vérifier l'équipe 1
    if (contratE1Val > 0 && contratE1Val < 500 && ecartMeneE1 >= 30) {
      setEpicierAlert({
        show: true,
        teamName: team1Name,
        ecartTheo: ecartMeneE1
      });
      return true;
    }

    // Vérifier l'équipe 2
    if (contratE2Val > 0 && contratE2Val < 500 && ecartMeneE2 >= 30) {
      setEpicierAlert({
        show: true,
        teamName: team2Name,
        ecartTheo: ecartMeneE2
      });
      return true;
    }

    return false;
  };

  /**
   * Vérifie si une alerte "Vous êtes nuls" doit être affichée
   * Condition: Contrat non Capot/Générale mais réalise un Capot (non annoncé)
   */
  const checkVousEtesNulsCondition = (
    realiseE1Final: number,
    contratE1Val: number,
    realiseE2Final: number,
    contratE2Val: number,
    team1Name: string,
    team2Name: string,
    realiseE1: string,
    realiseE2: string
  ): boolean => {
    // Équipe 1 fait un Capot sans l'avoir annoncé
    if (realiseE1Final === 160 && contratE1Val > 0 && contratE1Val < 500 && realiseE1 === "Capot") {
      setVousEtesNulsAlert({ show: true });
      return true;
    }

    // Équipe 2 fait un Capot sans l'avoir annoncé
    if (realiseE2Final === 160 && contratE2Val > 0 && contratE2Val < 500 && realiseE2 === "Capot") {
      setVousEtesNulsAlert({ show: true });
      return true;
    }

    return false;
  };

  /**
   * Vérifie si une alerte "La Chatte" doit être affichée
   * Condition: Contrat non Générale mais réalise une Générale (non annoncée)
   */
  const checkLaChatteCondition = (
    contratE1Val: number,
    realiseE1Final: number,
    contratE2Val: number,
    realiseE2Final: number,
    team1Name: string,
    team2Name: string
  ): boolean => {
    // Équipe 1 fait une Générale sans l'avoir annoncée
    // Note: Pour une Générale non annoncée, le réalisé doit être 160 ET le contrat < 1000
    // Mais ici on vérifie juste les conditions de base
    if (realiseE1Final === 160 && contratE1Val > 0 && contratE1Val < 1000) {
      // On ne peut pas vraiment savoir si c'est une Générale ici car on n'a pas realiseLabel
      // Cette vérification sera faite dans BeloteApp
    }

    // Note: La vraie logique "La Chatte" = Générale non annoncée sera gérée dans BeloteApp
    // car on a besoin de savoir si c'est explicitement une Générale (realiseE1 === "Générale")
    return false;
  };

  /**
   * Détermine l'alerte à afficher dans la colonne Alerte du tableau
   * 
   * Règles:
   * - Contrat chuté → aucune alerte
   * - Capot/Générale annoncé et réussi → aucune alerte
   * - Capot non annoncé → "Vous êtes nuls"
   * - Générale non annoncée → "La Chatte"
   * - Réussi >= 50 → "Commerce de Gros"
   * - Réussi >= 40 → "Épicerie Fine"
   * - Réussi >= 30 → "Épicerie"
   */
  const getAlertForRow = (
    ecart: number,
    contrat: number,
    chute: number,
    realiseLabel?: string
  ): AlertType => {
    // Si contrat chuté → aucune alerte
    if (chute === 1) return null;

    // Si pas de contrat → aucune alerte
    if (contrat === 0) return null;

    // Si Capot/Générale annoncé et réussi → aucune alerte
    if (contrat >= 500) return null;

    // Générale non annoncée → "La Chatte"
    if (realiseLabel === "Générale") return "La Chatte";

    // Capot non annoncé → "Vous êtes nuls"
    if (realiseLabel === "Capot") return "Vous êtes nuls";

    // Alertes épicerie basées sur l'écart
    if (ecart >= 50) return "Commerce de Gros";
    if (ecart >= 40) return "Épicerie Fine";
    if (ecart >= 30) return "Épicerie";

    return null;
  };

  /**
   * Détermine la remarque à stocker dans la base de données
   */
  const getRemarqueForRow = (
    remarqueInput: string,
    contrat: number,
    realiseLabel?: string
  ): string => {
    // Générale non annoncée
    if (contrat > 0 && contrat < 1000 && realiseLabel === "Générale") {
      return "Générale non annoncée";
    }

    // Capot non annoncé
    if (contrat > 0 && contrat < 500 && realiseLabel === "Capot") {
      return "Capot non annoncé";
    }

    return remarqueInput;
  };

  /**
   * Met à jour les tableaux d'affichage
   */
  const updateDisplayTables = (
    newData: BeloteRow[],
    setTeam1Rows: (rows: DisplayRow[]) => void,
    setTeam2Rows: (rows: DisplayRow[]) => void,
    setTeam1Score: (score: number) => void,
    setTeam2Score: (score: number) => void,
    setTeam1Winner: (winner: boolean) => void,
    setTeam2Winner: (winner: boolean) => void,
    victoryPoints: string
  ) => {
    const team1Rows: DisplayRow[] = [];
    const team2Rows: DisplayRow[] = [];

    let totalE1 = 0;
    let totalE2 = 0;
    let prevEcartTheoE1 = 0;
    let prevEcartTheoE2 = 0;

    newData.forEach((row, index) => {
      totalE1 = row.Total;
      totalE2 = row.Total_E2;

      const currentEcartTheoE1 = row["Ecarts Théorique"];
      const currentEcartTheoE2 = row["Ecarts Théorique_E2"];
      
      const ecartMeneE1 = currentEcartTheoE1 - prevEcartTheoE1;
      const ecartMeneE2 = currentEcartTheoE2 - prevEcartTheoE2;

      // Déterminer les alertes basées sur l'écart de la mène
      const alertTeam1 = getAlertForRow(
        row.Ecart,
        row.Contrat,
        row.Chute,
        row.CardColor // Utilise CardColor pour stocker realiseLabel temporairement
      );

      const alertTeam2 = getAlertForRow(
        row.Ecart_E2,
        row.Contrat_E2,
        row.Chute_E2,
        row.CardColor_E2
      );

      team1Rows.push({
        Mène: String(row.Mène),
        Contrat: formatTableCell(row.Contrat, 1, row.Contrat),
        SuitColor: row.CardColor,
        Chute: formatTableCell(row.Chute, 2, row.Contrat),
        Réalisé: formatTableCell(row.Réalisé, 3, row.Contrat),
        Ecart: formatTableCell(row.Ecart, 4, row.Contrat),
        "Ecarts Théo": formatTableCell(row["Ecarts Théorique"], 5, row.Contrat),
        Belote: formatTableCell(row["Belote Equipe 1"], 6, row.Contrat),
        Remarques: formatTableCell(
          row.Remarques === "Vous êtes nuls" ? "Capot non annoncé" : 
          row.Remarques === "La Chatte" ? "Générale non annoncée" : 
          row.Remarques, 
          7, 
          row.Contrat
        ),
        Points: formatTableCell(row.Points, 8, row.Contrat),
        Alerte: alertTeam1,
        Total: {
          text: String(totalE1),
          backgroundColor: ""
        }
      });

      team2Rows.push({
        Mène: String(row.Mène),
        Contrat: formatTableCell(row.Contrat_E2, 1, row.Contrat_E2),
        SuitColor: row.CardColor_E2,
        Chute: formatTableCell(row.Chute_E2, 2, row.Contrat_E2),
        Réalisé: formatTableCell(row.Réalisé_E2, 3, row.Contrat_E2),
        Ecart: formatTableCell(row.Ecart_E2, 4, row.Contrat_E2),
        "Ecarts Théo": formatTableCell(row["Ecarts Théorique_E2"], 5, row.Contrat_E2),
        Belote: formatTableCell(row["Belote Equipe 2"], 6, row.Contrat_E2),
        Remarques: formatTableCell(
          row.Remarques_E2 === "Vous êtes nuls" ? "Capot non annoncé" : 
          row.Remarques_E2 === "La Chatte" ? "Générale non annoncée" : 
          row.Remarques_E2, 
          7, 
          row.Contrat_E2
        ),
        Points: formatTableCell(row.Points_E2, 8, row.Contrat_E2),
        Alerte: alertTeam2,
        Total: {
          text: String(totalE2),
          backgroundColor: ""
        }
      });

      prevEcartTheoE1 = currentEcartTheoE1;
      prevEcartTheoE2 = currentEcartTheoE2;
    });

    setTeam1Rows(team1Rows);
    setTeam2Rows(team2Rows);
    setTeam1Score(totalE1);
    setTeam2Score(totalE2);

    const victoryThreshold = parseInt(victoryPoints);
    setTeam1Winner(totalE1 >= victoryThreshold);
    setTeam2Winner(totalE2 >= victoryThreshold);
  };

  return {
    epicierAlert,
    setEpicierAlert,
    vousEtesNulsAlert,
    setVousEtesNulsAlert,
    laChatteAlert,
    setLaChatteAlert,
    checkEpicierCondition,
    checkVousEtesNulsCondition,
    checkLaChatteCondition,
    getAlertForRow,
    getRemarqueForRow,
    updateDisplayTables
  };
};