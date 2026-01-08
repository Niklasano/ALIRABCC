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
   * Conditions:
   * - Contrat réussi avec écart >= 30 → Épicerie
   * - Contrat réussi avec écart >= 40 → Épicerie Fine
   * - Contrat réussi avec écart >= 50 → Commerce de Gros
   * - Ne s'applique PAS si contrat chuté
   * - Ne s'applique PAS si Capot/Générale annoncé et réussi
   */
  const checkEpicierCondition = (
    ecart: number,
    contrat: number,
    chute: number,
    realiseLabel: string | undefined,
    teamName: string
  ): boolean => {
    // Pas d'alerte si pas de contrat ou contrat chuté
    if (contrat === 0 || chute === 1) return false;

    // Pas d'alerte si Capot/Générale annoncé et réussi
    if (contrat >= 500) return false;

    // Pas d'alerte si Capot/Générale non annoncé (c'est "Vous êtes nuls" qui s'applique)
    if (realiseLabel === "Capot" || realiseLabel === "Générale") return false;

    // Vérifier les seuils d'épicerie
    if (ecart >= 30) {
      setEpicierAlert({
        show: true,
        teamName: teamName,
        ecartTheo: ecart
      });
      return true;
    }

    return false;
  };

  /**
   * Vérifie si une alerte "Vous êtes nuls" doit être affichée
   * Condition: Contrat non Capot/Générale mais réalise un Capot
   */
  const checkVousEtesNulsCondition = (
    realise: number,
    contrat: number,
    realiseLabel?: string
  ): boolean => {
    // Équipe fait un Capot sans l'avoir annoncé (et pas "0 mais pas capot")
    if (realise === 160 && contrat > 0 && contrat < 500 && realiseLabel === "Capot") {
      setVousEtesNulsAlert({ show: true });
      return true;
    }
    return false;
  };

  /**
   * Vérifie si une alerte "La Chatte" doit être affichée
   * Condition: Contrat non Générale mais réalise une Générale
   */
  const checkLaChatteCondition = (
    realise: number,
    contrat: number,
    realiseLabel?: string
  ): boolean => {
    // Équipe fait une Générale sans l'avoir annoncée
    if (realise === 160 && contrat > 0 && contrat < 1000 && realiseLabel === "Générale") {
      setLaChatteAlert({ show: true });
      return true;
    }
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
