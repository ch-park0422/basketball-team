"use client";

import { useState } from "react";
import MatchCard from "@/app/matches/MatchCard";
import type { TeamDisplay } from "@/app/matches/MatchCard";

// ── 타입 재정의 (MatchCard 내부와 동일) ──────────────────
type AttendanceRow = {
  id: string;
  match_id: string;
  user_id: string;
  status: string;
  profiles: { name: string } | null;
};

type Match = {
  id: string;
  date: string;
  location: string;
  fee: number;
  description: string | null;
};

type VideoLink = { hasFull: boolean; hasHighlight: boolean } | null;

// ── 목업 데이터 정의 ──────────────────────────────────────

const MOCK_USER_ID = "mock-user-000";
const MOCK_USER_NAME = "박창헌";

// ─ 케이스 1: 풀 데이터 (3파전 + 영상 모두) ───────────────
const MATCH_1: Match = {
  id: "mock-match-001",
  date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 후
  location: "광진구 실내체육관",
  fee: 5000,
  description: "이번 경기는 3팀으로 진행합니다. 각 팀 유니폼 지참 필수!",
};

const ATTENDANCE_1: AttendanceRow[] = [
  { id: "a1", match_id: "mock-match-001", user_id: "u1", status: "attendance", profiles: { name: "김민준" } },
  { id: "a2", match_id: "mock-match-001", user_id: "u2", status: "attendance", profiles: { name: "이서준" } },
  { id: "a3", match_id: "mock-match-001", user_id: "u3", status: "attendance", profiles: { name: "박지호" } },
  { id: "a4", match_id: "mock-match-001", user_id: "u4", status: "attendance", profiles: { name: "정현우" } },
  { id: "a5", match_id: "mock-match-001", user_id: "u5", status: "attendance", profiles: { name: "최승현" } },
  { id: "a6", match_id: "mock-match-001", user_id: "u6", status: "attendance", profiles: { name: "강도윤" } },
  { id: "a7", match_id: "mock-match-001", user_id: MOCK_USER_ID, status: "attendance", profiles: { name: MOCK_USER_NAME } },
  { id: "a8", match_id: "mock-match-001", user_id: "u8", status: "absence", profiles: { name: "윤지성" } },
  { id: "a9", match_id: "mock-match-001", user_id: "u9", status: "absence", profiles: { name: "임태양" } },
];

const TEAM_1: TeamDisplay = {
  teamA: [
    { id: "u1", name: "김민준", jersey_number: 7, position: "PG" },
    { id: "u2", name: "이서준", jersey_number: 11, position: "SG" },
    { id: MOCK_USER_ID, name: MOCK_USER_NAME, jersey_number: 23, position: "SF" },
  ],
  teamB: [
    { id: "u3", name: "박지호", jersey_number: 3, position: "PF" },
    { id: "u4", name: "정현우", jersey_number: 15, position: "C" },
  ],
  teamC: [
    { id: "u5", name: "최승현", jersey_number: 9, position: "PG" },
    { id: "u6", name: "강도윤", jersey_number: 32, position: "SF" },
  ],
};

const VIDEO_1: VideoLink = { hasFull: true, hasHighlight: true };

// ─ 케이스 2: 텅 빈 카드 ──────────────────────────────────
const MATCH_2: Match = {
  id: "mock-match-002",
  date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10일 후
  location: "강남구 체육관",
  fee: 0,
  description: null,
};

const ATTENDANCE_2: AttendanceRow[] = [];
const TEAM_2: TeamDisplay = null;
const VIDEO_2: VideoLink = null;

// ─ 케이스 3: 글자 넘침 ───────────────────────────────────
const MATCH_3: Match = {
  id: "mock-match-003",
  date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 이틀 전 (종료)
  location: "서울특별시 강남구 테헤란로 123-45 XX빌딩 지하 2층 실내농구코트 A동 (주차: 건물 뒤편 유료주차장 이용)",
  fee: 12000,
  description:
    "이번 경기는 정기 시즌 플레이오프 1라운드 경기로, 모든 팀원의 참석이 필수입니다. 유니폼 미지참 시 벤치에서 응원만 가능하며, 경기 후 뒤풀이도 예정되어 있으니 참고해 주세요. 장소 변경이 있을 수 있으니 단체 채팅방 공지를 반드시 확인하세요.",
};

const LONG_NAME_ATTENDANCE: AttendanceRow[] = [
  { id: "b1", match_id: "mock-match-003", user_id: "v1", status: "attendance", profiles: { name: "남궁민서황보준혁" } },
  { id: "b2", match_id: "mock-match-003", user_id: "v2", status: "attendance", profiles: { name: "Alexander Kim" } },
  { id: "b3", match_id: "mock-match-003", user_id: "v3", status: "attendance", profiles: { name: "제임스르브론오듀보" } },
  { id: "b4", match_id: "mock-match-003", user_id: "v4", status: "attendance", profiles: { name: "박" } },
  { id: "b5", match_id: "mock-match-003", user_id: "v5", status: "attendance", profiles: { name: "이서준" } },
  { id: "b6", match_id: "mock-match-003", user_id: "v6", status: "attendance", profiles: { name: "최승현" } },
  { id: "b7", match_id: "mock-match-003", user_id: "v7", status: "absence", profiles: { name: "Bartholomew Kristofferson" } },
];

