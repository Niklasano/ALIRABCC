import { BELOTE_ANNONCES, BeloteAnnonce, Remarque } from "@/types/belote";

/**
 * Calcul de l'écart :
 * - Si Capot/Générale ANNONCÉ et RÉUSSI : écart = 0
 * - Si Capot NON ANNONCÉ (Vrai Capot) : écart = 500 - contrat (ex: 420)
 * - Si Générale NON ANNONCÉE : écart = 1000 - contrat (ex: 920)
 * - Si 160 points simples : calcul standard abs(160 - contrat) (ex: 80)
 */
export const calculerEcart = (
  contrat: number, 
  realise: number | null, 
  realiseLabel?: string
): number => {
  if (contrat <= 0 || realise === null) return 0;

  // 1. Si le contrat annoncé (Capot/Générale) est réussi, l'écart est 0
  if (contrat === 500 && realise === 160 && realiseLabel === "Capot") return 0;
  if (contrat === 1000 && realise === 160 && realiseLabel === "Générale") return 0;

  // 2. Gestion des bonus non annoncés (Vrai Capot ou Générale)
  if (realise === 160) {
    if (realiseLabel === "Capot") {
      return Math.abs(500 - contrat);
    }
    if (realiseLabel === "Générale") {
      return Math.abs(1000 - contrat);
    }
  }

  // 3. Calcul standard (pour les points simples ou chutes)
  return Math.abs(contrat - realise);
};

export const calculerPoints = (
  contrat: number,
  realise: number | null,
  belote: number,
  remarque: string,
  contratAdverse: number,
  realiseAdverse: number | null,
  beloteAdverse: number,
  remarqueAdverse: string,
  realiseLabel?: string,
  realiseLabelAdverse?: string
): [number, number] => {
  const totalPoints = 160;
  
  const isRealCapot = realise === totalPoints && (realiseLabel === "Capot" || realiseLabel === "Générale");
  const isRealCapotAdverse = realiseAdverse === totalPoints && (realiseLabelAdverse === "Capot" || realiseLabelAdverse === "Générale");
  
  const chute = (realise !== null && contrat > 0 && (
    (realise < 80) || 
    (contrat >= 500 && realise < totalPoints) || 
    (contrat < 500 && realise + belote < contrat)
  )) ? 1 : 0;

  let coincheActive = "N/A";
  if (remarque === "Sur Coinche" || remarqueAdverse === "Sur Coinche") {
    coincheActive = "Sur Coinche";
  } else if (remarque === "Coinche" || remarqueAdverse === "Coinche") {
    coincheActive = "Coinche";
  }

  const multiplier = coincheActive === "Sur Coinche" ? 4 : coincheActive === "Coinche" ? 2 : 1;

  if (contrat === 0) {
    if (contratAdverse > 0) {
      if (contratAdverse >= 500 && isRealCapotAdverse) {
        return [remarque !== "Coinche" && remarque !== "Sur Coinche" ? belote : 0, 0];
      }
      
      if (realiseLabelAdverse === "0 mais pas capot" && realiseAdverse === 0) {
        return [belote, chute];
      }
      
      const chuteAdverse = (realiseAdverse !== null && contratAdverse > 0 && (
        (realiseAdverse < 80) || 
        (contratAdverse >= 500 && realiseAdverse < totalPoints) || 
        (contratAdverse < 500 && realiseAdverse + beloteAdverse < contratAdverse)
      )) ? 1 : 0;
      
      if (chuteAdverse && coincheActive === "N/A") {
        if (contratAdverse === 500) {
          return [250 + 160 + belote, chute];
        } else if (contratAdverse === 1000) {
          return [500 + 160 + belote, chute];
        }
        return [160 + contratAdverse + belote, chute];
      }
      else if (chuteAdverse && (remarque === "Coinche" || remarque === "Sur Coinche")) {
        if (contratAdverse === 500) {
          return [(multiplier * 250) + 160, chute];
        } else if (contratAdverse === 1000) {
          return [(multiplier * 500) + 160, chute];
        }
        return [(multiplier * contratAdverse) + 160, chute];
      }
      else if (realiseAdverse !== null && !chuteAdverse && 
              (remarque === "Coinche" || remarque === "Sur Coinche") && realiseAdverse >= 80) {
        return [belote, chute];
      }
      
      return [realiseAdverse !== null ? totalPoints - realiseAdverse + belote : belote, chute];
    }
    return [belote, chute];
  }

  if (contrat >= 500) {
    if (isRealCapot) {
      return [(multiplier * contrat) + belote, chute];
    }
    return [belote, chute];
  }
  
  if (realiseLabelAdverse === "0 mais pas capot" && realise === totalPoints && contrat > 0 && contrat < 500) {
    if (remarqueAdverse === "Coinche" || remarqueAdverse === "Sur Coinche") {
      return [(multiplier * contrat) + realise + belote, chute];
    }
    return [contrat + realise + belote, chute];
  }
  
  if (realiseLabel === "0 mais pas capot" && realise === 0 && contrat === 0) {
    return [belote, chute];
  }

  if (contrat > 0 && (remarqueAdverse === "Coinche" || remarqueAdverse === "Sur Coinche")) {
    if (realise !== null && realise >= 80 && realise + belote >= contrat) {
      return [(multiplier * contrat) + realise + belote, chute];
    }
    return [belote, chute];
  }

  return [
    (realise !== null && realise + belote >= contrat && realise >= 80) ? 
      contrat + realise + belote : belote,
    chute
  ];
};

export const calculerPointsAdverse = (
  contrat: number,
  realise: number | null,
  belote: number,
  remarque: string,
  contratAdverse: number,
  realiseAdverse: number | null,
  beloteAdverse: number,
  remarqueAdverse: string,
  realiseLabel?: string,
  realiseLabelAdverse?: string
): [number, number] => {
  return calculerPoints(
    contratAdverse,
    realiseAdverse,
    beloteAdverse,
    remarqueAdverse,
    contrat,
    realise,
    belote,
    remarque,
    realiseLabelAdverse,
    realiseLabel
  );
};

export const calculerPointsTheoriques = (
  contrat: number, 
  realise: number | null, 
  belote: number,
  realiseLabel?: string
): number => {
  if (contrat === 0) return 0;
  
  // Pour le cumul, on utilise les paliers 500 et 1000 si le label est présent
  if (realise === 160) {
    if (realiseLabel === "Capot") return 500 + belote;
    if (realiseLabel === "Générale") return 1000 + belote;
  }

  // Cas standard ou Capot/Générale annoncé et réussi
  return (contrat >= 500 && realise === 160) ? contrat + belote : (realise !== null ? realise + belote : belote);
};