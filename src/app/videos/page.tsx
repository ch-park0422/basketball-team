import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">영상</h1>
        <Link
          href="/videos/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          영상 등록
        </Link>
      </div>
      {videos.length === 0 ? (
        <p className="text-gray-400 text-center py-16">아직 등록된 영상이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map((video) => (
            <Link key={video.id} href={`/videos/${video.id}`} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-300 text-4xl">▶</span>
                )}
              </div>
              <div className="p-4">
                <p className="font-medium line-clamp-1">{video.title}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {video.author.name ?? video.author.email}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
