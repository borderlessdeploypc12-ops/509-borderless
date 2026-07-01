-- Portal da Família: perfil FAMILIA vinculado ao paciente + RLS somente leitura.

-- Vínculo família ↔ paciente
alter table public.user_profiles
  add column if not exists patient_id uuid references public.patients (id) on delete set null;

create index if not exists idx_user_profiles_patient_id
  on public.user_profiles (patient_id)
  where patient_id is not null;

alter table public.user_profiles
  drop constraint if exists user_profiles_profile_check;

alter table public.user_profiles
  add constraint user_profiles_profile_check
  check (profile in ('ADMIN', 'SUPERVISOR', 'RECEPCAO', 'AT1', 'AT2', 'FAMILIA'));

alter table public.user_profiles
  drop constraint if exists user_profiles_familia_patient_check;

alter table public.user_profiles
  add constraint user_profiles_familia_patient_check
  check (
    (profile = 'FAMILIA' and patient_id is not null)
    or (profile <> 'FAMILIA' and patient_id is null)
  );

-- Avisos/recados publicados pela equipe para responsáveis
create table if not exists public.family_portal_notices (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  title text not null,
  content text not null check (char_length(trim(content)) > 0),
  author_name text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_family_portal_notices_patient
  on public.family_portal_notices (patient_id, created_at desc);

alter table public.family_portal_notices enable row level security;

-- Helpers RBAC do portal da família
create or replace function public.is_familia()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select profile = 'FAMILIA'
      from public.user_profiles
      where id = auth.uid()
    ),
    false
  );
$$;

create or replace function public.familia_patient_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select patient_id
  from public.user_profiles
  where id = auth.uid()
    and profile = 'FAMILIA';
$$;

