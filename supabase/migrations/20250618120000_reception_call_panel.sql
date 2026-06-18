-- Painel de chamada na recepção: senha, sala e profissional.

alter table public.agenda_events
  drop constraint if exists agenda_events_status_check;

alter table public.agenda_events
  add column if not exists queue_number integer,
  add column if not exists room_name text,
  add column if not exists called_at timestamptz;

alter table public.agenda_events
  add constraint agenda_events_status_check
  check (
    status in ('confirmado', 'agendado', 'em_espera', 'chamado', 'cancelado')
  );

create index if not exists idx_agenda_events_reception_panel
  on public.agenda_events (event_date, called_at desc)
  where status = 'chamado';

create index if not exists idx_agenda_events_queue_waiting
  on public.agenda_events (event_date, queue_number)
  where status = 'em_espera';

comment on column public.agenda_events.queue_number is 'Senha de atendimento exibida no painel da recepção.';
comment on column public.agenda_events.room_name is 'Sala para onde o paciente deve se dirigir.';
comment on column public.agenda_events.called_at is 'Momento em que o paciente foi chamado no painel.';
