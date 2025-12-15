
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Users, Trophy, Settings, FileUp, Edit } from "lucide-react";
import * as XLSX from 'xlsx';
import { TournamentTeamsList } from './TournamentTeamsList';
import { TournamentMatches } from './TournamentMatches';
import { ManualTeamEntry } from './ManualTeamEntry';

interface TournamentDialogProps {
  open: boolean;
  onClose: () => void;
}

export interface Team {
  id: string;
  player1: string;
  player2: string;
  colorIndex?: number;
}

export interface Match {
  id: string;
  team1: Team;
  team2: Team;
}

export interface MatchRound {
  roundNumber: number;
  matches: Match[];
}

const TournamentDialog: React.FC<TournamentDialogProps> = ({ open, onClose }) => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matchRounds, setMatchRounds] = useState<MatchRound[]>([]);
  const [step, setStep] = useState<'format' | 'mode' | 'upload' | 'manual' | 'teams' | 'matches'>('format');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Fichier sélectionné:', file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Chercher spécifiquement la feuille "Participants"
        const participantsSheet = workbook.Sheets['Participants'];
        if (!participantsSheet) {
          alert('La feuille "Participants" n\'a pas été trouvée dans le fichier Excel.');
          return;
        }
        
        // Lire à partir de B2
        const participantList: string[] = [];
        let row = 2;
        
        while (row <= 50) { // Limite à 50 lignes pour éviter une boucle infinie
          const cellAddress = `B${row}`;
          const cell = participantsSheet[cellAddress];
          
          console.log(`Ligne ${row}:`, {
            cellExists: !!cell,
            cellValue: cell?.v,
            cellValueType: typeof cell?.v,
            cellValueString: cell?.v?.toString(),
            cellValueTrimmed: cell?.v?.toString()?.trim(),
            cellValueLength: cell?.v?.toString()?.trim()?.length
          });
          
          // Vérifier si la cellule est vraiment vide ou ne contient que des espaces
          if (!cell || !cell.v || 
              cell.v.toString().trim() === '' || 
              cell.v.toString().trim().length === 0) {
            row++;
            continue;
          }
          
          const participant = cell.v.toString().trim();
          // Ne compter que les participants qui ont un nom non vide
          if (participant && participant.length > 0) {
            console.log(`Participant ajouté: "${participant}"`);
            participantList.push(participant);
          }
          
          row++;
        }
        
        // Arrêter la boucle après avoir vérifié jusqu'à la ligne 50

         console.log('Participants trouvés:', participantList);
         console.log('Nombre de participants:', participantList.length);

         // Vérifier que le nombre est pair
        if (participantList.length % 2 !== 0) {
          alert(`Le nombre de participants (${participantList.length}) doit être pair pour former des équipes.`);
          return;
        }

        if (participantList.length < 4) {
          alert('Il faut au moins 4 participants pour organiser un tournoi.');
          return;
        }

        setParticipants(participantList);
        generateTeams(participantList);
      } catch (error) {
        console.error('Erreur lors de la lecture du fichier:', error);
        alert('Erreur lors de la lecture du fichier Excel.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const generateTeams = (participantList: string[]) => {
    const shuffled = [...participantList].sort(() => Math.random() - 0.5);
    const generatedTeams: Team[] = [];
    
    for (let i = 0; i < shuffled.length; i += 2) {
      generatedTeams.push({
        id: `team-${i/2 + 1}`,
        player1: shuffled[i],
        player2: shuffled[i + 1],
        colorIndex: i/2
      });
    }
    
    setTeams(generatedTeams);
    setStep('teams');
  };

  const generateMatches = () => {
    if (teams.length < 2) return;

    const rounds: MatchRound[] = [];
    const usedPairs = new Set<string>();
    const matchesPerRound = Math.floor(teams.length / 2);

    // Générer exactement 3 rounds avec exactement matchesPerRound matchs chacun
    for (let round = 1; round <= 3; round++) {
      const roundMatches: Match[] = [];
      const usedInThisRound = new Set<string>();
      
      // Première passe : essayer sans doublons
      const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < shuffledTeams.length - 1 && roundMatches.length < matchesPerRound; i++) {
        if (usedInThisRound.has(shuffledTeams[i].id)) continue;
        
        for (let j = i + 1; j < shuffledTeams.length; j++) {
          if (usedInThisRound.has(shuffledTeams[j].id)) continue;
          
          const team1 = shuffledTeams[i];
          const team2 = shuffledTeams[j];
          const pairKey1 = `${team1.id}-${team2.id}`;
          const pairKey2 = `${team2.id}-${team1.id}`;
          
          // Préférer les paires qui n'ont pas encore joué
          if (!usedPairs.has(pairKey1) && !usedPairs.has(pairKey2)) {
            roundMatches.push({
              id: `match-${round}-${roundMatches.length + 1}`,
              team1,
              team2
            });
            
            usedInThisRound.add(team1.id);
            usedInThisRound.add(team2.id);
            usedPairs.add(pairKey1);
            usedPairs.add(pairKey2);
            break;
          }
        }
      }
      
      // Deuxième passe : compléter avec n'importe quelle paire disponible si nécessaire
      if (roundMatches.length < matchesPerRound) {
        const availableTeams = teams.filter(team => !usedInThisRound.has(team.id));
        
        for (let i = 0; i < availableTeams.length - 1 && roundMatches.length < matchesPerRound; i++) {
          for (let j = i + 1; j < availableTeams.length && roundMatches.length < matchesPerRound; j++) {
            const team1 = availableTeams[i];
            const team2 = availableTeams[j];
            const pairKey1 = `${team1.id}-${team2.id}`;
            const pairKey2 = `${team2.id}-${team1.id}`;
            
            // Vérifier que cette paire n'a pas encore joué
            if (!usedPairs.has(pairKey1) && !usedPairs.has(pairKey2)) {
              roundMatches.push({
                id: `match-${round}-${roundMatches.length + 1}`,
                team1,
                team2
              });
              
              usedInThisRound.add(team1.id);
              usedInThisRound.add(team2.id);
              usedPairs.add(pairKey1);
              usedPairs.add(pairKey2);
            }
          }
        }
      }
      
      // Troisième passe : compléter avec les équipes restantes en acceptant les doublons si nécessaire
      while (roundMatches.length < matchesPerRound && teams.length >= 2) {
        const remainingTeams = teams.filter(team => !usedInThisRound.has(team.id));
        if (remainingTeams.length >= 2) {
          const team1 = remainingTeams[0];
          const team2 = remainingTeams[1];
          const pairKey1 = `${team1.id}-${team2.id}`;
          const pairKey2 = `${team2.id}-${team1.id}`;
          
          roundMatches.push({
            id: `match-${round}-${roundMatches.length + 1}`,
            team1,
            team2
          });
          
          usedInThisRound.add(team1.id);
          usedInThisRound.add(team2.id);
          
          // Marquer cette paire comme utilisée pour les prochains rounds
          usedPairs.add(pairKey1);
          usedPairs.add(pairKey2);
        } else {
          break; // Plus assez d'équipes disponibles
        }
      }
      
      rounds.push({
        roundNumber: round,
        matches: roundMatches
      });
    }

    setMatchRounds(rounds);
    setStep('matches');
  };

  const handleManualTeams = (manualTeams: Team[]) => {
    setTeams(manualTeams);
    setStep('teams');
  };

  const resetTournament = () => {
    setParticipants([]);
    setTeams([]);
    setMatchRounds([]);
    setStep('format');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Tournoi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {step === 'format' && (
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Choisissez le format de tournoi</h3>
                <p className="text-gray-600">Sélectionnez le type de tournoi que vous souhaitez organiser</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2 text-gray-400 cursor-not-allowed"
                  disabled
                >
                  <Settings className="h-8 w-8" />
                  <span className="font-medium">Format Classique</span>
                  <span className="text-xs text-gray-400">Bientôt disponible</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary"
                  onClick={() => setStep('mode')}
                >
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <span className="font-medium">Format Ligue des Champions</span>
                  <span className="text-xs text-gray-600">Tournoi par équipes</span>
                </Button>
              </div>
            </div>
          )}

          {step === 'mode' && (
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Mode de composition des équipes</h3>
                <p className="text-gray-600">Comment souhaitez-vous créer les équipes ?</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary"
                  onClick={() => setStep('upload')}
                >
                  <FileUp className="h-8 w-8 text-blue-500" />
                  <span className="font-medium">Automatique</span>
                  <span className="text-xs text-gray-600">Importer depuis un fichier Excel</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary"
                  onClick={() => setStep('manual')}
                >
                  <Edit className="h-8 w-8 text-green-500" />
                  <span className="font-medium">Manuel</span>
                  <span className="text-xs text-gray-600">Saisir les équipes manuellement</span>
                </Button>
              </div>
              <Button variant="ghost" onClick={() => setStep('format')}>
                ← Retour aux formats
              </Button>
            </div>
          )}

          {step === 'upload' && (
            <div className="text-center space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Composition automatique des équipes</h3>
                <p className="text-gray-600 mb-4">
                  Sélectionnez un fichier Excel avec les participants listés dans la feuille "Participants" à partir de la cellule B2
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild className="shadow-md">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Charger le fichier Excel
                  </label>
                </Button>
              </div>
              <Button variant="ghost" onClick={() => setStep('mode')}>
                ← Retour aux modes
              </Button>
            </div>
          )}

          {step === 'manual' && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Saisie manuelle des équipes</h3>
                <p className="text-gray-600">Créez vos équipes en saisissant deux joueurs par équipe</p>
              </div>
              <ManualTeamEntry onTeamsCreated={handleManualTeams} />
              <div className="text-center">
                <Button variant="ghost" onClick={() => setStep('mode')}>
                  ← Retour aux modes
                </Button>
              </div>
            </div>
          )}

          {step === 'teams' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants et Équipes
                </h3>
                <Button onClick={resetTournament} variant="outline" size="sm">
                  Recommencer
                </Button>
              </div>
              
              <TournamentTeamsList 
                participants={participants} 
                teams={teams} 
              />
              
              <div className="flex justify-center pt-4">
                <Button onClick={generateMatches} className="shadow-md">
                  <Trophy className="mr-2 h-4 w-4" />
                  Générer les Matchs
                </Button>
              </div>
            </div>
          )}

          {step === 'matches' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Matchs du Tournoi
                </h3>
                <Button onClick={resetTournament} variant="outline" size="sm">
                  Recommencer
                </Button>
              </div>
              
              <TournamentMatches matchRounds={matchRounds} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentDialog;
