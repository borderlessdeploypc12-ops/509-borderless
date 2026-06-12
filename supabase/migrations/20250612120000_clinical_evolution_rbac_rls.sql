-- Restringe INSERT/UPDATE em evoluções clínicas a SUPERVISOR e ADMIN (inclui master).

create or replace function public.is_supervisor_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select profile in ('ADMIN', 'SUPERVISOR') or is_master = true
      from public.user_profiles
      where id = auth.uid()
    ),
    false
  );
$$;

drop policy if exists "Inserção de evoluções clínicas"
  on public.clinical_evolution_records;

drop policy if exists "Atualização de evoluções clínicas"
  on public.clinical_evolution_records;

create policy "Inserção de evoluções — supervisor ou admin"
  on public.clinical_evolution_records
  for insert
  to authenticated
  with check (public.is_supervisor_or_admin());

create policy "Atualização de evoluções — supervisor ou admin"
  on public.clinical_evolution_records
  for update
  to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());
