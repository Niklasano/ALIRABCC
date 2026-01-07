import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, BarChart3, BookOpen, RefreshCw, PlusCircle, UndoIcon, Users, Download } from "lucide-react";
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useParams } from 'react-router-dom';

import TeamInputForm from './TeamInputForm';
import BeloteTable from './BeloteTable';
import TotalScores from './TotalScores';
import GameSettings from './GameSettings';
import TeamNameDialog from './TeamNameDialog';
import PlayerLayout from './PlayerLayout';
import StatsDialog from './StatsDialog';
import ValuesDialog from './ValuesDialog';
import EpicierAlert from './EpicierAlert';
import VousEtesNulsAlert from './VousEtesNulsAlert';
import GameControls from './GameControls';
import CurrentGameInfo from './CurrentGameInfo';
import LaChatteAlert from './LaChatteAlert';
import WinnerAlert from './WinnerAlert';
import LeaderboardDialog from './LeaderboardDialog';
import PointsRulesDialog from './PointsRulesDialog';
import AlertsDialog from './AlertsDialog';
import { useTeamStats } from '@/hooks/useTeamStats';
import { useBonusMalus } from '@/hooks/useBonusMalus';
import { useGameSession } from '@/hooks/useGameSession';
import { useTournament } from '@/hooks/useTournament';
import TournamentDialog from './TournamentDialog';

import { useGameState } from '@/hooks/useGameState';
import { useGameActions } from '@/hooks/useGameActions';
import { useGameHistory } from '@/hooks/useGameHistory';
import GameHistoryDialog from './GameHistoryDialog';
import FausseDonneDialog from './FausseDonneDialog';

import {
  BeloteAnnonce, Contrat, Realise, Remarque, BeloteRow, ExtendedRemarque,
  BELOTE_ANNONCES, CONTRATS, REALISES, REMARQUES,
  DisplayRow
} from '@/types/belote';
import {
  calculerEcart, calculerPoints, calculerPointsAdverse,
  calculerPointsTheoriques, formatTableCell, createNewBeloteRow,
  getNextDealer, getPreviousDealer, getCutterIndex, getOpenerIndex
} from '@/utils/beloteUtils';

const BeloteApp: React.FC = () => {
  const { sessionUrl: urlParam } = useParams<{ sessionUrl: string }>();
  const gameState = useGameState();
  const gameActions = useGameActions();
  const teamStats = useTeamStats();
  const bonusMalus = useBonusMalus();
  const gameSession = useGameSession();
  const tournament = useTournament();
  const gameHistory = useGameHistory();
  
  // États pour les dialogues
  const [renameTeamDialog, setRenameTeamDialog] = useState<{ open: boolean, team: 1 | 2 } | null>(null);
  const [showLayoutDialog, setShowLayoutDialog] = useState<boolean>(false);
  const [showStatsDialog, setShowStatsDialog] = useState<boolean>(false);
  const [showValuesDialog, setShowValuesDialog] = useState<"normal" | "tasa" | null>(null);
  const [showWinnerAlert, setShowWinnerAlert] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showPointsRules, setShowPointsRules] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showFausseDonne, setShowFausseDonne] = useState<boolean>(false);

  // Référence pour les tableaux de score
  const scoreTablesRef = useRef<HTMLDivElement>(null);
  
  // Effet pour mettre à jour l'état du bouton d'ajout
  const canAddRound = 
    gameState.teamSetupComplete && 
    ((gameState.contratE1 !== "0" && gameState.realiseE1 !== "0") || 
     (gameState.contratE2 !== "0" && gameState.realiseE2 !== "0"));

  // Au lieu du useState, on calcule la validité en temps réel
const teamNamesValid = Boolean(
  gameState.team1Player1 && 
  gameState.team1Player2 && 
  gameState.team2Player1 && 
  gameState.team2Player2
);
  
