import { BonusMalusCalculation } from '@/types/bonusMalus';

export const formatBonusMalusDetails = (
  calculation: BonusMalusCalculation,
  team1Name: string,
  team2Name: string,
  team1Score: number,
  team2Score: number
): string => {
  const team1IsWinner = team1Score > team2Score;
  const winnerTeam = team1IsWinner ? team1Name : team2Name;
  const winnerCalculation = team1IsWinner ? {
    bonus: calculation.team1BonusPoints,
    malus: calculation.team1MalusPoints,
    final: calculation.team1FinalPoints,
    chutesAdverses: calculation.team2Chutes,
    epicerieAlarms: calculation.team1EpicerieAlarms,
    vousEtesNulsCount: calculation.team1VousEtesNulsCount
  } : {
    bonus: calculation.team2BonusPoints,
    malus: calculation.team2MalusPoints,
    final: calculation.team2FinalPoints,
    chutesAdverses: calculation.team1Chutes,
    epicerieAlarms: calculation.team2EpicerieAlarms,
    vousEtesNulsCount: calculation.team2VousEtesNulsCount
  };

  const loserCalculation = team1IsWinner ? {
    bonus: calculation.team2BonusPoints,
    final: calculation.team2FinalPoints,
    chutesAdverses: calculation.team1Chutes
  } : {
    bonus: calculation.team1BonusPoints,
    final: calculation.team1FinalPoints,
    chutesAdverses: calculation.team2Chutes
  };

  let details = `🏆 Détail des Points\n\n`;
  
  details += `👑 ${winnerTeam} (Gagnant)\n`;
  details += `  ✓ Points de base : 6\n`;
  if (winnerCalculation.bonus > 0) {
    details += `  ✓ Bonus chutes adverses (${winnerCalculation.chutesAdverses} ≥ 2) : +${winnerCalculation.bonus}\n`;
  }
  if (winnerCalculation.malus > 0) {
    const epicerieMalus = Math.floor(winnerCalculation.epicerieAlarms / 2);
    if (epicerieMalus > 0) {
      details += `  ✗ Malus épicerie (${winnerCalculation.epicerieAlarms} alarmes ÷ 2) : -${epicerieMalus}\n`;
    }
    if (winnerCalculation.vousEtesNulsCount > 0) {
      details += `  ✗ Malus "vous êtes nuls" (${winnerCalculation.vousEtesNulsCount} × 2) : -${winnerCalculation.vousEtesNulsCount * 2}\n`;
    }
  }
  details += `  🎯 Total : ${winnerCalculation.final} points\n\n`;

  const loserTeam = team1IsWinner ? team2Name : team1Name;
  details += `😔 ${loserTeam} (Perdant)\n`;
  details += `  ⚪ Points de base : 0\n`;
  if (loserCalculation.bonus > 0) {
    details += `  ✓ Bonus chutes adverses (${loserCalculation.chutesAdverses} ≥ 2) : +${loserCalculation.bonus}\n`;
  }
  details += `  🎯 Total : ${loserCalculation.final} points\n\n`;

  details += `📋 Règles Appliquées\n`;
  details += `  • Victoire : 6 points | Défaite : 0 point\n`;
  details += `  • Bonus : +1 si adversaire chute ≥ 2 fois\n`;
  details += `  • Malus (gagnant seulement) :\n`;
  details += `    - Épicerie : -1 pt/2 alarmes\n`;
  details += `    - "Vous êtes nuls" : -2 pts/occurrence\n`;
  details += `  • Score minimum gagnant : 2 points`;

  return details;
};