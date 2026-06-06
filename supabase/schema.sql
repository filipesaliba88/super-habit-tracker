-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  has_access boolean default false,
  access_granted_at timestamptz,
  hotmart_transaction_id text,
  reminder_time time default '08:00',
  reminder_enabled boolean default true,
  created_at timestamptz default now()
);

-- Habits table
create table public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  color text default '#6366f1',
  icon text default '⭐',
  frequency text default 'daily' check (frequency in ('daily', 'weekly')),
  target_days int default 7,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Check-ins table
create table public.checkins (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  checked_date date not null,
  created_at timestamptz default now(),
  unique(habit_id, checked_date)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.checkins enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Habits policies
create policy "Users can manage own habits"
  on public.habits for all using (auth.uid() = user_id);

-- Checkins policies
create policy "Users can manage own checkins"
  on public.checkins for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
