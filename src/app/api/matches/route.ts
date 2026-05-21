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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "관리자만 등록할 수 있습니다." }, { status: 403 });
  }

  const { date, location, fee, description } = await req.json();

  if (!date || !location) {
    return NextResponse.json({ error: "일시와 장소는 필수입니다." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("matches")
    .insert({ date, location, fee: fee ?? 0, description, created_by: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
