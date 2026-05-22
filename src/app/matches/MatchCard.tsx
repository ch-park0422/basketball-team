"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Profile = { name: string };
type AttendanceRow = {
  id: string;
  match_id: string;
  user_id: string;
  status: string;
  profiles: Profile | null;
};
type Match = {
  id: string;
  date: string;
  location: string;
  fee: number;
  description: string | null;
};

export type TeamMember = {
  id: string;
  name: string;
  jersey_number: number | null;
  position: string | null;
};

export type TeamDisplay = {
  teamA: TeamMember[];
  teamB: TeamMember[];
  /** null = 2팀 모드(블랙/화이트), 배열(빈 배열 포함) = 3팀 모드(A/B/C) */
  teamC: TeamMember[] | null;
} | null;

// ── 팀 배정 섹션 컴포넌트 ────────────────────────────────
type TeamSlotConfig = {
  label: string;
  members: TeamMember[];
  bg: string;
  border: string;
  headerText: string;
  circleBg: string;
  circleText: string;
  emptyText: string;
};

function MemberCard({
  member,
  circleBg,
  circleText,
}: {
  member: TeamMember;
  circleBg: string;
  circleText: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-2 border border-gray-100">
      <span
        className={`inline-flex items-center justify-center w-6 h-6 ${circleBg} rounded-full text-xs font-bold ${circleText} flex-shrink-0`}
      >
        {member.jersey_number ?? "?"}
      </span>
      <span className="text-xs font-semibold text-gray-800 flex-1 truncate">
        {member.name}
      </span>
      {member.position && (
        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
          {member.position}
        </span>
      )}
    </div>
  );
}

function TeamSlot({ config }: { config: TeamSlotConfig }) {
  return (
    <div className={`${config.bg} rounded-xl p-3 border ${config.border}`}>
      <div className="flex items-center justify-between mb-2.5">
        <span className={`text-xs font-bold ${config.headerText}`}>
          {config.label}
        </span>
        <span className={`text-xs font-semibold ${config.headerText} opacity-70`}>
          {config.members.length}명
        </span>
      </div>
      {config.members.length > 0 ? (
        <div className="space-y-1.5">
          {config.members.map((m) => (
            <MemberCard
              key={m.id}
              member={m}
              circleBg={config.circleBg}
              circleText={config.circleText}
            />
          ))}
        </div>
      ) : (
        <p className={`text-xs ${config.emptyText} text-center py-2`}>미배정</p>
      )}
    </div>
  );
}

function TeamAssignmentSection({ teamDisplay }: { teamDisplay: NonNullable<TeamDisplay> }) {
  const isThreeTeam = teamDisplay.teamC !== null;
  const total =
    teamDisplay.teamA.length +
    teamDisplay.teamB.length +
    (teamDisplay.teamC?.length ?? 0);

  // 2팀 모드: ⚫ 블랙 팀 / ⚪ 화이트 팀
  // 3팀 모드: 🔴 A 팀 / 🔵 B 팀 / 🟢 C 팀
  const slotA: TeamSlotConfig = isThreeTeam
    ? {
        label: "🔴 A 팀",
        members: teamDisplay.teamA,
        bg: "bg-orange-50",
        border: "border-orange-100",
        headerText: "text-orange-700",
        circleBg: "bg-orange-100",
        circleText: "text-orange-600",
        emptyText: "text-orange-300",
      }
    : {
        label: "⚫ 블랙 팀",
        members: teamDisplay.teamA,
        bg: "bg-slate-50",
        border: "border-slate-200",
        headerText: "text-slate-700",
        circleBg: "bg-slate-200",
        circleText: "text-slate-700",
        emptyText: "text-slate-300",
      };

  const slotB: TeamSlotConfig = isThreeTeam
    ? {
        label: "🔵 B 팀",
        members: teamDisplay.teamB,
        bg: "bg-blue-50",
        border: "border-blue-100",
        headerText: "text-blue-700",
        circleBg: "bg-blue-100",
        circleText: "text-blue-600",
        emptyText: "text-blue-300",
      }
    : {
        label: "⚪ 화이트 팀",
        members: teamDisplay.teamB,
        bg: "bg-gray-50",
        border: "border-gray-200",
        headerText: "text-gray-600",
        circleBg: "bg-gray-200",
        circleText: "text-gray-600",
        emptyText: "text-gray-300",
      };

  const slotC: TeamSlotConfig | null =
    isThreeTeam
      ? {
          label: "🟢 C 팀",
          members: teamDisplay.teamC!,
          bg: "bg-green-50",
          border: "border-green-100",
          headerText: "text-green-700",
          circleBg: "bg-green-100",
          circleText: "text-green-600",
          emptyText: "text-green-300",
        }
      : null;

  return (
    <div className="border-t-2 border-dashed border-gray-200 px-6 py-5 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">🏀</span>
        <p className="text-sm font-bold text-gray-700">최종 팀 배정</p>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-auto">
          총 {total}명 · {isThreeTeam ? "3팀" : "2팀"}
        </span>
      </div>
      <div className={`grid gap-3 ${isThreeTeam ? "grid-cols-3" : "grid-cols-2"}`}>
        <TeamSlot config={slotA} />
        <TeamSlot config={slotB} />
        {slotC && <TeamSlot config={slotC} />}
      </div>
    </div>
  );
}

type VideoLink = {
  hasFull: boolean;
  hasHighlight: boolean;
} | null;

type Props = {
  match: Match;
  attendance: AttendanceRow[];
  teamDisplay: TeamDisplay;
  videoLink: VideoLink;
  currentUserId: string | undefined;
  currentUserName: string | undefined;
  isLoggedIn: boolean;
};

