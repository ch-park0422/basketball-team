import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { name: true, email: true } } },
  });
  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-8">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-400 mb-6">
        {post.author.name ?? post.author.email} ·{" "}
        {new Date(post.createdAt).toLocaleDateString("ko-KR")}
      </p>
      <div className="prose prose-gray whitespace-pre-wrap">{post.content}</div>
    </div>
  );
}
