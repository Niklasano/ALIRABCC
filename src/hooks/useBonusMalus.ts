import { BonusMalusCalculation } from '@/types/bonusMalus';
import { calculateBonusMalus } from '@/utils/bonusMalusCalculator';
import { formatBonusMalusDetails } from '@/utils/bonusMalusFormatter';

export type { BonusMalusCalculation };

export const useBonusMalus = () => {
  return {
    calculateBonusMalus,
    formatBonusMalusDetails,
  };
};