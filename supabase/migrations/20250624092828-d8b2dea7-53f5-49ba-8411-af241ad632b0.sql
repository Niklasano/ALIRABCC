
-- Corriger la fonction reset_all_stats pour éviter l'erreur de DELETE sans WHERE
CREATE OR REPLACE FUNCTION reset_all_stats()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Utiliser TRUNCATE au lieu de DELETE pour vider complètement les tables
  TRUNCATE TABLE public.team_stats RESTART IDENTITY CASCADE;
  TRUNCATE TABLE public.player_stats RESTART IDENTITY CASCADE;
END;
$$;
