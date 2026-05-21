import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { title, description, url } = await req.json();
  if (!title || !url) {
    return NextResponse.json({ error: "제목과 URL을 입력해주세요." }, { status: 400 });
  }

  const video = await prisma.video.create({
    data: { title, description, url, authorId: user.id },
  });

  return NextResponse.json(video, { status: 201 });
}
