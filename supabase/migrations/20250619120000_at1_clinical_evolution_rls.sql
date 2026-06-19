-- Permite que AT1 registre evoluções clínicas (psicólogos e terapeutas de nível 1).

create or replace function public.is_clinical_evolution_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select profile in ('ADMIN', 'SUPERVISOR', 'AT1') or is_master = true
      from public.user_profiles
      where id = auth.uid()
    ),
    false
  );
$$;

drop policy if exists "Inserção de evoluções — supervisor ou admin"
  on public.clinical_evolution_records;

drop policy if exists "Atualização de evoluções — supervisor ou admin"
  on public.clinical_evolution_records;

create policy "Inserção de evoluções — editor clínico"
  on public.clinical_evolution_records
  for insert
  to authenticated
  with check (public.is_clinical_evolution_editor());

create policy "Atualização de evoluções — editor clínico"
  on public.clinical_evolution_records
  for update
  to authenticated
  using (public.is_clinical_evolution_editor())
  with check (public.is_clinical_evolution_editor());
