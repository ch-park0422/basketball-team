-- =============================================
-- teams 테이블 — 경기별 팀 구성 저장
-- Supabase SQL Editor에서 실행하세요
-- =============================================

create table public.teams (
  id              uuid        default gen_random_uuid() primary key,
  match_id        uuid        not null references public.matches(id) on delete cascade,
  team_a_members  uuid[]      not null default '{}',
  team_b_members  uuid[]      not null default '{}',
  updated_at      timestamptz not null default now(),
  unique(match_id)
);

alter table public.teams enable row level security;

-- 인증된 유저는 팀 구성 조회 가능 (자기 팀 확인용)
create policy "팀 구성 조회"
  on public.teams for select
  to authenticated
  using (true);

-- 관리자만 팀 구성 등록 가능
create policy "관리자 팀 구성 등록"
  on public.teams for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 관리자만 팀 구성 수정 가능
create policy "관리자 팀 구성 수정"
  on public.teams for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
