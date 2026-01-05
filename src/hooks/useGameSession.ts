import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BeloteRow } from '@/types/belote';
import { Json } from '@/integrations/supabase/types';

interface GameSession {
  id: string;
  session_url: string;
  team1_player1?: string;
  team1_player2?: string;
  team2_player1?: string;
  team2_player2?: string;
  team1_name?: string;
  team2_name?: string;
  players_layout?: string[];
  current_dealer?: number;
  victory_points: string;
  game_data: BeloteRow[];
  team1_score: number;
  team2_score: number;
  is_finished: boolean;
  winner_team?: string;
}

export const useGameSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Générer un ID unique pour une nouvelle session
  const generateSessionUrl = () => {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  };

  // Créer une nouvelle session de jeu
const createGameSession = async (
    team1Player1: string,
    team1Player2: string,
    team2Player1: string,
    team2Player2: string,
    playersLayout: string[],
    currentDealer: number,
    victoryPoints: string = '2000',
    existingUrl?: string
  ) => {
    setLoading(true);
    try {
      const finalSessionUrl = existingUrl || generateSessionUrl();
      const team1Name = `${team1Player1}/${team1Player2}`;
      const team2Name = `${team2Player1}/${team2Player2}`;

      // On prépare les données
      const gameData = {
        session_url: finalSessionUrl,
        team1_player1: team1Player1,
        team1_player2: team1Player2,
        team2_player1: team2Player1,
        team2_player2: team2Player2,
        team1_name: team1Name,
        team2_name: team2Name,
        players_layout: playersLayout,
        current_dealer: currentDealer,
        victory_points: victoryPoints,
      };

      // TENTATIVE 1 : On essaie d'insérer
      const { data, error } = await supabase
        .from('game_sessions')
        .insert(gameData)
        .select()
        .maybeSingle();

      // Si l'erreur est un doublon (code 23505), on fait un UPDATE à la place
      if (error && (error.code === '23505' || error.message.includes('unique'))) {
        console.log("La session existe déjà, passage en mode mise à jour...");
        const { data: updateData, error: updateError } = await supabase
          .from('game_sessions')
          .update(gameData)
          .eq('session_url', finalSessionUrl)
          .select()
          .maybeSingle();
          
        if (updateError) throw updateError;
        return updateData;
      }

      if (error) throw error;

      setSessionId(data?.id);
      setSessionUrl(finalSessionUrl);
      
      toast.success("Partie synchronisée !");
      return data;

    } catch (error) {
      console.error('Erreur technique Supabase:', error);
      // On affiche un toast moins alarmiste car le jeu fonctionne quand même en local
      console.warn("Synchronisation serveur échouée, mais le jeu continue en local.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Charger une session existante
  const loadGameSession = async (url: string): Promise<GameSession | null> => {
    setLoading(true);
    try {
      // .maybeSingle() ne renvoie pas d'erreur si la ligne n'existe pas
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('session_url', url)
        .maybeSingle();

      if (error) throw error;

      // Si la session n'existe pas encore (nouvelle partie via URL Index)
      if (!data) {
        setSessionUrl(url);
        return null;
      }

      setSessionId(data.id);
      setSessionUrl(url);

      return {
		...data,
		players_layout: Array.isArray(data.players_layout) ? data.players_layout : [],
		game_data: (data.game_data as unknown as BeloteRow[]) || [],
		};
    } catch (error) {
      console.error('Erreur lors du chargement de la session:', error);
      // On reste discret sur les erreurs de chargement pour ne pas bloquer l'expérience
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une session
  const updateGameSession = async (
    sessionUrl: string,
    updateData: Partial<{
      team1_score: number;
      team2_score: number;
      game_data: Json;
      current_dealer: number;
      is_finished: boolean;
      winner_team: string;
    }>
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('game_sessions')
        .update(updateData)
        .eq('session_url', sessionUrl);

      if (error) throw error;

    } catch (error) {
      console.error('Erreur lors de la mise à jour de la session:', error);
      // On ne met pas de toast.error ici pour ne pas polluer l'écran à chaque mène
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // S'abonner aux changements en temps réel
  const subscribeToSession = (sessionUrl: string, callback: (session: GameSession) => void) => {
    const channel = supabase
      .channel(`game-session-${sessionUrl}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `session_url=eq.${sessionUrl}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as any;
            const session = {
              ...newData,
              players_layout: (newData.players_layout as string[]) || [],
              game_data: (newData.game_data as BeloteRow[]) || [],
            } as GameSession;
            callback(session);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    sessionId,
    sessionUrl,
    loading,
    createGameSession,
    loadGameSession,
    updateGameSession,
    subscribeToSession,
  };
};