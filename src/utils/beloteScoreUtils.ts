/**
 * Calcul de l'écart pour une mène
 * 
 * Règles:
 * - Contrat chuté → écart = 0
 * - Contrat réussi → écart = réalisé - contrat
 * - Capot/Générale annoncé et réussi → écart = 0
 * - Capot non annoncé (réalisé Capot avec contrat < 500) → écart = 500 - contrat
 * - Générale non annoncée (réalisé Générale avec contrat < 1000) → écart = 1000 - contrat
 */
export const calculerEcart = (
  contrat: number,
  realise: number | null,
  chute: number,
  realiseLabel?: string
): number => {
  if (contrat <= 0 || realise === null) return 0;

  // Si le contrat est chuté, l'écart est 0
  if (chute === 1) return 0;

  // Si Capot annoncé (contrat = 500) et réussi
  if (contrat === 500 && realise === 160 && realiseLabel === "Capot") return 0;

  // Si Générale annoncée (contrat = 1000) et réussie
  if (contrat === 1000 && realise === 160 && realiseLabel === "Générale") return 0;

  // Capot non annoncé (contrat < 500 mais réalisé = Capot)
  if (realise === 160 && realiseLabel === "Capot" && contrat < 500) {
    return 500 - contrat;
  }

  // Générale non annoncée (contrat < 1000 mais réalisé = Générale)
  if (realise === 160 && realiseLabel === "Générale" && contrat < 1000) {
    return 1000 - contrat;
  }

  // Calcul standard : réalisé - contrat
  return realise - contrat;
};

/**
 * Calcul de l'écart théorique pour une mène (valeur à cumuler)
 * 
 * Règles:
 * - Contrat chuté → écart théorique = contrat + valeur du contra (coinche/sur coinche)
 * - Capot chuté → écart théorique = 500
 * - Générale chutée → écart théorique = 1000
 * - Contrat réussi → écart théorique = réalisé - contrat
 */
export const calculerEcartTheorique = (
  contrat: number,
  realise: number | null,
  chute: number,
  remarque: string,
  realiseLabel?: string
): number => {
  if (contrat <= 0 || realise === null) return 0;

  // Valeur du contra
  const contraValue = remarque === "Sur Coinche" ? 100 : remarque === "Coinche" ? 90 : 0;

  // Si le contrat est chuté
  if (chute === 1) {
    // Capot chuté
    if (contrat === 500) return 500;
    // Générale chutée
    if (contrat === 1000) return 1000;
    // Contrat normal chuté
    return contrat + contraValue;
  }

  // Contrat réussi - même logique que calculerEcart
  // Si Capot annoncé (contrat = 500) et réussi
  if (contrat === 500 && realise === 160 && realiseLabel === "Capot") return 0;

  // Si Générale annoncée (contrat = 1000) et réussie
  if (contrat === 1000 && realise === 160 && realiseLabel === "Générale") return 0;

  // Capot non annoncé
  if (realise === 160 && realiseLabel === "Capot" && contrat < 500) {
    return 500 - contrat;
  }

  // Générale non annoncée
  if (realise === 160 && realiseLabel === "Générale" && contrat < 1000) {
    return 1000 - contrat;
  }

  // Calcul standard
  return realise - contrat;
};

/**
 * Calcul des points pour l'équipe qui a proposé le contrat
 */
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
      } else if (chuteAdverse && (remarque === "Coinche" || remarque === "Sur Coinche")) {
        if (contratAdverse === 500) {
          return [(multiplier * 250) + 160, chute];
        } else if (contratAdverse === 1000) {
          return [(multiplier * 500) + 160, chute];
        }
        return [(multiplier * contratAdverse) + 160, chute];
      } else if (realiseAdverse !== null && !chuteAdverse &&
        (remarque === "Coinche" || remarque === "Sur Coinche") &&
        realiseAdverse >= 80) {
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

  if (realise === 160) {
    if (realiseLabel === "Capot") return 500 + belote;
    if (realiseLabel === "Générale") return 1000 + belote;
  }

  return (contrat >= 500 && realise === 160) ? contrat + belote : (realise !== null ? realise + belote : belote);
};
