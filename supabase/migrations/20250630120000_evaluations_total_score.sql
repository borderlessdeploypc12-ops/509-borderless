-- Pontuação total da avaliação para indicadores clínicos e gráficos de evolução.

alter table public.evaluations
  add column if not exists total_score numeric(10, 2);

comment on column public.evaluations.total_score is
  'Pontuação total obtida na avaliação (ex.: VB-MAPP, ABLLS). Usada nos indicadores clínicos.';
