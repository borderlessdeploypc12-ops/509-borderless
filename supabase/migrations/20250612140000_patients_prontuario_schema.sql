-- Prontuário individual: tabela central de pacientes e vínculos clínicos.

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_date date,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  diagnosis text,
  cpf text,
  notes text,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'discharged')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patients_full_name
  on public.patients (full_name);

create index if not exists idx_patients_status
  on public.patients (status);

-- Pacientes iniciais (equivalentes aos cadastros de demonstração).
insert into public.patients (
  id,
  full_name,
  birth_date,
  guardian_name,
  diagnosis
)
values
  (
    'a0000001-0000-4000-8000-000000000001',
    'Lucas Mendes',
    '2018-03-14',
    'Patrícia Mendes',
    'TEA — Nível 2'
  ),
  (
    'a0000002-0000-4000-8000-000000000002',
    'Sofia Ribeiro',
    '2019-07-22',
    'Carlos Ribeiro',
    'TEA — Nível 1'
  ),
  (
    'a0000003-0000-4000-8000-000000000003',
    'Miguel Torres',
    '2017-11-05',
    'Ana Torres',
    'TEA — Nível 2'
  ),
  (
    'a0000004-0000-4000-8000-000000000004',
    'Fernanda Oliveira',
    '2016-01-30',
    'Roberto Oliveira',
    'TEA — Nível 3'
  ),
  (
    'a0000005-0000-4000-8000-000000000005',
    'Gabriel Souza',
    '2020-09-18',
    'Juliana Souza',
    'TEA — Nível 1'
  )
on conflict (id) do nothing;

-- Migra clinical_evolution_records.patient_id (text) para FK uuid.
alter table public.clinical_evolution_records
  add column if not exists patient_uuid uuid references public.patients (id);

update public.clinical_evolution_records cer
set patient_uuid = p.id
from public.patients p
where cer.patient_uuid is null
  and (
    cer.patient_id = p.id::text
    or lower(trim(cer.patient_name)) = lower(trim(p.full_name))
  );

delete from public.clinical_evolution_records
where patient_uuid is null;

alter table public.clinical_evolution_records
  drop column if exists patient_id;

alter table public.clinical_evolution_records
  rename column patient_uuid to patient_id;

alter table public.clinical_evolution_records
  alter column patient_id set not null;

drop index if exists idx_clinical_evolution_patient;
create index idx_clinical_evolution_patient
  on public.clinical_evolution_records (patient_id);

alter table public.clinical_evolution_records
  drop constraint if exists clinical_evolution_records_patient_id_session_date_professional_name_key;

alter table public.clinical_evolution_records
  add constraint clinical_evolution_records_patient_session_professional_key
  unique (patient_id, session_date, professional_name);

-- Avaliações vinculadas ao paciente.
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  title text not null,
  instrument text,
  evaluation_date date not null,
  content_html text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'finalized')),
  professional_name text not null,
  professional_role text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_evaluations_patient
  on public.evaluations (patient_id);

create index if not exists idx_evaluations_date
  on public.evaluations (evaluation_date desc);

-- Planos terapêuticos vinculados ao paciente.
create table if not exists public.therapeutic_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  title text not null,
  goals_html text not null default '',
  strategies_html text not null default '',
  start_date date not null,
  end_date date,
  status text not null default 'active'
    check (status in ('draft', 'active', 'completed', 'archived')),
  professional_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_therapeutic_plans_patient
  on public.therapeutic_plans (patient_id);

-- Documentos do prontuário.
create table if not exists public.patient_documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  title text not null,
  document_type text not null default 'outro',
  file_url text,
  notes text,
  uploaded_by text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_patient_documents_patient
  on public.patient_documents (patient_id);

-- Vincula agenda ao paciente quando possível.
alter table public.agenda_events
  add column if not exists patient_id uuid references public.patients (id);

update public.agenda_events ae
set patient_id = p.id
from public.patients p
where ae.patient_id is null
  and lower(trim(ae.patient_name)) = lower(trim(p.full_name));

create index if not exists idx_agenda_events_patient
  on public.agenda_events (patient_id);

-- Função auxiliar de RBAC (idempotente — pode já existir de migration anterior).
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

-- RLS
alter table public.patients enable row level security;
alter table public.evaluations enable row level security;
alter table public.therapeutic_plans enable row level security;
alter table public.patient_documents enable row level security;

create policy "Leitura de pacientes"
  on public.patients for select to authenticated using (true);

create policy "Gestão de pacientes — supervisor ou admin"
  on public.patients for all to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

create policy "Leitura de avaliações"
  on public.evaluations for select to authenticated using (true);

create policy "Gestão de avaliações — supervisor ou admin"
  on public.evaluations for insert to authenticated
  with check (public.is_supervisor_or_admin());

create policy "Atualização de avaliações — supervisor ou admin"
  on public.evaluations for update to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

create policy "Leitura de planos terapêuticos"
  on public.therapeutic_plans for select to authenticated using (true);

create policy "Gestão de planos — supervisor ou admin"
  on public.therapeutic_plans for insert to authenticated
  with check (public.is_supervisor_or_admin());

create policy "Atualização de planos — supervisor ou admin"
  on public.therapeutic_plans for update to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

create policy "Leitura de documentos do paciente"
  on public.patient_documents for select to authenticated using (true);

create policy "Gestão de documentos — supervisor ou admin"
  on public.patient_documents for insert to authenticated
  with check (public.is_supervisor_or_admin());

create policy "Atualização de documentos — supervisor ou admin"
  on public.patient_documents for update to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());
