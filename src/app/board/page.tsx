import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function BoardPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">게시판</h1>
        <Link
          href="/board/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          글쓰기
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className="text-gray-400 text-center py-16">아직 게시글이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white rounded-lg border border-gray-200">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/board/${post.id}`} className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium">{post.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {post.author.name ?? post.author.email} ·{" "}
                    {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <span className="text-gray-300">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
