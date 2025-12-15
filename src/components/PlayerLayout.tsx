
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PlayerLayoutProps {
  open: boolean;
  onClose: () => void;
  team1Players: string[];
  team2Players: string[];
  onSaveLayout: (positions: string[], dealer: number) => void;
  initialPositions?: string[];
  initialDealer?: number;
}

const PlayerLayout: React.FC<PlayerLayoutProps> = ({
  open,
  onClose,
  team1Players,
  team2Players,
  onSaveLayout,
  initialPositions,
  initialDealer
}) => {
  // Récupérer seulement les 4 joueurs sélectionnés (2 par équipe)
  const selectedPlayers = [...team1Players, ...team2Players].filter(Boolean);
  
  const [positions, setPositions] = useState<(string | null)[]>(
    initialPositions && initialPositions.length === 4 ? [...initialPositions] : [null, null, null, null]
  );
  const [dealer, setDealer] = useState<string | null>(
    initialDealer !== undefined && initialPositions && initialPositions.length === 4 ? initialPositions[initialDealer] : null
  );

  const handlePositionChange = (index: number, player: string) => {
    const newPositions = [...positions];
    newPositions[index] = player;
    setPositions(newPositions);
  };

  const handleSave = () => {
    if (positions.some(p => p === null) || !dealer) {
      alert("Veuillez sélectionner tous les joueurs et le donneur");
      return;
    }

    const dealerIndex = positions.findIndex(p => p === dealer);
    if (dealerIndex === -1) {
      alert("Le donneur doit être l'un des joueurs sélectionnés");
      return;
    }

    onSaveLayout(positions as string[], dealerIndex);
    onClose();
  };

  // Afficher tous les 4 joueurs sélectionnés dans chaque liste déroulante
  const getAvailablePlayers = () => {
    return selectedPlayers;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Disposition des Joueurs</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          {/* Haut Gauche */}
          <div className="flex flex-col items-center">
            <Label className="mb-2">Haut Gauche</Label>
            <Select 
              value={positions[0] || ''} 
              onValueChange={(value) => handlePositionChange(0, value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {getAvailablePlayers().map((player) => (
                  <SelectItem key={`pos0-${player}`} value={player}>
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Vide */}
          <div></div>
          
          {/* Haut Droit */}
          <div className="flex flex-col items-center">
            <Label className="mb-2">Haut Droit</Label>
            <Select 
              value={positions[1] || ''} 
              onValueChange={(value) => handlePositionChange(1, value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {getAvailablePlayers().map((player) => (
                  <SelectItem key={`pos1-${player}`} value={player}>
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Bas Gauche */}
          <div className="flex flex-col items-center col-start-1 row-start-3">
            <Label className="mb-2">Bas Gauche</Label>
            <Select 
              value={positions[2] || ''} 
              onValueChange={(value) => handlePositionChange(2, value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {getAvailablePlayers().map((player) => (
                  <SelectItem key={`pos2-${player}`} value={player}>
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Vide */}
          <div></div>
          
          {/* Bas Droit */}
          <div className="flex flex-col items-center col-start-3 row-start-3">
            <Label className="mb-2">Bas Droit</Label>
            <Select 
              value={positions[3] || ''} 
              onValueChange={(value) => handlePositionChange(3, value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {getAvailablePlayers().map((player) => (
                  <SelectItem key={`pos3-${player}`} value={player}>
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 mt-2">
          <Label htmlFor="dealer">Premier Donneur :</Label>
          <Select 
            value={dealer || ''} 
            onValueChange={setDealer}
          >
            <SelectTrigger id="dealer">
              <SelectValue placeholder="Sélectionner le donneur" />
            </SelectTrigger>
            <SelectContent>
              {positions.filter(Boolean).map((player) => (
                <SelectItem key={`dealer-${player}`} value={player as string}>
                  {player}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter>
          <Button onClick={handleSave}>Valider et quitter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerLayout;
