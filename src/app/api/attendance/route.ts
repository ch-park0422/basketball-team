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

  revalidatePath("/matches");
  return NextResponse.json({ ok: true });
}
