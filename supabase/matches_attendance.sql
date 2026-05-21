-- =============================================
-- 경기 일정 & 참석 투표 테이블
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 프로필 조회 정책을 비로그인 사용자도 읽을 수 있도록 업데이트
-- (경기 카드에서 참석자 이름 표시 시 필요)
drop policy if exists "프로필 전체 조회" on public.profiles;
create policy "프로필 전체 조회"
  on public.profiles for select
  using (true);

-- ─── 1. matches 테이블 ───────────────────────────────

create table public.matches (
  id          uuid        default gen_random_uuid() primary key,
  date        timestamptz not null,
  location    text        not null,
  fee         integer     not null default 0,
  description text,
  created_by  uuid        references auth.users(id),
  created_at  timestamptz not null default now()
);

alter table public.matches enable row level security;

-- 누구나 경기 일정 조회 가능
create policy "경기 일정 전체 조회"
  on public.matches for select
  using (true);

-- admin만 경기 등록 가능
create policy "관리자만 경기 등록"
  on public.matches for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- admin만 경기 삭제 가능
create policy "관리자만 경기 삭제"
  on public.matches for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 2. attendance 테이블 ─────────────────────────────

create table public.attendance (
  id         uuid        default gen_random_uuid() primary key,
  match_id   uuid        not null references public.matches(id) on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  status     text        not null check (status in ('attendance', 'absence')),
  updated_at timestamptz not null default now(),
  unique(match_id, user_id)
);

alter table public.attendance enable row level security;

-- 누구나 참석 정보 조회 가능
create policy "참석 정보 전체 조회"
  on public.attendance for select
  using (true);

-- 로그인한 유저는 본인 참석 정보 등록 가능
create policy "본인 참석 등록"
  on public.attendance for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 본인 참석 정보만 수정 가능
create policy "본인 참석 수정"
  on public.attendance for update
  to authenticated
  using (auth.uid() = user_id);

-- ─── 3. Realtime 활성화 (참석 투표 실시간 반영) ──────

alter publication supabase_realtime add table public.attendance;
