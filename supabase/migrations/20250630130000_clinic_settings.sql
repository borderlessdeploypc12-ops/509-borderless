-- Configurações globais da clínica (singleton). Acesso restrito a ADMIN.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select profile = 'ADMIN' or is_master = true
      from public.user_profiles
      where id = auth.uid()
    ),
    false
  );
$$;

create table if not exists public.clinic_settings (
  id uuid primary key default '00000000-0000-4000-8000-000000000001'::uuid,
  nome_clinica text not null default '',
  cnpj text,
  endereco_completo text,
  logo_url text,
  stripe_api_key text,
  mercado_pago_api_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clinic_settings_singleton check (
    id = '00000000-0000-4000-8000-000000000001'::uuid
  )
);

insert into public.clinic_settings (id, nome_clinica)
values ('00000000-0000-4000-8000-000000000001'::uuid, 'Nurse Care')
on conflict (id) do nothing;

alter table public.clinic_settings enable row level security;

drop policy if exists "Leitura de configurações — admin" on public.clinic_settings;
drop policy if exists "Inserção de configurações — admin" on public.clinic_settings;
drop policy if exists "Atualização de configurações — admin" on public.clinic_settings;

create policy "Leitura de configurações — admin"
  on public.clinic_settings
  for select
  to authenticated
  using (public.is_admin());

create policy "Inserção de configurações — admin"
  on public.clinic_settings
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Atualização de configurações — admin"
  on public.clinic_settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Bucket público para logo institucional (leitura aberta, escrita apenas admin).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'clinic-assets',
  'clinic-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Leitura pública de assets da clínica" on storage.objects;
drop policy if exists "Upload de assets da clínica — admin" on storage.objects;
drop policy if exists "Atualização de assets da clínica — admin" on storage.objects;
drop policy if exists "Remoção de assets da clínica — admin" on storage.objects;

create policy "Leitura pública de assets da clínica"
  on storage.objects
  for select
  to public
  using (bucket_id = 'clinic-assets');

create policy "Upload de assets da clínica — admin"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'clinic-assets'
    and public.is_admin()
  );

create policy "Atualização de assets da clínica — admin"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'clinic-assets'
    and public.is_admin()
  )
  with check (
    bucket_id = 'clinic-assets'
    and public.is_admin()
  );

create policy "Remoção de assets da clínica — admin"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'clinic-assets'
    and public.is_admin()
  );
