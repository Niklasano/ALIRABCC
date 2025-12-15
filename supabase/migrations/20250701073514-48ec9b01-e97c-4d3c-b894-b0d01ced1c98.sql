
-- Fonction pour fusionner les statistiques de deux joueurs
CREATE OR REPLACE FUNCTION merge_player_stats(
  source_player_name TEXT,
  target_player_name TEXT
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Vérifier que les deux joueurs existent
  IF NOT EXISTS (SELECT 1 FROM public.player_stats WHERE player_name = source_player_name) THEN
    RAISE EXCEPTION 'Le joueur source "%" n''existe pas', source_player_name;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.player_stats WHERE player_name = target_player_name) THEN
    RAISE EXCEPTION 'Le joueur cible "%" n''existe pas', target_player_name;
  END IF;
  
  -- Fusionner les statistiques : ajouter les stats de source vers target
  UPDATE public.player_stats 
  SET 
    victories = victories + (SELECT victories FROM public.player_stats WHERE player_name = source_player_name),
    games_played = games_played + (SELECT games_played FROM public.player_stats WHERE player_name = source_player_name),
    updated_at = now()
  WHERE player_name = target_player_name;
  
  -- Supprimer le joueur source
  DELETE FROM public.player_stats WHERE player_name = source_player_name;
  
  RAISE NOTICE 'Statistiques de "%" fusionnées dans "%" avec succès', source_player_name, target_player_name;
END;
$$;

-- Exécuter la fusion de "Bader" vers "Bad"
SELECT merge_player_stats('Bader', 'Bad');
