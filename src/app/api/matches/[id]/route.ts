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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: matchId } = await params;
  const supabase = await createClient();

  const admin = await requireAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: "관리자만 삭제할 수 있습니다." }, { status: 403 });
  }

  // 연관 데이터 순서대로 삭제 (attendance → teams → videos → matches)
  await supabase.from("attendance").delete().eq("match_id", matchId);
  await supabase.from("teams").delete().eq("match_id", matchId);
  await supabase.from("videos").delete().eq("match_id", matchId);

  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/matches");
  return NextResponse.json({ ok: true });
}
