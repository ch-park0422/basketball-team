import { createClient } from "@/lib/supabase/server";
import MatchCard from "./MatchCard";
import CreateMatchModal from "./CreateMatchModal";
import RealtimeListener from "./RealtimeListener";

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

export default async function MatchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 현재 유저 role 확인
  let role = "user";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? "user";
  }

  // 경기 목록 (날짜 오름차순 — 가까운 경기가 위로)
  const { data: matches } = await supabase
    .from("matches")
    .select("id, date, location, fee, description, created_at")
    .order("date", { ascending: true });

  const matchList = (matches ?? []) as Match[];

  // 전체 참석 정보 (한 번에 fetch)
  const matchIds = matchList.map((m) => m.id);
  const { data: attendanceData } = matchIds.length > 0
    ? await supabase
        .from("attendance")
        .select("id, match_id, user_id, status, profiles(name)")
        .in("match_id", matchIds)
    : { data: [] };

  const allAttendance = (attendanceData ?? []) as unknown as AttendanceRow[];

  const upcoming = matchList.filter((m) => new Date(m.date) >= new Date());
  const past = matchList.filter((m) => new Date(m.date) < new Date());

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">경기 일정</h1>
          <p className="text-gray-500 text-sm mt-1">
            {upcoming.length}경기 예정 · {past.length}경기 완료
          </p>
        </div>
        {role === "admin" && <CreateMatchModal />}
      </div>

      {/* Supabase Realtime 구독 */}
      <RealtimeListener />

      {matchList.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🏀</p>
          <p className="font-medium">등록된 경기 일정이 없습니다</p>
          {role === "admin" && (
            <p className="text-sm mt-1">위 버튼으로 첫 경기를 등록해 보세요</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* 예정된 경기 */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                예정된 경기
              </h2>
              <div className="space-y-4">
                {upcoming.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    attendance={allAttendance.filter(
                      (a) => a.match_id === match.id
                    )}
                    currentUserId={user?.id}
                    isLoggedIn={!!user}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 지난 경기 */}
          {past.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                지난 경기
              </h2>
              <div className="space-y-4">
                {[...past].reverse().map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    attendance={allAttendance.filter(
                      (a) => a.match_id === match.id
                    )}
                    currentUserId={user?.id}
                    isLoggedIn={!!user}
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
