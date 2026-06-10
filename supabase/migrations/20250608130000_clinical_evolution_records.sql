create table if not exists public.clinical_evolution_records (
  id uuid primary key default gen_random_uuid(),
  patient_id text not null,
  patient_name text not null,
  session_date date not null,
  content_html text not null default '',
  status text not null default 'draft' check (status in ('draft', 'finalized')),
  professional_name text not null,
  professional_role text not null,
  professional_council text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_id, session_date, professional_name)
);

create index if not exists idx_clinical_evolution_patient
  on public.clinical_evolution_records (patient_id);

create index if not exists idx_clinical_evolution_status
  on public.clinical_evolution_records (status);

alter table public.clinical_evolution_records enable row level security;

create policy "Leitura de evoluções clínicas"
  on public.clinical_evolution_records
  for select
  to anon, authenticated
  using (true);

create policy "Inserção de evoluções clínicas"
  on public.clinical_evolution_records
  for insert
  to anon, authenticated
  with check (true);

create policy "Atualização de evoluções clínicas"
  on public.clinical_evolution_records
  for update
  to anon, authenticated
  using (true);
