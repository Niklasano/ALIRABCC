
import { useState } from 'react';

export const useTournament = () => {
  const [showTournamentDialog, setShowTournamentDialog] = useState(false);

  const handleShowTournament = () => {
    setShowTournamentDialog(true);
  };

  const handleCloseTournament = () => {
    setShowTournamentDialog(false);
  };

  return {
    showTournamentDialog,
    handleShowTournament,
    handleCloseTournament,
  };
};
