"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// ── 공유 타입 ─────────────────────────────────────────────
export type Attendee = { userId: string; name: string };

export type DashboardMatch = {
  id: string;
  date: string;
  location: string;
  fee: number;
  description: string | null;
  attendees: Attendee[];
  absentees: Attendee[];
  myStatus: "attendance" | "absence" | null;
};

export type DashboardVideo = {
  id: string;
  title: string;
  youtube_url: string;
  match_id: string | null;
  playerNames: string[];
};

export type DashboardData = {
  nextMatch: DashboardMatch | null;
  latestFullVideo: DashboardVideo | null;
  highlights: DashboardVideo[];
  currentUserId: string | null;
  currentUserName: string | null;
  isLoggedIn: boolean;
};

// ── 목업 데이터 ───────────────────────────────────────────

const MOCK_A: DashboardData = {
  nextMatch: {
    id: "mock-a",
    date: new Date(Date.now() + 3 * 86_400_000).toISOString(),
    location: "광진구 실내체육관",
    fee: 5000,
    description: "이번 주 정기 경기! 무조건 참석 부탁드립니다 🔥",
    attendees: [
      { userId: "u1", name: "김민준" }, { userId: "u2", name: "이서준" },
      { userId: "u3", name: "박지호" }, { userId: "u4", name: "정현우" },
      { userId: "u5", name: "최승현" }, { userId: "u6", name: "강도윤" },
      { userId: "u7", name: "윤지성" }, { userId: "u8", name: "임태양" },
      { userId: "u9", name: "오승현" }, { userId: "u10", name: "한민석" },
      { userId: "u11", name: "신정우" }, { userId: "mock-me", name: "박창헌" },
    ],
    absentees: [
      { userId: "u12", name: "류성현" }, { userId: "u13", name: "김태현" },
    ],
    myStatus: "attendance",
  },
  latestFullVideo: {
    id: "v1", title: "2025년 6월 정기 경기 풀영상",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    match_id: "mock-a", playerNames: [],
  },
  highlights: [
    { id: "h1", title: "김민준 3점슛 하이라이트 모음",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      match_id: null, playerNames: ["김민준"] },
    { id: "h2", title: "이서준 레이업 연속 베스트",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      match_id: null, playerNames: ["이서준", "박지호"] },
    { id: "h3", title: "5월 경기 최고의 장면들",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      match_id: null, playerNames: ["정현우", "최승현", "강도윤"] },
  ],
  currentUserId: "mock-me",
  currentUserName: "박창헌",
  isLoggedIn: true,
};

const MOCK_B: DashboardData = {
  nextMatch: null,
  latestFullVideo: null,
  highlights: [],
  currentUserId: null,
  currentUserName: null,
  isLoggedIn: false,
};

const MOCK_C: DashboardData = {
  nextMatch: {
    id: "mock-c",
    date: new Date(Date.now() + 1 * 86_400_000).toISOString(),
    location: "서울특별시 강남구 테헤란로 123-45 XX빌딩 지하 2층",
    fee: 12000,
    description: "정기 시즌 플레이오프 1라운드. 모든 팀원 참석 필수. 유니폼 지참.",
    attendees: [
      { userId: "v1", name: "남궁민서황보준혁" },
      { userId: "v2", name: "Alexander Kim" },
      { userId: "v3", name: "제임스르브론" },
    ],
    absentees: [],
    myStatus: null,
  },
  latestFullVideo: {
    id: "vc",
    title: "2025년 5월 28일 강남 플레이오프 1라운드 풀영상",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    match_id: "mock-c", playerNames: [],
  },
  highlights: [
    { id: "hc1", title: "360도 레이업 덩크 하이라이트 모음",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      match_id: null, playerNames: ["남궁민서황보준혁", "Alexander Kim"] },
    { id: "hc2", title: "연장전 버저비터 3점슛",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      match_id: null, playerNames: ["제임스르브론"] },
    { id: "hc3", title: "전반전 압축 리뷰",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      match_id: null, playerNames: ["남궁민서황보준혁", "제임스르브론"] },
  ],
  currentUserId: "mock-me-c",
  currentUserName: "박창헌",
  isLoggedIn: true,
};

const MOCK_CASES = [
  { key: "A" as const, label: "케이스 A · 풍부한 데이터", data: MOCK_A },
  { key: "B" as const, label: "케이스 B · 빈 상태",       data: MOCK_B },
  { key: "C" as const, label: "케이스 C · 텍스트 오버플로우", data: MOCK_C },
];

// ── YouTube 유틸 ─────────────────────────────────────────
function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return m ? m[1] : null;
}

