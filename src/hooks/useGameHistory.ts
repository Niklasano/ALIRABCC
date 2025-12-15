import { useState, useEffect } from 'react';
import { BeloteRow, DisplayRow } from '@/types/belote';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface GameHistoryEntry {
  id: string;
  date: string; // Format: "01/12/2025"
  displayName: string; // "01/12/2025 - Team1 VS Team2"
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

const MAX_HISTORY_SIZE = 30;

export const useGameHistory = () => {
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load history from Supabase on mount
  useEffect(() => {
    loadHistoryFromSupabase();
  }, []);

  const loadHistoryFromSupabase = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('is_finished', true)
        .order('created_at', { ascending: false })
        .limit(MAX_HISTORY_SIZE);

      if (error) {
        console.error('Error loading history from Supabase:', error);
        return;
      }

      if (data) {
        const historyEntries: GameHistoryEntry[] = data.map((session) => {
          const createdAt = new Date(session.created_at);
          const dateStr = createdAt.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });

          const team1Name = session.team1_name || 'Équipe 1';
          const team2Name = session.team2_name || 'Équipe 2';

          // Parse game_data to extract rows
          const gameData = (session.game_data as unknown as BeloteRow[]) || [];
          
          // Generate display rows from game data
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

  // Helper function to generate display rows from game data
  const generateDisplayRows = (data: BeloteRow[], teamNumber: 1 | 2): DisplayRow[] => {
    return data.map((row) => {
      const isTeam1 = teamNumber === 1;
      const contrat = isTeam1 ? row.Contrat : row.Contrat_E2;
      const chute = isTeam1 ? row.Chute : row.Chute_E2;
      const realise = isTeam1 ? row.Réalisé : row.Réalisé_E2;
      const ecart = isTeam1 ? row.Ecart : row.Ecart_E2;
      const ecartTheo = isTeam1 ? row['Ecarts Théorique'] : row['Ecarts Théorique_E2'];
      const belote = isTeam1 ? row.Belote : row.Belote_E2;
      const remarques = isTeam1 ? row.Remarques : row.Remarques_E2;
      const points = isTeam1 ? row.Points : row.Points_E2;
      const total = isTeam1 ? row.Total : row.Total_E2;
      const suitColor = isTeam1 ? row.CardColor : row.CardColor_E2;

      return {
        Mène: row.Mène.toString(),
        Contrat: contrat.toString(),
        SuitColor: suitColor,
        Chute: chute.toString(),
        Réalisé: realise.toString(),
        Ecart: ecart.toString(),
        'Ecarts Théo': ecartTheo.toString(),
        Belote: belote,
        Remarques: remarques,
        Points: points.toString(),
        Total: {
          text: total.toString(),
          backgroundColor: ''
        }
      };
    });
  };

  const saveGame = (
    team1Name: string,
    team2Name: string,
    team1Player1: string,
    team1Player2: string,
    team2Player1: string,
    team2Player2: string,
    team1Score: number,
    team2Score: number,
    team1Winner: boolean,
    team2Winner: boolean,
    victoryPoints: string,
    data: BeloteRow[],
    team1Rows: DisplayRow[],
    team2Rows: DisplayRow[]
  ) => {
    // The game is already saved in game_sessions table via auto-save
    // Just refresh the history to include it
    loadHistoryFromSupabase();
  };

  const clearHistory = async () => {
    // Note: This won't delete from Supabase since game_sessions doesn't allow DELETE
    // Just clear local state
    setHistory([]);
  };

  const deleteGame = async (id: string) => {
    // Note: game_sessions table doesn't allow DELETE operations
    // Remove from local state only
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

