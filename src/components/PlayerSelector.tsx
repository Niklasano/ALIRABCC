
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useTeamStats } from '@/hooks/useTeamStats';
import { toast } from "sonner";

interface PlayerSelectorProps {
  selectedPlayer1: string;
  selectedPlayer2: string;
  onPlayer1Change: (player: string) => void;
  onPlayer2Change: (player: string) => void;
  teamColor: string;
  teamName: string;
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  selectedPlayer1,
  selectedPlayer2,
  onPlayer1Change,
  onPlayer2Change,
  teamColor,
  teamName
}) => {
  const [availablePlayers, setAvailablePlayers] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const { getLeaderboard, loading } = useTeamStats();

  // Charger les joueurs disponibles
  const loadPlayers = async () => {
    try {
      const data = await getLeaderboard();
      if (data && data.players) {
        const playerNames = data.players.map((player: any) => player.player_name);
        setAvailablePlayers(playerNames);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des joueurs:', error);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  // Ajouter un nouveau joueur
  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) {
      toast.error("Veuillez saisir un nom de joueur");
      return;
    }

    if (availablePlayers.includes(newPlayerName.trim())) {
      toast.error("Ce joueur existe déjà");
      return;
    }

    try {
      // Créer une entrée temporaire pour le joueur (sera vraiment ajouté lors de la première partie)
      const updatedPlayers = [...availablePlayers, newPlayerName.trim()];
      setAvailablePlayers(updatedPlayers);
      
      toast.success(`Joueur "${newPlayerName.trim()}" ajouté à la liste`);
      setNewPlayerName('');
      setShowAddDialog(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du joueur:', error);
      toast.error("Erreur lors de l'ajout du joueur");
    }
  };

  const getAvailablePlayersForSelect = (currentPlayer: string, otherPlayer: string) => {
    return availablePlayers.filter(player => player !== otherPlayer || player === currentPlayer);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold" style={{ color: teamColor }}>
          {teamName}
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddDialog(true)}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label>Joueur 1 :</Label>
          <Select value={selectedPlayer1} onValueChange={onPlayer1Change}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              {getAvailablePlayersForSelect(selectedPlayer1, selectedPlayer2).map((player) => (
                <SelectItem key={`p1-${player}`} value={player}>
                  {player}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Joueur 2 :</Label>
          <Select value={selectedPlayer2} onValueChange={onPlayer2Change}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              {getAvailablePlayersForSelect(selectedPlayer2, selectedPlayer1).map((player) => (
                <SelectItem key={`p2-${player}`} value={player}>
                  {player}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau joueur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="playerName">Nom du joueur :</Label>
              <Input
                id="playerName"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Entrez le nom du joueur"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddPlayer();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddPlayer} disabled={loading}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerSelector;
