import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileClient, { type ProfileData } from "./ProfileClient";

// ─── 하네스 모드 토글 ────────────────────────────────────────
// true  → Mock 데이터로 UI/레이아웃 검증 (DB 미연결)
// false → Supabase에서 실 데이터 조회
const IS_HARNESS_MODE = false;

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 하네스 모드일 때는 DB 조회 생략하고 ProfileClient에 harness 플래그만 전달
  if (IS_HARNESS_MODE) {
    return <ProfileClient harness />;
  }

  // ── 실 데이터 병렬 조회 ───────────────────────────────────
  const [
    { data: profile },
    { count: attendanceCount },
    { count: votedCount },
    { count: totalMatches },
    { count: highlightCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, jersey_number, position, role, created_at")
      .eq("id", user.id)
      .single(),

    supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "attendance"),

    supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),

    supabase
      .from("matches")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("videos")
      .select("*", { count: "exact", head: true })
      .eq("category", "highlight")
      .contains("player_ids", [user.id]),
  ]);

  const voteRate =
    (totalMatches ?? 0) > 0
      ? Math.round(((votedCount ?? 0) / (totalMatches ?? 1)) * 100)
      : 0;

  const data: ProfileData = {
    name:
      profile?.name ??
      (user.user_metadata?.name as string | undefined) ??
      "알 수 없음",
    jerseyNumber: profile?.jersey_number ?? null,
    position: profile?.position ?? null,
    role: profile?.role ?? "user",
    joinedAt: profile?.created_at ?? user.created_at,
    attendanceCount: attendanceCount ?? 0,
    highlightCount: highlightCount ?? 0,
    voteRate,
    userId: user.id,
  };

  return <ProfileClient data={data} />;
}
