import { BeloteRow } from '@/types/belote';
import { BonusMalusCalculation } from '@/types/bonusMalus';

export const calculateBonusMalus = (
  gameData: BeloteRow[],
  team1Name: string,
  team2Name: string,
  team1Score: number,
  team2Score: number
): BonusMalusCalculation => {
  let team1Chutes = 0;
  let team2Chutes = 0;
  let team1EpicerieAlarms = 0;
  let team2EpicerieAlarms = 0;
  let team1VousEtesNulsCount = 0;
  let team2VousEtesNulsCount = 0;

  // Compter les chutes et autres alarmes
  gameData.forEach((row) => {
    // Compter les chutes
    if (row.Chute === 1) {
      team1Chutes++;
    }
    if (row.Chute_E2 === 1) {
      team2Chutes++;
    }

    // Compter les alarmes épicerie
    const epicerieTypes = ['Épicerie', 'Épicerie fine', 'Commerce de gros'];
    const team1HasEpicerie = epicerieTypes.includes(row.Remarques);
    const team2HasEpicerie = epicerieTypes.includes(row.Remarques_E2);
    
    if (team1HasEpicerie) {
      team1EpicerieAlarms++;
      console.log(`Team 1 Épicerie alarm found: ${row.Remarques}, total: ${team1EpicerieAlarms}`);
    }
    if (team2HasEpicerie) {
      team2EpicerieAlarms++;
      console.log(`Team 2 Épicerie alarm found: ${row.Remarques_E2}, total: ${team2EpicerieAlarms}`);
    }

    // Compter les "vous êtes nuls" - l'équipe qui annonce un contrat
    if (row.Remarques === 'Vous êtes nuls') {
      // L'équipe 1 a l'alarme "vous êtes nuls" et elle doit avoir un contrat
      if (row.Contrat > 0) {
        team1VousEtesNulsCount++;
      }
    }
    if (row.Remarques_E2 === 'Vous êtes nuls') {
      // L'équipe 2 a l'alarme "vous êtes nuls" et elle doit avoir un contrat
      if (row.Contrat_E2 > 0) {
        team2VousEtesNulsCount++;
      }
    }
  });

  // Calculer les bonus (au moins 2 chutes adverses = +1 point)
  const team1BonusPoints = team2Chutes >= 2 ? 1 : 0;
  const team2BonusPoints = team1Chutes >= 2 ? 1 : 0;

  // Déterminer l'équipe gagnante
  const team1IsWinner = team1Score > team2Score;
  const team2IsWinner = team2Score > team1Score;

  // Calculer les malus (uniquement pour l'équipe gagnante)
  let team1MalusPoints = 0;
  let team2MalusPoints = 0;

  if (team1IsWinner) {
    // Malus épicerie : toutes les 2 alarmes = -1 point
    const epicerieMalus = Math.floor(team1EpicerieAlarms / 2);
    team1MalusPoints += epicerieMalus;
    console.log(`Team 1 winner - Épicerie alarms: ${team1EpicerieAlarms}, malus: ${epicerieMalus}`);
    // Malus "vous êtes nuls" : -2 points par occurrence
    team1MalusPoints += team1VousEtesNulsCount * 2;
  }

  if (team2IsWinner) {
    // Malus épicerie : toutes les 2 alarmes = -1 point
    const epicerieMalus = Math.floor(team2EpicerieAlarms / 2);
    team2MalusPoints += epicerieMalus;
    console.log(`Team 2 winner - Épicerie alarms: ${team2EpicerieAlarms}, malus: ${epicerieMalus}`);
    // Malus "vous êtes nuls" : -2 points par occurrence
    team2MalusPoints += team2VousEtesNulsCount * 2;
  }

  // Calculer les points finaux
  let team1FinalPoints = 0;
  let team2FinalPoints = 0;

  if (team1IsWinner) {
    team1FinalPoints = 6 + team1BonusPoints - team1MalusPoints;
    team2FinalPoints = 0 + team2BonusPoints; // Pas de malus pour l'équipe perdante
    
    // Score minimum de 2 pour l'équipe gagnante
    if (team1FinalPoints < 2) {
      team1FinalPoints = 2;
    }
  } else if (team2IsWinner) {
    team1FinalPoints = 0 + team1BonusPoints; // Pas de malus pour l'équipe perdante
    team2FinalPoints = 6 + team2BonusPoints - team2MalusPoints;
    
    // Score minimum de 2 pour l'équipe gagnante
    if (team2FinalPoints < 2) {
      team2FinalPoints = 2;
    }
  } else {
    // Match nul (ne devrait pas arriver normalement)
    team1FinalPoints = team1BonusPoints;
    team2FinalPoints = team2BonusPoints;
  }

  return {
    team1Chutes,
    team2Chutes,
    team1EpicerieAlarms,
    team2EpicerieAlarms,
    team1VousEtesNulsCount,
    team2VousEtesNulsCount,
    team1BonusPoints,
    team2BonusPoints,
    team1MalusPoints,
    team2MalusPoints,
    team1FinalPoints,
    team2FinalPoints,
  };
};