export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      game_sessions: {
        Row: {
          created_at: string
          current_dealer: number | null
          game_data: Json | null
          id: string
          is_finished: boolean | null
          players_layout: Json | null
          session_url: string
          team1_name: string | null
          team1_player1: string | null
          team1_player2: string | null
          team1_score: number | null
          team2_name: string | null
          team2_player1: string | null
          team2_player2: string | null
          team2_score: number | null
          updated_at: string
          victory_points: string | null
          winner_team: string | null
        }
        Insert: {
          created_at?: string
          current_dealer?: number | null
          game_data?: Json | null
          id?: string
          is_finished?: boolean | null
          players_layout?: Json | null
          session_url: string
          team1_name?: string | null
          team1_player1?: string | null
          team1_player2?: string | null
          team1_score?: number | null
          team2_name?: string | null
          team2_player1?: string | null
          team2_player2?: string | null
          team2_score?: number | null
          updated_at?: string
          victory_points?: string | null
          winner_team?: string | null
        }
        Update: {
          created_at?: string
          current_dealer?: number | null
          game_data?: Json | null
          id?: string
          is_finished?: boolean | null
          players_layout?: Json | null
          session_url?: string
          team1_name?: string | null
          team1_player1?: string | null
          team1_player2?: string | null
          team1_score?: number | null
          team2_name?: string | null
          team2_player1?: string | null
          team2_player2?: string | null
          team2_score?: number | null
          updated_at?: string
          victory_points?: string | null
          winner_team?: string | null
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          created_at: string
          games_played: number | null
          id: string
          player_name: string
          points: number | null
          team_name: string
          updated_at: string
          victories: number | null
        }
        Insert: {
          created_at?: string
          games_played?: number | null
          id?: string
          player_name: string
          points?: number | null
          team_name: string
          updated_at?: string
          victories?: number | null
        }
        Update: {
          created_at?: string
          games_played?: number | null
          id?: string
          player_name?: string
          points?: number | null
          team_name?: string
          updated_at?: string
          victories?: number | null
        }
        Relationships: []
      }
      team_stats: {
        Row: {
          created_at: string
          games_played: number | null
          id: string
          points: number | null
          team_name: string
          updated_at: string
          victories: number | null
        }
        Insert: {
          created_at?: string
          games_played?: number | null
          id?: string
          points?: number | null
          team_name: string
          updated_at?: string
          victories?: number | null
        }
        Update: {
          created_at?: string
          games_played?: number | null
          id?: string
          points?: number | null
          team_name?: string
          updated_at?: string
          victories?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_team_points: {
        Args: {
          epicerie_alarms?: number
          is_winner: boolean
          opponent_chutes?: number
          vous_etes_nuls_malus?: number
        }
        Returns: number
      }
      merge_player_stats: {
        Args: { source_player_name: string; target_player_name: string }
        Returns: undefined
      }
      reset_all_stats: { Args: never; Returns: undefined }
      upsert_player_game: {
        Args: { player_name_param: string; team_name_param: string }
        Returns: undefined
      }
      upsert_player_game_with_points: {
        Args: {
          opponent_chutes?: number
          player_name_param: string
          team_name_param: string
        }
        Returns: undefined
      }
      upsert_player_victory: {
        Args: { player_name_param: string; team_name_param: string }
        Returns: undefined
      }
      upsert_player_victory_with_points: {
        Args: {
          epicerie_alarms?: number
          opponent_chutes?: number
          player_name_param: string
          team_name_param: string
          vous_etes_nuls_malus?: number
        }
        Returns: undefined
      }
      upsert_team_game: {
        Args: { team_name_param: string }
        Returns: undefined
      }
      upsert_team_game_with_points: {
        Args: { opponent_chutes?: number; team_name_param: string }
        Returns: undefined
      }
      upsert_team_victory: {
        Args: { team_name_param: string }
        Returns: undefined
      }
      upsert_team_victory_with_points: {
        Args: {
          epicerie_alarms?: number
          opponent_chutes?: number
          team_name_param: string
          vous_etes_nuls_malus?: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
