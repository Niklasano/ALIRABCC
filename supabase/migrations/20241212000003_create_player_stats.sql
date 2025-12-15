
-- Create player_stats table to track individual player victories
create table if not exists public.player_stats (
  id uuid default gen_random_uuid() primary key,
  player_name text not null unique,
  team_name text not null,
  victories integer default 0,
  games_played integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.player_stats enable row level security;

-- Create policy to allow all operations for now
create policy "Allow all operations on player_stats" on public.player_stats
  for all using (true);

-- Create indexes for faster lookups
create index if not exists player_stats_player_name_idx on public.player_stats (player_name);
create index if not exists player_stats_victories_idx on public.player_stats (victories desc);
create index if not exists player_stats_team_name_idx on public.player_stats (team_name);
