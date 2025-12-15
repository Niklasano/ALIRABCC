
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User } from "lucide-react";

interface TournamentTeamsListProps {
  participants: string[];
  teams: Array<{
    id: string;
    player1: string;
    player2: string;
    colorIndex?: number;
  }>;
}

export const TournamentTeamsList: React.FC<TournamentTeamsListProps> = ({ 
  participants, 
  teams 
}) => {
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
  
  const getTeamColor = (index: number) => {
    return teamColors[index % teamColors.length];
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Liste des participants */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Participants ({participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {participants.map((participant, index) => (
              <div 
                key={index}
                className="p-2 bg-muted/50 rounded border text-sm"
              >
                {participant}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste des équipes */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Équipes ({teams.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {teams.map((team, index) => {
              const teamColor = getTeamColor(team.colorIndex ?? index);
              
              return (
                <div 
                  key={team.id}
                  className={`p-3 ${teamColor.bg} rounded-lg border-2 ${teamColor.border} shadow-sm transition-all hover:shadow-md`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users className={`h-4 w-4 ${teamColor.icon}`} />
                    <div className={`font-medium text-sm ${teamColor.text}`}>
                      Équipe {index + 1}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`font-medium ${teamColor.text}`}>{team.player1}</span>
                    <span className="text-gray-500">+</span>
                    <span className={`font-medium ${teamColor.text}`}>{team.player2}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
