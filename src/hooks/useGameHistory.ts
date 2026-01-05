import { useState, useEffect } from 'react';
import { BeloteRow, DisplayRow } from '@/types/belote';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface GameHistoryEntry {
  id: string;
  date: string;
  displayName: string;
  team1Name: string;
  team2Name: string;
  team1Player1: string;
  team1Player2: string;
  team2Player1: string;
  team2Player2: string;
  team1Score: number;
  team2Score: number;
  team1Winner: boolean;
  team2Winner: boolean;
  victoryPoints: string;
  data: BeloteRow[];
  team1Rows: DisplayRow[];
  team2Rows: DisplayRow[];
}

const MAX_HISTORY_SIZE = 50; // Augmenté pour voir plus de parties

export const useGameHistory = () => {
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistoryFromSupabase();
  }, []);

  const loadHistoryFromSupabase = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        // On récupère tout ce qui contient des données, même si non "fini"
        .not('game_data', 'is', null) 
        .order('created_at', { ascending: false })
        .limit(MAX_HISTORY_SIZE);

      if (error) {
        console.error('Error loading history from Supabase:', error);
        return;
      }

      if (data) {
        // Filtrage pour ne garder que les sessions ayant au moins une mène jouée
        const historyEntries: GameHistoryEntry[] = data
          .filter((session) => Array.isArray(session.game_data) && session.game_data.length > 0)
          .map((session) => {
            const createdAt = new Date(session.created_at);
            const dateStr = createdAt.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            const team1Name = session.team1_name || 'Équipe 1';
            const team2Name = session.team2_name || 'Équipe 2';
            const gameData = (session.game_data as unknown as BeloteRow[]) || [];
            
            const team1Rows = generateDisplayRows(gameData, 1);
            const team2Rows = generateDisplayRows(gameData, 2);

            return {
              id: session.id,
              date: dateStr,
              displayName: `${dateStr} - ${team1Name} VS ${team2Name}`,
              team1Name,
              team2Name,
              team1Player1: session.team1_player1 || '',
              team1Player2: session.team1_player2 || '',
              team2Player1: session.team2_player1 || '',
              team2Player2: session.team2_player2 || '',
              team1Score: session.team1_score || 0,
              team2Score: session.team2_score || 0,
              team1Winner: session.winner_team === team1Name,
              team2Winner: session.winner_team === team2Name,
              victoryPoints: session.victory_points || '2000',
              data: gameData,
              team1Rows,
              team2Rows
            };
          });

        setHistory(historyEntries);
      }
    } catch (error) {
      console.error('Error loading game history:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDisplayRows = (data: BeloteRow[], teamNumber: 1 | 2): DisplayRow[] => {
    return data.map((row) => {
      const isTeam1 = teamNumber === 1;
      return {
        Mène: row.Mène.toString(),
        Contrat: isTeam1 ? row.Contrat.toString() : row.Contrat_E2.toString(),
        SuitColor: isTeam1 ? row.CardColor : row.CardColor_E2,
        Chute: isTeam1 ? row.Chute.toString() : row.Chute_E2.toString(),
        Réalisé: isTeam1 ? row.Réalisé.toString() : row.Réalisé_E2.toString(),
        Ecart: isTeam1 ? row.Ecart.toString() : row.Ecart_E2.toString(),
        'Ecarts Théo': isTeam1 ? row['Ecarts Théorique'].toString() : row['Ecarts Théorique_E2'].toString(),
        Belote: isTeam1 ? row.Belote : row.Belote_E2,
        Remarques: isTeam1 ? row.Remarques : row.Remarques_E2,
        Points: isTeam1 ? row.Points.toString() : row.Points_E2.toString(),
        Total: {
          text: isTeam1 ? row.Total.toString() : row.Total_E2.toString(),
          backgroundColor: ''
        }
      };
    });
  };

  const saveGame = () => {
    // La sauvegarde est gérée par l'auto-save de BeloteApp
    loadHistoryFromSupabase();
  };

  const clearHistory = async () => {
    setHistory([]);
  };

  const deleteGame = async (id: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== id));
  };

  return {
    history,
    loading,
    saveGame,
    clearHistory,
    deleteGame,
    refreshHistory: loadHistoryFromSupabase
  };
};