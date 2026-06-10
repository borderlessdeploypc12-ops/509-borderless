-- Cargo/especialidade clínica do profissional (Psicólogo, AT, etc.)
alter table public.user_profiles
  add column if not exists professional_role text check (
    professional_role is null or professional_role in (
      'Psicólogo',
      'Assistente Terapêutico (AT)',
      'Coordenador',
      'Fonoaudiólogo',
      'Terapeuta Ocupacional'
    )
  );

create index if not exists idx_user_profiles_professional_role
  on public.user_profiles (professional_role)
  where professional_role is not null;

-- Índice composto para busca rápida de disponibilidade na agenda
create index if not exists idx_agenda_events_availability_search
  on public.agenda_events (event_date, start_time, professional_name)
  where status <> 'cancelado';

create index if not exists idx_agenda_events_date_professional_user
  on public.agenda_events (event_date, professional_user_id)
  where status <> 'cancelado';
