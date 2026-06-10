-- Mensagens diretas entre recepção e profissionais
create table if not exists public.internal_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id) on delete cascade,
  receiver_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_internal_messages_receiver
  on public.internal_messages (receiver_id, created_at desc);

create index if not exists idx_internal_messages_sender
  on public.internal_messages (sender_id, created_at desc);

-- Notificações do sistema (chegada de paciente, novas mensagens)
create table if not exists public.internal_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('patient_waiting', 'new_message')),
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_internal_notifications_user
  on public.internal_notifications (user_id, created_at desc);

create index if not exists idx_internal_notifications_unread
  on public.internal_notifications (user_id)
  where read_at is null;

-- Presença online dos profissionais
create table if not exists public.user_presence (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_seen_at timestamptz not null default now()
);

create index if not exists idx_user_presence_last_seen
  on public.user_presence (last_seen_at desc);

-- Agendamentos (base para trigger de chegada do paciente)
create table if not exists public.agenda_events (
  id text primary key,
  patient_name text not null,
  professional_name text not null,
  professional_user_id uuid references auth.users (id) on delete set null,
  event_date date not null,
  start_time text not null,
  end_time text not null,
  status text not null default 'agendado' check (
    status in ('confirmado', 'agendado', 'em_espera', 'cancelado')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agenda_events_status
  on public.agenda_events (status);

create index if not exists idx_agenda_events_professional_user
  on public.agenda_events (professional_user_id);

-- RLS
alter table public.internal_messages enable row level security;
alter table public.internal_notifications enable row level security;
alter table public.user_presence enable row level security;
alter table public.agenda_events enable row level security;

create policy "Participantes podem ler mensagens"
  on public.internal_messages
  for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Usuários autenticados podem enviar mensagens"
  on public.internal_messages
  for insert
  to authenticated
  with check (auth.uid() = sender_id);

create policy "Destinatário pode marcar mensagem como lida"
  on public.internal_messages
  for update
  to authenticated
  using (auth.uid() = receiver_id);

create policy "Usuário lê as próprias notificações"
  on public.internal_notifications
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Sistema insere notificações para usuários"
  on public.internal_notifications
  for insert
  to authenticated, anon
  with check (true);

create policy "Usuário marca notificação como lida"
  on public.internal_notifications
  for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários autenticados leem presença"
  on public.user_presence
  for select
  to authenticated
  using (true);

create policy "Usuário atualiza a própria presença"
  on public.user_presence
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Usuário renova a própria presença"
  on public.user_presence
  for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Leitura de agenda para autenticados"
  on public.agenda_events
  for select
  to authenticated
  using (true);

create policy "Gestão de agenda para autenticados"
  on public.agenda_events
  for insert
  to authenticated
  with check (true);

create policy "Atualização de agenda para autenticados"
  on public.agenda_events
  for update
  to authenticated
  using (true);

-- Políticas de desenvolvimento (anon)
create policy "Leitura anônima de mensagens em desenvolvimento"
  on public.internal_messages
  for select
  to anon
  using (true);

create policy "Inserção anônima de mensagens em desenvolvimento"
  on public.internal_messages
  for insert
  to anon
  with check (true);

create policy "Leitura anônima de notificações em desenvolvimento"
  on public.internal_notifications
  for select
  to anon
  using (true);

create policy "Leitura anônima de presença em desenvolvimento"
  on public.user_presence
  for select
  to anon
  using (true);

create policy "Leitura anônima de agenda em desenvolvimento"
  on public.agenda_events
  for select
  to anon
  using (true);

-- Trigger: notificar profissional quando paciente entra em espera
create or replace function public.notify_professional_on_patient_waiting()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'em_espera'
    and (tg_op = 'INSERT' or old.status is distinct from 'em_espera')
    and new.professional_user_id is not null
  then
    insert into public.internal_notifications (
      user_id,
      type,
      title,
      body,
      metadata
    )
    values (
      new.professional_user_id,
      'patient_waiting',
      'Paciente aguardando',
      'O paciente ' || new.patient_name || ' chegou e está aguardando na recepção.',
      jsonb_build_object(
        'appointment_id', new.id,
        'patient_name', new.patient_name,
        'professional_name', new.professional_name
      )
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_agenda_event_waiting on public.agenda_events;

create trigger on_agenda_event_waiting
  after insert or update of status on public.agenda_events
  for each row
  execute function public.notify_professional_on_patient_waiting();

-- Trigger: notificar destinatário sobre nova mensagem
create or replace function public.notify_receiver_on_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sender_name text;
begin
  select full_name into sender_name
  from public.user_profiles
  where id = new.sender_id;

  insert into public.internal_notifications (
    user_id,
    type,
    title,
    body,
    metadata
  )
  values (
    new.receiver_id,
    'new_message',
    'Nova mensagem',
    coalesce(sender_name, 'Recepção') || ': ' || left(new.content, 120),
    jsonb_build_object(
      'message_id', new.id,
      'sender_id', new.sender_id
    )
  );

  return new;
end;
$$;

drop trigger if exists on_internal_message_created on public.internal_messages;

create trigger on_internal_message_created
  after insert on public.internal_messages
  for each row
  execute function public.notify_receiver_on_new_message();

-- Realtime
alter table public.internal_messages replica identity full;
alter table public.internal_notifications replica identity full;

alter publication supabase_realtime add table public.internal_messages;
alter publication supabase_realtime add table public.internal_notifications;
