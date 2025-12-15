
import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, UndoIcon, Users, BarChart3, BookOpen, Download, RefreshCw, Trophy, SkipForward, History, AlertTriangle } from "lucide-react";

interface GameControlsProps {
  canAddRound: boolean;
  hasData: boolean;
  teamNamesValid: boolean;
  teamSetupComplete: boolean;
  onAddRound: () => void;
  onCancelRound: () => void;
  onSkipTurn: () => void;
  onFausseDonne: () => void;
  onShowLayoutDialog: () => void;
  onShowStatsDialog: () => void;
  onShowValuesDialog: (type: "normal" | "tasa") => void;
  onSaveExcel: () => void;
  onRestartGame: () => void;
  onRevenge: () => void;
  onShowLeaderboard?: () => void;
  onShowPointsRules?: () => void;
  onShowTournament?: () => void;
  onShowHistory?: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  canAddRound,
  hasData,
  teamNamesValid,
  teamSetupComplete,
  onAddRound,
  onCancelRound,
  onSkipTurn,
  onFausseDonne,
  onShowLayoutDialog,
  onShowStatsDialog,
  onShowValuesDialog,
  onSaveExcel,
  onRestartGame,
  onRevenge,
  onShowLeaderboard,
  onShowPointsRules,
  onShowTournament,
  onShowHistory,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      <Button 
        onClick={onAddRound}
        disabled={!canAddRound}
        className="shadow-md h-8 text-xs px-3"
        size="sm"
      >
        <PlusCircle className="mr-1 h-3 w-3" />
        Ajouter Manche
      </Button>
      <Button 
        onClick={onCancelRound}
        variant="outline"
        disabled={!hasData}
        className="shadow-sm h-8 text-xs px-3"
        size="sm"
      >
        <UndoIcon className="mr-1 h-3 w-3" />
        Annuler Manche
      </Button>
      <Button 
        onClick={onSkipTurn}
        variant="outline"
        disabled={!teamSetupComplete}
        className="shadow-sm h-8 text-xs px-3"
        size="sm"
      >
        <SkipForward className="mr-1 h-3 w-3" />
        Passer le tour
      </Button>
      <Button 
        onClick={onFausseDonne}
        variant="outline"
        disabled={!teamSetupComplete}
        className="shadow-sm h-8 text-xs px-3"
        size="sm"
      >
        <AlertTriangle className="mr-1 h-3 w-3" />
        Fausse donne
      </Button>
      <Button 
        onClick={onShowLayoutDialog}
        disabled={!teamNamesValid}
        variant="outline"
        className="shadow-sm h-8 text-xs px-3"
        size="sm"
      >
        <Users className="mr-1 h-3 w-3" />
        Disposition
      </Button>
      <Button 
        onClick={onShowStatsDialog}
        disabled={!hasData}
        variant="outline"
        className="shadow-sm h-8 text-xs px-3"
        size="sm"
      >
        <BarChart3 className="mr-1 h-3 w-3" />
        Statistiques
      </Button>
      <Button 
        onClick={() => onShowValuesDialog("normal")}
        variant="outline"
        className="shadow-sm h-8 text-xs px-3"
        size="sm"
      >
        <BookOpen className="mr-1 h-3 w-3" />
        Points Normal
      </Button>
      <Button 
        onClick={() => onShowValuesDialog("tasa")}
        variant="outline"
        className="shadow-sm h-8 text-xs px-3"
        size="sm"
      >
        <BookOpen className="mr-1 h-3 w-3" />
        Points TA/SA
      </Button>
      <Button 
        onClick={onSaveExcel}
        variant="outline"
        disabled={!hasData}
        className="shadow-sm h-8 text-xs px-3"
        size="sm"
      >
        <Download className="mr-1 h-3 w-3" />
        Excel
      </Button>
      <Button 
        onClick={onRestartGame}
        variant="destructive"
        disabled={!hasData}
        className="shadow-md h-8 text-xs px-3"
        size="sm"
      >
        Redémarrer
      </Button>
      <Button 
        onClick={onRevenge}
        variant="secondary"
        disabled={!teamSetupComplete}
        className="shadow-md h-8 text-xs px-3"
        size="sm"
      >
        <RefreshCw className="mr-1 h-3 w-3" />
        Revanche
      </Button>
      {onShowLeaderboard && (
        <Button 
          onClick={onShowLeaderboard}
          variant="outline"
          className="shadow-md bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700 h-8 text-xs px-3"
          size="sm"
        >
          <Trophy className="mr-1 h-3 w-3" />
          Classement
        </Button>
      )}
      {onShowPointsRules && (
        <Button 
          onClick={onShowPointsRules}
          variant="outline"
          className="shadow-sm h-8 text-xs px-3"
          size="sm"
        >
          <BookOpen className="mr-1 h-3 w-3" />
          Règles
        </Button>
      )}
      {onShowTournament && (
        <Button 
          onClick={onShowTournament}
          variant="outline"
          className="shadow-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 h-8 text-xs px-3"
          size="sm"
        >
          <Trophy className="mr-1 h-3 w-3" />
          Tournoi
        </Button>
      )}
      {onShowHistory && (
        <Button 
          onClick={onShowHistory}
          variant="outline"
          className="shadow-sm h-8 text-xs px-3"
          size="sm"
        >
          <History className="mr-1 h-3 w-3" />
          Historique
        </Button>
      )}
    </div>
  );
};

export default GameControls;
