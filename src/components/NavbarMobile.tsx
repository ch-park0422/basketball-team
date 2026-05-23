"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Props = {
  role: string | null;
  isLoggedIn: boolean;
  name: string | undefined;
  jerseyNumber: number | undefined;
  email: string | undefined;
  position: string | undefined;
};

export default function NavbarMobile({ role, isLoggedIn, name, jerseyNumber, email, position }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // 메뉴 열림 시 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* 햄버거 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-black/[0.04] active:bg-black/[0.08] transition-all gap-[5px]"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
      >
        <span className={`block w-5 h-[1.5px] bg-[#1d1d1f] transition-all duration-200 origin-center ${open ? "rotate-45 translate-y-[6.5px]" : ""}`} />
        <span className={`block w-5 h-[1.5px] bg-[#1d1d1f] transition-all duration-200 ${open ? "opacity-0 scale-x-0" : ""}`} />
        <span className={`block w-5 h-[1.5px] bg-[#1d1d1f] transition-all duration-200 origin-center ${open ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
      </button>

      {/* 반투명 백드롭 */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* 모바일 드롭다운 메뉴 */}
      <div
        className={`fixed top-14 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-b border-black/[0.06] shadow-xl transition-all duration-200 md:hidden ${
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="px-4 py-3 space-y-0.5">
          {/* 기본 메뉴 */}
          <Link
            href="/matches"
            onClick={() => setOpen(false)}
            className="flex items-center px-4 py-3 rounded-xl text-[15px] font-medium text-[#1d1d1f] hover:bg-black/[0.04] active:bg-black/[0.08] transition-all"
          >
            경기 일정
          </Link>
          <Link
            href="/videos"
            onClick={() => setOpen(false)}
            className="flex items-center px-4 py-3 rounded-xl text-[15px] font-medium text-[#1d1d1f] hover:bg-black/[0.04] active:bg-black/[0.08] transition-all"
          >
            영상
          </Link>

          {/* 관리자 메뉴 */}
          {role === "admin" && (
            <>
              <div className="pt-2 pb-1 px-4">
                <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">Admin</p>
              </div>
              <Link
                href="/admin/users"
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-[15px] font-medium text-[#1d1d1f] hover:bg-black/[0.04] active:bg-black/[0.08] transition-all"
              >
                회원 관리
              </Link>
              <Link
                href="/admin/team-builder"
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-[15px] font-medium text-[#1d1d1f] hover:bg-black/[0.04] active:bg-black/[0.08] transition-all"
              >
                팀 빌더
              </Link>
              <Link
                href="/admin/harness"
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-[15px] font-medium text-[#1d1d1f] hover:bg-black/[0.04] active:bg-black/[0.08] transition-all"
              >
                하네스
              </Link>
            </>
          )}

          {/* 구분선 */}
          <div className="h-px bg-black/[0.06] !mt-2" />

          {/* 유저 섹션 */}
          {isLoggedIn ? (
            <div className="space-y-0.5 pb-2">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/[0.04] active:bg-black/[0.08] transition-all"
              >
                <span className="inline-flex items-center justify-center w-9 h-9 bg-[#0071e3] rounded-full text-[14px] font-bold text-white flex-shrink-0">
                  {jerseyNumber ?? "#"}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-[15px] text-[#1d1d1f] truncate">{name ?? email}</p>
                  {position && <p className="text-[12px] text-[#6e6e73]">{position}</p>}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 rounded-xl text-[15px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] active:bg-black/[0.08] transition-all"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 px-4 pb-3 pt-1">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-xl text-[15px] font-medium text-center text-[#1d1d1f] bg-black/[0.04] hover:bg-black/[0.08] transition-all"
              >
                로그인
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="w-full bg-[#0071e3] text-white py-3 rounded-xl text-[15px] font-medium text-center hover:bg-[#0077ed] transition-all"
              >
                팀 합류하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
