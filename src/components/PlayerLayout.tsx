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
  // Liste source des joueurs
  const selectedPlayers = [...team1Players, ...team2Players].filter(Boolean);
  
  // ÉTAT : On initialise strictement à null pour forcer l'utilisateur à choisir
  const [positions, setPositions] = useState<(string | null)[]>([null, null, null, null]);
  const [dealer, setDealer] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // On ne charge QUE si des positions existent déjà en base de données (donc après un F5 ou une sauvegarde)
      // On vérifie que initialPositions contient bien des données et n'est pas juste un tableau vide
      if (initialPositions && initialPositions.length === 4 && initialPositions.some(p => p !== null)) {
        setPositions([...initialPositions]);
        if (initialDealer !== undefined && initialPositions[initialDealer]) {
          setDealer(initialPositions[initialDealer]);
        }
      } else {
        // Nouvelle partie : on force le reset à vide pour éviter toute disposition auto
        setPositions([null, null, null, null]);
        setDealer(null);
      }
    }
  }, [open, initialPositions, initialDealer]);

  // LOGIQUE D'EXCLUSION : Filtre les joueurs pour qu'un nom ne soit utilisé qu'une seule fois
  const getAvailablePlayersForPosition = (currentIndex: number) => {
    // On récupère tous les noms sélectionnés dans les AUTRES cases
    const namesInOtherBoxes = positions.filter((name, idx) => idx !== currentIndex && name !== null);
    // On retourne les joueurs qui ne sont pas dans les autres cases
    return selectedPlayers.filter(player => !namesInOtherBoxes.includes(player));
  };

  const handlePositionChange = (index: number, player: string) => {
    const newPositions = [...positions];
    newPositions[index] = player;
    setPositions(newPositions);
    
    // Reset du donneur si le joueur sélectionné comme donneur n'est plus dans la liste
    if (dealer && !newPositions.includes(dealer)) {
      setDealer(null);
    }
  };

  const handleSave = () => {
    if (positions.some(p => p === null) || !dealer) {
      alert("Veuillez remplir les 4 positions et désigner le premier donneur.");
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
            const gridClass = idx === 2 ? "col-start-1 row-start-3" : idx === 3 ? "col-start-3 row-start-3" : "";
            const labels = ["Haut Gauche", "Haut Droit", "Bas Gauche", "Bas Droit"];
            
            return (
              <React.Fragment key={idx}>
                {idx === 1 && <div></div>}
                <div className={`flex flex-col items-center ${gridClass}`}>
                  <Label className="mb-2 text-xs text-muted-foreground">{labels[idx]}</Label>
                  <Select 
                    value={positions[idx] || undefined} 
                    onValueChange={(val) => handlePositionChange(idx, val)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePlayersForPosition(idx).map((player) => (
                        <SelectItem key={player} value={player}>{player}</SelectItem>
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
          <Label className="font-semibold text-center">Premier Donneur :</Label>
          <Select value={dealer || undefined} onValueChange={setDealer}>
            <SelectTrigger>
              <SelectValue placeholder="Qui donne en premier ?" />
            </SelectTrigger>
            <SelectContent>
              {positions.filter(Boolean).map((player) => (
                <SelectItem key={`dealer-${player}`} value={player!}>{player}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter className="mt-6">
          <Button className="w-full" onClick={handleSave}>Valider la disposition</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerLayout;