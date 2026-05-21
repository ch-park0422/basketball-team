import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { targetId, newRole } = await req.json();

  if (!targetId || !["user", "admin"].includes(newRole)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  // DB의 RPC 함수가 admin 여부 + 자기 자신 변경 불가를 검증
  const { error } = await supabase.rpc("update_user_role", {
    target_id: targetId,
    new_role: newRole,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
