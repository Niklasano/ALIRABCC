
import React from 'react';
import { getCutterIndex, getOpenerIndex } from '@/utils/beloteUtils';

interface CurrentGameInfoProps {
  players: string[];
  currentDealer: number | null;
  teamSetupComplete: boolean;
}

const CurrentGameInfo: React.FC<CurrentGameInfoProps> = ({
  players,
  currentDealer,
  teamSetupComplete,
}) => {
  const getDealerName = () => {
    return currentDealer !== null && players.length > 0 ? players[currentDealer] : '';
  };
  
  const getCutterName = () => {
    if (currentDealer === null || players.length === 0) return '';
    const cutterIndex = getCutterIndex(currentDealer);
    return players[cutterIndex];
  };
  
  const getOpenerName = () => {
    if (currentDealer === null || players.length === 0) return '';
    const openerIndex = getOpenerIndex(currentDealer);
    return players[openerIndex];
  };

  if (!teamSetupComplete) return null;

  return (
    <div className="text-center mb-6 p-3 glass-card rounded-lg animate-in">
      <div className="flex flex-wrap justify-center items-center gap-4">
        <p className="text-lg font-medium">
          <span className="text-muted-foreground mr-2">Coupe:</span> 
          <span className="font-bold text-primary">{getCutterName()}</span>
        </p>
        <p className="text-lg font-medium">
          <span className="text-muted-foreground mr-2">Donneur actuel:</span> 
          <span className="font-bold text-primary">{getDealerName()}</span>
        </p>
        <p className="text-lg font-medium">
          <span className="text-muted-foreground mr-2">Ouvre:</span> 
          <span className="font-bold text-primary">{getOpenerName()}</span>
        </p>
      </div>
    </div>
  );
};

export default CurrentGameInfo;
