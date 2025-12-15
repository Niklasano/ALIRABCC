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