
export const getNextDealer = (currentDealer: number): number => {
  // Ordre: HG (0) → HD (1) → BD (3) → BG (2)
  const dealerOrder = [0, 1, 3, 2];
  const currentIndex = dealerOrder.indexOf(currentDealer);
  return dealerOrder[(currentIndex + 1) % 4];
};

export const getPreviousDealer = (currentDealer: number): number => {
  // Ordre: HG (0) → HD (1) → BD (3) → BG (2)
  const dealerOrder = [0, 1, 3, 2];
  const currentIndex = dealerOrder.indexOf(currentDealer);
  return dealerOrder[(currentIndex - 1 + 4) % 4];
};

// Fonctions pour déterminer qui coupe et qui ouvre
export const getCutterIndex = (dealerIndex: number): number => {
  // Le coupeur est le joueur avant le donneur (sens inverse des aiguilles d'une montre)
  return getPreviousDealer(dealerIndex);
};

export const getOpenerIndex = (dealerIndex: number): number => {
  // L'ouvreur est le joueur après le donneur (sens des aiguilles d'une montre)
  return getNextDealer(dealerIndex);
};
