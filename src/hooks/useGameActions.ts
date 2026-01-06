
import { useState } from 'react';
import { toast } from "sonner";
import { BeloteRow, DisplayRow, ExtendedRemarque, AlertType } from '@/types/belote';
import { CONTRATS, REALISES, BELOTE_ANNONCES } from '@/types/belote';
import {
  calculerEcart, calculerPoints, calculerPointsAdverse,
  calculerPointsTheoriques, formatTableCell, createNewBeloteRow,
  getNextDealer, getPreviousDealer
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

 const checkEpicierCondition = (
  ecartTheoE1: number, 
  ecartTheoE2: number, 
  prevEcartTheoE1: number, 
  prevEcartTheoE2: number,
  contratE1: number,
  realiseE1: number,
  contratE2: number,
  realiseE2: number,
  team1Name: string,
  team2Name: string
) => {
  const newEcartE1 = ecartTheoE1 - prevEcartTheoE1;
  const newEcartE2 = ecartTheoE2 - prevEcartTheoE2;
  
  // CONDITION ÉQUIPE 1 : Il faut qu'ils aient pris (contrat > 0)
  if (contratE1 > 0 && newEcartE1 >= 30 && realiseE1 >= contratE1) {
    setEpicierAlert({
      show: true,
      teamName: team1Name,
      ecartTheo: newEcartE1
    });
    return true; 
  }
  
  // CONDITION ÉQUIPE 2 : Il faut qu'ils aient pris (contrat > 0)
  if (contratE2 > 0 && newEcartE2 >= 30 && realiseE2 >= contratE2) {
    setEpicierAlert({
      show: true,
      teamName: team2Name,
      ecartTheo: newEcartE2
    });
    return true; 
  }

  return false;
};
  // Fonction pour vérifier si une équipe fait un capot sans l'avoir annoncé
  const checkVousEtesNulsCondition = (
    realiseE1: number,
    contratE1: number,
    realiseE2: number,
    contratE2: number,
    team1Name: string,
    team2Name: string,
    realiseE1Label?: string,
    realiseE2Label?: string
  ) => {
    // Équipe 1 fait un capot sans l'avoir annoncé (mais pas si "0 mais pas capot" est sélectionné)
    if (realiseE1 === 160 && contratE1 > 0 && contratE1 < 500 && realiseE1Label !== "0 mais pas capot") {
      setVousEtesNulsAlert({
        show: true
      });
      return;
    }
    
    // Équipe 2 fait un capot sans l'avoir annoncé (mais pas si "0 mais pas capot" est sélectionné)
    if (realiseE2 === 160 && contratE2 > 0 && contratE2 < 500 && realiseE2Label !== "0 mais pas capot") {
      setVousEtesNulsAlert({
        show: true
      });
      return;
    }
  };

  // Fonction pour vérifier si une équipe fait une Générale réussie
  const checkLaChatteCondition = (
    contratE1: number,
    realiseE1: number,
    contratE2: number,
    realiseE2: number,
    team1Name: string,
    team2Name: string
  ) => {
    // Vérifier si une des équipes contient "Pépite" ou "Petit Ageorges"
    const team1Players = team1Name.toLowerCase();
    const team2Players = team2Name.toLowerCase();
    const forbiddenNames = ['pépite', 'petit ageorges'];
    
    const hasForbiddenName = forbiddenNames.some(name => 
      team1Players.includes(name) || team2Players.includes(name)
    );
    
    if (hasForbiddenName) {
      return;
    }
    
    // Équipe 1 annonce et réussit une Générale (1000)
    if (contratE1 === 1000 && realiseE1 === 160) {
      setLaChatteAlert({
        show: true
      });
      return;
    }
    
    // Équipe 2 annonce et réussit une Générale (1000)
    if (contratE2 === 1000 && realiseE2 === 160) {
      setLaChatteAlert({
        show: true
      });
      return;
    }
  };

  // Fonction pour déterminer l'alerte d'une équipe basée sur l'écart théorique de la mène
  const getAlertForRow = (
    currentEcartTheo: number, 
    previousEcartTheo: number, 
    remarques: string
  ): AlertType => {
    // Vérifier d'abord "Vous êtes nuls" dans les remarques
    if (remarques === "Vous êtes nuls" || remarques === "Capot non annoncé") {
      return "Vous êtes nuls";
    }
    
    // Calculer l'écart de cette mène uniquement (pas le cumulé)
    const ecartMene = currentEcartTheo - previousEcartTheo;
    
    // Alertes basées sur l'écart théorique de la mène (seulement pour l'équipe qui a pris)
    if (ecartMene >= 50) {
      return "Commerce de Gros";
    } else if (ecartMene >= 40) {
      return "Épicerie Fine";
    } else if (ecartMene >= 30) {
      return "Épicerie";
    }
    
    return null;
  };

  // Fonction pour mettre à jour les tableaux d'affichage
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
    
    newData.forEach((row, i) => {
      totalE1 += row.Points;
      totalE2 += row.Points_E2;
      
      // Récupérer les écarts précédents pour calculer l'écart de la mène
      const prevEcartTheoE1 = i > 0 ? newData[i - 1]["Ecarts Théorique"] : 0;
      const prevEcartTheoE2 = i > 0 ? newData[i - 1]["Ecarts Théorique_E2"] : 0;
      
      // Déterminer quelle équipe a annoncé le contrat (basé sur qui a un contrat > 0)
      const team1HasContract = row.Contrat > 0;
      const team2HasContract = row.Contrat_E2 > 0;
      
      // Alerte pour Team1 (seulement si c'est eux qui ont annoncé)
      const alertTeam1: AlertType = team1HasContract 
        ? getAlertForRow(row["Ecarts Théorique"], prevEcartTheoE1, row.Remarques)
        : null;
      
      // Alerte pour Team2 (seulement si c'est eux qui ont annoncé)
      const alertTeam2: AlertType = team2HasContract 
        ? getAlertForRow(row["Ecarts Théorique_E2"], prevEcartTheoE2, row.Remarques_E2)
        : null;
      
      const team1Row: DisplayRow = {
        Mène: String(row.Mène),
        Contrat: formatTableCell(row.Contrat, 1, row.Contrat),
        SuitColor: row.CardColor,
        Chute: formatTableCell(row.Chute, 2, row.Contrat),
        Réalisé: formatTableCell(row.Réalisé, 3, row.Contrat),
        Ecart: formatTableCell(row.Ecart, 4, row.Contrat),
        "Ecarts Théo": formatTableCell(row["Ecarts Théorique"], 5, row.Contrat),
        Belote: formatTableCell(row["Belote Equipe 1"], 6, row.Contrat),
        Remarques: formatTableCell(row.Remarques === "Vous êtes nuls" ? "Capot non annoncé" : row.Remarques, 7, row.Contrat),
        Points: formatTableCell(row.Points, 8, row.Contrat),
        Alerte: alertTeam1,
        Total: {
          text: String(totalE1),
          backgroundColor: totalE1 >= totalE2 ? '#90ee90' : '#ff6347'
        }
      };
      
      const team2Row: DisplayRow = {
        Mène: String(row.Mène),
        Contrat: formatTableCell(row.Contrat_E2, 1, row.Contrat_E2),
        SuitColor: row.CardColor_E2,
        Chute: formatTableCell(row.Chute_E2, 2, row.Contrat_E2),
        Réalisé: formatTableCell(row.Réalisé_E2, 3, row.Contrat_E2),
        Ecart: formatTableCell(row.Ecart_E2, 4, row.Contrat_E2),
        "Ecarts Théo": formatTableCell(row["Ecarts Théorique_E2"], 5, row.Contrat_E2),
        Belote: formatTableCell(row["Belote Equipe 2"], 6, row.Contrat_E2),
        Remarques: formatTableCell(row.Remarques_E2 === "Vous êtes nuls" ? "Capot non annoncé" : row.Remarques_E2, 7, row.Contrat_E2),
        Points: formatTableCell(row.Points_E2, 8, row.Contrat_E2),
        Alerte: alertTeam2,
        Total: {
          text: String(totalE2),
          backgroundColor: totalE2 > totalE1 ? '#90ee90' : '#ff6347'
        }
      };
      
      team1Rows.push(team1Row);
      team2Rows.push(team2Row);
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
    updateDisplayTables,
  };
};