create or replace function public.familia_can_read_patient(target_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not public.is_familia()
    or target_patient_id = public.familia_patient_id();
$$;

-- Trigger de cadastro: suporta FAMILIA com patient_id
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  master_exists boolean;
  selected_profile text;
  selected_patient_id uuid;
begin
  select exists (
    select 1 from public.user_profiles where is_master = true
  ) into master_exists;

  selected_profile := coalesce(
    new.raw_user_meta_data ->> 'profile',
    'RECEPCAO'
  );

  if selected_profile not in ('ADMIN', 'SUPERVISOR', 'RECEPCAO', 'AT1', 'AT2', 'FAMILIA') then
    selected_profile := case selected_profile
      when 'administracao' then 'ADMIN'
      when 'supervisor' then 'SUPERVISOR'
      when 'recepcao' then 'RECEPCAO'
      when 'at' then 'AT1'
      else 'RECEPCAO'
    end;
  end if;

  selected_patient_id := null;
  if selected_profile = 'FAMILIA' then
    begin
      selected_patient_id := (new.raw_user_meta_data ->> 'patient_id')::uuid;
    exception
      when others then
        selected_patient_id := null;
    end;

    if selected_patient_id is null then
      raise exception 'Perfil FAMILIA exige patient_id nos metadados do usuário.';
    end if;
  end if;

  insert into public.user_profiles (
    id,
    full_name,
    profile,
    is_master,
    professional_council,
    patient_id
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Usuário'),
    case
      when master_exists then selected_profile
      else 'ADMIN'
    end,
    not master_exists,
    new.raw_user_meta_data ->> 'professional_council',
    case
      when master_exists and selected_profile = 'FAMILIA' then selected_patient_id
      else null
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- RLS: avisos do portal
create policy "Família lê avisos publicados do próprio paciente"
  on public.family_portal_notices
  for select
  to authenticated
  using (
    public.is_familia()
    and patient_id = public.familia_patient_id()
    and is_published = true
  );

create policy "Equipe lê avisos do portal"
  on public.family_portal_notices
  for select
  to authenticated
  using (not public.is_familia());

create policy "Equipe publica avisos no portal"
  on public.family_portal_notices
  for insert
  to authenticated
  with check (
    not public.is_familia()
    and public.is_supervisor_or_admin()
  );

create policy "Equipe atualiza avisos do portal"
  on public.family_portal_notices
  for update
  to authenticated
  using (not public.is_familia() and public.is_supervisor_or_admin())
  with check (not public.is_familia() and public.is_supervisor_or_admin());

create policy "Equipe remove avisos do portal"
  on public.family_portal_notices
  for delete
  to authenticated
  using (not public.is_familia() and public.is_supervisor_or_admin());

-- RLS: restringe leitura da família às tabelas clínicas do próprio paciente
drop policy if exists "Leitura de pacientes" on public.patients;
create policy "Leitura de pacientes"
  on public.patients
  for select
  to authenticated
  using (public.familia_can_read_patient(id));

drop policy if exists "Leitura de avaliações" on public.evaluations;
create policy "Leitura de avaliações"
  on public.evaluations
  for select
  to authenticated
  using (
    public.familia_can_read_patient(patient_id)
    and (not public.is_familia() or status = 'finalized')
  );

drop policy if exists "Leitura de planos terapêuticos" on public.therapeutic_plans;
create policy "Leitura de planos terapêuticos"
  on public.therapeutic_plans
  for select
  to authenticated
  using (not public.is_familia());

drop policy if exists "Leitura de documentos do paciente" on public.patient_documents;
create policy "Leitura de documentos do paciente"
  on public.patient_documents
  for select
  to authenticated
  using (not public.is_familia());

drop policy if exists "Leitura de evoluções clínicas" on public.clinical_evolution_records;

create policy "Leitura de evoluções clínicas — equipe"
  on public.clinical_evolution_records
  for select
  to authenticated
  using (
    public.familia_can_read_patient(patient_id)
    and (not public.is_familia() or status = 'finalized')
  );

create policy "Leitura anônima de evoluções em desenvolvimento"
  on public.clinical_evolution_records
  for select
  to anon
  using (true);

-- Perfis: família só lê o próprio; equipe lê todos
drop policy if exists "Usuários autenticados podem ler perfis da clínica"
  on public.user_profiles;
create policy "Usuários autenticados podem ler perfis da clínica"
  on public.user_profiles
  for select
  to authenticated
  using (not public.is_familia());

drop policy if exists "Usuário pode atualizar o próprio perfil"
  on public.user_profiles;
create policy "Usuário pode atualizar o próprio perfil"
  on public.user_profiles
  for update
  to authenticated
  using (auth.uid() = id and not public.is_familia());

drop policy if exists "Usuário pode inserir o próprio perfil"
  on public.user_profiles;
create policy "Usuário pode inserir o próprio perfil"
  on public.user_profiles
  for insert
  to authenticated
  with check (auth.uid() = id and not public.is_familia());

-- Agenda e comunicação interna: bloqueados para família
drop policy if exists "Leitura de agenda para autenticados" on public.agenda_events;
create policy "Leitura de agenda para autenticados"
  on public.agenda_events
  for select
  to authenticated
  using (not public.is_familia());

drop policy if exists "Participantes podem ler mensagens" on public.internal_messages;
create policy "Participantes podem ler mensagens"
  on public.internal_messages
  for select
  to authenticated
  using (
    not public.is_familia()
    and (auth.uid() = sender_id or auth.uid() = receiver_id)
  );

drop policy if exists "Usuário lê as próprias notificações" on public.internal_notifications;
create policy "Usuário lê as próprias notificações"
  on public.internal_notifications
  for select
  to authenticated
  using (not public.is_familia() and auth.uid() = user_id);

drop policy if exists "Usuários autenticados leem presença" on public.user_presence;
create policy "Usuários autenticados leem presença"
  on public.user_presence
  for select
  to authenticated
  using (not public.is_familia());

-- Templates e avaliações estruturadas
drop policy if exists "Leitura de templates de avaliação" on public.assessment_templates;
create policy "Leitura de templates de avaliação"
  on public.assessment_templates
  for select
  to authenticated
  using (not public.is_familia());

drop policy if exists "Leitura de níveis de avaliação" on public.assessment_levels;
create policy "Leitura de níveis de avaliação"
  on public.assessment_levels
  for select
  to authenticated
  using (not public.is_familia());

drop policy if exists "Leitura de habilidades de avaliação" on public.assessment_skills;
create policy "Leitura de habilidades de avaliação"
  on public.assessment_skills
  for select
  to authenticated
  using (not public.is_familia());

drop policy if exists "Leitura de grupos de pontuação" on public.assessment_score_groups;
create policy "Leitura de grupos de pontuação"
  on public.assessment_score_groups
  for select
  to authenticated
  using (not public.is_familia());

drop policy if exists "Leitura de pontuações" on public.assessment_scores;
create policy "Leitura de pontuações"
  on public.assessment_scores
  for select
  to authenticated
  using (not public.is_familia());

-- Documentos e auditoria
drop policy if exists "Leitura de modelos de documento" on public.document_templates;
create policy "Leitura de modelos de documento"
  on public.document_templates
  for select
  to authenticated
  using (not public.is_familia());

drop policy if exists "Permitir leitura de logs para usuários autenticados"
  on public.agenda_audit_logs;
create policy "Permitir leitura de logs para usuários autenticados"
  on public.agenda_audit_logs
  for select
  to authenticated
  using (not public.is_familia());

-- Configurações da clínica
drop policy if exists "Leitura de configurações — admin" on public.clinic_settings;
create policy "Leitura de configurações — admin"
  on public.clinic_settings
  for select
  to authenticated
  using (not public.is_familia() and public.is_admin());

-- Chat: família sem acesso
drop policy if exists "Membros leem conversas" on public.chat_conversations;
create policy "Membros leem conversas"
  on public.chat_conversations
  for select
  to authenticated
  using (
    not public.is_familia()
    and (
      public.is_chat_conversation_member(id)
      or created_by = auth.uid()
    )
  );

drop policy if exists "Membros leem participantes" on public.chat_conversation_members;
create policy "Membros leem participantes"
  on public.chat_conversation_members
  for select
  to authenticated
  using (
    not public.is_familia()
    and (
      public.is_chat_conversation_member(conversation_id)
      or user_id = auth.uid()
      or exists (
        select 1
        from public.chat_conversations conv
        where conv.id = conversation_id
          and conv.created_by = auth.uid()
      )
    )
  );

drop policy if exists "Membros leem mensagens" on public.chat_messages;
create policy "Membros leem mensagens"
  on public.chat_messages
  for select
  to authenticated
  using (
    not public.is_familia()
    and public.is_chat_conversation_member(conversation_id)
  );
