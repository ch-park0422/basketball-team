import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
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

  // 호출자가 admin인지 일반 클라이언트로 확인
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: "관리자만 삭제할 수 있습니다." }, { status: 403 });
  }
  if (admin.id === targetId) {
    return NextResponse.json({ error: "자기 자신은 삭제할 수 없습니다." }, { status: 400 });
  }

  // 이후 모든 삭제는 service role(RLS 우회)로 처리
  let service: ReturnType<typeof createServiceClient>;
  try {
    service = createServiceClient();
  } catch {
    return NextResponse.json(
      { error: "서버 설정 오류: SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  // 1. 투표 기록 삭제
  await service.from("attendance").delete().eq("user_id", targetId);

  // 2. 팀 배열에서 해당 유저 ID 필터링
  const { data: teamsData } = await service
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
        await service.from("teams")
          .update({ team_a_members: newA, team_b_members: newB, team_c_members: newC })
          .eq("id", team.id);
      }
    }
  }

  // 3. profiles 행 삭제 (service role로 RLS 우회)
  const { error: profileError } = await service
    .from("profiles").delete().eq("id", targetId);
  if (profileError) {
    return NextResponse.json({ error: `프로필 삭제 실패: ${profileError.message}` }, { status: 500 });
  }

  // 4. auth.users 원천 삭제 (service role 전용 API)
  const { error: authError } = await service.auth.admin.deleteUser(targetId);
  if (authError) {
    return NextResponse.json({ error: `계정 삭제 실패: ${authError.message}` }, { status: 500 });
  }

  // 5. 실제로 삭제됐는지 검증
  const { data: check } = await service
    .from("profiles").select("id").eq("id", targetId).single();
  if (check) {
    return NextResponse.json({ error: "삭제 후 데이터가 남아있습니다. 다시 시도해 주세요." }, { status: 500 });
  }

  revalidatePath("/admin/users");
  revalidatePath("/matches");
  return NextResponse.json({ ok: true });
}
