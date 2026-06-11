-- Migra perfis legados para o modelo RBAC (ADMIN, SUPERVISOR, RECEPCAO, AT1, AT2)
alter table public.user_profiles
  drop constraint if exists user_profiles_profile_check;

update public.user_profiles
set profile = 'ADMIN'
where profile = 'administracao';

update public.user_profiles
set profile = 'SUPERVISOR'
where profile = 'supervisor';

update public.user_profiles
set profile = 'RECEPCAO'
where profile = 'recepcao';

update public.user_profiles
set profile = 'AT1'
where profile = 'at';

alter table public.user_profiles
  add constraint user_profiles_profile_check
  check (profile in ('ADMIN', 'SUPERVISOR', 'RECEPCAO', 'AT1', 'AT2'));

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
    'RECEPCAO'
  );

  if selected_profile not in ('ADMIN', 'SUPERVISOR', 'RECEPCAO', 'AT1', 'AT2') then
    selected_profile := case selected_profile
      when 'administracao' then 'ADMIN'
      when 'supervisor' then 'SUPERVISOR'
      when 'recepcao' then 'RECEPCAO'
      when 'at' then 'AT1'
      else 'RECEPCAO'
    end;
  end if;

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
      else 'ADMIN'
    end,
    not master_exists,
    new.raw_user_meta_data ->> 'professional_council'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
