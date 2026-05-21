-- =============================================
-- 회원 등급 변경 RPC 함수
-- Supabase 대시보드 > SQL Editor 에서 실행하세요
-- =============================================

create or replace function public.update_user_role(target_id uuid, new_role text)
returns void
language plpgsql
security definer set search_path = 'public'
as $$
begin
  -- role 값 검증
  if new_role not in ('user', 'admin') then
    raise exception 'invalid role: %', new_role;
  end if;

  -- 호출자가 admin인지 확인
  if not exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'unauthorized';
  end if;

  -- 자기 자신의 role은 변경 불가
  if target_id = auth.uid() then
    raise exception 'cannot change your own role';
  end if;

  update profiles set role = new_role where id = target_id;
end;
$$;

-- =============================================
-- 첫 번째 관리자 지정 (본인 user id로 변경하세요)
-- Supabase > Authentication > Users 에서 UUID 확인
-- =============================================
-- update profiles set role = 'admin' where id = '여기에-본인-UUID';
