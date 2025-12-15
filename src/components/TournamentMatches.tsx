
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users } from "lucide-react";

interface Team {
  id: string;
  player1: string;
  player2: string;
  colorIndex?: number;
}

interface Match {
  id: string;
  team1: Team;
  team2: Team;
}

interface MatchRound {
  roundNumber: number;
  matches: Match[];
}

interface TournamentMatchesProps {
  matchRounds: MatchRound[];
}

export const TournamentMatches: React.FC<TournamentMatchesProps> = ({ matchRounds }) => {
  // Récupérer toutes les équipes uniques de tous les rounds
  const getAllUniqueTeams = () => {
    const teamsSet = new Set<string>();
    matchRounds.forEach(round => {
      round.matches.forEach(match => {
        teamsSet.add(match.team1.id);
        teamsSet.add(match.team2.id);
      });
    });
    return Array.from(teamsSet).sort(); // Trier pour avoir un ordre consistant
  };

  // Générer des couleurs consistantes pour les équipes
  const generateTeamColors = () => {
    const baseColors = [
      { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', icon: 'text-blue-500' },
      { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700', icon: 'text-red-500' },
      { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700', icon: 'text-green-500' },
      { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700', icon: 'text-purple-500' },
      { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700', icon: 'text-orange-500' },
      { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-700', icon: 'text-indigo-500' },
      { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-700', icon: 'text-pink-500' },
      { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-700', icon: 'text-teal-500' },
      { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700', icon: 'text-yellow-500' },
      { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-700', icon: 'text-cyan-500' },
    ];
    return baseColors;
  };

  const teamColors = generateTeamColors();
  
  // Fonction pour obtenir la couleur d'une équipe spécifique
  const getTeamColor = (team: Team) => {
    // Utiliser l'index de couleur assigné à l'équipe, ou son index dans la liste
    const colorIndex = team.colorIndex ?? parseInt(team.id.split('-')[1]) - 1;
    return teamColors[colorIndex % teamColors.length];
  };

  return (
    <div className="space-y-6">
      {matchRounds.map((round) => (
        <Card key={`round-${round.roundNumber}`} className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Match n°{round.roundNumber}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {round.matches.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                Aucun match disponible pour ce round
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {round.matches.map((match, index) => {
                  const team1Color = getTeamColor(match.team1);
                  const team2Color = getTeamColor(match.team2);
                  
                  return (
                    <div 
                      key={match.id}
                      className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border shadow-sm"
                    >
                      <div className="text-center mb-3">
                        <div className="font-semibold text-gray-700 text-sm">
                          Rencontre {index + 1}
                        </div>
                      </div>
                      
                      {/* Équipe 1 */}
                      <div className={`mb-3 p-3 ${team1Color.bg} rounded-lg border-2 ${team1Color.border} transition-all hover:shadow-md`}>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className={`h-4 w-4 ${team1Color.icon}`} />
                          <span className={`text-xs px-1 py-0.5 rounded ${team1Color.text} bg-white/50 font-bold`}>
                            {match.team1.id.split('-')[1]}
                          </span>
                          <span className={`font-semibold ${team1Color.text}`}>
                            {match.team1.player1}
                          </span>
                          <span className="text-gray-500">+</span>
                          <span className={`font-semibold ${team1Color.text}`}>
                            {match.team1.player2}
                          </span>
                        </div>
                      </div>
                      
                      {/* VS */}
                      <div className="text-center text-gray-600 font-bold text-sm mb-3 bg-white rounded px-2 py-1 border">
                        VS
                      </div>
                      
                      {/* Équipe 2 */}
                      <div className={`p-3 ${team2Color.bg} rounded-lg border-2 ${team2Color.border} transition-all hover:shadow-md`}>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className={`h-4 w-4 ${team2Color.icon}`} />
                          <span className={`text-xs px-1 py-0.5 rounded ${team2Color.text} bg-white/50 font-bold`}>
                            {match.team2.id.split('-')[1]}
                          </span>
                          <span className={`font-semibold ${team2Color.text}`}>
                            {match.team2.player1}
                          </span>
                          <span className="text-gray-500">+</span>
                          <span className={`font-semibold ${team2Color.text}`}>
                            {match.team2.player2}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
