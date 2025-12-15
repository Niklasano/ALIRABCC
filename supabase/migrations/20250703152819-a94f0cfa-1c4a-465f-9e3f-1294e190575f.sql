-- Créer une table pour stocker les parties avec leurs URL uniques
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_url TEXT NOT NULL UNIQUE,
  team1_player1 TEXT,
  team1_player2 TEXT,
  team2_player1 TEXT,
  team2_player2 TEXT,
  team1_name TEXT,
  team2_name TEXT,
  players_layout JSONB,
  current_dealer INTEGER,
  victory_points TEXT DEFAULT '2000',
  game_data JSONB DEFAULT '[]',
  team1_score INTEGER DEFAULT 0,
  team2_score INTEGER DEFAULT 0,
  is_finished BOOLEAN DEFAULT false,
  winner_team TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Créer des politiques pour l'accès aux sessions de jeu
CREATE POLICY "Game sessions are viewable by everyone" 
ON public.game_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Game sessions can be created by everyone" 
ON public.game_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Game sessions can be updated by everyone" 
ON public.game_sessions 
FOR UPDATE 
USING (true);

-- Créer la fonction pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_game_sessions_updated_at
BEFORE UPDATE ON public.game_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Créer un index sur session_url pour les recherches rapides
CREATE INDEX idx_game_sessions_url ON public.game_sessions(session_url);

-- Mettre à jour la table team_stats pour inclure le nouveau système de points
ALTER TABLE public.team_stats ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.player_stats ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Créer une fonction pour calculer les points avec le nouveau système
CREATE OR REPLACE FUNCTION public.calculate_team_points(
  is_winner BOOLEAN,
  opponent_chutes INTEGER DEFAULT 0,
  epicerie_alarms INTEGER DEFAULT 0,
  vous_etes_nuls_malus INTEGER DEFAULT 0
) RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_points INTEGER := 0;
  bonus_points INTEGER := 0;
  malus_points INTEGER := 0;
  final_points INTEGER;
BEGIN
  -- Points de base
  IF is_winner THEN
    base_points := 6;
  ELSE
    base_points := 0;
  END IF;
  
  -- Bonus pour chutes adverses (au moins 2 chutes = +1 point)
  IF opponent_chutes >= 2 THEN
    bonus_points := 1;
  END IF;
  
  -- Malus uniquement pour l'équipe gagnante
  IF is_winner THEN
    -- Malus épicerie : toutes les 2 alarmes = -1 point
    malus_points := malus_points + (epicerie_alarms / 2);
    
    -- Malus "vous êtes nuls" : -2 points par occurrence
    malus_points := malus_points + (vous_etes_nuls_malus * 2);
  END IF;
  
  -- Calcul final
  final_points := base_points + bonus_points - malus_points;
  
  -- Score minimum de 2 pour l'équipe gagnante
  IF is_winner AND final_points < 2 THEN
    final_points := 2;
  END IF;
  
  RETURN final_points;
END;
$$;

-- Fonction pour enregistrer une victoire avec le nouveau système de points
CREATE OR REPLACE FUNCTION public.upsert_team_victory_with_points(
  team_name_param TEXT,
  opponent_chutes INTEGER DEFAULT 0,
  epicerie_alarms INTEGER DEFAULT 0,
  vous_etes_nuls_malus INTEGER DEFAULT 0
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  calculated_points INTEGER;
BEGIN
  -- Calculer les points pour l'équipe gagnante
  calculated_points := calculate_team_points(true, opponent_chutes, epicerie_alarms, vous_etes_nuls_malus);
  
  INSERT INTO public.team_stats (team_name, victories, games_played, points)
  VALUES (team_name_param, 1, 1, calculated_points)
  ON CONFLICT (team_name)
  DO UPDATE SET
    victories = team_stats.victories + 1,
    games_played = team_stats.games_played + 1,
    points = team_stats.points + calculated_points,
    updated_at = now();
END;
$$;

-- Fonction pour enregistrer un jeu pour l'équipe perdante avec bonus éventuel
CREATE OR REPLACE FUNCTION public.upsert_team_game_with_points(
  team_name_param TEXT,
  opponent_chutes INTEGER DEFAULT 0
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  calculated_points INTEGER;
BEGIN
  -- Calculer les points pour l'équipe perdante (bonus possible mais pas de malus)
  calculated_points := calculate_team_points(false, opponent_chutes, 0, 0);
  
  INSERT INTO public.team_stats (team_name, victories, games_played, points)
  VALUES (team_name_param, 0, 1, calculated_points)
  ON CONFLICT (team_name)
  DO UPDATE SET
    games_played = team_stats.games_played + 1,
    points = team_stats.points + calculated_points,
    updated_at = now();
END;
$$;

-- Fonction similaire pour les joueurs
CREATE OR REPLACE FUNCTION public.upsert_player_victory_with_points(
  player_name_param TEXT,
  team_name_param TEXT,
  opponent_chutes INTEGER DEFAULT 0,
  epicerie_alarms INTEGER DEFAULT 0,
  vous_etes_nuls_malus INTEGER DEFAULT 0
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  calculated_points INTEGER;
BEGIN
  calculated_points := calculate_team_points(true, opponent_chutes, epicerie_alarms, vous_etes_nuls_malus);
  
  INSERT INTO public.player_stats (player_name, team_name, victories, games_played, points)
  VALUES (player_name_param, team_name_param, 1, 1, calculated_points)
  ON CONFLICT (player_name)
  DO UPDATE SET
    team_name = team_name_param,
    victories = player_stats.victories + 1,
    games_played = player_stats.games_played + 1,
    points = player_stats.points + calculated_points,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_player_game_with_points(
  player_name_param TEXT,
  team_name_param TEXT,
  opponent_chutes INTEGER DEFAULT 0
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  calculated_points INTEGER;
BEGIN
  calculated_points := calculate_team_points(false, opponent_chutes, 0, 0);
  
  INSERT INTO public.player_stats (player_name, team_name, victories, games_played, points)
  VALUES (player_name_param, team_name_param, 0, 1, calculated_points)
  ON CONFLICT (player_name)
  DO UPDATE SET
    team_name = team_name_param,
    games_played = player_stats.games_played + 1,
    points = player_stats.points + calculated_points,
    updated_at = now();
END;
$$;