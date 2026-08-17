-- Oryz account + library schema
-- Run this whole file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_library (
  user_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('movie','tv')),
  media_id bigint not null,
  title text not null,
  poster_path text,
  backdrop_path text,
  release_date text,
  vote_average numeric,
  liked boolean not null default false,
  watch_later boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, media_type, media_id)
);

create table if not exists public.watch_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('movie','tv')),
  media_id bigint not null,
  season_number integer not null default 0,
  episode_number integer not null default 0,
  title text not null,
  episode_name text,
  poster_path text,
  backdrop_path text,
  release_date text,
  vote_average numeric,
  position_seconds numeric not null default 0,
  duration_seconds numeric,
  progress_percent numeric not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, media_type, media_id, season_number, episode_number)
);

create table if not exists public.watch_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('movie','tv')),
  media_id bigint not null,
  season_number integer not null default 0,
  episode_number integer not null default 0,
  title text not null,
  episode_name text,
  poster_path text,
  backdrop_path text,
  release_date text,
  vote_average numeric,
  position_seconds numeric not null default 0,
  duration_seconds numeric,
  progress_percent numeric not null default 0,
  watched_at timestamptz not null default now(),
  primary key (user_id, media_type, media_id, season_number, episode_number)
);

create index if not exists media_library_user_updated_idx on public.media_library(user_id, updated_at desc);
create index if not exists watch_progress_user_updated_idx on public.watch_progress(user_id, updated_at desc);
create index if not exists watch_history_user_watched_idx on public.watch_history(user_id, watched_at desc);

alter table public.profiles enable row level security;
alter table public.media_library enable row level security;
alter table public.watch_progress enable row level security;
alter table public.watch_history enable row level security;

-- Profiles: a user can only read/write their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Library rows: only the signed-in owner can access them.
drop policy if exists "media_library_own" on public.media_library;
create policy "media_library_own" on public.media_library for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "watch_progress_own" on public.watch_progress;
create policy "watch_progress_own" on public.watch_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "watch_history_own" on public.watch_history;
create policy "watch_history_own" on public.watch_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Automatically create a profile row after a new Supabase Auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.profiles (id, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
