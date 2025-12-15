
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Medal, Award, Users, TrendingUp, BarChart3, Loader2, RotateCcw, Lock, UserCheck, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTeamStats } from "@/hooks/useTeamStats";
import PlayerMergeDialog from "./PlayerMergeDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TeamStats {
  id: string;
  team_name: string;
  victories: number;
  games_played: number;
  points: number;
  created_at: string;
  updated_at: string;
}

interface PlayerStats {
  id: string;
  player_name: string;
  team_name: string;
  victories: number;
  games_played: number;
  points: number;
  created_at: string;
  updated_at: string;
}

interface LeaderboardDialogProps {
  open: boolean;
  onClose: () => void;
}

const LeaderboardDialog: React.FC<LeaderboardDialogProps> = ({
  open,
  onClose,
}) => {
  const [teams, setTeams] = useState<TeamStats[]>([]);
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
  const { toast } = useToast();
  const { getLeaderboard, resetStats, loading: resetLoading } = useTeamStats();

  // Fonction pour normaliser les noms d'équipe (tri des joueurs par ordre alphabétique)
  const normalizeTeamName = (teamName: string): string => {
    const players = teamName.split('/').map(name => name.trim()).sort();
    return players.join('/');
  };

  // Fonction pour fusionner les équipes avec les mêmes joueurs
  const mergeTeamsByPlayers = (teams: TeamStats[]): TeamStats[] => {
    const mergedTeams = new Map<string, TeamStats>();

    teams.forEach(team => {
      const normalizedName = normalizeTeamName(team.team_name);
      
      if (mergedTeams.has(normalizedName)) {
        const existingTeam = mergedTeams.get(normalizedName)!;
        existingTeam.victories += team.victories;
        existingTeam.games_played += team.games_played;
        existingTeam.points += team.points;
      } else {
        mergedTeams.set(normalizedName, {
          ...team,
          team_name: normalizedName
        });
      }
    });

    return Array.from(mergedTeams.values());
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard();
      const rawTeams = data.teams || [];
      const mergedTeams = mergeTeamsByPlayers(rawTeams);
      setTeams(mergedTeams);
      setPlayers(data.players || []);
    } catch (error) {
      // Error is already handled in useTeamStats
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLeaderboard();
    }
  }, [open]);

  const handleReset = async () => {
    if (password !== 'sanslejeu') {
      toast({
        title: "Erreur",
        description: "Mot de passe incorrect",
        variant: "destructive",
      });
      return;
    }

    await resetStats();
    await fetchLeaderboard();
    setPassword('');
    setIsResetDialogOpen(false);
  };

  const handleResetDialogClose = () => {
    setIsResetDialogOpen(false);
    setPassword('');
  };

  const handleMergeComplete = () => {
    fetchLeaderboard();
  };

  const getWinRate = (victories: number, gamesPlayed: number) => {
    if (gamesPlayed === 0) return 0;
    return Math.round((victories / gamesPlayed) * 100);
  };

  // Fonction pour calculer les points (2 points par victoire, 0 point par défaite)
  const calculatePoints = (victories: number, gamesPlayed: number) => {
    return victories * 2;
  };

  // Fonction pour calculer les rangs avec égalités pour les points
  const calculatePointsRanks = (items: any[]) => {
    const sortedItems = [...items].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.victories - a.victories; // Secondary sort by total victories
    });

    const rankedItems = [];
    let currentRank = 1;
    let previousPoints = null;
    let sameRankCount = 0;

    for (let i = 0; i < sortedItems.length; i++) {
      const item = sortedItems[i];
      
      if (previousPoints !== null && item.points !== previousPoints) {
        currentRank += sameRankCount;
        sameRankCount = 1;
      } else {
        sameRankCount++;
      }

      rankedItems.push({
        ...item,
        rank: currentRank,
        displayRank: currentRank
      });

      previousPoints = item.points;
    }

    return rankedItems;
  };

  // Fonction pour calculer les rangs avec égalités
  const calculateRanks = (items: any[]) => {
    const sortedItems = [...items].sort((a, b) => {
      const winRateA = getWinRate(a.victories, a.games_played);
      const winRateB = getWinRate(b.victories, b.games_played);
      if (winRateB !== winRateA) return winRateB - winRateA;
      return b.victories - a.victories; // Secondary sort by total victories
    });

    const rankedItems = [];
    let currentRank = 1;
    let previousWinRate = null;
    let sameRankCount = 0;

    for (let i = 0; i < sortedItems.length; i++) {
      const item = sortedItems[i];
      const winRate = getWinRate(item.victories, item.games_played);
      
      if (previousWinRate !== null && winRate !== previousWinRate) {
        currentRank += sameRankCount;
        sameRankCount = 1;
      } else {
        sameRankCount++;
      }

      rankedItems.push({
        ...item,
        rank: currentRank,
        displayRank: currentRank
      });

      previousWinRate = winRate;
    }

    return rankedItems;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">{rank}</div>;
    }
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
      default:
        return "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200";
    }
  };

  const renderTeamLeaderboard = () => {
    const rankedTeams = calculateRanks(teams);
    
    return (
      <div className="space-y-4">
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Aucune équipe enregistrée</p>
            <p className="text-gray-500 text-sm mt-2">Jouez quelques parties pour voir apparaître le classement !</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-3 pr-4">
              {rankedTeams.map((team) => (
                <div
                  key={team.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${getRankClass(team.rank)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getRankIcon(team.rank)}
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{team.team_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            {team.victories} victoires
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-blue-500" />
                            {team.games_played} parties
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {getWinRate(team.victories, team.games_played)}%
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Taux de victoire
                      </div>
                      
                      <div className="w-32 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                          style={{ width: `${getWinRate(team.victories, team.games_played)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  };

  const renderPlayerLeaderboard = () => {
    const rankedPlayers = calculateRanks(players);
    
    return (
      <div className="space-y-4">
        {players.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Aucun joueur enregistré</p>
            <p className="text-gray-500 text-sm mt-2">Les statistiques de joueurs apparaîtront bientôt !</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-3 pr-4">
              {rankedPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${getRankClass(player.rank)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getRankIcon(player.rank)}
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{player.player_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            {player.victories} victoires
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-blue-500" />
                            {player.games_played} parties
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {getWinRate(player.victories, player.games_played)}%
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Taux de victoire
                      </div>
                      
                      <div className="w-32 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                          style={{ width: `${getWinRate(player.victories, player.games_played)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  };

  const renderPointsLeaderboard = () => {
    const rankedPlayers = calculatePointsRanks(players);
    
    return (
      <div className="space-y-4">
        {players.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Aucun joueur enregistré</p>
            <p className="text-gray-500 text-sm mt-2">Les points apparaîtront après quelques parties !</p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Système de points</h3>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>6 points</strong> par victoire, <strong>0 point</strong> par défaite</p>
              <p>+ Bonus/malus selon les performances</p>
              <p><em>Score minimum de 2 points pour l'équipe gagnante</em></p>
            </div>
          </div>
        )}

        {players.length > 0 && (
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-3 pr-4">
              {rankedPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${getRankClass(player.rank)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getRankIcon(player.rank)}
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{player.player_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            {player.victories} victoires
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-blue-500" />
                            {player.games_played} parties
                          </span>
                          <span className="text-red-600">
                            {player.games_played - player.victories} défaites
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-800">
                        {player.points}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Points
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text flex items-center justify-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Classement
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Chargement du classement...</span>
          </div>
        ) : (
          <Tabs defaultValue="teams" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="teams">Équipes</TabsTrigger>
              <TabsTrigger value="players">Joueurs</TabsTrigger>
              <TabsTrigger value="points">Points</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teams" className="mt-6">
              {renderTeamLeaderboard()}
            </TabsContent>
            
            <TabsContent value="players" className="mt-6">
              {renderPlayerLeaderboard()}
            </TabsContent>
            
            <TabsContent value="points" className="mt-6">
              {renderPointsLeaderboard()}
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={loading || resetLoading || (teams.length === 0 && players.length === 0)}
                  className="flex items-center gap-2"
                  onClick={() => setIsResetDialogOpen(true)}
                >
                  <RotateCcw className="w-4 h-4" />
                  Réinitialiser
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-red-500" />
                    Confirmer la réinitialisation
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera définitivement toutes les statistiques d'équipes et de joueurs. Cette action ne peut pas être annulée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="my-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe requis :
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Entrez le mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={handleResetDialogClose}>
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleReset} 
                    disabled={resetLoading || !password}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {resetLoading ? "Réinitialisation..." : "Réinitialiser"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="outline"
              onClick={() => setIsMergeDialogOpen(true)}
              disabled={players.length < 2}
              className="flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Fusionner joueurs
            </Button>
          </div>
          
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </DialogContent>

      <PlayerMergeDialog
        open={isMergeDialogOpen}
        onClose={() => setIsMergeDialogOpen(false)}
        players={players}
        onMergeComplete={handleMergeComplete}
      />
    </Dialog>
  );
};

export default LeaderboardDialog;
