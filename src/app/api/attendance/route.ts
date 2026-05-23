import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { matchId, status } = await req.json();

  if (!matchId || !["attendance", "absence"].includes(status)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  // 기존 행이 있으면 UPDATE, 없으면 INSERT
  const { data: updated, error: updateError } = await supabase
    .from("attendance")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("match_id", matchId)
    .eq("user_id", user.id)
    .select();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (!updated || updated.length === 0) {
    const { error: insertError } = await supabase
      .from("attendance")
      .insert({ match_id: matchId, user_id: user.id, status });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  // 불참으로 변경 시 teams 배열에서 유저 ID 자동 제거
  if (status === "absence") {
    const { data: teamsRow } = await supabase
      .from("teams")
      .select("id, team_a_members, team_b_members, team_c_members")
      .eq("match_id", matchId)
      .single();

    if (teamsRow) {
      const uid = user.id;
      const newA = (teamsRow.team_a_members ?? []).filter((id: string) => id !== uid);
      const newB = (teamsRow.team_b_members ?? []).filter((id: string) => id !== uid);
      const newC = teamsRow.team_c_members !== null
        ? (teamsRow.team_c_members ?? []).filter((id: string) => id !== uid)
        : null;

      const changed =
        newA.length !== (teamsRow.team_a_members ?? []).length ||
        newB.length !== (teamsRow.team_b_members ?? []).length ||
        (newC !== null && newC.length !== (teamsRow.team_c_members ?? []).length);

      if (changed) {
        await supabase
          .from("teams")
          .update({ team_a_members: newA, team_b_members: newB, team_c_members: newC })
          .eq("id", teamsRow.id);
      }
    }
  }

  revalidatePath("/matches");
  return NextResponse.json({ ok: true });
}
