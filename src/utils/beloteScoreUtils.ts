
import { BELOTE_ANNONCES, BeloteAnnonce, Remarque } from "@/types/belote";

export const calculerEcart = (contrat: number, realise: number | null): number => {
  return contrat > 0 && realise !== null ? Math.abs(contrat - realise) : 0;
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
  
  // Vérifier si c'est un vrai capot/générale (160 points avec label "Capot" ou "Générale") ou juste 160 points normaux
  const isRealCapot = realise === totalPoints && (realiseLabel === "Capot" || realiseLabel === "Générale");
  const isRealCapotAdverse = realiseAdverse === totalPoints && (realiseLabelAdverse === "Capot" || realiseLabelAdverse === "Générale");
  
  // Correction du calcul de chute pour inclure les contrats Capot et Générale
  const chute = (realise !== null && contrat > 0 && (
    (realise < 80) || // Chute classique : moins de 80 points
    (contrat >= 500 && realise < totalPoints) || // Chute Capot/Générale : ne pas faire 160
    (contrat < 500 && realise + belote < contrat) // Chute contrat normal
  )) ? 1 : 0;

  // Déterminer si coinche ou surcoinche est active
  let coincheActive = "N/A";
  if (remarque === "Sur Coinche" || remarqueAdverse === "Sur Coinche") {
    coincheActive = "Sur Coinche";
  } else if (remarque === "Coinche" || remarqueAdverse === "Coinche") {
    coincheActive = "Coinche";
  }

  const multiplier = coincheActive === "Sur Coinche" ? 4 : coincheActive === "Coinche" ? 2 : 1;

  // Cas où l'équipe n'a pas de contrat (contrat = 0)
  if (contrat === 0) {
    if (contratAdverse > 0) {
      // Si l'équipe adverse a fait un capot ou une générale (vérifier que c'est un vrai capot)
      if (contratAdverse >= 500 && isRealCapotAdverse) {
        return [remarque !== "Coinche" && remarque !== "Sur Coinche" ? belote : 0, 0];
      }
      
      // Cas spécial : "0 mais pas capot" - l'équipe qui a pris fait 160 mais sans bonus capot
      if (realiseLabelAdverse === "0 mais pas capot" && realiseAdverse === 0) {
        // L'équipe qui n'a pas pris marque 0 + belote
        return [belote, chute];
      }
      
      // Calcul de chute pour l'équipe adverse (correction appliquée)
      const chuteAdverse = (realiseAdverse !== null && contratAdverse > 0 && (
        (realiseAdverse < 80) || 
        (contratAdverse >= 500 && realiseAdverse < totalPoints) || 
        (contratAdverse < 500 && realiseAdverse + beloteAdverse < contratAdverse)
      )) ? 1 : 0;
      
      // Si l'équipe adverse chute sans coinche
      if (chuteAdverse && coincheActive === "N/A") {
        // Nouveaux points pour chute Capot/Générale
        if (contratAdverse === 500) {
          // Capot : 250 + 160 au lieu de 500 + 160
          return [250 + 160 + belote, chute];
        } else if (contratAdverse === 1000) {
          // Générale : 500 + 160 au lieu de 1000 + 160
          return [500 + 160 + belote, chute];
        }
        return [160 + contratAdverse + belote, chute];
      }
      // Si l'équipe adverse chute et il y a coinche de l'équipe principale
      else if (chuteAdverse && (remarque === "Coinche" || remarque === "Sur Coinche")) {
        // Nouveaux points pour chute Capot/Générale avec coinche
        if (contratAdverse === 500) {
          // Capot avec coinche : (250 + 160) × multiplier
          return [(multiplier * 250) + 160, chute];
        } else if (contratAdverse === 1000) {
          // Générale avec coinche : (500 + 160) × multiplier
          return [(multiplier * 500) + 160, chute];
        }
        return [(multiplier * contratAdverse) + 160, chute];
      }
      // Si l'équipe adverse réalise son contrat et il y a coinche de l'équipe principale
      else if (realiseAdverse !== null && !chuteAdverse && 
              (remarque === "Coinche" || remarque === "Sur Coinche") && realiseAdverse >= 80) {
        return [belote, chute];
      }
      
      // Cas normal où l'équipe adverse a un contrat
      return [realiseAdverse !== null ? totalPoints - realiseAdverse + belote : belote, chute];
    }
    // Aucune équipe n'a de contrat
    return [belote, chute];
  }

  // Cas où l'équipe a annoncé capot ou générale
  if (contrat >= 500) {
    if (isRealCapot) {
      return [(multiplier * contrat) + belote, chute];
    }
    return [belote, chute];
  }
  
  // Cas spécial : l'équipe adverse a sélectionné "0 mais pas capot"
  // Cela signifie que l'équipe courante a fait 160 points SANS bonus capot
  if (realiseLabelAdverse === "0 mais pas capot" && realise === totalPoints && contrat > 0 && contrat < 500) {
    // Calcul normal sans bonus capot : contrat + 160 + belote
    if (remarqueAdverse === "Coinche" || remarqueAdverse === "Sur Coinche") {
      // Si coinché/surcoiché par l'équipe adverse
      return [(multiplier * contrat) + realise + belote, chute];
    }
    // Cas normal
    return [contrat + realise + belote, chute];
  }
  
  // Cas spécial : l'équipe courante a sélectionné "0 mais pas capot"
  if (realiseLabel === "0 mais pas capot" && realise === 0 && contrat === 0) {
    // L'équipe qui n'a pas pris et a fait 0 points
    return [belote, chute];
  }

  // Cas où l'équipe a un contrat et l'équipe adverse a coinché/surcoiché
  if (contrat > 0 && (remarqueAdverse === "Coinche" || remarqueAdverse === "Sur Coinche")) {
    if (realise !== null && realise >= 80 && realise + belote >= contrat) {
      return [(multiplier * contrat) + realise + belote, chute];
    }
    return [belote, chute];
  }

  // Cas standard où l'équipe a un contrat
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
  // Pour assurer une symétrie complète entre les deux équipes, nous inversons simplement les paramètres
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

export const calculerPointsTheoriques = (contrat: number, realise: number | null, belote: number): number => {
  if (contrat === 0) return 0;
  return contrat >= 500 && realise === 160 ? contrat + belote : (realise !== null ? realise + belote : belote);
};
