import React, { useState, useEffect } from 'react';
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
  // Récupérer les 4 joueurs sélectionnés
  const selectedPlayers = [...team1Players, ...team2Players].filter(Boolean);
  
  const [positions, setPositions] = useState<(string | null)[]>(
    initialPositions && initialPositions.length === 4 ? [...initialPositions] : [null, null, null, null]
  );
  const [dealer, setDealer] = useState<string | null>(
    initialDealer !== undefined && initialPositions && initialPositions.length === 4 ? initialPositions[initialDealer] : null
  );

  // Synchronisation des données quand le dialogue s'ouvre ou que les données arrivent
  useEffect(() => {
    if (open) {
      if (initialPositions && initialPositions.length === 4) {
        setPositions([...initialPositions]);
        if (initialDealer !== undefined && initialPositions[initialDealer]) {
          setDealer(initialPositions[initialDealer]);
        }
      } else if (selectedPlayers.length === 4) {
        // Initialisation par défaut si aucune disposition n'existe
        setPositions(selectedPlayers);
      }
    }
  }, [open, initialPositions, initialDealer, team1Players, team2Players]);

  const handlePositionChange = (index: number, player: string) => {
    const newPositions = [...positions];
    newPositions[index] = player;
    setPositions(newPositions);
    
    // Si le donneur actuel n'est plus dans les positions, on le réinitialise
    if (dealer && !newPositions.includes(dealer)) {
      setDealer(null);
    }
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Disposition des Joueurs</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          {/* Haut Gauche */}
          <div className="flex flex-col items-center">
            <Label className="mb-2 text-xs text-muted-foreground text-center">Haut Gauche</Label>
            <Select 
              value={positions[0] || ''} 
              onValueChange={(value) => handlePositionChange(0, value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {selectedPlayers.map((player) => (
                  <SelectItem key={`pos0-${player}`} value={player}>
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div></div>
          
          {/* Haut Droit */}
          <div className="flex flex-col items-center">
            <Label className="mb-2 text-xs text-muted-foreground text-center">Haut Droit</Label>
            <Select 
              value={positions[1] || ''} 
              onValueChange={(value) => handlePositionChange(1, value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {selectedPlayers.map((player) => (
                  <SelectItem key={`pos1-${player}`} value={player}>
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Bas Gauche */}
          <div className="flex flex-col items-center col-start-1 row-start-3">
            <Label className="mb-2 text-xs text-muted-foreground text-center">Bas Gauche</Label>
            <Select 
              value={positions[2] || ''} 
              onValueChange={(value) => handlePositionChange(2, value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {selectedPlayers.map((player) => (
                  <SelectItem key={`pos2-${player}`} value={player}>
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div></div>
          
          {/* Bas Droit */}
          <div className="flex flex-col items-center col-start-3 row-start-3">
            <Label className="mb-2 text-xs text-muted-foreground text-center">Bas Droit</Label>
            <Select 
              value={positions[3] || ''} 
              onValueChange={(value) => handlePositionChange(3, value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {selectedPlayers.map((player) => (
                  <SelectItem key={`pos3-${player}`} value={player}>
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 mt-4 border-t pt-4">
          <Label htmlFor="dealer" className="font-semibold text-center">Premier Donneur :</Label>
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
        
        <DialogFooter className="mt-6">
          <Button className="w-full" onClick={handleSave}>Valider et enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerLayout;