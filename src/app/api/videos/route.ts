import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const { title, description, url } = await req.json();
  if (!title || !url) {
    return NextResponse.json({ error: "제목과 URL을 입력해주세요." }, { status: 400 });
  }
  const video = await prisma.video.create({
    data: { title, description, url, authorId: session.user.id },
  });
  return NextResponse.json(video, { status: 201 });
}
