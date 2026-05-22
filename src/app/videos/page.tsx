import { createClient } from "@/lib/supabase/server";
import VideoTabs, { VideoItem } from "./VideoTabs";
import AddVideoModal from "./AddVideoModal";

type Match = { id: string; date: string; location: string };
type Profile = { id: string; name: string };

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; matchId?: string; playerId?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  // ── 현재 유저 role 확인 ──────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let role = "user";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? "user";
  }

  // ── URL 파라미터 파싱 ────────────────────────────────
  const category =
    params.category === "highlight" ? "highlight" : "full";
  const matchId = params.matchId ?? null;
  const playerId = params.playerId ?? null;

  // ── 영상 목록 조회 (서버사이드 필터) ────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from("videos")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (matchId) query = query.eq("match_id", matchId);
  if (playerId && category === "highlight")
    query = query.contains("player_ids", [playerId]);

  const { data: videosData } = await query;
  const videos = (videosData ?? []) as VideoItem[];

  // ── 경기 목록 (모달 + 필터용, 최신순) ───────────────
  const { data: matchesData } = await supabase
    .from("matches")
    .select("id, date, location")
    .order("date", { ascending: false });
  const matches = (matchesData ?? []) as Match[];

  // ── 프로필 목록 (선수 태그/필터용) ──────────────────
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, name")
    .order("name");
  const profiles = (profilesData ?? []) as Profile[];

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">경기 영상</h1>
          <p className="text-gray-500 text-sm mt-1">
            {category === "full" ? "🎬 경기 풀 영상" : "⭐ 하이라이트"} ·{" "}
            {videos.length}개
          </p>
        </div>
        {role === "admin" && (
          <AddVideoModal matches={matches} profiles={profiles} />
        )}
      </div>

      {/* 탭 + 필터 + 영상 그리드 */}
      <VideoTabs
        videos={videos}
        matches={matches}
        profiles={profiles}
        category={category}
        matchId={matchId}
        playerId={playerId}
      />
    </div>
  );
}
