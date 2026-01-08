
// Main utilities entry point file
// Re-export all utilities from specialized files for backward compatibility

export { 
  calculerEcart, 
  calculerPoints, 
  calculerPointsAdverse, 
  calculerPointsTheoriques 
} from './beloteScoreUtils';

export { 
  formatTableCell, 
  createNewBeloteRow 
} from './beloteTableUtils';

export { 
  getNextDealer, 
  getPreviousDealer, 
  getCutterIndex, 
  getOpenerIndex 
} from './beloteGameUtils';
