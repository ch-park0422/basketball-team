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

// POST /api/videos
export async function POST(req: Request) {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);
  if (!admin)
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  const { title, youtube_url, category, match_id, player_ids } =
    await req.json();

  if (!title || !youtube_url || !category) {
    return NextResponse.json(
      { error: "필수 항목이 누락되었습니다." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("videos").insert({
    title,
    youtube_url,
    category,
    match_id: match_id || null,
    player_ids:
      Array.isArray(player_ids) && player_ids.length > 0 ? player_ids : null,
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/videos");
  revalidatePath("/matches");
  return NextResponse.json({ ok: true });
}
