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
  teamC: TeamMember[] | null;
} | null;

// ── 팀 배정 섹션 ────────────────────────────────────────────
type TeamSlotConfig = {
  label: string;
  members: TeamMember[];
  bg: string;
  headerColor: string;
  badgeBg: string;
  badgeText: string;
  numberBg: string;
  numberText: string;
};

function MemberCard({ member, numberBg, numberText }: {
  member: TeamMember;
  numberBg: string;
  numberText: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-white/60 px-2.5 py-2 rounded-xl">
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${numberBg} text-[11px] font-bold ${numberText} flex-shrink-0`}>
        {member.jersey_number ?? "?"}
      </span>
      <span className="text-[13px] font-medium text-[#1d1d1f] flex-1 truncate">{member.name}</span>
      {member.position && (
        <span className="text-[10px] text-[#6e6e73] bg-black/[0.06] px-1.5 py-0.5 rounded-full flex-shrink-0">
          {member.position}
        </span>
      )}
    </div>
  );
}

function TeamSlot({ config }: { config: TeamSlotConfig }) {
  return (
    <div className={`${config.bg} p-3 rounded-xl`}>
      <div className="flex items-center justify-between mb-2.5">
        <span className={`text-[12px] font-semibold ${config.headerColor}`}>{config.label}</span>
        <span className={`text-[11px] font-medium ${config.headerColor} opacity-60`}>{config.members.length}명</span>
      </div>
      {config.members.length > 0 ? (
        <div className="space-y-1.5">
          {config.members.map((m) => (
            <MemberCard key={m.id} member={m} numberBg={config.numberBg} numberText={config.numberText} />
          ))}
        </div>
      ) : (
        <p className={`text-[12px] ${config.headerColor} opacity-40 text-center py-2`}>미배정</p>
      )}
    </div>
  );
}

function TeamAssignmentSection({ teamDisplay }: { teamDisplay: NonNullable<TeamDisplay> }) {
  const isThreeTeam = teamDisplay.teamC !== null;
  const total = teamDisplay.teamA.length + teamDisplay.teamB.length + (teamDisplay.teamC?.length ?? 0);

  const slotA: TeamSlotConfig = isThreeTeam
    ? { label: "A 팀", members: teamDisplay.teamA, bg: "bg-[#1d1d1f]", headerColor: "text-white", badgeBg: "bg-white/20", badgeText: "text-white", numberBg: "bg-white", numberText: "text-[#1d1d1f]" }
    : { label: "⚫ 블랙 팀", members: teamDisplay.teamA, bg: "bg-[#1d1d1f]", headerColor: "text-white", badgeBg: "bg-white/20", badgeText: "text-white", numberBg: "bg-[#6e6e73]", numberText: "text-white" };

  const slotB: TeamSlotConfig = isThreeTeam
    ? { label: "B 팀", members: teamDisplay.teamB, bg: "bg-black/[0.04]", headerColor: "text-[#1d1d1f]", badgeBg: "bg-[#6e6e73]/20", badgeText: "text-[#6e6e73]", numberBg: "bg-[#6e6e73]", numberText: "text-white" }
    : { label: "⚪ 화이트 팀", members: teamDisplay.teamB, bg: "bg-black/[0.04]", headerColor: "text-[#1d1d1f]", badgeBg: "bg-[#6e6e73]/10", badgeText: "text-[#6e6e73]", numberBg: "bg-[#aeaeb2]", numberText: "text-white" };

  const slotC: TeamSlotConfig | null = isThreeTeam
    ? { label: "C 팀", members: teamDisplay.teamC!, bg: "bg-[#6e6e73]/20", headerColor: "text-[#1d1d1f]", badgeBg: "bg-[#6e6e73]/20", badgeText: "text-[#6e6e73]", numberBg: "bg-[#6e6e73]", numberText: "text-white" }
    : null;

  return (
    <div className="border-t border-black/[0.06] px-5 py-4 bg-black/[0.02]">
      <div className="flex items-center gap-2 mb-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#6e6e73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 5C19 12 5 12 5 19" stroke="#6e6e73" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M5 5C5 12 19 12 19 19" stroke="#6e6e73" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p className="text-[13px] font-semibold text-[#1d1d1f]">최종 팀 배정</p>
        <span className="text-[11px] text-[#6e6e73] bg-black/[0.04] px-2 py-0.5 rounded-full ml-auto">
          총 {total}명 · {isThreeTeam ? "3팀" : "2팀"}
        </span>
      </div>
      <div className={`grid gap-2 ${isThreeTeam ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>
        <TeamSlot config={slotA} />
        <TeamSlot config={slotB} />
        {slotC && <TeamSlot config={slotC} />}
      </div>
    </div>
  );
}

type VideoLink = { hasFull: boolean; hasHighlight: boolean } | null;

type Props = {
  match: Match;
  attendance: AttendanceRow[];
  teamDisplay: TeamDisplay;
  videoLink: VideoLink;
  currentUserId: string | undefined;
  currentUserName: string | undefined;
  isLoggedIn: boolean;
  isAdmin?: boolean;
};

export default function MatchCard({ match, attendance, teamDisplay, videoLink, currentUserId, currentUserName, isLoggedIn, isAdmin }: Props) {
  const router = useRouter();
  const serverStatus = attendance.find((a) => a.user_id === currentUserId)?.status ?? null;
  const [myStatus, setMyStatus] = useState<string | null>(serverStatus);
  const [voting, setVoting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!voting) setMyStatus(serverStatus);
  }, [serverStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayAttendees: AttendanceRow[] = [
    ...attendance.filter((a) => a.user_id !== currentUserId && a.status === "attendance"),
    ...(myStatus === "attendance" && currentUserId
      ? [attendance.find((a) => a.user_id === currentUserId) ?? { id: "optimistic", match_id: match.id, user_id: currentUserId, status: "attendance", profiles: currentUserName ? { name: currentUserName } : null }]
      : []),
  ];

  const displayAbsentees: AttendanceRow[] = [
    ...attendance.filter((a) => a.user_id !== currentUserId && a.status === "absence"),
    ...(myStatus === "absence" && currentUserId
      ? [attendance.find((a) => a.user_id === currentUserId) ?? { id: "optimistic", match_id: match.id, user_id: currentUserId, status: "absence", profiles: currentUserName ? { name: currentUserName } : null }]
      : []),
  ];

  const matchDate = new Date(match.date);
  const isPast = matchDate < new Date();

  async function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000);
      return;
    }
    setDeleting(true);
    const res = await fetch(`/api/matches/${match.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) router.refresh();
  }

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
    if (res.ok) router.refresh();
    else setMyStatus(serverStatus);
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-shadow ${isPast ? "opacity-60" : "hover:shadow-md"}`}>
      {/* 상단 */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-1">
              {isPast ? "종료된 경기" : "예정된 경기"}
            </p>
            <p className="text-[19px] font-bold text-[#1d1d1f]">
              {matchDate.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}
            </p>
            <p className="text-[#6e6e73] text-[14px] mt-0.5">
              {matchDate.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {match.fee > 0 && (
              <span className="text-[12px] bg-black/[0.04] text-[#6e6e73] px-2.5 py-1 rounded-full font-medium">
                {match.fee.toLocaleString()}원
              </span>
            )}
            <span className="text-[12px] bg-black/[0.04] text-[#6e6e73] px-2.5 py-1 rounded-full max-w-[160px] truncate">
              {match.location}
            </span>
          </div>
        </div>
        {match.description && (
          <p className="mt-3 text-[14px] text-[#6e6e73] leading-relaxed border-t border-black/[0.06] pt-3">
            {match.description}
          </p>
        )}
      </div>

      {/* 투표 버튼 */}
      {isLoggedIn && (
        <div className="flex gap-2 px-5 pb-4">
          <button
            onClick={() => vote("attendance")}
            disabled={voting}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
              myStatus === "attendance" ? "bg-[#0071e3] text-white" : "bg-black/[0.04] text-[#1d1d1f] hover:bg-black/[0.08]"
            } disabled:cursor-not-allowed`}
          >
            참석
          </button>
          <button
            onClick={() => vote("absence")}
            disabled={voting}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
              myStatus === "absence" ? "bg-[#6e6e73] text-white" : "bg-black/[0.04] text-[#1d1d1f] hover:bg-black/[0.08]"
            } disabled:cursor-not-allowed`}
          >
            불참
          </button>
        </div>
      )}

      {/* 참석자 목록 */}
      <div className="border-t border-black/[0.06] px-5 py-4 bg-black/[0.02] space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 bg-[#0071e3] rounded-full" />
            <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">
              참석 <span className="text-[#1d1d1f]">{displayAttendees.length}명</span>
            </p>
          </div>
          {displayAttendees.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {displayAttendees.map((a) => (
                <span
                  key={a.id}
                  className={`text-[12px] px-2.5 py-1 rounded-full font-medium ${
                    a.user_id === currentUserId ? "bg-[#0071e3] text-white" : "bg-white text-[#1d1d1f] shadow-sm"
                  }`}
                >
                  {a.profiles?.name ?? "알 수 없음"}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#6e6e73]">아직 참석자가 없습니다</p>
          )}
        </div>

        {displayAbsentees.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-[#aeaeb2] rounded-full" />
              <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">
                불참 <span className="text-[#6e6e73]">{displayAbsentees.length}명</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {displayAbsentees.map((a) => (
                <span
                  key={a.id}
                  className={`text-[12px] px-2.5 py-1 rounded-full font-medium ${
                    a.user_id === currentUserId ? "bg-[#aeaeb2] text-white" : "bg-white text-[#6e6e73] shadow-sm"
                  }`}
                >
                  {a.profiles?.name ?? "알 수 없음"}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 영상 링크 */}
      {videoLink && (videoLink.hasFull || videoLink.hasHighlight) && (
        <div className="border-t border-black/[0.06] px-5 py-3 flex flex-wrap gap-2">
          {videoLink.hasFull && (
            <Link
              href={`/videos?category=full&matchId=${match.id}`}
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#0071e3] bg-[#0071e3]/[0.08] hover:bg-[#0071e3]/[0.14] px-3 py-1.5 rounded-full transition-all"
            >
              풀 영상 →
            </Link>
          )}
          {videoLink.hasHighlight && (
            <Link
              href={`/videos?category=highlight&matchId=${match.id}`}
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#0071e3] bg-[#0071e3]/[0.08] hover:bg-[#0071e3]/[0.14] px-3 py-1.5 rounded-full transition-all"
            >
              하이라이트 →
            </Link>
          )}
        </div>
      )}

      {teamDisplay && <TeamAssignmentSection teamDisplay={teamDisplay} />}

      {isAdmin && (
        <div className="border-t border-black/[0.06] px-5 py-3 flex justify-end">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${
              deleteConfirm
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-black/[0.04] text-[#6e6e73] hover:bg-red-50 hover:text-red-500"
            }`}
          >
            {deleting ? "삭제 중…" : deleteConfirm ? "정말 삭제" : "경기 삭제"}
          </button>
        </div>
      )}
    </div>
  );
}
