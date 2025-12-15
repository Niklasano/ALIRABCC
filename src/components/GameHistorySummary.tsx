import React from 'react';
import { GameHistoryEntry } from '@/hooks/useGameHistory';
import BeloteTable from './BeloteTable';
import TotalScores from './TotalScores';
import ScoreEvolutionChart from './ScoreEvolutionChart';

interface GameHistorySummaryProps {
  game: GameHistoryEntry;
}

const GameHistorySummary: React.FC<GameHistorySummaryProps> = ({ game }) => {
  return (
    <div className="space-y-4">
      {/* Total Scores */}
      <TotalScores
        team1Name={game.team1Name}
        team2Name={game.team2Name}
        team1Score={game.team1Score}
        team2Score={game.team2Score}
        team1Winner={game.team1Winner}
        team2Winner={game.team2Winner}
        victoryPoints={parseInt(game.victoryPoints)}
      />

      {/* Score Evolution Chart */}
      {game.data.length > 0 && (
        <ScoreEvolutionChart
          team1Name={game.team1Name}
          team2Name={game.team2Name}
          data={game.data}
          compact
        />
      )}

      {/* Score Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-3">
          <BeloteTable
            teamName={game.team1Name}
            rows={game.team1Rows}
          />
        </div>
        
        <div className="glass-card rounded-xl p-3">
          <BeloteTable
            teamName={game.team2Name}
            rows={game.team2Rows}
          />
        </div>
      </div>

      {/* Game Info */}
      <div className="glass-card rounded-xl p-3">
        <h4 className="font-semibold mb-2 text-sm">Informations</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Date:</span>
            <span className="ml-1 font-medium">{game.date}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Objectif:</span>
            <span className="ml-1 font-medium">{game.victoryPoints}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Mènes:</span>
            <span className="ml-1 font-medium">{game.data.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHistorySummary;
