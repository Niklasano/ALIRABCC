
-- Function to upsert player victory (increment victories and games_played)
create or replace function upsert_player_victory(player_name_param text, team_name_param text)
returns void
language plpgsql
as $$
begin
  insert into public.player_stats (player_name, team_name, victories, games_played)
  values (player_name_param, team_name_param, 1, 1)
  on conflict (player_name)
  do update set
    team_name = team_name_param,
    victories = player_stats.victories + 1,
    games_played = player_stats.games_played + 1,
    updated_at = now();
end;
$$;

-- Function to upsert player game (only increment games_played)
create or replace function upsert_player_game(player_name_param text, team_name_param text)
returns void
language plpgsql
as $$
begin
  insert into public.player_stats (player_name, team_name, victories, games_played)
  values (player_name_param, team_name_param, 0, 1)
  on conflict (player_name)
  do update set
    team_name = team_name_param,
    games_played = player_stats.games_played + 1,
    updated_at = now();
end;
$$;

-- Function to reset all statistics
create or replace function reset_all_stats()
returns void
language plpgsql
as $$
begin
  delete from public.team_stats where id is not null;
  delete from public.player_stats where id is not null;
end;
$$;
