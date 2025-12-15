
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

export const useTeamStats = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getLeaderboard = async () => {
    setLoading(true);
    try {
      console.log('Chargement du classement...');
      
      const { data, error } = await supabase.functions.invoke('team-stats', {
        body: {
          action: 'leaderboard',
        },
      });

      if (error) {
        throw error;
      }

      console.log('Classement chargé avec succès:', data);
      return data;
      
    } catch (error) {
      console.error('Erreur lors du chargement du classement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le classement",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordVictory = async (
    winnerTeam: string, 
    loserTeam: string, 
    winnerPlayers?: string[], 
    loserPlayers?: string[],
    winnerChutesAdverses: number = 0,
    winnerEpicerieAlarms: number = 0,
    winnerVousEtesNulsCount: number = 0,
    loserChutesAdverses: number = 0
  ) => {
    setLoading(true);
    try {
      console.log('Enregistrement victoire:', { 
        winnerTeam, 
        loserTeam, 
        winnerPlayers, 
        loserPlayers,
        winnerChutesAdverses,
        winnerEpicerieAlarms,
        winnerVousEtesNulsCount,
        loserChutesAdverses
      });
      
      const { data, error } = await supabase.functions.invoke('team-stats', {
        body: {
          action: 'record-victory',
          winnerTeam,
          loserTeam,
          winnerPlayers,
          loserPlayers,
          winnerChutesAdverses,
          winnerEpicerieAlarms,
          winnerVousEtesNulsCount,
          loserChutesAdverses,
        },
      });

      if (error) {
        throw error;
      }

      console.log('Victoire enregistrée avec succès:', data);
      
      toast({
        title: "Succès",
        description: "Victoire enregistrée avec succès",
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la victoire",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetStats = async () => {
    setLoading(true);
    try {
      console.log('Réinitialisation des statistiques...');
      
      const { data, error } = await supabase.functions.invoke('team-stats', {
        body: {
          action: 'reset-stats',
        },
      });

      if (error) {
        throw error;
      }

      console.log('Statistiques réinitialisées avec succès');
      toast({
        title: "Succès",
        description: "Statistiques réinitialisées avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les statistiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    getLeaderboard,
    recordVictory,
    resetStats,
    loading,
  };
};
