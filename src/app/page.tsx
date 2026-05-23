// ─────────────────────────────────────────────────────────
// 🧪 IS_HARNESS_MODE
//   true  → Supabase를 호출하지 않고 Mock 데이터로 UI를 렌더링합니다.
//            페이지 최상단의 A/B/C 버튼으로 케이스를 전환하세요.
//   false → 실제 Supabase 데이터를 가져와 대시보드를 렌더링합니다.
// ─────────────────────────────────────────────────────────
const IS_HARNESS_MODE = false;

import { createClient } from "@/lib/supabase/server";
import HomeClient from "./HomeClient";
import type { DashboardData } from "./HomeClient";

type RawAttendance = { user_id: string; status: string };
type RawProfile    = { id: string; name: string };
type RawVideo      = {
  id: string;
  title: string;
  youtube_url: string;
  match_id: string | null;
  player_ids: string[] | null;
};

export default async function HomePage() {
  // ── 하네스 모드: DB 호출 없이 바로 반환 ──────────────
  if (IS_HARNESS_MODE) {
    return <HomeClient harness />;
  }

  // ── 실제 모드: Supabase 데이터 병렬 페치 ─────────────
  const supabase = await createClient();

  // 현재 유저 + 프로필 이름
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentUserId: string | null = null;
  let currentUserName: string | null = null;

  if (user) {
    currentUserId = user.id;
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();
    currentUserName =
      myProfile?.name ??
      (user.user_metadata?.name as string | undefined) ??
      null;
  }

  // ── 1) 다음 경기 — 현재 시각 이후 가장 빠른 1건 ──────
  const { data: nextMatchRaw } = await supabase
    .from("matches")
    .select("id, date, location, fee, description")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(1)
    .maybeSingle();

  // ── 2) 최신 풀영상 1건 ───────────────────────────────
  const { data: fullVideoRaw } = await supabase
    .from("videos")
    .select("id, title, youtube_url, match_id")
    .eq("category", "full")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // ── 3) 최신 하이라이트 3건 ───────────────────────────
  const { data: hlRows } = await supabase
    .from("videos")
    .select("id, title, youtube_url, match_id, player_ids")
    .eq("category", "highlight")
    .order("created_at", { ascending: false })
    .limit(3);

  const hlList = (hlRows ?? []) as RawVideo[];

  // ── 4) 다음 경기 참석 정보 + 프로필 이름 조회 ────────
  let nextMatch: DashboardData["nextMatch"] = null;

  if (nextMatchRaw) {
    const { data: attRows } = await supabase
      .from("attendance")
      .select("user_id, status")
      .eq("match_id", nextMatchRaw.id);

    const attList = (attRows ?? []) as RawAttendance[];
    const attUserIds = attList.map((a) => a.user_id);

    const { data: profRows } =
      attUserIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, name")
            .in("id", attUserIds)
        : { data: [] as RawProfile[] };

    const profMap = new Map<string, string>(
      ((profRows ?? []) as RawProfile[]).map((p) => [p.id, p.name])
    );

    const attendees = attList
      .filter((a) => a.status === "attendance")
      .map((a) => ({
        userId: a.user_id,
        name: profMap.get(a.user_id) ?? "알 수 없음",
      }));

    const absentees = attList
      .filter((a) => a.status === "absence")
      .map((a) => ({
        userId: a.user_id,
        name: profMap.get(a.user_id) ?? "알 수 없음",
      }));

    const myStatus =
      (attList.find((a) => a.user_id === currentUserId)?.status as
        | "attendance"
        | "absence"
        | undefined) ?? null;

    nextMatch = {
      id: nextMatchRaw.id,
      date: nextMatchRaw.date,
      location: nextMatchRaw.location,
      fee: nextMatchRaw.fee,
      description: nextMatchRaw.description,
      attendees,
      absentees,
      myStatus,
    };
  }

  // ── 5) 하이라이트 선수 이름 해석 ─────────────────────
  const allPlayerIds = [
    ...new Set(hlList.flatMap((h) => h.player_ids ?? [])),
  ];

  const { data: playerProfRows } =
    allPlayerIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, name")
          .in("id", allPlayerIds)
      : { data: [] as RawProfile[] };

  const playerMap = new Map<string, string>(
    ((playerProfRows ?? []) as RawProfile[]).map((p) => [p.id, p.name])
  );

  const highlights = hlList.map((h) => ({
    id: h.id,
    title: h.title,
    youtube_url: h.youtube_url,
    match_id: h.match_id,
    playerNames: (h.player_ids ?? []).map(
      (id) => playerMap.get(id) ?? "알 수 없음"
    ),
  }));

  // ── 조합 후 클라이언트에 전달 ─────────────────────────
  const dashboardData: DashboardData = {
    nextMatch,
    latestFullVideo: fullVideoRaw
      ? { ...fullVideoRaw, playerNames: [] }
      : null,
    highlights,
    currentUserId,
    currentUserName,
    isLoggedIn: !!user,
  };

  return <HomeClient data={dashboardData} />;
}
