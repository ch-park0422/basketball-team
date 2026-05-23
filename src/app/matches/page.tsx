import { createClient } from "@/lib/supabase/server";
import MatchCard from "./MatchCard";
import CreateMatchModal from "./CreateMatchModal";
import RealtimeListener from "./RealtimeListener";
import type { TeamDisplay } from "./MatchCard";

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
  created_at: string;
};

type ProfileRow = {
  id: string;
  name: string;
  jersey_number: number | null;
  position: string | null;
};

type RawTeam = {
  match_id: string;
  team_a_members: string[];
  team_b_members: string[];
  team_c_members: string[] | null;
};

type VideoLink = {
  hasFull: boolean;
  hasHighlight: boolean;
};

export default async function MatchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 현재 유저 role + name 확인
  let role = "user";
  let currentUserName: string | undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, name")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? "user";
    currentUserName =
      profile?.name ?? (user.user_metadata?.name as string | undefined);
  }

  // 경기 목록 (날짜 오름차순)
  const { data: matches } = await supabase
    .from("matches")
    .select("id, date, location, fee, description, created_at")
    .order("date", { ascending: true });

  const matchList = (matches ?? []) as Match[];
  const matchIds = matchList.map((m) => m.id);

  if (matchIds.length === 0) {
    // 경기 없을 때 바로 렌더
    const upcoming: Match[] = [];
    const past: Match[] = [];
    return renderPage(role, upcoming, past, [], new Map(), new Map(), user?.id, currentUserName, !!user);
  }

  // ── 참석 정보 ──────────────────────────────────────────
  const { data: rawAttendance } = await supabase
    .from("attendance")
    .select("id, match_id, user_id, status")
    .in("match_id", matchIds);

  const attendanceList = (rawAttendance ?? []) as Omit<AttendanceRow, "profiles">[];

  // ── 팀 구성 조회 (team_c_members 포함) ──────────────────
  const { data: teamsData } = await supabase
    .from("teams")
    .select("match_id, team_a_members, team_b_members, team_c_members")
    .in("match_id", matchIds);

  const rawTeams = (teamsData ?? []) as RawTeam[];

  // ── 프로필 조회 (참석자 + 팀 배정 멤버 통합) ──────────
  const attendanceUserIds = attendanceList.map((a) => a.user_id);
  const teamUserIds = rawTeams.flatMap((t) => [
    ...t.team_a_members,
    ...t.team_b_members,
    ...(t.team_c_members ?? []),
  ]);
  const allUserIds = [...new Set([...attendanceUserIds, ...teamUserIds])];

  const { data: profilesData } =
    allUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, name, jersey_number, position")
          .in("id", allUserIds)
      : { data: [] };

  const profileMap = new Map<string, ProfileRow>(
    (profilesData ?? []).map((p: ProfileRow) => [p.id, p])
  );

  // 참석 정보에 이름 매핑
  const allAttendance: AttendanceRow[] = attendanceList.map((a) => ({
    ...a,
    profiles: profileMap.has(a.user_id)
      ? { name: profileMap.get(a.user_id)!.name }
      : null,
  }));

  // ── 팀 배정 표시 데이터 빌드 ────────────────────────────
  function resolveMembers(ids: string[]) {
    return ids.map((id) => {
      const p = profileMap.get(id);
      return {
        id,
        name: p?.name ?? "알 수 없음",
        jersey_number: p?.jersey_number ?? null,
        position: p?.position ?? null,
      };
    });
  }

  const teamDisplayMap = new Map<string, TeamDisplay>();
  for (const t of rawTeams) {
    const isThreeTeam = t.team_c_members !== null;
    const hasMembers =
      t.team_a_members.length > 0 ||
      t.team_b_members.length > 0 ||
      (t.team_c_members ?? []).length > 0 ||
      isThreeTeam; // 3팀 모드로 저장됐다면 빈 팀도 표시
    teamDisplayMap.set(
      t.match_id,
      hasMembers
        ? {
            teamA: resolveMembers(t.team_a_members),
            teamB: resolveMembers(t.team_b_members),
            // null = 2팀 모드, 배열 = 3팀 모드
            teamC: isThreeTeam ? resolveMembers(t.team_c_members!) : null,
          }
        : null
    );
  }

  // ── 영상 링크 조회 ────────────────────────────────────
  const { data: videosData } = await supabase
    .from("videos")
    .select("match_id, category")
    .in("match_id", matchIds);

  const videoLinkMap = new Map<string, VideoLink>();
  for (const v of (videosData ?? []) as { match_id: string; category: string }[]) {
    if (!v.match_id) continue;
    const existing = videoLinkMap.get(v.match_id) ?? { hasFull: false, hasHighlight: false };
    videoLinkMap.set(v.match_id, {
      hasFull: existing.hasFull || v.category === "full",
      hasHighlight: existing.hasHighlight || v.category === "highlight",
    });
  }

  const upcoming = matchList.filter((m) => new Date(m.date) >= new Date());
  const past = matchList.filter((m) => new Date(m.date) < new Date());

  return renderPage(
    role,
    upcoming,
    past,
    allAttendance,
    teamDisplayMap,
    videoLinkMap,
    user?.id,
    currentUserName,
    !!user
  );
}

// ── JSX 렌더 분리 ────────────────────────────────────────
function renderPage(
  role: string,
  upcoming: Match[],
  past: Match[],
  allAttendance: AttendanceRow[],
  teamDisplayMap: Map<string, TeamDisplay>,
  videoLinkMap: Map<string, VideoLink>,
  currentUserId: string | undefined,
  currentUserName: string | undefined,
  isLoggedIn: boolean
) {
  const totalMatches = upcoming.length + past.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-1">Schedule</p>
          <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-tight">경기 일정</h1>
          <p className="text-[#6e6e73] text-[14px] mt-1">
            {upcoming.length}경기 예정 · {past.length}경기 완료
          </p>
        </div>
        {role === "admin" && <CreateMatchModal />}
      </div>

      <RealtimeListener />

      {totalMatches === 0 ? (
        <div className="text-center py-24 text-[#6e6e73] bg-white rounded-2xl shadow-sm">
          <div className="flex justify-center mb-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 5C19 12 5 12 5 19" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M5 5C5 12 19 12 19 19" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="font-semibold text-[#1d1d1f]">등록된 경기 일정이 없습니다</p>
          {role === "admin" && (
            <p className="text-[14px] mt-1 text-[#6e6e73]">위 버튼으로 첫 경기를 등록해 보세요</p>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <section>
              <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-4">예정된 경기</p>
              <div className="space-y-4">
                {upcoming.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    attendance={allAttendance.filter((a) => a.match_id === match.id)}
                    teamDisplay={teamDisplayMap.get(match.id) ?? null}
                    videoLink={videoLinkMap.get(match.id) ?? null}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-4">지난 경기</p>
              <div className="space-y-4">
                {[...past].reverse().map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    attendance={allAttendance.filter((a) => a.match_id === match.id)}
                    teamDisplay={teamDisplayMap.get(match.id) ?? null}
                    videoLink={videoLinkMap.get(match.id) ?? null}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
