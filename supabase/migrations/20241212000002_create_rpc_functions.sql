
-- Function to upsert team victory (increment victories and games_played)
create or replace function upsert_team_victory(team_name_param text)
returns void
language plpgsql
as $$
begin
  insert into public.team_stats (team_name, victories, games_played)
  values (team_name_param, 1, 1)
  on conflict (team_name)
  do update set
    victories = team_stats.victories + 1,
    games_played = team_stats.games_played + 1,
    updated_at = now();
end;
$$;

-- Function to upsert team game (only increment games_played)
create or replace function upsert_team_game(team_name_param text)
returns void
language plpgsql
as $$
begin
  insert into public.team_stats (team_name, victories, games_played)
  values (team_name_param, 0, 1)
  on conflict (team_name)
  do update set
    games_played = team_stats.games_played + 1,
    updated_at = now();
end;
$$;