// ── D-Day 계산 ────────────────────────────────────────────
function getDDay(dateStr: string): { label: string; isToday: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return { label: "D-DAY", isToday: true };
  if (diff > 0)   return { label: `D-${diff}`, isToday: false };
  return            { label: `D+${Math.abs(diff)}`, isToday: false };
}

// ── Hero 섹션 ─────────────────────────────────────────────
function HeroSection({ match }: { match: DashboardMatch | null }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!match) {
    return (
      <section className="w-full bg-white border-b border-black/[0.06] py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[13px] font-medium text-[#6e6e73] mb-4">Next Game</p>
          <p className="text-[5rem] sm:text-[8rem] md:text-[11rem] font-bold text-[#e5e5ea] leading-none mb-4 tracking-tight">
            TBD
          </p>
          <p className="text-[#6e6e73] text-[15px]">새로운 경기가 등록되면 여기에 표시됩니다</p>
        </div>
      </section>
    );
  }

  const { label, isToday } = mounted
    ? getDDay(match.date)
    : { label: "---", isToday: false };

  const matchDate = new Date(match.date);
  const dateStr = matchDate.toLocaleDateString("ko-KR", {
    month: "long", day: "numeric", weekday: "short",
  });
  const timeStr = matchDate.toLocaleTimeString("ko-KR", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <section className="w-full bg-white border-b border-black/[0.06] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 md:gap-10">
          {/* 좌: D-DAY + 경기 정보 */}
          <div>
            <p className="text-[12px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-3">
              Next Game
            </p>
            <p className={`text-[4rem] sm:text-[6rem] md:text-[9rem] font-bold leading-none tracking-tight mb-5 ${
              isToday ? "text-[#0071e3]" : "text-[#1d1d1f]"
            }`}>
              {label}
            </p>
            <div className="space-y-1.5">
              <p className="text-[#1d1d1f] font-semibold text-lg">
                {dateStr} &nbsp;·&nbsp; {timeStr}
              </p>
              <p className="text-[#6e6e73] text-[15px] max-w-md truncate" title={match.location}>
                {match.location}
              </p>
              {match.fee > 0 && (
                <span className="inline-block text-[12px] font-medium text-[#6e6e73] bg-black/[0.04] px-3 py-1 rounded-full mt-1">
                  참가비 {match.fee.toLocaleString()}원
                </span>
              )}
            </div>
          </div>

          {/* 우: 참석 현황 */}
          <div className="flex gap-3 shrink-0">
            <div className="bg-[#0071e3] px-5 sm:px-8 py-4 sm:py-5 rounded-2xl text-center min-w-[80px] sm:min-w-[100px]">
              <p className="text-3xl sm:text-4xl font-bold text-white leading-none">
                {match.attendees.length}
              </p>
              <p className="text-white/70 text-[11px] font-medium mt-1.5 uppercase tracking-widest">참석</p>
            </div>
            <div className="bg-black/[0.04] px-5 sm:px-8 py-4 sm:py-5 rounded-2xl text-center min-w-[80px] sm:min-w-[100px]">
              <p className="text-3xl sm:text-4xl font-bold text-[#6e6e73] leading-none">
                {match.absentees.length}
              </p>
              <p className="text-[#6e6e73] text-[11px] font-medium mt-1.5 uppercase tracking-widest">불참</p>
            </div>
          </div>
        </div>

        {match.description && (
          <div className="mt-8 pt-6 border-t border-black/[0.06]">
            <p className="text-[#6e6e73] text-[15px] leading-relaxed max-w-xl">{match.description}</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ── 투표 위젯 ─────────────────────────────────────────────
function MatchWidget({
  match, currentUserId, currentUserName, isLoggedIn, isHarness,
}: {
  match: DashboardMatch;
  currentUserId: string | null;
  currentUserName: string | null;
  isLoggedIn: boolean;
  isHarness: boolean;
}) {
  const router = useRouter();
  const serverStatus = match.myStatus;
  const [myVote, setMyVote] = useState<"attendance" | "absence" | null>(serverStatus);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (!voting) setMyVote(serverStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverStatus]);

  const displayAttendees = [
    ...match.attendees.filter((a) => a.userId !== currentUserId),
    ...(myVote === "attendance" && currentUserId
      ? [match.attendees.find((a) => a.userId === currentUserId) ?? {
          userId: currentUserId, name: currentUserName ?? "나",
        }]
      : []),
  ];
  const displayAbsentees = [
    ...match.absentees.filter((a) => a.userId !== currentUserId),
    ...(myVote === "absence" && currentUserId
      ? [match.absentees.find((a) => a.userId === currentUserId) ?? {
          userId: currentUserId, name: currentUserName ?? "나",
        }]
      : []),
  ];

  async function vote(status: "attendance" | "absence") {
    if (!isLoggedIn || voting) return;
    setMyVote(status);
    if (!isHarness) {
      setVoting(true);
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: match.id, status }),
      });
      setVoting(false);
      if (res.ok) router.refresh();
      else setMyVote(serverStatus);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-black/[0.06]">
        <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-1">
          Match Details
        </p>
        <p className="text-[#1d1d1f] font-semibold text-[15px] leading-snug line-clamp-2">
          {match.location}
        </p>
      </div>

      {/* 참석자 목록 */}
      <div className="px-5 py-4 flex-1 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-2 h-2 bg-[#0071e3] rounded-full" />
            <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">
              참석 {displayAttendees.length}
            </p>
          </div>
          {displayAttendees.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {displayAttendees.map((a) => (
                <span
                  key={a.userId}
                  className={`text-[12px] px-2.5 py-1 rounded-full font-medium truncate max-w-[120px] ${
                    a.userId === currentUserId
                      ? "bg-[#0071e3] text-white"
                      : "bg-black/[0.04] text-[#1d1d1f]"
                  }`}
                  title={a.name}
                >
                  {a.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#6e6e73]">아직 참석자가 없습니다</p>
          )}
        </div>

        {displayAbsentees.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-2 h-2 bg-[#aeaeb2] rounded-full" />
              <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">
                불참 {displayAbsentees.length}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {displayAbsentees.map((a) => (
                <span
                  key={a.userId}
                  className={`text-[12px] px-2.5 py-1 rounded-full font-medium truncate max-w-[120px] ${
                    a.userId === currentUserId
                      ? "bg-[#aeaeb2] text-white"
                      : "bg-black/[0.04] text-[#6e6e73]"
                  }`}
                  title={a.name}
                >
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 투표 버튼 */}
      {isLoggedIn ? (
        <div className="flex gap-2 p-4 border-t border-black/[0.06] mt-auto">
          <button
            onClick={() => vote("attendance")}
            disabled={voting}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
              myVote === "attendance"
                ? "bg-[#0071e3] text-white"
                : "bg-black/[0.04] text-[#1d1d1f] hover:bg-black/[0.08]"
            } disabled:cursor-not-allowed`}
          >
            참석
          </button>
          <button
            onClick={() => vote("absence")}
            disabled={voting}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
              myVote === "absence"
                ? "bg-[#6e6e73] text-white"
                : "bg-black/[0.04] text-[#1d1d1f] hover:bg-black/[0.08]"
            } disabled:cursor-not-allowed`}
          >
            불참
          </button>
        </div>
      ) : (
        <div className="p-4 border-t border-black/[0.06]">
          <Link
            href="/login"
            className="block w-full py-2.5 rounded-xl text-[13px] font-semibold text-center text-[#0071e3] bg-[#0071e3]/[0.08] hover:bg-[#0071e3]/[0.14] transition-all"
          >
            로그인하고 투표하기
          </Link>
        </div>
      )}
    </div>
  );
}

// ── 풀영상 카드 ───────────────────────────────────────────
function FullVideoCard({ video }: { video: DashboardVideo }) {
  const ytId = extractYouTubeId(video.youtube_url);
  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
  const watchUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : video.youtube_url;

  return (
    <a
      href={watchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video bg-black/[0.04] overflow-hidden flex-shrink-0">
        {thumb ? (
          <Image
            src={thumb}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/[0.04]">
            <span className="text-[#aeaeb2] text-5xl">▶</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-[#1d1d1f] text-xl ml-1">▶</span>
          </div>
        </div>
        <div className="absolute top-3 left-3">
          <span className="text-[11px] font-semibold bg-black/70 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
            Full Game
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="font-semibold text-[#1d1d1f] text-[14px] line-clamp-3 flex-1 leading-snug">
          {video.title}
        </p>
        <p className="text-[12px] text-[#0071e3] mt-3 font-medium">
          YouTube에서 보기 →
        </p>
      </div>
    </a>
  );
}

function FullVideoEmpty() {
  return (
    <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-16 px-6 h-full text-center">
      <p className="text-4xl mb-3 opacity-20">🎬</p>
      <p className="text-[#1d1d1f] font-semibold text-[14px]">등록된 풀영상이 없습니다</p>
      <p className="text-[#6e6e73] text-[13px] mt-1">경기 후 영상을 등록해 보세요</p>
    </div>
  );
}

// ── 하이라이트 카드 ───────────────────────────────────────
function HighlightCard({ video }: { video: DashboardVideo }) {
  const ytId = extractYouTubeId(video.youtube_url);
  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
  const watchUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : video.youtube_url;

  return (
    <a
      href={watchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="relative aspect-video bg-black/[0.04] overflow-hidden flex-shrink-0">
        {thumb ? (
          <Image
            src={thumb}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-black/[0.04] flex items-center justify-center">
            <span className="text-[#aeaeb2] text-4xl">▶</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-[#1d1d1f] text-base ml-0.5">▶</span>
          </div>
        </div>
        <div className="absolute top-2 left-2">
          <span className="text-[10px] font-semibold bg-black/70 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            Highlight
          </span>
        </div>
      </div>
      <div className="p-3.5 flex flex-col flex-1">
        <p className="font-semibold text-[#1d1d1f] text-[13px] line-clamp-2 flex-1 leading-snug">
          {video.title}
        </p>
        {video.playerNames.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {video.playerNames.map((name) => (
              <span
                key={name}
                className="text-[11px] bg-black/[0.04] text-[#6e6e73] px-2 py-0.5 rounded-full font-medium truncate max-w-[90px]"
                title={name}
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

// ── 섹션 레이블 ────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-5">
      {children}
    </h2>
  );
}

// ── 메인 대시보드 컴포넌트 ────────────────────────────────
export default function HomeClient({
  data,
  harness,
}: {
  data?: DashboardData;
  harness?: boolean;
}) {
  const [mockCase, setMockCase] = useState<"A" | "B" | "C">("A");

  const activeData: DashboardData = harness
    ? MOCK_CASES.find((c) => c.key === mockCase)!.data
    : (data ?? MOCK_B);

  const {
    nextMatch, latestFullVideo, highlights,
    currentUserId, currentUserName, isLoggedIn,
  } = activeData;

  return (
    <div className="bg-[#f5f5f7] min-h-screen">
      {/* ── 하네스 컨트롤 바 ──────────────────────────── */}
      {harness && (
        <div className="flex flex-wrap items-center gap-3 bg-white border-b border-black/[0.06] px-6 py-2.5 text-[12px]">
          <span className="text-[#1d1d1f] font-semibold">Harness</span>
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
                {c.key}
              </button>
            ))}
          </div>
          <span className="text-[#6e6e73] hidden sm:block">
            {MOCK_CASES.find((c) => c.key === mockCase)?.label}
          </span>
        </div>
      )}

      {/* ── Hero D-Day 섹션 ────────────────────────── */}
      <HeroSection match={nextMatch} />

      {/* ── 메인 콘텐츠 ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10 sm:space-y-12">

        {/* 경기 위젯 + 풀영상 */}
        {(nextMatch || latestFullVideo) && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nextMatch ? (
                <MatchWidget
                  match={nextMatch}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  isLoggedIn={isLoggedIn}
                  isHarness={!!harness}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center">
                  <p className="text-4xl mb-3 opacity-20">📋</p>
                  <p className="text-[#1d1d1f] font-semibold text-[14px]">예정된 경기가 없습니다</p>
                </div>
              )}
              {latestFullVideo ? (
                <FullVideoCard video={latestFullVideo} />
              ) : (
                <FullVideoEmpty />
              )}
            </div>
          </section>
        )}

        {/* 하이라이트 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Recent Highlights</SectionLabel>
            {highlights.length > 0 && (
              <Link
                href="/videos?category=highlight"
                className="text-[13px] font-medium text-[#0071e3] hover:text-[#0077ed] transition-colors -mt-3"
              >
                전체 보기
              </Link>
            )}
          </div>

          {highlights.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {highlights.slice(0, 3).map((h) => (
                <HighlightCard key={h.id} video={h} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm py-20 flex flex-col items-center justify-center text-center px-6">
              <p className="text-4xl mb-3 opacity-20">⭐</p>
              <p className="text-[#1d1d1f] font-semibold text-[14px]">등록된 하이라이트가 없습니다</p>
              <p className="text-[#6e6e73] text-[13px] mt-1">멋진 장면이 생기면 첫 하이라이트를 등록해 보세요</p>
            </div>
          )}
        </section>

        {/* CTA 배너 */}
        {!isLoggedIn && (
          <section className="bg-white rounded-2xl shadow-sm px-5 sm:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xl font-bold text-[#1d1d1f] mb-1">팀에 합류하세요</p>
              <p className="text-[#6e6e73] text-[15px]">경기 일정 확인, 참석 투표, 영상 감상까지</p>
            </div>
            <Link
              href="/register"
              className="bg-[#0071e3] text-white font-medium text-[15px] px-7 py-3 rounded-full hover:bg-[#0077ed] transition-all whitespace-nowrap"
            >
              팀 합류하기
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
