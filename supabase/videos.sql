-- =============================================
-- videos 테이블 생성
-- Supabase SQL Editor에서 실행하세요
-- =============================================

CREATE TABLE IF NOT EXISTS public.videos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  youtube_url text NOT NULL,
  category text NOT NULL CHECK (category IN ('full', 'highlight')),
  match_id uuid REFERENCES public.matches(id) ON DELETE SET NULL,
  player_ids uuid[] DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 누구나 조회 가능
CREATE POLICY "Anyone can view videos"
  ON public.videos FOR SELECT
  USING (true);

-- 관리자만 등록
CREATE POLICY "Admin can insert videos"
  ON public.videos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 관리자만 수정
CREATE POLICY "Admin can update videos"
  ON public.videos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 관리자만 삭제
CREATE POLICY "Admin can delete videos"
  ON public.videos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
