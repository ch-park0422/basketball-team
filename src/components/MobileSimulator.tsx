"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MobileSimulator() {
  const [open, setOpen] = useState(false);
  const [isTopFrame, setIsTopFrame] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    try {
      setIsTopFrame(window === window.top);
    } catch {
      // cross-origin iframe
      setIsTopFrame(false);
    }
  }, []);

  // iframe 안이거나 hydration 전에는 렌더링하지 않음
  if (!isTopFrame) return null;

  return (
    <>
      {/* 플로팅 토글 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="모바일 뷰 시뮬레이터"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-white shadow-lg rounded-2xl flex items-center justify-center text-xl border border-black/[0.08] hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
      >
        📱
      </button>

      {/* 시뮬레이터 오버레이 */}
      {open && (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center">
          {/* 닫기 버튼 */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-lg font-medium transition-all"
          >
            ✕
          </button>

          {/* 라벨 */}
          <p className="absolute top-6 left-1/2 -translate-x-1/2 text-white/60 text-[13px] font-medium tracking-wide whitespace-nowrap">
            📱 375 × 812 · iPhone 14
          </p>

          {/* 폰 프레임 */}
          <div className="relative mt-6" style={{ transform: "scale(0.88)", transformOrigin: "center center" }}>
            {/* 외부 셸 */}
            <div
              className="relative bg-[#1c1c1e] rounded-[50px]"
              style={{
                padding: "14px 10px 10px",
                boxShadow:
                  "0 0 0 2px #3a3a3c, inset 0 0 0 1px #2a2a2a, 0 40px 80px rgba(0,0,0,0.9)",
              }}
            >
              {/* Dynamic Island (노치) */}
              <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-10 flex items-center justify-center gap-2 pointer-events-none">
                <div className="w-2.5 h-2.5 bg-[#1a1a1a] rounded-full ring-1 ring-[#2a2a2a]" />
                <div className="w-10 h-2 bg-[#111] rounded-full" />
              </div>

              {/* 스크린 iframe */}
              <iframe
                src={pathname}
                width={375}
                height={812}
                className="rounded-[40px] block"
                style={{ border: "none", display: "block", overflow: "hidden" }}
                title="모바일 뷰 미리보기"
              />

              {/* 홈 인디케이터 */}
              <div className="flex justify-center pt-2">
                <div className="w-32 h-[5px] bg-white/25 rounded-full" />
              </div>
            </div>

            {/* 사이드 버튼 — 왼쪽 (음소거/음량) */}
            <div className="absolute left-[-13px] top-[85px] w-[4px] h-9 bg-[#3a3a3c] rounded-l-sm" />
            <div className="absolute left-[-13px] top-[135px] w-[4px] h-14 bg-[#3a3a3c] rounded-l-sm" />
            <div className="absolute left-[-13px] top-[162px] w-[4px] h-14 bg-[#3a3a3c] rounded-l-sm" />
            {/* 사이드 버튼 — 오른쪽 (전원) */}
            <div className="absolute right-[-13px] top-[125px] w-[4px] h-20 bg-[#3a3a3c] rounded-r-sm" />
          </div>
        </div>
      )}
    </>
  );
}
