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
  const selectedPlayers = [...team1Players, ...team2Players].filter(Boolean);
  
  // Initialisation des états
  const [positions, setPositions] = useState<(string | null)[]>([null, null, null, null]);
  const [dealer, setDealer] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // Si on a des données sauvegardées en base de données, on les charge
      if (initialPositions && initialPositions.length === 4 && initialPositions.every(p => p !== null)) {
        setPositions([...initialPositions]);
        if (initialDealer !== undefined && initialPositions[initialDealer]) {
          setDealer(initialPositions[initialDealer]);
        }
      } 
      // Sinon, si l'état local est vide, on propose la liste brute par défaut
      else if (positions.every(p => p === null) && selectedPlayers.length === 4) {
        setPositions(selectedPlayers);
      }
    }
    // Note: On ne met pas positions dans les dépendances pour éviter les boucles de reset
  }, [open, initialPositions, initialDealer]);

  // Fonction pour filtrer les joueurs déjà choisis dans les autres listes
  const getAvailablePlayersForPosition = (currentIndex: number) => {
    const otherSelectedPlayers = positions.filter((p, idx) => idx !== currentIndex && p !== null);
    return selectedPlayers.filter(p => !otherSelectedPlayers.includes(p));
  };

  const handlePositionChange = (index: number, player: string) => {
    const newPositions = [...positions];
    newPositions[index] = player;
    setPositions(newPositions);
    
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
          {[0, 1, 2, 3].map((idx) => {
            // Placement visuel : 0:HG, 1:HD, 2:BG, 3:BD
            const gridClass = idx === 2 ? "col-start-1 row-start-3" : idx === 3 ? "col-start-3 row-start-3" : "";
            const label = ["Haut Gauche", "Haut Droit", "Bas Gauche", "Bas Droit"][idx];
            
            return (
              <React.Fragment key={idx}>
                {idx === 1 && <div></div>}
                <div className={`flex flex-col items-center ${gridClass}`}>
                  <Label className="mb-2 text-xs text-muted-foreground text-center">{label}</Label>
                  <Select 
                    value={positions[idx] || ''} 
                    onValueChange={(value) => handlePositionChange(idx, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePlayersForPosition(idx).map((player) => (
                        <SelectItem key={`pos${idx}-${player}`} value={player}>
                          {player}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {idx === 2 && <div></div>}
              </React.Fragment>
            );
          })}
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