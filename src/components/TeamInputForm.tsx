import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Contrat, Realise, BeloteAnnonce, Remarque, CONTRATS, REALISES, BELOTE_ANNONCES, REMARQUES } from "@/types/belote";
import { Club, Diamond, Heart, Spade } from "lucide-react";
import PlayerSelector from './PlayerSelector';

interface TeamInputFormProps {
  teamName: string;
  teamColor: string;
  contrat: Contrat;
  setContrat: (value: Contrat) => void;
  cardColor: string;
  setCardColor: (value: string) => void;
  realise: Realise;
  setRealise: (value: Realise) => void;
  belote: BeloteAnnonce;
  setBelote: (value: BeloteAnnonce) => void;
  remarque: Remarque;
  setRemarque: (value: Remarque) => void;
  selectedPlayer1: string;
  selectedPlayer2: string;
  onPlayer1Change: (player: string) => void;
  onPlayer2Change: (player: string) => void;
  teamSetupComplete?: boolean;
}

const TeamInputForm: React.FC<TeamInputFormProps> = ({
  teamName,
  teamColor,
  contrat,
  setContrat,
  cardColor,
  setCardColor,
  realise,
  setRealise,
  belote,
  setBelote,
  remarque,
  setRemarque,
  selectedPlayer1,
  selectedPlayer2,
  onPlayer1Change,
  onPlayer2Change,
  teamSetupComplete = false
}) => {
  const renderCardColorIcon = (color: string) => {
    switch (color) {
      case "Carreau":
        return <Diamond className="h-4 w-4 text-red-500" />;
      case "Coeur":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "Pique":
        return <Spade className="h-4 w-4 text-foreground" />;
      case "Trèfle":
        return <Club className="h-4 w-4 text-foreground" />;
      default:
        return null;
    }
  };

  // Afficher les noms des joueurs si la disposition est validée et les deux joueurs sont sélectionnés
  const displayTeamName = teamSetupComplete && selectedPlayer1 && selectedPlayer2 
    ? `${selectedPlayer1}/${selectedPlayer2}` 
    : teamName;
  
  return (
    <div className="border rounded-md p-4 bg-card shadow">
      <PlayerSelector
        selectedPlayer1={selectedPlayer1}
        selectedPlayer2={selectedPlayer2}
        onPlayer1Change={onPlayer1Change}
        onPlayer2Change={onPlayer2Change}
        teamColor={teamColor}
        teamName={displayTeamName}
      />
      
      <div className="grid gap-3 mt-4">
        <div className="space-y-1">
          <Label htmlFor={`contrat-${teamName}`}>Contrat :</Label>
          <div className="flex gap-2">
            <div className="flex-grow">
              <Select value={contrat} onValueChange={(value) => setContrat(value as Contrat)}>
                <SelectTrigger id={`contrat-${teamName}`}>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CONTRATS).map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-1/3">
              <Select value={cardColor} onValueChange={(value) => setCardColor(value)}>
                <SelectTrigger id={`cardColor-${teamName}`} className="flex items-center">
                  <SelectValue placeholder="Choisir...">
                    {cardColor && cardColor !== "" && (
                      <div className="flex items-center gap-1">
                        {renderCardColorIcon(cardColor)}
                        <span>{cardColor}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Carreau">
                    <div className="flex items-center gap-1">
                      <Diamond className="h-4 w-4 text-red-500" />
                      <span>Carreau</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Coeur">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>Coeur</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Pique">
                    <div className="flex items-center gap-1">
                      <Spade className="h-4 w-4 text-foreground" />
                      <span>Pique</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Trèfle">
                    <div className="flex items-center gap-1">
                      <Club className="h-4 w-4 text-foreground" />
                      <span>Trèfle</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="TA">TA</SelectItem>
                  <SelectItem value="SA">SA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <Label htmlFor={`realise-${teamName}`}>Réalisé :</Label>
          <Select value={realise} onValueChange={(value) => setRealise(value as Realise)}>
            <SelectTrigger id={`realise-${teamName}`}>
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(REALISES).map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col gap-1">
          <Label htmlFor={`belote-${teamName}`}>Annonce Belote :</Label>
          <Select value={belote} onValueChange={(value) => setBelote(value as BeloteAnnonce)}>
            <SelectTrigger id={`belote-${teamName}`}>
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(BELOTE_ANNONCES).map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col gap-1">
          <Label htmlFor={`remarque-${teamName}`}>Remarque :</Label>
          <Select value={remarque} onValueChange={(value) => setRemarque(value as Remarque)}>
            <SelectTrigger id={`remarque-${teamName}`}>
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(REMARQUES).map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default TeamInputForm;