const TEAM_3: TeamDisplay = {
  teamA: [
    { id: "v1", name: "남궁민서황보준혁", jersey_number: 99, position: "PG/SG/SF" },
    { id: "v2", name: "Alexander Kim", jersey_number: 1, position: "Point Guard" },
  ],
  teamB: [
    { id: "v3", name: "제임스르브론오듀보", jersey_number: 23, position: null },
    { id: "v4", name: "박", jersey_number: null, position: null },
    { id: "v5", name: "이서준", jersey_number: 5, position: "SG" },
    { id: "v6", name: "최승현", jersey_number: 7, position: "PF" },
  ],
  teamC: null, // 2팀 모드
};

const VIDEO_3: VideoLink = { hasFull: false, hasHighlight: true };

// ── 케이스 메타 ───────────────────────────────────────────
const CASES = [
  {
    id: 1,
    emoji: "✅",
    label: "케이스 1 · 정상",
    desc: "투표 7명, 3파전 팀 배정, 풀영상 + 하이라이트",
    badgeColor: "bg-green-100 text-green-700 border-green-200",
    match: MATCH_1,
    attendance: ATTENDANCE_1,
    team: TEAM_1,
    video: VIDEO_1,
  },
  {
    id: 2,
    emoji: "⬜",
    label: "케이스 2 · 빈 카드",
    desc: "참석자 0명, 팀 미구성, 영상 없음, 무료",
    badgeColor: "bg-gray-100 text-gray-600 border-gray-200",
    match: MATCH_2,
    attendance: ATTENDANCE_2,
    team: TEAM_2,
    video: VIDEO_2,
  },
  {
    id: 3,
    emoji: "⚠️",
    label: "케이스 3 · 글자 넘침",
    desc: "초장문 장소·메모, 긴 이름 선수, 2파전, 종료된 경기",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
    match: MATCH_3,
    attendance: LONG_NAME_ATTENDANCE,
    team: TEAM_3,
    video: VIDEO_3,
  },
] as const;

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function HarnessClient() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showCurrentUser, setShowCurrentUser] = useState(true);
  const [layout, setLayout] = useState<"grid" | "stack">("grid");

  const currentUserId = isLoggedIn && showCurrentUser ? MOCK_USER_ID : undefined;
  const currentUserName = isLoggedIn && showCurrentUser ? MOCK_USER_NAME : undefined;

  return (
    <div>
      {/* ── 컨트롤 패널 ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-dashed border-orange-300 shadow-sm p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">🧪</span>
          <p className="font-bold text-gray-800 text-sm">테스트 컨트롤</p>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-auto">
            실제 DB 미연결 · Mock Data
          </span>
        </div>

        <div className="flex flex-wrap gap-4 items-center text-sm">
          {/* 로그인 상태 */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setIsLoggedIn((v) => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                isLoggedIn ? "bg-orange-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  isLoggedIn ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-gray-700 font-medium">로그인 상태</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${isLoggedIn ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>
              {isLoggedIn ? "ON" : "OFF"}
            </span>
          </label>

          {/* 현재 유저 표시 */}
          {isLoggedIn && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setShowCurrentUser((v) => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  showCurrentUser ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    showCurrentUser ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
              <span className="text-gray-700 font-medium">내 계정 표시</span>
              <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                {MOCK_USER_NAME}
              </span>
            </label>
          )}

          {/* 레이아웃 토글 */}
          <div className="flex items-center gap-1 ml-auto bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setLayout("grid")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                layout === "grid"
                  ? "bg-white shadow text-gray-800"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ⊞ 3열
            </button>
            <button
              onClick={() => setLayout("stack")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                layout === "stack"
                  ? "bg-white shadow text-gray-800"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ≡ 세로
            </button>
          </div>
        </div>

        {/* 케이스 요약 */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          {CASES.map((c) => (
            <div
              key={c.id}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium ${c.badgeColor}`}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 카드 렌더링 ──────────────────────────────────── */}
      <div
        className={
          layout === "grid"
            ? "grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
            : "space-y-10"
        }
      >
        {CASES.map((c) => (
          <div key={c.id}>
            {/* 케이스 레이블 */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${c.badgeColor}`}
              >
                {c.emoji} {c.label}
              </span>
              <span className="text-xs text-gray-400">{c.desc}</span>
            </div>

            {/* 실제 MatchCard */}
            <MatchCard
              match={c.match}
              attendance={c.attendance as AttendanceRow[]}
              teamDisplay={c.team}
              videoLink={c.video}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              isLoggedIn={isLoggedIn}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