useEffect(() => {
  const loadSessionFromUrl = async () => {
    if (urlParam) {
      try {
        const session = await gameSession.loadGameSession(urlParam);
        
        if (session) {
          gameState.setTeam1Player1(session.team1_player1 || '');
          gameState.setTeam1Player2(session.team1_player2 || '');
          gameState.setTeam2Player1(session.team2_player1 || '');
          gameState.setTeam2Player2(session.team2_player2 || '');
          gameState.setPlayers(session.players_layout || []);
          gameState.setCurrentDealer(session.current_dealer || 0);
          gameState.setVictoryPoints(session.victory_points || '2000');
          
          const savedData = (session.game_data as any) || [];
          gameState.setData(savedData);
          gameState.setTeam1Score(session.team1_score || 0);
          gameState.setTeam2Score(session.team2_score || 0);
          
          gameActions.updateDisplayTables(
            savedData,
            gameState.setTeam1Rows,
            gameState.setTeam2Rows,
            gameState.setTeam1Score,
            gameState.setTeam2Score,
            gameState.setTeam1Winner,
            gameState.setTeam2Winner,
            session.victory_points || '2000'
          );

          // --- AJOUT ICI ---
          // On vérifie si les 4 joueurs sont présents
          const hasAllPlayers = session.team1_player1 && session.team1_player2 && 
                               session.team2_player1 && session.team2_player2;

			if (hasAllPlayers) {
            // Supprimé : setTeamNamesValid(true); (cette ligne causait l'erreur)
            gameState.setTeamSetupComplete(true); // Affiche le tableau des scores
          }
          // ------------------
          
        } else {
          console.log("Nouvelle session de jeu détectée.");
        }
      } catch (error) {
        console.error('Info: Session non trouvée ou nouvelle:', error);
      }
    }
  };

  loadSessionFromUrl();
}, [urlParam]);

  // Effet pour sauvegarder automatiquement la partie en cours dans Supabase
  useEffect(() => {
    const saveGameSession = async () => {
      if (gameSession.sessionUrl && gameState.teamSetupComplete && gameState.data.length > 0) {
        try {
          await gameSession.updateGameSession(gameSession.sessionUrl, {
            team1_score: gameState.team1Score,
            team2_score: gameState.team2Score,
            game_data: gameState.data as any,
            current_dealer: gameState.currentDealer ?? 0,
            is_finished: gameState.team1Winner || gameState.team2Winner,
            winner_team: gameState.team1Winner ? gameState.team1Name : gameState.team2Winner ? gameState.team2Name : undefined,
          });
        } catch (error) {
          console.error('Erreur lors de la sauvegarde automatique:', error);
        }
      }
    };

    saveGameSession();
  }, [
    gameState.data,
    gameState.team1Score,
    gameState.team2Score,
    gameState.currentDealer,
    gameState.team1Winner,
    gameState.team2Winner,
    gameSession.sessionUrl,
    gameState.teamSetupComplete
  ]);

  // Effet pour détecter quand une équipe gagne et sauvegarder dans l'historique
  useEffect(() => {
    if ((gameState.team1Winner || gameState.team2Winner) && gameState.data.length > 0) {
      setShowWinnerAlert(true);
      
      // Sauvegarder la partie dans l'historique
      gameHistory.saveGame(
        gameState.team1Name,
        gameState.team2Name,
        gameState.team1Player1,
        gameState.team1Player2,
        gameState.team2Player1,
        gameState.team2Player2,
        gameState.team1Score,
        gameState.team2Score,
        gameState.team1Winner,
        gameState.team2Winner,
        gameState.victoryPoints,
        gameState.data,
        gameState.team1Rows,
        gameState.team2Rows
      );
    }
  }, [gameState.team1Winner, gameState.team2Winner, gameState.data.length]);
  
  // Fonction pour ouvrir le dialogue de renommage d'équipe
  const handleRenameTeam = (team: 1 | 2) => {
    setRenameTeamDialog({ open: true, team });
  };
  
  // Fonction pour sauvegarder le nouveau nom d'équipe (not needed anymore since names are derived)
  const handleSaveTeamName = (name: string) => {
    // Team names are now derived from selected players, so this function is no longer needed
    // but we keep it for compatibility with the TeamNameDialog component
    toast.info("Les noms d'équipe sont maintenant basés sur les joueurs sélectionnés");
  };
  
// Fonction pour sauvegarder la disposition des joueurs et générer URL
 const handleSaveLayout = async (positions: string[], dealerIndex: number) => {
  // 1. Mise à jour immédiate de l'interface (UI)
  gameState.setPlayers(positions);
  gameState.setCurrentDealer(dealerIndex);
  gameState.setTeamSetupComplete(true);

  // 2. Sauvegarde dans Supabase
  if (urlParam) {
    try {
      // Nous utilisons createGameSession qui contient déjà notre logique .upsert()
      // Cela garantit que la session est soit créée, soit mise à jour avec la nouvelle disposition
      await gameSession.createGameSession(
        gameState.team1Player1,
        gameState.team1Player2,
        gameState.team2Player1,
        gameState.team2Player2,
        positions,      // On envoie les nouvelles positions
        dealerIndex,    // On envoie le nouveau donneur
        gameState.victoryPoints,
        urlParam        // On précise l'URL actuelle pour ne pas en créer une nouvelle
      );
      console.log("Disposition et donneur synchronisés sur le serveur.");
    } catch (error) {
      console.error("Erreur lors de la synchronisation de la disposition:", error);
    }
  }
};
  
 // Fonction pour ajouter une manche
