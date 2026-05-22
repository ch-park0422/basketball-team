-- =============================================
-- teams 테이블에 C팀 컬럼 추가
-- Supabase SQL Editor에서 실행하세요
-- =============================================

ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS team_c_members uuid[] DEFAULT NULL;

-- NULL = 2팀 모드(블랙/화이트), 배열(빈 배열 포함) = 3팀 모드(A/B/C)
