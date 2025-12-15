
import { useState } from 'react';
import { BeloteAnnonce, Contrat, Realise, Remarque, BeloteRow, DisplayRow } from '@/types/belote';

export const useGameState = () => {
  // États pour les joueurs individuels
  const [team1Player1, setTeam1Player1] = useState<string>("");
  const [team1Player2, setTeam1Player2] = useState<string>("");
  const [team2Player1, setTeam2Player1] = useState<string>("");
  const [team2Player2, setTeam2Player2] = useState<string>("");

  // États dérivés pour les noms d'équipe (basés sur les joueurs sélectionnés)
  const team1Name = team1Player1 && team1Player2 ? `${team1Player1}/${team1Player2}` : "Équipe 1";
  const team2Name = team2Player1 && team2Player2 ? `${team2Player1}/${team2Player2}` : "Équipe 2";
  
  // États pour les entrées
  const [contratE1, setContratE1] = useState<Contrat>("0");
  const [cardColorE1, setCardColorE1] = useState<string>("");
  const [realiseE1, setRealiseE1] = useState<Realise>("0");
  const [beloteE1, setBeloteE1] = useState<BeloteAnnonce>("N/A");
  const [remarqueE1, setRemarqueE1] = useState<Remarque>("N/A");
  
  const [contratE2, setContratE2] = useState<Contrat>("0");
  const [cardColorE2, setCardColorE2] = useState<string>("");
  const [realiseE2, setRealiseE2] = useState<Realise>("0");
  const [beloteE2, setBeloteE2] = useState<BeloteAnnonce>("N/A");
  const [remarqueE2, setRemarqueE2] = useState<Remarque>("N/A");
  
  // États pour les données de jeu
  const [data, setData] = useState<BeloteRow[]>([]);
  const [victoryPoints, setVictoryPoints] = useState<string>("2000");

  // États pour le jeu
  const [players, setPlayers] = useState<string[]>([]);
  const [currentDealer, setCurrentDealer] = useState<number | null>(null);
  const [teamSetupComplete, setTeamSetupComplete] = useState<boolean>(false);
  
  // États pour le tableau d'affichage
  const [team1Rows, setTeam1Rows] = useState<DisplayRow[]>([]);
  const [team2Rows, setTeam2Rows] = useState<DisplayRow[]>([]);

  // États pour les scores
  const [team1Score, setTeam1Score] = useState<number>(0);
  const [team2Score, setTeam2Score] = useState<number>(0);
  const [team1Winner, setTeam1Winner] = useState<boolean>(false);
  const [team2Winner, setTeam2Winner] = useState<boolean>(false);

  // Fonction pour réinitialiser les entrées
  const resetInputs = () => {
    setContratE1("0");
    setCardColorE1("");
    setRealiseE1("0");
    setBeloteE1("N/A");
    setRemarqueE1("N/A");
    setContratE2("0");
    setCardColorE2("");
    setRealiseE2("0");
    setBeloteE2("N/A");
    setRemarqueE2("N/A");
  };

  // Fonction pour redémarrer la partie
  const resetGame = () => {
    setData([]);
    setTeam1Rows([]);
    setTeam2Rows([]);
    setTeam1Player1("");
    setTeam1Player2("");
    setTeam2Player1("");
    setTeam2Player2("");
    setTeam1Score(0);
    setTeam2Score(0);
    setTeam1Winner(false);
    setTeam2Winner(false);
    setPlayers([]);
    setCurrentDealer(null);
    setTeamSetupComplete(false);
    resetInputs();
  };

  return {
    // Team players
    team1Player1, setTeam1Player1,
    team1Player2, setTeam1Player2,
    team2Player1, setTeam2Player1,
    team2Player2, setTeam2Player2,
    
    // Team names (derived)
    team1Name,
    team2Name,
    
    // Team 1 inputs
    contratE1, setContratE1,
    cardColorE1, setCardColorE1,
    realiseE1, setRealiseE1,
    beloteE1, setBeloteE1,
    remarqueE1, setRemarqueE1,
    
    // Team 2 inputs
    contratE2, setContratE2,
    cardColorE2, setCardColorE2,
    realiseE2, setRealiseE2,
    beloteE2, setBeloteE2,
    remarqueE2, setRemarqueE2,
    
    // Game data
    data, setData,
    victoryPoints, setVictoryPoints,
    
    // Players
    players, setPlayers,
    currentDealer, setCurrentDealer,
    teamSetupComplete, setTeamSetupComplete,
    
    // Display tables
    team1Rows, setTeam1Rows,
    team2Rows, setTeam2Rows,
    
    // Scores
    team1Score, setTeam1Score,
    team2Score, setTeam2Score,
    team1Winner, setTeam1Winner,
    team2Winner, setTeam2Winner,
    
    // Actions
    resetInputs,
    resetGame,
  };
};