export default function MatchCard({
  match,
  attendance,
  teamDisplay,
  videoLink,
  currentUserId,
  currentUserName,
  isLoggedIn,
}: Props) {
  const router = useRouter();
  const serverStatus =
    attendance.find((a) => a.user_id === currentUserId)?.status ?? null;
  const [myStatus, setMyStatus] = useState<string | null>(serverStatus);
  const [voting, setVoting] = useState(false);

  // 서버 데이터 갱신 시 상태 동기화 (투표 중엔 스킵)
  useEffect(() => {
    if (!voting) {
      setMyStatus(serverStatus);
    }
  }, [serverStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // 참석자/불참자 목록을 myStatus 기준으로 낙관적 계산
  const displayAttendees: AttendanceRow[] = [
    ...attendance.filter(
      (a) => a.user_id !== currentUserId && a.status === "attendance"
    ),
    ...(myStatus === "attendance" && currentUserId
      ? [
          attendance.find((a) => a.user_id === currentUserId) ?? {
            id: "optimistic",
            match_id: match.id,
            user_id: currentUserId,
            status: "attendance",
            profiles: currentUserName ? { name: currentUserName } : null,
          },
        ]
      : []),
  ];

  const displayAbsentees: AttendanceRow[] = [
    ...attendance.filter(
      (a) => a.user_id !== currentUserId && a.status === "absence"
    ),
    ...(myStatus === "absence" && currentUserId
      ? [
          attendance.find((a) => a.user_id === currentUserId) ?? {
            id: "optimistic",
            match_id: match.id,
            user_id: currentUserId,
            status: "absence",
            profiles: currentUserName ? { name: currentUserName } : null,
          },
        ]
      : []),
  ];

  const matchDate = new Date(match.date);
  const isPast = matchDate < new Date();

  async function vote(status: "attendance" | "absence") {
    if (!isLoggedIn || voting) return;
    setMyStatus(status);
    setVoting(true);
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: match.id, status }),
    });
    setVoting(false);
    if (res.ok) {
      router.refresh();
    } else {
      setMyStatus(serverStatus);
    }
  }

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
        isPast ? "opacity-60 border-gray-200" : "border-gray-200 hover:shadow-md"
      }`}
    >
      {/* 카드 상단 */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          {/* 날짜 */}
          <div>
            <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide mb-0.5">
              {isPast ? "종료된 경기" : "예정된 경기"}
            </p>
            <p className="text-xl font-bold text-gray-900">
              {matchDate.toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
                weekday: "short",
              })}
            </p>
            <p className="text-gray-500 text-sm">
              {matchDate.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* 배지 */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {match.fee > 0 && (
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                💰 {match.fee.toLocaleString()}원
              </span>
            )}
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              📍 {match.location}
            </span>
          </div>
        </div>

        {match.description && (
          <p className="mt-3 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
            {match.description}
          </p>
        )}
      </div>

      {/* 투표 버튼 */}
      {isLoggedIn && (
        <div className="flex gap-3 px-6 pb-4">
          <button
            onClick={() => vote("attendance")}
            disabled={voting}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              myStatus === "attendance"
                ? "bg-orange-500 text-white shadow-sm scale-[0.98]"
                : "bg-orange-50 text-orange-600 hover:bg-orange-100"
            } disabled:cursor-not-allowed`}
          >
            🔥 참석
          </button>
          <button
            onClick={() => vote("absence")}
            disabled={voting}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              myStatus === "absence"
                ? "bg-slate-500 text-white shadow-sm scale-[0.98]"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            } disabled:cursor-not-allowed`}
          >
            💤 불참
          </button>
        </div>
      )}

      {/* 참석자 목록 */}
      <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50 space-y-3">
        {/* 참석 */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">
            🔥 참석{" "}
            <span className="text-orange-500 font-bold">
              {displayAttendees.length}명
            </span>
          </p>
          {displayAttendees.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {displayAttendees.map((a) => (
                <span
                  key={a.id}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    a.user_id === currentUserId
                      ? "bg-orange-500 text-white"
                      : "bg-white border border-orange-200 text-orange-700"
                  }`}
                >
                  {a.profiles?.name ?? "알 수 없음"}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">아직 참석자가 없습니다</p>
          )}
        </div>

        {/* 불참 (1명 이상일 때만) */}
        {displayAbsentees.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              💤 불참{" "}
              <span className="text-gray-600 font-bold">
                {displayAbsentees.length}명
              </span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {displayAbsentees.map((a) => (
                <span
                  key={a.id}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    a.user_id === currentUserId
                      ? "bg-slate-500 text-white"
                      : "bg-white border border-gray-200 text-gray-500"
                  }`}
                >
                  {a.profiles?.name ?? "알 수 없음"}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 영상 링크 버튼 — 연결된 영상이 있을 때만 표시 */}
      {videoLink && (videoLink.hasFull || videoLink.hasHighlight) && (
        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50/30 flex flex-wrap gap-2">
          {videoLink.hasFull && (
            <Link
              href={`/videos?category=full&matchId=${match.id}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-2 rounded-lg transition-colors"
            >
              🎥 풀 영상 보러가기
              <span className="text-orange-400">›</span>
            </Link>
          )}
          {videoLink.hasHighlight && (
            <Link
              href={`/videos?category=highlight&matchId=${match.id}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-yellow-700 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 px-3 py-2 rounded-lg transition-colors"
            >
              ✨ 하이라이트 보러가기
              <span className="text-yellow-500">›</span>
            </Link>
          )}
        </div>
      )}

      {/* 최종 팀 배정 — 팀 데이터가 있을 때만 표시 */}
      {teamDisplay && (
        <TeamAssignmentSection teamDisplay={teamDisplay} />
      )}
    </div>
  );
}
