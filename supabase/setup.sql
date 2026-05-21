-- =============================================
-- 농구팀 홈페이지 - Supabase 초기 설정 SQL
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요
-- =============================================

-- 1. Profiles 테이블 생성
create table public.profiles (
  id          uuid        references auth.users(id) on delete cascade primary key,
  name        text        not null,
  jersey_number integer,
  position    text        check (position in ('PG', 'SG', 'SF', 'PF', 'C')),
  role        text        not null default 'user',
  created_at  timestamptz not null default now()
);

-- 2. Row Level Security 활성화
alter table public.profiles enable row level security;

-- 3. 정책: 로그인한 사용자는 모든 프로필 조회 가능
create policy "프로필 전체 조회"
  on public.profiles for select
  to authenticated
  using (true);

-- 4. 정책: 본인 프로필만 수정 가능
create policy "본인 프로필 수정"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 5. 정책: 서비스 계정(trigger)이 프로필 생성 가능
create policy "서비스 계정 프로필 생성"
  on public.profiles for insert
  with check (true);

-- 6. 회원가입 시 자동으로 profiles 행을 생성하는 트리거
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, jersey_number, position)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    (new.raw_user_meta_data ->> 'jersey_number')::integer,
    new.raw_user_meta_data ->> 'position'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
