import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Calendar, Trash2, X } from "lucide-react";
import { GameHistoryEntry } from '@/hooks/useGameHistory';
import GameHistorySummary from './GameHistorySummary';

interface GameHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: GameHistoryEntry[];
  onDeleteGame: (id: string) => void;
  onClearHistory: () => void;
}

const GameHistoryDialog: React.FC<GameHistoryDialogProps> = ({
  open,
  onOpenChange,
  history,
  onDeleteGame,
  onClearHistory
}) => {
  const [selectedGame, setSelectedGame] = useState<GameHistoryEntry | null>(null);

  const handleGameClick = (game: GameHistoryEntry) => {
    setSelectedGame(game);
  };

  const handleBack = () => {
    setSelectedGame(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Voulez-vous vraiment supprimer cette partie de l\'historique ?')) {
      onDeleteGame(id);
      if (selectedGame?.id === id) {
        setSelectedGame(null);
      }
    }
  };

  const handleClearAll = () => {
    if (confirm('Voulez-vous vraiment supprimer tout l\'historique ? Cette action est irréversible.')) {
      onClearHistory();
      setSelectedGame(null);
    }
  };

  if (selectedGame) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">{selectedGame.displayName}</DialogTitle>
                <DialogDescription>
                  Tableau récapitulatif de la partie
                </DialogDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleBack}>
                <X className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </div>
          </DialogHeader>
          
          <ScrollArea className="h-[70vh] pr-4">
            <GameHistorySummary game={selectedGame} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Historique des parties</DialogTitle>
          <DialogDescription>
            Les 30 dernières parties jouées
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune partie dans l'historique</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleGameClick(game)}
                  className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{game.date}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-3 h-3 rounded-full bg-team1"></span>
                          <span className="font-medium">{game.team1Name}</span>
                          <span className="text-sm text-muted-foreground">
                            ({game.team1Player1}, {game.team1Player2})
                          </span>
                          <span className="ml-auto font-bold text-blue-600">{game.team1Score}</span>
                          {game.team1Winner && (
                            <Trophy className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-3 h-3 rounded-full bg-team2"></span>
                          <span className="font-medium">{game.team2Name}</span>
                          <span className="text-sm text-muted-foreground">
                            ({game.team2Player1}, {game.team2Player2})
                          </span>
                          <span className="ml-auto font-bold text-red-600">{game.team2Score}</span>
                          {game.team2Winner && (
                            <Trophy className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(game.id, e)}
                      className="ml-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {history.length > 0 && (
          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Vider l'historique
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GameHistoryDialog;
