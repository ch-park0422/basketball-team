"use client";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

type Player = {
  id: string;
  name: string;
  jersey_number: number | null;
  position: string | null;
};

type Match = {
  id: string;
  date: string;
  location: string;
};

type Props = {
  matches: Match[];
};

// ── 선수 카드 ────────────────────────────────────────────
function PlayerCard({ player, index }: { player: Player; index: number }) {
  return (
    <Draggable draggableId={player.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white border rounded-xl px-4 py-3 flex items-center gap-3 mb-2 select-none transition-all ${
            snapshot.isDragging
              ? "shadow-xl ring-2 ring-orange-300 rotate-1 opacity-95"
              : "border-gray-200 shadow-sm hover:shadow-md"
          }`}
        >
          <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full text-sm font-bold text-orange-600 flex-shrink-0">
            {player.jersey_number ?? "?"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-900">{player.name}</p>
            {player.position && (
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                {player.position}
              </span>
            )}
          </div>
          <span className="text-gray-300 text-sm flex-shrink-0">⠿</span>
        </div>
      )}
    </Draggable>
  );
}

// ── 드롭 존 ──────────────────────────────────────────────
type ZoneColor = "gray" | "orange" | "blue" | "green";

const ZONE_STYLES: Record<
  ZoneColor,
  { border: string; header: string; badge: string; hover: string; idle: string }
> = {
  gray: {
    border: "border-gray-200",
    header: "bg-gray-50 border-gray-200 text-gray-700",
    badge: "bg-gray-200 text-gray-600",
    hover: "bg-gray-100",
    idle: "bg-gray-50",
  },
  orange: {
    border: "border-orange-200",
    header: "bg-orange-50 border-orange-200 text-orange-700",
    badge: "bg-orange-200 text-orange-700",
    hover: "bg-orange-100",
    idle: "bg-orange-50",
  },
  blue: {
    border: "border-blue-200",
    header: "bg-blue-50 border-blue-200 text-blue-700",
    badge: "bg-blue-200 text-blue-700",
    hover: "bg-blue-100",
    idle: "bg-blue-50",
  },
  green: {
    border: "border-green-200",
    header: "bg-green-50 border-green-200 text-green-700",
    badge: "bg-green-200 text-green-700",
    hover: "bg-green-100",
    idle: "bg-green-50",
  },
};

function Zone({
  droppableId,
  title,
  color,
  players,
}: {
  droppableId: string;
  title: string;
  color: ZoneColor;
  players: Player[];
}) {
  const s = ZONE_STYLES[color];
  return (
    <div
      className={`flex-1 border-2 ${s.border} rounded-2xl overflow-hidden flex flex-col min-w-0`}
    >
      <div
        className={`${s.header} border-b px-4 py-3 flex items-center justify-between flex-shrink-0`}
      >
        <span className="font-bold text-sm truncate">{title}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${s.badge}`}>
          {players.length}명
        </span>
      </div>
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 min-h-[220px] transition-colors ${
              snapshot.isDraggingOver ? s.hover : s.idle
            }`}
          >
            {players.length === 0 && !snapshot.isDraggingOver && (
              <p className="text-xs text-gray-400 text-center pt-10">
                여기로 드래그하세요
              </p>
            )}
            {players.map((player, index) => (
              <PlayerCard key={player.id} player={player} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

// ── 메인 클라이언트 컴포넌트 ─────────────────────────────
export default function TeamBuilderClient({ matches }: Props) {
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [waiting, setWaiting] = useState<Player[]>([]);
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);
  const [teamC, setTeamC] = useState<Player[]>([]);
  const [showThirdTeam, setShowThirdTeam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!selectedMatchId) {
      setWaiting([]);
      setTeamA([]);
      setTeamB([]);
      setTeamC([]);
      setShowThirdTeam(false);
      return;
    }
    void loadData(selectedMatchId);
  }, [selectedMatchId]);

  async function loadData(matchId: string) {
    setLoading(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/team-builder?matchId=${matchId}`);
      const { attendees, team } = (await res.json()) as {
        attendees: Player[];
        team: {
          team_a_members: string[];
          team_b_members: string[];
          team_c_members: string[] | null;
        } | null;
      };

      const aIds = new Set<string>(team?.team_a_members ?? []);
      const bIds = new Set<string>(team?.team_b_members ?? []);
      // team_c_members가 null이 아니면 3팀 모드
      const isThreeTeam = team?.team_c_members !== null && team?.team_c_members !== undefined;
      const cIds = new Set<string>(isThreeTeam ? (team?.team_c_members ?? []) : []);

      const all = attendees ?? [];
      setShowThirdTeam(isThreeTeam);
      setTeamA(all.filter((p) => aIds.has(p.id)));
      setTeamB(all.filter((p) => bIds.has(p.id)));
      setTeamC(isThreeTeam ? all.filter((p) => cIds.has(p.id)) : []);
      setWaiting(
        all.filter(
          (p) => !aIds.has(p.id) && !bIds.has(p.id) && !cIds.has(p.id)
        )
      );
    } finally {
      setLoading(false);
    }
  }

  // C팀 추가
  function handleAddThirdTeam() {
    setShowThirdTeam(true);
  }

  // C팀 삭제 — C팀 인원 전원을 대기소로 복귀
  function handleRemoveThirdTeam() {
    setWaiting((prev) => [...prev, ...teamC]);
    setTeamC([]);
    setShowThirdTeam(false);
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const listMap: Record<string, Player[]> = {
      waiting,
      "team-a": teamA,
      "team-b": teamB,
      ...(showThirdTeam ? { "team-c": teamC } : {}),
    };
    const setMap: Record<string, (v: Player[]) => void> = {
      waiting: setWaiting,
      "team-a": setTeamA,
      "team-b": setTeamB,
      ...(showThirdTeam ? { "team-c": setTeamC } : {}),
    };

    const srcList = [...listMap[source.droppableId]];
    const dstList =
      source.droppableId === destination.droppableId
        ? srcList
        : [...listMap[destination.droppableId]];

    const [moved] = srcList.splice(source.index, 1);
    dstList.splice(destination.index, 0, moved);

    if (source.droppableId === destination.droppableId) {
      setMap[source.droppableId](srcList);
    } else {
      setMap[source.droppableId](srcList);
      setMap[destination.droppableId](dstList);
    }
  };

  async function handleSave() {
    if (!selectedMatchId) return;
    setSaving(true);
    setSaveMsg(null);

    const res = await fetch("/api/team-builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId: selectedMatchId,
        teamA: teamA.map((p) => p.id),
        teamB: teamB.map((p) => p.id),
        // 3팀 모드면 배열(빈 배열 포함), 2팀 모드면 null
        teamC: showThirdTeam ? teamC.map((p) => p.id) : null,
      }),
    });

    setSaving(false);
    if (res.ok) {
      setSaveMsg({ text: "✓ 팀 구성이 저장되었습니다", ok: true });
      setTimeout(() => setSaveMsg(null), 3000);
    } else {
      const { error } = await res.json();
      setSaveMsg({
        text: `✗ 저장 실패: ${error ?? "오류가 발생했습니다"}`,
        ok: false,
      });
    }
  }

  function formatMatchLabel(m: Match) {
    const d = new Date(m.date);
    const date = d.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });
    const time = d.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date} ${time} · ${m.location}`;
  }

  // 팀 이름 — 2팀 모드는 블랙/화이트, 3팀 모드는 A/B/C
  const teamALabel = showThirdTeam ? "A 팀" : "🖤 블랙 팀";
  const teamBLabel = showThirdTeam ? "B 팀" : "🤍 화이트 팀";

  const hasPlayers =
    waiting.length > 0 || teamA.length > 0 || teamB.length > 0 || teamC.length > 0;

  return (
    <div>
      {/* 경기 선택 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          경기 선택
        </label>
        <select
          value={selectedMatchId}
          onChange={(e) => setSelectedMatchId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
        >
          <option value="">-- 경기를 선택하세요 --</option>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {formatMatchLabel(m)}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-2xl mb-2">⏳</p>
          <p className="text-sm">참석자 정보를 불러오는 중...</p>
        </div>
      )}

      {!selectedMatchId && !loading && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🏀</p>
          <p className="font-medium">경기를 선택하면 참석자가 표시됩니다</p>
          <p className="text-sm mt-1">드래그 앤 드랍으로 팀을 구성하세요</p>
        </div>
      )}

      {selectedMatchId && !loading && (
        <>
          {!hasPlayers && (
            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-gray-200 mb-6">
              <p className="text-3xl mb-2">🙅</p>
              <p className="font-medium text-sm">이 경기에 참석자가 없습니다</p>
            </div>
          )}

          {hasPlayers && (
            <>
              {/* 3팀 토글 버튼 */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">
                  {showThirdTeam
                    ? "3팀 모드 — A / B / C 팀"
                    : "2팀 모드 — 블랙 / 화이트 팀"}
                </p>
                {!showThirdTeam ? (
                  <button
                    onClick={handleAddThirdTeam}
                    className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ➕ 3번째 팀 추가하기
                  </button>
                ) : (
                  <button
                    onClick={handleRemoveThirdTeam}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ✕ C 팀 삭제
                  </button>
                )}
              </div>

              {/* 드래그 앤 드랍 영역 */}
              <DragDropContext onDragEnd={onDragEnd}>
                <div
                  className={`grid gap-4 ${
                    showThirdTeam ? "grid-cols-4" : "grid-cols-3"
                  }`}
                >
                  <Zone
                    droppableId="waiting"
                    title="참석자 대기소"
                    color="gray"
                    players={waiting}
                  />
                  <Zone
                    droppableId="team-a"
                    title={teamALabel}
                    color="orange"
                    players={teamA}
                  />
                  <Zone
                    droppableId="team-b"
                    title={teamBLabel}
                    color="blue"
                    players={teamB}
                  />
                  {showThirdTeam && (
                    <Zone
                      droppableId="team-c"
                      title="C 팀"
                      color="green"
                      players={teamC}
                    />
                  )}
                </div>
              </DragDropContext>

              {/* 하단 상태바 + 저장 버튼 */}
              <div className="flex items-center justify-between mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4">
                <div className="text-sm text-gray-500">
                  {showThirdTeam ? (
                    <>
                      A팀{" "}
                      <span className="font-bold text-orange-600">{teamA.length}명</span>
                      {" · "}
                      B팀{" "}
                      <span className="font-bold text-blue-600">{teamB.length}명</span>
                      {" · "}
                      C팀{" "}
                      <span className="font-bold text-green-600">{teamC.length}명</span>
                      {" · "}
                      대기{" "}
                      <span className="font-bold text-gray-600">{waiting.length}명</span>
                    </>
                  ) : (
                    <>
                      블랙{" "}
                      <span className="font-bold text-orange-600">{teamA.length}명</span>
                      {" · "}
                      화이트{" "}
                      <span className="font-bold text-blue-600">{teamB.length}명</span>
                      {" · "}
                      대기{" "}
                      <span className="font-bold text-gray-600">{waiting.length}명</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {saveMsg && (
                    <span
                      className={`text-sm font-medium ${
                        saveMsg.ok ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {saveMsg.text}
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-60 text-sm"
                  >
                    {saving ? "저장 중..." : "팀 구성 저장"}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
