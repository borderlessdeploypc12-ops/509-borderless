create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  profile text not null check (
    profile in ('administracao', 'supervisor', 'at', 'recepcao')
  ),
  is_master boolean not null default false,
  professional_council text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_profiles_single_master_idx
  on public.user_profiles (is_master)
  where is_master = true;

create index if not exists idx_user_profiles_profile
  on public.user_profiles (profile);

alter table public.user_profiles enable row level security;

create policy "Usuários podem ler o próprio perfil"
  on public.user_profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Usuários autenticados podem ler perfis da clínica"
  on public.user_profiles
  for select
  to authenticated
  using (true);

create policy "Usuário pode inserir o próprio perfil"
  on public.user_profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Usuário pode atualizar o próprio perfil"
  on public.user_profiles
  for update
  to authenticated
  using (auth.uid() = id);

create policy "Leitura anônima para verificar master em desenvolvimento"
  on public.user_profiles
  for select
  to anon
  using (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  master_exists boolean;
  selected_profile text;
begin
  select exists (
    select 1 from public.user_profiles where is_master = true
  ) into master_exists;

  selected_profile := coalesce(
    new.raw_user_meta_data ->> 'profile',
    'recepcao'
  );

  insert into public.user_profiles (
    id,
    full_name,
    profile,
    is_master,
    professional_council
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Usuário'),
    case
      when master_exists then selected_profile
      else 'administracao'
    end,
    not master_exists,
    new.raw_user_meta_data ->> 'professional_council'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
