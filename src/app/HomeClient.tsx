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
    location: "서울특별시 강남구 테헤란로 123-45 XX빌딩 지하 2층 실내농구코트 A동 (주차 불가, 대중교통 이용 필수, 입구 비밀번호 문의)",
    fee: 12000,
    description: "이번 경기는 정기 시즌 플레이오프 1라운드 경기로 모든 팀원의 참석이 필수입니다. 유니폼 미지참 시 벤치에서 응원만 가능하며 경기 후 뒤풀이도 예정되어 있으니 참고해 주세요. 장소 변경이 있을 수 있으니 단체 채팅방 공지를 반드시 확인하세요. 아 그리고 음료수 한 개씩 가져와 주시기 바랍니다.",
    attendees: [
      { userId: "v1", name: "남궁민서황보준혁" },
      { userId: "v2", name: "Alexander Bartholomew Kim-Johnson" },
      { userId: "v3", name: "제임스르브론오듀보농구황제" },
    ],
    absentees: [],
    myStatus: null,
  },
  latestFullVideo: {
    id: "vc",
    title: "2025년 5월 28일 강남구 XX빌딩 실내농구코트 정기 플레이오프 1라운드 A팀 vs B팀 전체 경기 풀영상 (4K 고화질 무편집 원본)",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    match_id: "mock-c", playerNames: [],
  },
  highlights: [
    { id: "hc1",
      title: "남궁민서황보준혁 선수의 믿기 힘든 360도 레이업 덩크 하이라이트 모음집 (2025 시즌 베스트 오브 베스트)",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      match_id: null, playerNames: ["남궁민서황보준혁", "Alexander Bartholomew Kim-Johnson"] },
    { id: "hc2", title: "연장전 마지막 버저비터 3점슛 결승골 풀영상",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      match_id: null, playerNames: ["제임스르브론오듀보농구황제"] },
    { id: "hc3", title: "전반전 전체 리뷰 압축본",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      match_id: null,
      playerNames: ["남궁민서황보준혁", "제임스르브론오듀보농구황제", "Alexander Bartholomew Kim-Johnson"] },
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
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl px-8 py-12 mb-8 text-center">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f97316 0%, transparent 40%)" }} />
        <p className="text-4xl mb-3">📅</p>
        <h2 className="text-xl font-bold text-white mb-1">다음 경기 일정이 없습니다</h2>
        <p className="text-slate-400 text-sm">새로운 경기가 등록되면 여기에 표시됩니다</p>
      </div>
    );
  }

  const { label, isToday } = mounted
    ? getDDay(match.date)
    : { label: "...", isToday: false };

  const matchDate = new Date(match.date);
  const dateStr = matchDate.toLocaleDateString("ko-KR", {
    month: "long", day: "numeric", weekday: "short",
  });
  const timeStr = matchDate.toLocaleTimeString("ko-KR", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="relative overflow-hidden bg-slate-900 rounded-3xl px-8 py-10 mb-8">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 15% 60%, #f97316 0%, transparent 55%), radial-gradient(circle at 85% 10%, #fb923c 0%, transparent 45%)" }} />
      {/* 농구공 워터마크 */}
      <div className="absolute -right-8 -bottom-8 text-[10rem] opacity-5 select-none pointer-events-none leading-none">
        🏀
      </div>

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* 디데이 */}
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">
            Next Game
          </p>
          <p className={`text-7xl font-black leading-none mb-3 ${isToday ? "text-white" : "text-orange-400"}`}>
            {label}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-white font-semibold">{dateStr} · {timeStr}</span>
            {match.fee > 0 && (
              <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full text-xs font-medium">
                💰 {match.fee.toLocaleString()}원
              </span>
            )}
          </div>
          {/* 장소 — 넘치면 말줄임표 */}
          <p className="text-slate-400 text-sm mt-1.5 max-w-sm truncate" title={match.location}>
            📍 {match.location}
          </p>
        </div>

        {/* 참석 현황 요약 */}
        <div className="flex gap-4 shrink-0">
          <div className="bg-white/10 backdrop-blur rounded-2xl px-5 py-4 text-center">
            <p className="text-3xl font-black text-orange-400">{match.attendees.length}</p>
            <p className="text-slate-300 text-xs mt-0.5 font-medium">참석</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl px-5 py-4 text-center">
            <p className="text-3xl font-black text-slate-300">{match.absentees.length}</p>
            <p className="text-slate-400 text-xs mt-0.5 font-medium">불참</p>
          </div>
        </div>
      </div>
    </div>
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

  // 낙관적 참석자 목록
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* 경기 정보 헤더 */}
      <div className="bg-slate-800 px-5 pt-5 pb-4">
        <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-1">
          Next Match
        </p>
        <p className="text-white font-bold text-base leading-snug line-clamp-2">
          📍 {match.location}
        </p>
        {match.fee > 0 && (
          <span className="inline-block mt-1.5 text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full font-medium">
            💰 {match.fee.toLocaleString()}원
          </span>
        )}
        {match.description && (
          <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
            {match.description}
          </p>
        )}
      </div>

      {/* 참석자 목록 */}
      <div className="px-5 py-4 flex-1 space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">
            🔥 참석{" "}
            <span className="text-orange-500 font-bold">{displayAttendees.length}명</span>
          </p>
          {displayAttendees.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {displayAttendees.map((a) => (
                <span
                  key={a.userId}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium truncate max-w-[120px] ${
                    a.userId === currentUserId
                      ? "bg-orange-500 text-white"
                      : "bg-orange-50 border border-orange-200 text-orange-700"
                  }`}
                  title={a.name}
                >
                  {a.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">아직 참석자가 없습니다</p>
          )}
        </div>

        {displayAbsentees.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              💤 불참{" "}
              <span className="text-gray-600 font-bold">{displayAbsentees.length}명</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {displayAbsentees.map((a) => (
                <span
                  key={a.userId}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium truncate max-w-[120px] ${
                    a.userId === currentUserId
                      ? "bg-slate-500 text-white"
                      : "bg-gray-50 border border-gray-200 text-gray-500"
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
        <div className="px-5 pb-5 pt-2 flex gap-3 border-t border-gray-100 mt-auto">
          <button
            onClick={() => vote("attendance")}
            disabled={voting}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              myVote === "attendance"
                ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                : "bg-orange-50 text-orange-600 hover:bg-orange-100"
            } disabled:cursor-not-allowed`}
          >
            🔥 참석
          </button>
          <button
            onClick={() => vote("absence")}
            disabled={voting}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              myVote === "absence"
                ? "bg-slate-700 text-white shadow-md shadow-slate-200"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            } disabled:cursor-not-allowed`}
          >
            💤 불참
          </button>
        </div>
      ) : (
        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
          <Link
            href="/login"
            className="block w-full py-3 rounded-xl font-bold text-sm text-center bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
          >
            로그인하고 투표하기 →
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
      className="group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md hover:border-orange-200 transition-all"
    >
      {/* 썸네일 */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden flex-shrink-0">
        {thumb ? (
          <Image src={thumb} alt={video.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <span className="text-slate-500 text-5xl">▶</span>
          </div>
        )}
        {/* 재생 오버레이 */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl">
            <span className="text-white text-2xl ml-1.5">▶</span>
          </div>
        </div>
        {/* 뱃지 */}
        <div className="absolute top-3 left-3">
          <span className="text-xs font-bold bg-slate-900/80 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
            🎬 경기 풀영상
          </span>
        </div>
      </div>
      {/* 정보 */}
      <div className="p-4 flex flex-col flex-1">
        <p className="font-bold text-gray-900 text-sm line-clamp-3 flex-1 group-hover:text-orange-600 transition-colors leading-snug">
          {video.title}
        </p>
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
          <span>▶</span> YouTube에서 보기
        </p>
      </div>
    </a>
  );
}

function FullVideoEmpty() {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center py-12 px-6 h-full text-center">
      <span className="text-5xl mb-4 opacity-30">🎬</span>
      <p className="text-gray-500 font-semibold text-sm">등록된 풀영상이 없습니다</p>
      <p className="text-gray-400 text-xs mt-1">경기가 끝나면 영상을 등록해 보세요!</p>
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
      className="group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-yellow-300 transition-all flex flex-col"
    >
      <div className="relative aspect-video bg-slate-100 overflow-hidden flex-shrink-0">
        {thumb ? (
          <Image src={thumb} alt={video.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
        ) : (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <span className="text-slate-500 text-4xl">▶</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-lg ml-1">▶</span>
          </div>
        </div>
        <div className="absolute top-2 left-2">
          <span className="text-xs font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">
            ⭐ 하이라이트
          </span>
        </div>
      </div>
      <div className="p-3.5 flex flex-col flex-1">
        <p className="font-bold text-gray-900 text-xs line-clamp-2 flex-1 group-hover:text-yellow-700 transition-colors leading-snug">
          {video.title}
        </p>
        {video.playerNames.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {video.playerNames.map((name) => (
              <span
                key={name}
                className="text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded-full font-medium truncate max-w-[90px]"
                title={name}
              >
                ⭐ {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
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
    <div>
      {/* ── 하네스 컨트롤 바 ──────────────────────────── */}
      {harness && (
        <div className="flex flex-wrap items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6 text-sm">
          <span className="text-amber-700 font-bold text-xs uppercase tracking-wide">
            🧪 Harness Mode
          </span>
          <span className="text-amber-500 text-xs">·  Mock Data · DB 미연결</span>
          <div className="flex gap-1.5 ml-auto">
            {MOCK_CASES.map((c) => (
              <button
                key={c.key}
                onClick={() => setMockCase(c.key)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mockCase === c.key
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white border border-amber-200 text-amber-700 hover:border-amber-400"
                }`}
              >
                {c.key}
              </button>
            ))}
          </div>
          <span className="text-amber-600 text-xs hidden sm:block">
            {MOCK_CASES.find((c) => c.key === mockCase)?.label}
          </span>
        </div>
      )}

      {/* ── Hero D-Day 섹션 ────────────────────────── */}
      <HeroSection match={nextMatch} />

      {/* ── 메인 그리드 (경기 위젯 + 풀영상) ──────── */}
      {nextMatch || latestFullVideo ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 좌: 경기 투표 위젯 */}
          {nextMatch ? (
            <MatchWidget
              match={nextMatch}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              isLoggedIn={isLoggedIn}
              isHarness={!!harness}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center py-12 px-6 text-center">
              <span className="text-5xl mb-4 opacity-30">📋</span>
              <p className="text-gray-500 font-semibold text-sm">예정된 경기가 없습니다</p>
              <p className="text-gray-400 text-xs mt-1">새 경기가 등록되면 투표할 수 있어요</p>
            </div>
          )}

          {/* 우: 최신 풀영상 */}
          {latestFullVideo ? (
            <FullVideoCard video={latestFullVideo} />
          ) : (
            <FullVideoEmpty />
          )}
        </div>
      ) : null}

      {/* ── 하이라이트 섹션 ────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 bg-yellow-400 rounded-full" />
            <h2 className="text-base font-bold text-gray-800">최근 하이라이트</h2>
          </div>
          {highlights.length > 0 && (
            <Link
              href="/videos?category=highlight"
              className="text-xs text-gray-400 hover:text-yellow-600 transition-colors font-medium"
            >
              전체 보기 →
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
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-14 flex flex-col items-center justify-center text-center px-6">
            <span className="text-5xl mb-4 opacity-30">⭐</span>
            <p className="text-gray-500 font-semibold text-sm">등록된 하이라이트가 없습니다</p>
            <p className="text-gray-400 text-xs mt-1">멋진 장면이 생기면 첫 하이라이트를 등록해 보세요!</p>
          </div>
        )}
      </section>
    </div>
  );
}
