import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Settings } from 'lucide-react';

interface GameSettingsProps {
  victoryPoints: string;
  setVictoryPoints: (points: string) => void;
}

const GameSettings: React.FC<GameSettingsProps> = ({ victoryPoints, setVictoryPoints }) => {
  return (
    <div className="glass-card rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Paramètres</h3>
      </div>
      
      <div className="flex flex-col gap-2">
        <Label htmlFor="victory-condition" className="text-sm text-muted-foreground">
          Condition de victoire
        </Label>
        <Select value={victoryPoints} onValueChange={setVictoryPoints}>
          <SelectTrigger id="victory-condition" className="w-full">
            <SelectValue placeholder="Points" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1000" className="cursor-pointer">1000 points</SelectItem>
            <SelectItem value="2000" className="cursor-pointer">2000 points</SelectItem>
            <SelectItem value="3000" className="cursor-pointer">3000 points</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="mt-4 text-xs text-center text-muted-foreground">
          ALIRABCC - Sans Le Jeu
        </div>

        {/* Logo placé en dessous du texte et agrandi */}
        <div className="flex justify-center mt-4">
          <img 
            src="/lovable-uploads/88d78836-a013-4b12-bd37-dea6ec9e1b44.png" 
            alt="ALIRABCC Logo" 
            className="h-32 w-auto object-contain" 
          />
        </div>
      </div>
    </div>
  );
};

export default GameSettings;