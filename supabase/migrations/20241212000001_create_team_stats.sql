
-- Create team_stats table to track team victories
create table if not exists public.team_stats (
  id uuid default gen_random_uuid() primary key,
  team_name text not null unique,
  victories integer default 0,
  games_played integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.team_stats enable row level security;

-- Create policy to allow all operations for now (you can restrict this later)
create policy "Allow all operations on team_stats" on public.team_stats
  for all using (true);

-- Create index for faster lookups
create index if not exists team_stats_team_name_idx on public.team_stats (team_name);
create index if not exists team_stats_victories_idx on public.team_stats (victories desc);
