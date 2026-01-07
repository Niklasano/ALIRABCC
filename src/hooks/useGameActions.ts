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

  // 1. Vérification Epicier (Flash écran)
  const checkEpicierCondition = (
    ecartTheoE1: number, 
    ecartTheoE2: number, 
    prevEcartTheoE1: number, 
    prevEcartTheoE2: number,
    contratE1: number,
    realiseE1: number,
    contratE2: number,
    realiseE2: number,
    chuteE1: number,
    chuteE2: number,
    team1Name: string,
    team2Name: string
  ) => {
    const newEcartE1 = ecartTheoE1 - prevEcartTheoE1;
    const newEcartE2 = ecartTheoE2 - prevEcartTheoE2;
    
    const isSpecialE1 = (contratE1 === 500 || contratE1 === 1000) && realiseE1 === 160;
    if (newEcartE1 >= 30 && contratE1 !== 0 && chuteE1 === 0 && !isSpecialE1) {
      setEpicierAlert({ show: true, teamName: team1Name, ecartTheo: newEcartE1 });
      return true;
    }
    
    const isSpecialE2 = (contratE2 === 500 || contratE2 === 1000) && realiseE2 === 160;
    if (newEcartE2 >= 30 && contratE2 !== 0 && chuteE2 === 0 && !isSpecialE2) {
      setEpicierAlert({ show: true, teamName: team2Name, ecartTheo: newEcartE2 });
      return true;
    }
    return false;
  };

  // 2. Vérification Capot non annoncé
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
    if (realiseE1 === 160 && contratE1 > 0 && contratE1 < 500 && realiseE1Label !== "0 mais pas capot") {
      setVousEtesNulsAlert({ show: true });
      return;
    }
    if (realiseE2 === 160 && contratE2 > 0 && contratE2 < 500 && realiseE2Label !== "0 mais pas capot") {
      setVousEtesNulsAlert({ show: true });
      return;
    }
  };

  // 3. Vérification Générale
  const checkLaChatteCondition = (
    contratE1: number,
    realiseE1: number,
    contratE2: number,
    realiseE2: number,
    team1Name: string,
    team2Name: string
  ) => {
    const forbiddenNames = ['pépite', 'petit ageorges'];
    const hasForbidden = forbiddenNames.some(name => 
      team1Name.toLowerCase().includes(name) || team2Name.toLowerCase().includes(name)
    );
    if (hasForbidden) return;
    
    if ((contratE1 === 1000 && realiseE1 === 160) || (contratE2 === 1000 && realiseE2 === 160)) {
      setLaChatteAlert({ show: true });
    }
  };

  // 4. Alerte de ligne (Tableau) - CORRIGÉ SANS CITE
  const getAlertForRow = (
    currentEcartTheo: number, 
    previousEcartTheo: number, 
    remarques: string,
    contrat: number,
    realise: number,
    chute: number
  ): AlertType => {
    if (chute === 1) return null;

    const isSpecial = (contrat === 500 || contrat === 1000) && realise === 160;
    if (isSpecial) return null;

    if (remarques === "Vous êtes nuls" || remarques === "Capot non annoncé") {
      return "Vous êtes nuls";
    }
    
    const ecartMene = currentEcartTheo - previousEcartTheo;
    if (ecartMene >= 50) return "Commerce de Gros";
    if (ecartMene >= 40) return "Épicerie Fine";
    if (ecartMene >= 30) return "Épicerie";
    
    return null;
  };

  // 5. Mise à jour des tableaux - PARAMÈTRE CHUTE AJOUTÉ AUX APPELS
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
      
      const prevE1 = i > 0 ? newData[i - 1]["Ecarts Théorique"] : 0;
      const prevE2 = i > 0 ? newData[i - 1]["Ecarts Théorique_E2"] : 0;
      
      // FIX : On passe bien row.Chute ici pour éviter le freeze
      const alertTeam1: AlertType = row.Contrat > 0 
        ? getAlertForRow(row["Ecarts Théorique"], prevE1, row.Remarques, row.Contrat, row.Réalisé, row.Chute)
        : null;
      
      const alertTeam2: AlertType = row.Contrat_E2 > 0 
        ? getAlertForRow(row["Ecarts Théorique_E2"], prevE2, row.Remarques_E2, row.Contrat_E2, row.Réalisé_E2, row.Chute_E2)
        : null;
      
      const isSpecialE1 = (row.Contrat === 500 || row.Contrat === 1000) && row.Chute === 0;
      const isSpecialE2 = (row.Contrat_E2 === 500 || row.Contrat_E2 === 1000) && row.Chute_E2 === 0;
      
      team1Rows.push({
        Mène: String(row.Mène),
        Contrat: formatTableCell(row.Contrat, 1, row.Contrat),
        SuitColor: row.CardColor,
        Chute: formatTableCell(row.Chute, 2, row.Contrat),
        Réalisé: formatTableCell(row.Réalisé, 3, row.Contrat),
        Ecart: isSpecialE1 ? { text: '', backgroundColor: '#FFFFFF' } : formatTableCell(row.Ecart, 4, row.Contrat),
        "Ecarts Théo": formatTableCell(row["Ecarts Théorique"], 5, row.Contrat),
        Belote: formatTableCell(row["Belote Equipe 1"], 6, row.Contrat),
        Remarques: formatTableCell(row.Remarques === "Vous êtes nuls" ? "Capot non annoncé" : row.Remarques, 7, row.Contrat),
        Points: formatTableCell(row.Points, 8, row.Contrat),
        Alerte: alertTeam1,
        Total: { text: String(totalE1), backgroundColor: totalE1 >= totalE2 ? '#90ee90' : '#ff6347' }
      });
      
      team2Rows.push({
        Mène: String(row.Mène),
        Contrat: formatTableCell(row.Contrat_E2, 1, row.Contrat_E2),
        SuitColor: row.CardColor_E2,
        Chute: formatTableCell(row.Chute_E2, 2, row.Contrat_E2),
        Réalisé: formatTableCell(row.Réalisé_E2, 3, row.Contrat_E2),
        Ecart: isSpecialE2 ? { text: '', backgroundColor: '#FFFFFF' } : formatTableCell(row.Ecart_E2, 4, row.Contrat_E2),
        "Ecarts Théo": formatTableCell(row["Ecarts Théorique_E2"], 5, row.Contrat_E2),
        Belote: formatTableCell(row["Belote Equipe 2"], 6, row.Contrat_E2),
        Remarques: formatTableCell(row.Remarques_E2 === "Vous êtes nuls" ? "Capot non annoncé" : row.Remarques_E2, 7, row.Contrat_E2),
        Points: formatTableCell(row.Points_E2, 8, row.Contrat_E2),
        Alerte: alertTeam2,
        Total: { text: String(totalE2), backgroundColor: totalE2 > totalE1 ? '#90ee90' : '#ff6347' }
      });
    });
    
    setTeam1Rows(team1Rows);
    setTeam2Rows(team2Rows);
    setTeam1Score(totalE1);
    setTeam2Score(totalE2);
    setTeam1Winner(totalE1 >= parseInt(victoryPoints));
    setTeam2Winner(totalE2 >= parseInt(victoryPoints));
  };

  return {
    epicierAlert, setEpicierAlert,
    vousEtesNulsAlert, setVousEtesNulsAlert,
    laChatteAlert, setLaChatteAlert,
    checkEpicierCondition, checkVousEtesNulsCondition,
    checkLaChatteCondition, updateDisplayTables,
    getNextDealer, getPreviousDealer, createNewBeloteRow
  };
};