const handleAddRound = () => {
  const contratE1Val = CONTRATS[gameState.contratE1];
  const realiseE1Val = REALISES[gameState.realiseE1];
  const beloteE1Val = BELOTE_ANNONCES[gameState.beloteE1];
  const contratE2Val = CONTRATS[gameState.contratE2];
  const realiseE2Val = REALISES[gameState.realiseE2];
  const beloteE2Val = BELOTE_ANNONCES[gameState.beloteE2];

  // --- VALIDATIONS ---
  if (gameState.remarqueE1 !== "N/A" && gameState.remarqueE2 !== "N/A" && gameState.remarqueE1 === gameState.remarqueE2) {
    toast.error("Impossible d'avoir deux fois la même remarque (Coinche ou Sur Coinche).");
    return;
  }
  
  if (beloteE1Val + beloteE2Val > 80) {
    toast.error("La somme des annonces Belote ne peut pas dépasser 80.");
    return;
  }
  
  if (contratE1Val > 0 && contratE2Val > 0) {
    toast.error("Un seul contrat par manche.");
    return;
  }

  // --- CALCUL DES SCORES RÉALISÉS ---
  const totalPoints = 160;
  let realiseE1Final = realiseE1Val;
  let realiseE2Final = realiseE2Val;
  
  if (contratE1Val >= 500 && realiseE1Final === totalPoints) {
    realiseE2Final = 0;
  } else if (contratE2Val >= 500 && realiseE2Final === totalPoints) {
    realiseE1Final = 0;
  } else if (contratE1Val > 0 && gameState.realiseE2 === "0") {
    realiseE2Final = totalPoints - realiseE1Final;
  } else if (contratE2Val > 0 && gameState.realiseE1 === "0") {
    realiseE1Final = totalPoints - realiseE2Final;
  }

  // --- CALCUL DES ÉCARTS ET POINTS ---
let ecartE1 = calculerEcart(contratE1Val, realiseE1Final, gameState.realiseE1);
let ecartE2 = calculerEcart(contratE2Val, realiseE2Final, gameState.realiseE2);

// Nouvelle règle : Écart à 0 si Capot ou Générale réussi
if ((contratE1Val === 500 || contratE1Val === 1000) && realiseE1Final === 160) {
  ecartE1 = 0;
}

if ((contratE2Val === 500 || contratE2Val === 1000) && realiseE2Final === 160) {
  ecartE2 = 0;
}
  
  const [pointsE1, chuteE1] = calculerPoints(
    contratE1Val, realiseE1Final, beloteE1Val, gameState.remarqueE1,
    contratE2Val, realiseE2Final, beloteE2Val, gameState.remarqueE2,
    gameState.realiseE1, gameState.realiseE2
  );
  
  const [pointsE2, chuteE2] = calculerPointsAdverse(
    contratE1Val, realiseE1Final, beloteE1Val, gameState.remarqueE1,
    contratE2Val, realiseE2Final, beloteE2Val, gameState.remarqueE2,
    gameState.realiseE1, gameState.realiseE2
  );

  const theoE1 = calculerPointsTheoriques(contratE1Val, realiseE1Final, beloteE1Val, gameState.realiseE1);
  const theoE2 = calculerPointsTheoriques(contratE2Val, realiseE2Final, beloteE2Val, gameState.realiseE2);
  
  let remarqueE1Display: ExtendedRemarque = gameState.remarqueE1;
  let remarqueE2Display: ExtendedRemarque = gameState.remarqueE2;
  
  // Gestion des mentions spéciales dans le tableau
  if (realiseE1Final === 160 && contratE1Val < 500 && contratE1Val > 0 && 
      gameState.realiseE1 !== "0 mais pas capot" && gameState.realiseE1 !== "Capot") {
    remarqueE1Display = "Vous êtes nuls";
  } else if (realiseE1Final === 160 && contratE1Val < 500 && 
              gameState.realiseE1 !== "0 mais pas capot" && gameState.realiseE1 !== "Capot") {
    remarqueE1Display = "Capot non annoncé";
  }
  
  if (realiseE2Final === 160 && contratE2Val < 500 && contratE2Val > 0 && 
      gameState.realiseE2 !== "0 mais pas capot" && gameState.realiseE2 !== "Capot") {
    remarqueE2Display = "Vous êtes nuls";
  } else if (realiseE2Final === 160 && contratE2Val < 500 && 
              gameState.realiseE2 !== "0 mais pas capot" && gameState.realiseE2 !== "Capot") {
    remarqueE2Display = "Capot non annoncé";
  }

  // --- CALCUL DES ÉCARTS THÉORIQUES ---
  let ecartTheoE1 = 0;
  let ecartTheoE2 = 0;

  if (remarqueE1Display === "Capot non annoncé" || remarqueE1Display === "Vous êtes nuls") {
    ecartE1 = 500 - contratE1Val - realiseE1Final;
  }
  if (remarqueE2Display === "Capot non annoncé" || remarqueE2Display === "Vous êtes nuls") {
    ecartE2 = 500 - contratE2Val - realiseE2Final;
  }

  // Gestion des chutes
  if (contratE1Val > 0 && chuteE1 === 1) {
    ecartE1 = (contratE1Val === 500) ? 500 : (contratE1Val === 1000) ? 1000 : 2 * contratE1Val;
  }
  if (contratE2Val > 0 && chuteE2 === 1) {
    ecartE2 = (contratE2Val === 500) ? 500 : (contratE2Val === 1000) ? 1000 : 2 * contratE2Val;
  }

  const prevEcartTheoE1 = gameState.data.length > 0 ? gameState.data[gameState.data.length - 1]["Ecarts Théorique"] : 0;
  const prevEcartTheoE2 = gameState.data.length > 0 ? gameState.data[gameState.data.length - 1]["Ecarts Théorique_E2"] : 0;

 // Calcul normal du score (ne pas toucher pour garder les points justes)
  if (contratE1Val > 0) {
    ecartTheoE1 = prevEcartTheoE1 + ecartE1;
    ecartTheoE2 = prevEcartTheoE2;
  } else if (contratE2Val > 0) {
    ecartTheoE1 = prevEcartTheoE1;
    ecartTheoE2 = prevEcartTheoE2 + ecartE2;
  } else {
    ecartTheoE1 = prevEcartTheoE1;
    ecartTheoE2 = prevEcartTheoE2;
  }

    // --- GESTION DES ALERTES FLASH (AVEC PRIORITÉ) ---
  // On vérifie d'abord l'Epicier (Commerce de Gros, etc.)
  const alerteAffichee = gameActions.checkEpicierCondition(
    ecartTheoE1, ecartTheoE2, prevEcartTheoE1, prevEcartTheoE2,
    gameState.contratE1, gameState.realiseE1,
    gameState.contratE2, gameState.realiseE2,
    gameState.team1Name, gameState.team2Name
  );

  // Si l'épicier n'a pas affiché d'alerte, on vérifie "Vous êtes nuls"
  if (!alerteAffichee) {
    gameActions.checkVousEtesNulsCondition(
      realiseE1Final, contratE1Val,
      realiseE2Final, contratE2Val,
      gameState.team1Name, gameState.team2Name,
      gameState.realiseE1, gameState.realiseE2
    );

    gameActions.checkLaChatteCondition(
      contratE1Val, realiseE1Final,
      contratE2Val, realiseE2Final,
      gameState.team1Name, gameState.team2Name
    );
  }



// --- CRÉATION ET MISE À JOUR DE LA DATA ---
  const newRound = createNewBeloteRow(
    gameState.data,
    gameState.data.length + 1,
    contratE1Val, chuteE1, realiseE1Final, ecartE1, ecartTheoE1, gameState.beloteE1, remarqueE1Display, pointsE1,
    contratE2Val, chuteE2, realiseE2Final, ecartE2, ecartTheoE2, gameState.beloteE2, remarqueE2Display, pointsE2,
    theoE1, theoE2,
    gameState.cardColorE1, gameState.cardColorE2
  );
  
  const newData = [...gameState.data, newRound];
  gameState.setData(newData);
  
  gameActions.updateDisplayTables(
    newData,
    gameState.setTeam1Rows, gameState.setTeam2Rows,
    gameState.setTeam1Score, gameState.setTeam2Score,
    gameState.setTeam1Winner, gameState.setTeam2Winner,
    gameState.victoryPoints
  );
  
  if (gameState.currentDealer !== null) {
    gameState.setCurrentDealer(getNextDealer(gameState.currentDealer));
  }
  
  gameState.resetInputs();
  
  // On n'affiche le toast de succès que si aucune grosse alerte n'a pris l'écran
  if (!alerteAffichee) {
    toast.success(`Manche ${gameState.data.length + 1} ajoutée !`);
  }
};

  // Fonction pour annuler la dernière manche
  const handleCancelRound = () => {
    if (gameState.data.length === 0) {
      toast.warning("Aucune manche à annuler !");
      return;
    }

    const newData = [...gameState.data];
    newData.pop();
    gameState.setData(newData);
    
    gameActions.updateDisplayTables(
      newData,
      gameState.setTeam1Rows,
      gameState.setTeam2Rows,
      gameState.setTeam1Score,
      gameState.setTeam2Score,
      gameState.setTeam1Winner,
      gameState.setTeam2Winner,
      gameState.victoryPoints
    );
    
    if (gameState.currentDealer !== null) {
      gameState.setCurrentDealer(getPreviousDealer(gameState.currentDealer));
    }
    
    toast.success("Dernière manche annulée !");
  };

  // Fonction pour passer le tour (avancer le donneur sans ajouter de manche)
  const handleSkipTurn = () => {
    if (gameState.currentDealer !== null) {
      gameState.setCurrentDealer(getNextDealer(gameState.currentDealer));
      toast.success("Tour passé ! Le donneur a changé.");
    } else {
      toast.warning("Aucun donneur défini !");
    }
  };

  // Fonction pour gérer la fausse donne
  const handleFausseDonne = (teamReceivingPoints: 1 | 2) => {
    // L'équipe qui reçoit les points n'est PAS celle qui a fait la fausse donne
    // Donc "Fausse donne" va dans les remarques de l'équipe adverse
    const prevEcartTheoE1 = gameState.data.length > 0 ? gameState.data[gameState.data.length - 1]["Ecarts Théorique"] : 0;
    const prevEcartTheoE2 = gameState.data.length > 0 ? gameState.data[gameState.data.length - 1]["Ecarts Théorique_E2"] : 0;

    const newRound = createNewBeloteRow(
      gameState.data,
      gameState.data.length + 1,
      // Team 1 values
      0, // contrat
      0, // chute
      teamReceivingPoints === 1 ? 160 : 0, // réalisé
      0, // ecart
      prevEcartTheoE1, // ecart théorique (inchangé)
      "N/A", // belote
      teamReceivingPoints === 2 ? "Fausse donne" : "N/A", // remarques (Team 1 a fait la faute si Team 2 reçoit)
      teamReceivingPoints === 1 ? 160 : 0, // points
      // Team 2 values
      0, // contrat
      0, // chute
      teamReceivingPoints === 2 ? 160 : 0, // réalisé
      0, // ecart
      prevEcartTheoE2, // ecart théorique (inchangé)
      "N/A", // belote
      teamReceivingPoints === 1 ? "Fausse donne" : "N/A", // remarques (Team 2 a fait la faute si Team 1 reçoit)
      teamReceivingPoints === 2 ? 160 : 0, // points
      0, // theoE1
      0, // theoE2
      "", // cardColorE1
      "" // cardColorE2
    );

    const newData = [...gameState.data, newRound];
    gameState.setData(newData);

    gameActions.updateDisplayTables(
      newData,
      gameState.setTeam1Rows,
      gameState.setTeam2Rows,
      gameState.setTeam1Score,
      gameState.setTeam2Score,
      gameState.setTeam1Winner,
      gameState.setTeam2Winner,
      gameState.victoryPoints
    );

    // Avancer le donneur comme pour "Passer le tour"
    if (gameState.currentDealer !== null) {
      gameState.setCurrentDealer(getNextDealer(gameState.currentDealer));
    }
    
    const teamFautive = teamReceivingPoints === 1 ? gameState.team2Name : gameState.team1Name;
    const teamBeneficiaire = teamReceivingPoints === 1 ? gameState.team1Name : gameState.team2Name;
    toast.success(`Fausse donne de ${teamFautive} ! 160 points pour ${teamBeneficiaire}`);
    
    setShowFausseDonne(false);
  };

  // Fonction pour redémarrer la partie
  const handleRestartGame = () => {
    if (confirm("Voulez-vous vraiment redémarrer la partie ? Toutes les données seront perdues.")) {
      gameState.resetGame();
      toast.success("La partie a été redémarrée !");
    }
  };
  
  // Fonction pour lancer une revanche - MODIFIÉE pour pré-remplir les noms
  const handleRevenge = () => {
    if (!gameState.players.length) {
      toast.warning("Aucune disposition précédente pour une revanche !");
      return;
    }
    
    if (confirm("Voulez-vous lancer une revanche avec les mêmes joueurs et disposition ?")) {
      toast.info("Partie précédente sauvegardée automatiquement");
      
      // Sauvegarder les joueurs et équipes actuels avant de réinitialiser
      const previousPlayers = [...gameState.players];
      const previousTeam1Player1 = gameState.team1Player1;
      const previousTeam1Player2 = gameState.team1Player2;
      const previousTeam2Player1 = gameState.team2Player1;
      const previousTeam2Player2 = gameState.team2Player2;
      const previousDealer = gameState.currentDealer;
      
      gameState.resetGame();
      
      // Restaurer les noms des joueurs pour le prochain setup
      gameState.setTeam1Player1(previousTeam1Player1);
      gameState.setTeam1Player2(previousTeam1Player2);
      gameState.setTeam2Player1(previousTeam2Player1);
      gameState.setTeam2Player2(previousTeam2Player2);
      
      setShowLayoutDialog(true);
      
      toast.success("Revanche lancée avec les mêmes joueurs !");
    }
  };

  // Fonction pour sauvegarder les scores sous format Excel
  const handleSaveExcel = async () => {
    if (gameState.data.length === 0) {
      toast.error("Aucun score à sauvegarder !");
      return;
    }

    try {
      toast.info("Création du fichier Excel en cours...");
      
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Belote App';
      workbook.lastModifiedBy = 'Belote App';
      workbook.created = new Date();
      workbook.modified = new Date();
      
      const sheet1 = workbook.addWorksheet(gameState.team1Name);
      
      sheet1.columns = [
        { header: 'Mène', key: 'mene', width: 5 },
        { header: 'Contrat', key: 'contrat', width: 10 },
        { header: 'Chute', key: 'chute', width: 7 },
        { header: 'Réalisé', key: 'realise', width: 10 },
        { header: 'Ecart', key: 'ecart', width: 10 },
        { header: 'Ecarts Théo', key: 'ecartsTheo', width: 12 },
        { header: 'Belote', key: 'belote', width: 10 },
        { header: 'Remarques', key: 'remarques', width: 15 },
        { header: 'Points', key: 'points', width: 10 },
        { header: 'Total', key: 'total', width: 10 }
      ];
      
      sheet1.getRow(1).font = { bold: true };
      sheet1.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4169E1' }
      };
      sheet1.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      
      let totalE1 = 0;
      gameState.team1Rows.forEach(row => {
        totalE1 += parseInt(row.Points.replace('<div style="color: ', '').split('">')[1] || '0');
        sheet1.addRow({
          mene: row.Mène,
          contrat: row.Contrat.replace(/<[^>]*>/g, ''),
          chute: row.Chute.replace(/<[^>]*>/g, ''),
          realise: row.Réalisé.replace(/<[^>]*>/g, ''),
          ecart: row.Ecart.replace(/<[^>]*>/g, ''),
          ecartsTheo: row["Ecarts Théo"].replace(/<[^>]*>/g, ''),
          belote: row.Belote.replace(/<[^>]*>/g, ''),
          remarques: row.Remarques.replace(/<[^>]*>/g, ''),
          points: row.Points.replace(/<[^>]*>/g, ''),
          total: row.Total.text
        });
      });
      
      const sheet2 = workbook.addWorksheet(gameState.team2Name);
      
      sheet2.columns = [
        { header: 'Mène', key: 'mene', width: 5 },
        { header: 'Contrat', key: 'contrat', width: 10 },
        { header: 'Chute', key: 'chute', width: 7 },
        { header: 'Réalisé', key: 'realise', width: 10 },
        { header: 'Ecart', key: 'ecart', width: 10 },
        { header: 'Ecarts Théo', key: 'ecartsTheo', width: 12 },
        { header: 'Belote', key: 'belote', width: 10 },
        { header: 'Remarques', key: 'remarques', width: 15 },
        { header: 'Points', key: 'points', width: 10 },
        { header: 'Total', key: 'total', width: 10 }
      ];
      
      sheet2.getRow(1).font = { bold: true };
      sheet2.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE34234' }
      };
      sheet2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      
      let totalE2 = 0;
      gameState.team2Rows.forEach(row => {
        totalE2 += parseInt(row.Points.replace('<div style="color: ', '').split('">')[1] || '0');
        sheet2.addRow({
          mene: row.Mène,
          contrat: row.Contrat.replace(/<[^>]*>/g, ''),
          chute: row.Chute.replace(/<[^>]*>/g, ''),
          realise: row.Réalisé.replace(/<[^>]*>/g, ''),
          ecart: row.Ecart.replace(/<[^>]*>/g, ''),
          ecartsTheo: row["Ecarts Théo"].replace(/<[^>]*>/g, ''),
          belote: row.Belote.replace(/<[^>]*>/g, ''),
          remarques: row.Remarques.replace(/<[^>]*>/g, ''),
          points: row.Points.replace(/<[^>]*>/g, ''),
          total: row.Total.text
        });
      });
      
      const summarySheet = workbook.addWorksheet('Résumé');
      summarySheet.columns = [
        { header: 'Équipe', key: 'equipe', width: 20 },
        { header: 'Score', key: 'score', width: 10 },
      ];
      
      summarySheet.addRow({ equipe: gameState.team1Name, score: gameState.team1Score });
      summarySheet.addRow({ equipe: gameState.team2Name, score: gameState.team2Score });
      
      summarySheet.getRow(1).font = { bold: true };
      summarySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4682B4' }
      };
      summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      
      const winner = gameState.team1Score > gameState.team2Score ? gameState.team1Name : gameState.team2Name;
      summarySheet.getCell('A4').value = 'Vainqueur';
      summarySheet.getCell('B4').value = winner;
      summarySheet.getCell('B4').font = { bold: true, color: { argb: 'FF008000' } };
      
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, `Belote_${gameState.team1Name}_vs_${gameState.team2Name}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
      toast.success("Fichier Excel sauvegardé !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du fichier Excel:", error);
      toast.error("Erreur lors de la sauvegarde du fichier Excel");
    }
  };

  // Fonction pour fermer l'alerte de victoire
  const handleCloseWinnerAlert = async () => {
    if (gameState.team1Winner || gameState.team2Winner) {
      const winnerTeam = gameState.team1Winner ? gameState.team1Name : gameState.team2Name;
      const loserTeam = gameState.team1Winner ? gameState.team2Name : gameState.team1Name;
      
      const winnerPlayers = winnerTeam.includes('/') ? winnerTeam.split('/') : [];
      const loserPlayers = loserTeam.includes('/') ? loserTeam.split('/') : [];
      
      // Calculer les bonus/malus
      const calculation = bonusMalus.calculateBonusMalus(
        gameState.data, 
        gameState.team1Name, 
        gameState.team2Name, 
        gameState.team1Score, 
        gameState.team2Score
      );
      
      const isTeam1Winner = gameState.team1Winner;
      await teamStats.recordVictory(
        winnerTeam, 
        loserTeam, 
        winnerPlayers, 
        loserPlayers,
        isTeam1Winner ? calculation.team2Chutes : calculation.team1Chutes,
        isTeam1Winner ? calculation.team1EpicerieAlarms : calculation.team2EpicerieAlarms,
        isTeam1Winner ? calculation.team1VousEtesNulsCount : calculation.team2VousEtesNulsCount,
        isTeam1Winner ? calculation.team1Chutes : calculation.team2Chutes
      );
    }
    
    setShowWinnerAlert(false);
  };

  return (
    <div className="container mx-auto px-4 pb-12 max-w-7xl">
      
      
      <header className="py-4 mb-4">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-red-600 text-transparent bg-clip-text">
          Belote - Suivi des Scores
        </h1>
        {!gameState.teamSetupComplete && (
          <p className="text-center text-gray-600 text-sm mt-2 animate-pulse">
            Sélectionner les joueurs pour chaque équipe
          </p>
        )}
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GameSettings victoryPoints={gameState.victoryPoints} setVictoryPoints={gameState.setVictoryPoints} />
        
        <div className="relative">
          <div className="absolute -top-2 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></div>
          <TeamInputForm
            teamName="Équipe 1"
            teamColor="blue"
            contrat={gameState.contratE1}
            setContrat={gameState.setContratE1}
            cardColor={gameState.cardColorE1}
            setCardColor={gameState.setCardColorE1}
            realise={gameState.realiseE1}
            setRealise={gameState.setRealiseE1}
            belote={gameState.beloteE1}
            setBelote={gameState.setBeloteE1}
            remarque={gameState.remarqueE1}
            setRemarque={gameState.setRemarqueE1}
            selectedPlayer1={gameState.team1Player1}
            selectedPlayer2={gameState.team1Player2}
            onPlayer1Change={gameState.setTeam1Player1}
            onPlayer2Change={gameState.setTeam1Player2}
            teamSetupComplete={gameState.teamSetupComplete}
          />
        </div>
        
        <div className="relative">
          <div className="absolute -top-2 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-700 rounded-full"></div>
          <TeamInputForm
            teamName="Équipe 2"
            teamColor="red"
            contrat={gameState.contratE2}
            setContrat={gameState.setContratE2}
            cardColor={gameState.cardColorE2}
            setCardColor={gameState.setCardColorE2}
            realise={gameState.realiseE2}
            setRealise={gameState.setRealiseE2}
            belote={gameState.beloteE2}
            setBelote={gameState.setBeloteE2}
            remarque={gameState.remarqueE2}
            setRemarque={gameState.setRemarqueE2}
            selectedPlayer1={gameState.team2Player1}
            selectedPlayer2={gameState.team2Player2}
            onPlayer1Change={gameState.setTeam2Player1}
            onPlayer2Change={gameState.setTeam2Player2}
            teamSetupComplete={gameState.teamSetupComplete}
          />
        </div>
      </div>
      
      <CurrentGameInfo
        players={gameState.players}
        currentDealer={gameState.currentDealer}
        teamSetupComplete={gameState.teamSetupComplete}
      />
      
      <GameControls
        canAddRound={canAddRound}
        hasData={gameState.data.length > 0}
        teamNamesValid={teamNamesValid}
        teamSetupComplete={gameState.teamSetupComplete}
        onAddRound={handleAddRound}
        onCancelRound={handleCancelRound}
        onSkipTurn={handleSkipTurn}
        onFausseDonne={() => setShowFausseDonne(true)}
        onShowLayoutDialog={() => setShowLayoutDialog(true)}
        onShowStatsDialog={() => setShowStatsDialog(true)}
        onShowValuesDialog={setShowValuesDialog}
        onSaveExcel={handleSaveExcel}
        onRestartGame={handleRestartGame}
        onRevenge={handleRevenge}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        onShowPointsRules={() => setShowPointsRules(true)}
        onShowTournament={tournament.handleShowTournament}
        onShowHistory={() => setShowHistory(true)}
      />
      
      <AlertsDialog
        gameData={gameState.data}
        team1Name={gameState.team1Name}
        team2Name={gameState.team2Name}
        disabled={!gameState.players || gameState.players.length === 0}
      />
      
      <div className="mb-8 animate-in">
        <TotalScores 
          team1Name={gameState.team1Name} 
          team2Name={gameState.team2Name}
          team1Score={gameState.team1Score}
          team2Score={gameState.team2Score}
          team1Winner={gameState.team1Winner}
          team2Winner={gameState.team2Winner}
          victoryPoints={parseInt(gameState.victoryPoints)}
        />
      </div>
      
      <div ref={scoreTablesRef} className="flex flex-col lg:flex-row gap-8 w-full">
  <div className="relative rounded-xl overflow-hidden animate-in w-full lg:w-full" style={{animationDelay: "0.1s"}}>
    <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
    <BeloteTable teamName={gameState.team1Name} rows={gameState.team1Rows} />
  </div>
  <div className="relative rounded-xl overflow-hidden animate-in w-full lg:w-full" style={{animationDelay: "0.2s"}}>
    <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
    <BeloteTable teamName={gameState.team2Name} rows={gameState.team2Rows} />
  </div>
</div>
      
      {renameTeamDialog && (
        <TeamNameDialog
          open={renameTeamDialog.open}
          onClose={() => setRenameTeamDialog(null)}
          teamName={renameTeamDialog.team === 1 ? gameState.team1Name : gameState.team2Name}
          onSave={handleSaveTeamName}
        />
      )}
      
			<PlayerLayout
			  open={showLayoutDialog}
			  onClose={() => setShowLayoutDialog(false)}
			  // On s'assure de passer les noms qui sont ACTUELLEMENT dans le gameState
			  team1Players={[gameState.team1Player1, gameState.team1Player2].filter(Boolean)}
			  team2Players={[gameState.team2Player1, gameState.team2Player2].filter(Boolean)}
			  onSaveLayout={handleSaveLayout}
			  initialPositions={gameState.players}
			  initialDealer={gameState.currentDealer !== null ? gameState.currentDealer : undefined}
			/>
      
      <StatsDialog
        open={showStatsDialog}
        onClose={() => setShowStatsDialog(false)}
        team1Name={gameState.team1Name}
        team2Name={gameState.team2Name}
        data={gameState.data}
      />
      
      {showValuesDialog && (
        <ValuesDialog
          open={!!showValuesDialog}
          onClose={() => setShowValuesDialog(null)}
          type={showValuesDialog}
        />
      )}
      
      <LeaderboardDialog
        open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
      
      <PointsRulesDialog
        open={showPointsRules}
        onClose={() => setShowPointsRules(false)}
      />
      
      {showWinnerAlert && (gameState.team1Winner || gameState.team2Winner) && (
        <WinnerAlert
          winnerTeam={gameState.team1Winner ? gameState.team1Name : gameState.team2Name}
          winnerScore={gameState.team1Winner ? gameState.team1Score : gameState.team2Score}
          loserScore={gameState.team1Winner ? gameState.team2Score : gameState.team1Score}
          bonusMalusDetails={bonusMalus.formatBonusMalusDetails(
            bonusMalus.calculateBonusMalus(gameState.data, gameState.team1Name, gameState.team2Name, gameState.team1Score, gameState.team2Score),
            gameState.team1Name,
            gameState.team2Name,
            gameState.team1Score,
            gameState.team2Score
          )}
          onClose={handleCloseWinnerAlert}
        />
      )}
      
      {gameActions.epicierAlert && gameActions.epicierAlert.show && (
        <EpicierAlert 
          teamName={gameActions.epicierAlert.teamName} 
          ecartTheo={gameActions.epicierAlert.ecartTheo}
          onClose={() => gameActions.setEpicierAlert(null)} 
        />
      )}
      
      {gameActions.vousEtesNulsAlert && gameActions.vousEtesNulsAlert.show && (
        <VousEtesNulsAlert 
          onClose={() => gameActions.setVousEtesNulsAlert(null)} 
        />
      )}
      
      {gameActions.laChatteAlert && gameActions.laChatteAlert.show && (
        <LaChatteAlert 
          onClose={() => gameActions.setLaChatteAlert(null)} 
        />
      )}
      
      <TournamentDialog
        open={tournament.showTournamentDialog}
        onClose={tournament.handleCloseTournament}
      />
      
      <GameHistoryDialog
        open={showHistory}
        onOpenChange={setShowHistory}
        history={gameHistory.history}
        onDeleteGame={gameHistory.deleteGame}
        onClearHistory={gameHistory.clearHistory}
      />
      
      <FausseDonneDialog
        open={showFausseDonne}
        onClose={() => setShowFausseDonne(false)}
        onSelectTeam={handleFausseDonne}
        team1Name={gameState.team1Name}
        team2Name={gameState.team2Name}
      />
    </div>
  );
};

export default BeloteApp;
