import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, Users, Check } from "lucide-react";
import { Team } from './TournamentDialog';

interface ManualTeamEntryProps {
  onTeamsCreated: (teams: Team[]) => void;
}

interface TeamInput {
  id: string;
  player1: string;
  player2: string;
}

export const ManualTeamEntry: React.FC<ManualTeamEntryProps> = ({ onTeamsCreated }) => {
  const [teamInputs, setTeamInputs] = useState<TeamInput[]>([
    { id: '1', player1: '', player2: '' },
    { id: '2', player1: '', player2: '' }
  ]);

  const addTeam = () => {
    const newId = (teamInputs.length + 1).toString();
    setTeamInputs([...teamInputs, { id: newId, player1: '', player2: '' }]);
  };

  const removeTeam = (id: string) => {
    if (teamInputs.length > 2) {
      setTeamInputs(teamInputs.filter(team => team.id !== id));
    }
  };

  const updateTeam = (id: string, field: 'player1' | 'player2', value: string) => {
    setTeamInputs(teamInputs.map(team => 
      team.id === id ? { ...team, [field]: value } : team
    ));
  };

  const validateAndCreateTeams = () => {
    // Vérifier que toutes les équipes ont deux joueurs
    const incompleteTeams = teamInputs.filter(team => 
      !team.player1.trim() || !team.player2.trim()
    );
    
    if (incompleteTeams.length > 0) {
      alert('Veuillez renseigner tous les joueurs pour toutes les équipes.');
      return;
    }

    // Vérifier que le nombre d'équipes est pair
    if (teamInputs.length % 2 !== 0) {
      alert(`Le nombre d'équipes (${teamInputs.length}) doit être pair pour organiser un tournoi.`);
      return;
    }

    // Vérifier qu'il y a au moins 2 équipes
    if (teamInputs.length < 2) {
      alert('Il faut au moins 2 équipes pour organiser un tournoi.');
      return;
    }

    // Vérifier qu'il n'y a pas de joueurs en double
    const allPlayers = teamInputs.flatMap(team => [team.player1.trim(), team.player2.trim()]);
    const uniquePlayers = new Set(allPlayers.map(name => name.toLowerCase()));
    
    if (uniquePlayers.size !== allPlayers.length) {
      alert('Chaque joueur ne peut apparaître que dans une seule équipe.');
      return;
    }

    // Créer les équipes
    const teams: Team[] = teamInputs.map(team => ({
      id: `team-${team.id}`,
      player1: team.player1.trim(),
      player2: team.player2.trim()
    }));

    onTeamsCreated(teams);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {teamInputs.map((team, index) => (
          <Card key={team.id} className="relative">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Équipe {index + 1}
                </span>
                {teamInputs.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTeam(team.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Joueur 1</label>
                <Input
                  placeholder="Nom du premier joueur"
                  value={team.player1}
                  onChange={(e) => updateTeam(team.id, 'player1', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Joueur 2</label>
                <Input
                  placeholder="Nom du second joueur"
                  value={team.player2}
                  onChange={(e) => updateTeam(team.id, 'player2', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        <Button 
          variant="outline" 
          onClick={addTeam}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter une équipe
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <p className="text-blue-800">
          <strong>Rappel :</strong> Le nombre d'équipes doit être pair pour organiser un tournoi. 
          Actuellement : {teamInputs.length} équipe{teamInputs.length > 1 ? 's' : ''}
          {teamInputs.length % 2 !== 0 && (
            <span className="text-red-600 font-medium"> (nombre impair !)</span>
          )}
        </p>
      </div>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={validateAndCreateTeams}
          className="flex items-center gap-2 shadow-md"
          disabled={teamInputs.length % 2 !== 0}
        >
          <Check className="h-4 w-4" />
          Valider les équipes
        </Button>
      </div>
    </div>
  );
};