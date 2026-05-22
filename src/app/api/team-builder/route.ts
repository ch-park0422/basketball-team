import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin" ? user : null;
}

// GET /api/team-builder?matchId=xxx
export async function GET(req: Request) {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  const matchId = new URL(req.url).searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "matchId가 필요합니다." }, { status: 400 });

  const { data: attendanceRows } = await supabase
    .from("attendance")
    .select("user_id")
    .eq("match_id", matchId)
    .eq("status", "attendance");

  const userIds = (attendanceRows ?? []).map((a: { user_id: string }) => a.user_id);

  const { data: attendees } =
    userIds.length > 0
      ? await supabase.from("profiles").select("id, name, jersey_number, position").in("id", userIds)
      : { data: [] };

  // team_c_members 포함
  const { data: team } = await supabase
    .from("teams")
    .select("team_a_members, team_b_members, team_c_members")
    .eq("match_id", matchId)
    .maybeSingle();

  return NextResponse.json({ attendees: attendees ?? [], team });
}

// POST /api/team-builder
export async function POST(req: Request) {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  const { matchId, teamA, teamB, teamC } = await req.json();
  if (!matchId) return NextResponse.json({ error: "matchId가 필요합니다." }, { status: 400 });

  // teamC: null = 2팀 모드, 배열 = 3팀 모드
  const payload = {
    team_a_members: teamA ?? [],
    team_b_members: teamB ?? [],
    team_c_members: teamC ?? null,   // null이면 DB에 NULL 저장
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error: updateError } = await supabase
    .from("teams")
    .update(payload)
    .eq("match_id", matchId)
    .select();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  if (!updated || updated.length === 0) {
    const { error: insertError } = await supabase.from("teams").insert({
      match_id: matchId,
      ...payload,
    });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  revalidatePath("/admin/team-builder");
  revalidatePath("/matches");
  return NextResponse.json({ ok: true });
}
