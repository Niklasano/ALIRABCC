-- Créer la fonction pour mettre à jour les timestamps automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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