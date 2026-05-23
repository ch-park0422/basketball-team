"use client";

import { useState } from "react";
import Link from "next/link";

// ── 타입 ──────────────────────────────────────────────────────
export type ProfileData = {
  name: string;
  jerseyNumber: number | null;
  position: string | null;
  role: string;
  joinedAt: string;
  attendanceCount: number;
  highlightCount: number;
  voteRate: number; // 0–100
  userId: string;
};

// ── 포지션 라벨 ───────────────────────────────────────────────
const POSITION_LABELS: Record<string, string> = {
  PG: "PG · 포인트가드",
  SG: "SG · 슈팅가드",
  SF: "SF · 스몰포워드",
  PF: "PF · 파워포워드",
  C:  "C · 센터",
};

// ── 활동 등급 ─────────────────────────────────────────────────
function getGrade(count: number): { label: string; color: string } | null {
  if (count >= 30) return { label: "🏆 레전드", color: "text-[#ff9f0a]" };
  if (count >= 20) return { label: "⭐ 베테랑", color: "text-[#0071e3]" };
  if (count >= 10) return { label: "👍 활발한 멤버", color: "text-[#34c759]" };
  if (count >= 1)  return { label: "🌱 참여 중", color: "text-[#6e6e73]" };
  return null;
}

// ── 원형 진행률 SVG ──────────────────────────────────────────
function CircularProgress({ value, size = 96 }: { value: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(value, 100) / 100);
  const color =
    value >= 80 ? "#34c759" :
    value >= 50 ? "#0071e3" :
    value >   0 ? "#ff9f0a" :
                  "#e5e5ea";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke="#f5f5f7" strokeWidth="8" fill="none"
      />
      {value > 0 && (
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth="8" fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
    </svg>
  );
}

// ── 하네스 목업 ───────────────────────────────────────────────
const MOCK_A: ProfileData = {
  name: "박창헌",
  jerseyNumber: 20,
  position: "SF",
  role: "admin",
  joinedAt: "2024-01-15T00:00:00Z",
  attendanceCount: 45,
  highlightCount: 18,
  voteRate: 98,
  userId: "mock-a",
};

const MOCK_B: ProfileData = {
  name: "이신입",
  jerseyNumber: null,
  position: null,
  role: "user",
  joinedAt: new Date().toISOString(),
  attendanceCount: 0,
  highlightCount: 0,
  voteRate: 0,
  userId: "mock-b",
};

const MOCK_CASES = [
  {
    key: "A" as const,
    label: "케이스 A",
    desc: "올스타 회원 · 참석 45회, 하이라이트 18개, 투표 98%",
    data: MOCK_A,
  },
  {
    key: "B" as const,
    label: "케이스 B",
    desc: "신입 회원 · 모든 지표 0, 가입일 오늘",
    data: MOCK_B,
  },
];

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function ProfileClient({
  data,
  harness = false,
}: {
  data?: ProfileData;
  harness?: boolean;
}) {
  const [mockCase, setMockCase] = useState<"A" | "B">("A");

  const d: ProfileData = harness
    ? MOCK_CASES.find((c) => c.key === mockCase)!.data
    : data!;

  const {
    name, jerseyNumber, position, role,
    joinedAt, attendanceCount, highlightCount, voteRate, userId,
  } = d;

  const joinDate = new Date(joinedAt);
  const isNewMember = attendanceCount === 0 && highlightCount === 0 && voteRate === 0;
  const grade = getGrade(attendanceCount);
  const voteColor =
    voteRate >= 80 ? "text-[#34c759]" :
    voteRate >= 50 ? "text-[#0071e3]" :
    voteRate >   0 ? "text-[#ff9f0a]" :
                     "text-[#aeaeb2]";
  const voteLabel =
    voteRate >= 80 ? "매우 성실한 팀원이에요" :
    voteRate >= 50 ? "꾸준히 참여 중이에요" :
    voteRate >   0 ? "조금 더 투표해 보세요" :
                     "첫 투표를 기다리고 있어요";

  return (
    <div className="bg-[#f5f5f7] min-h-screen">

      {/* ── 하네스 컨트롤 바 ──────────────────────────────── */}
      {harness && (
        <div className="bg-white border-b border-black/[0.06] px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-3 text-[12px]">
          <span className="text-[#1d1d1f] font-semibold">🧪 Harness</span>
          <span className="text-[#c7c7cc]">·</span>
          <span className="text-[#6e6e73]">Mock Data · DB 미연결</span>
          <div className="flex gap-1.5 ml-auto">
            {MOCK_CASES.map((c) => (
              <button
                key={c.key}
                onClick={() => setMockCase(c.key)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                  mockCase === c.key
                    ? "bg-[#0071e3] text-white"
                    : "bg-black/[0.04] text-[#6e6e73] hover:bg-black/[0.08]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <span className="text-[#6e6e73] hidden sm:block truncate max-w-[300px]">
            {MOCK_CASES.find((c) => c.key === mockCase)?.desc}
          </span>
        </div>
      )}

      {/* ── 페이지 콘텐츠 ─────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-5">

        {/* 페이지 레이블 */}
        <div className="px-1">
          <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-1">
            Profile
          </p>
          <h1 className="text-[26px] sm:text-[30px] font-bold text-[#1d1d1f] tracking-tight">
            내 프로필
          </h1>
        </div>

        {/* ── 프로필 카드 ───────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
            {/* 아바타 */}
            <div className="flex-shrink-0">
              <div
                className={`flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full text-[22px] sm:text-[26px] font-bold text-white ${
                  jerseyNumber != null ? "bg-[#0071e3]" : "bg-black/[0.08]"
                }`}
              >
                {jerseyNumber != null ? `#${jerseyNumber}` : (
                  <span className="text-[#aeaeb2] text-[28px]">?</span>
                )}
              </div>
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="text-[22px] sm:text-[26px] font-bold text-[#1d1d1f] tracking-tight">
                  {name}
                </h2>
                {role === "admin" && (
                  <span className="text-[11px] font-semibold bg-[#0071e3] text-white px-2.5 py-0.5 rounded-full">
                    관리자
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                {position ? (
                  <span className="text-[13px] text-[#6e6e73] bg-black/[0.04] px-2.5 py-1 rounded-full font-medium">
                    {POSITION_LABELS[position] ?? position}
                  </span>
                ) : (
                  <span className="text-[13px] text-[#aeaeb2] italic">포지션 미설정</span>
                )}
                {grade && (
                  <span className={`text-[12px] font-semibold ${grade.color}`}>
                    {grade.label}
                  </span>
                )}
              </div>

              <p className="text-[13px] text-[#6e6e73]">
                <span className="text-[#aeaeb2] mr-1">가입</span>
                {joinDate.toLocaleDateString("ko-KR", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* ── 활동 통계 그리드 ──────────────────────────── */}
        <div>
          <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-4 px-1">
            Activity
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* 총 참석 */}
            <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">
                  총 참석
                </p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#0071e3" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M19 5C19 12 5 12 5 19" stroke="#0071e3" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M5 5C5 12 19 12 19 19" stroke="#0071e3" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>

              <div className="flex-1">
                <p className="text-[52px] font-bold text-[#1d1d1f] leading-none tabular-nums">
                  {attendanceCount}
                </p>
                <p className="text-[13px] text-[#6e6e73] font-medium mt-1.5">경기 출전</p>
              </div>

              {grade && (
                <div className="mt-4 pt-4 border-t border-black/[0.04]">
                  <span className={`text-[12px] font-semibold ${grade.color}`}>
                    {grade.label}
                  </span>
                </div>
              )}
              {!grade && attendanceCount === 0 && (
                <div className="mt-4 pt-4 border-t border-black/[0.04]">
                  <p className="text-[12px] text-[#aeaeb2]">첫 경기를 기다리는 중</p>
                </div>
              )}
            </div>

            {/* 하이라이트 영상 */}
            <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">
                  하이라이트
                </p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <polygon points="5,3 19,12 5,21" fill="none" stroke="#ff9f0a" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="flex-1">
                <p className="text-[52px] font-bold text-[#1d1d1f] leading-none tabular-nums">
                  {highlightCount}
                </p>
                <p className="text-[13px] text-[#6e6e73] font-medium mt-1.5">내가 나온 영상</p>
              </div>

              <div className="mt-4 pt-4 border-t border-black/[0.04]">
                {highlightCount > 0 ? (
                  <Link
                    href={`/videos?category=highlight&playerId=${userId}`}
                    className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#0071e3] hover:text-[#0077ed] transition-colors"
                  >
                    내 하이라이트 보기 →
                  </Link>
                ) : (
                  <p className="text-[12px] text-[#aeaeb2]">아직 등록된 영상이 없어요</p>
                )}
              </div>
            </div>

            {/* 투표 참여율 */}
            <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">
                  투표 참여율
                </p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="#34c759" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="#34c759" strokeWidth="1.5"/>
                </svg>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center py-1">
                <div className="relative flex items-center justify-center w-24 h-24">
                  <CircularProgress value={voteRate} size={96} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[20px] font-bold text-[#1d1d1f] tabular-nums">
                      {voteRate}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-black/[0.04]">
                <p className={`text-[12px] font-medium ${voteColor}`}>{voteLabel}</p>
              </div>
            </div>

          </div>
        </div>

        {/* ── 신입 회원 안내 배너 ───────────────────────── */}
        {isNewMember && (
          <div className="bg-white rounded-2xl shadow-sm px-6 py-7 sm:px-8 sm:py-8">
            <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-3">
              Get Started
            </p>
            <h2 className="text-[19px] sm:text-[21px] font-bold text-[#1d1d1f] mb-1.5">
              팀에 오신 것을 환영해요! 🎉
            </h2>
            <p className="text-[#6e6e73] text-[14px] mb-6 leading-relaxed">
              경기 일정을 확인하고 첫 투표를 해보세요.
              <br className="hidden sm:block" />
              활동이 쌓이면 이 화면에 나만의 기록이 남습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/matches"
                className="flex items-center justify-center gap-2 bg-[#0071e3] text-white px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-[#0077ed] transition-all"
              >
                이번 주 경기 투표하러 가기 →
              </Link>
              <Link
                href="/videos"
                className="flex items-center justify-center gap-2 bg-black/[0.04] text-[#1d1d1f] px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-black/[0.08] transition-all"
              >
                팀 하이라이트 구경하기
              </Link>
            </div>
          </div>
        )}

        {/* ── 하이라이트가 있을 때 큰 CTA 카드 ──────────── */}
        {!isNewMember && highlightCount > 0 && (
          <div className="bg-white rounded-2xl shadow-sm px-6 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-1">
                My Highlights
              </p>
              <p className="text-[16px] font-bold text-[#1d1d1f]">
                나를 태그한 영상 {highlightCount}개가 있어요
              </p>
              <p className="text-[13px] text-[#6e6e73] mt-0.5">
                팀원들이 찍은 나의 활약을 확인해 보세요
              </p>
            </div>
            <Link
              href={`/videos?category=highlight&playerId=${userId}`}
              className="flex-shrink-0 flex items-center justify-center gap-2 bg-[#0071e3] text-white px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-[#0077ed] transition-all"
            >
              내가 나온 하이라이트 보러가기 →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
