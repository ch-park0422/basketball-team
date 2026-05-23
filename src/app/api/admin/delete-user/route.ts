import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

export async function DELETE(req: Request) {
  const { targetId } = await req.json();
  if (!targetId) {
    return NextResponse.json({ error: "대상 ID가 필요합니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: "관리자만 삭제할 수 있습니다." }, { status: 403 });
  }
  if (admin.id === targetId) {
    return NextResponse.json({ error: "자기 자신은 삭제할 수 없습니다." }, { status: 400 });
  }

  // 1. 투표 기록 삭제
  await supabase.from("attendance").delete().eq("user_id", targetId);

  // 2. 팀 배열에서 해당 유저 ID 필터링
  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, team_a_members, team_b_members, team_c_members");

  if (teamsData) {
    for (const team of teamsData) {
      const newA = (team.team_a_members ?? []).filter((id: string) => id !== targetId);
      const newB = (team.team_b_members ?? []).filter((id: string) => id !== targetId);
      const newC = team.team_c_members !== null
        ? (team.team_c_members ?? []).filter((id: string) => id !== targetId)
        : null;

      const changed =
        newA.length !== (team.team_a_members ?? []).length ||
        newB.length !== (team.team_b_members ?? []).length ||
        (newC !== null && newC.length !== (team.team_c_members ?? []).length);

      if (changed) {
        await supabase
          .from("teams")
          .update({ team_a_members: newA, team_b_members: newB, team_c_members: newC })
          .eq("id", team.id);
      }
    }
  }

  // 3. profiles 행 삭제
  const { error } = await supabase.from("profiles").delete().eq("id", targetId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/admin/users");
  return NextResponse.json({ ok: true });
}
