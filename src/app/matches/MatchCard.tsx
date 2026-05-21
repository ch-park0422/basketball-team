"use client";

import { useState } from "react";

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

type Props = {
  match: Match;
  attendance: AttendanceRow[];
  currentUserId: string | undefined;
  isLoggedIn: boolean;
};

export default function MatchCard({
  match,
  attendance,
  currentUserId,
  isLoggedIn,
}: Props) {
  const myVote = attendance.find((a) => a.user_id === currentUserId);
  const [voting, setVoting] = useState(false);

  const attendees = attendance.filter((a) => a.status === "attendance");
  const absentees = attendance.filter((a) => a.status === "absence");

  const matchDate = new Date(match.date);
  const isPast = matchDate < new Date();

  async function vote(status: "attendance" | "absence") {
    if (!isLoggedIn || voting) return;
    setVoting(true);
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: match.id, status }),
    });
    // router.refresh()는 RealtimeListener가 담당
    setVoting(false);
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
              myVote?.status === "attendance"
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
              myVote?.status === "absence"
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
            <span className="text-orange-500 font-bold">{attendees.length}명</span>
          </p>
          {attendees.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {attendees.map((a) => (
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
        {absentees.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              💤 불참{" "}
              <span className="text-gray-600 font-bold">{absentees.length}명</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {absentees.map((a) => (
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
    </div>
  );
}
