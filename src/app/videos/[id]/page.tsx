import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await prisma.video.findUnique({
    where: { id },
    include: { author: { select: { name: true, email: true } } },
  });
  if (!video) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
        <iframe
          src={video.url.replace("watch?v=", "embed/")}
          className="w-full h-full"
          allowFullScreen
        />
      </div>
      <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
      <p className="text-sm text-gray-400 mb-4">
        {video.author.name ?? video.author.email} ·{" "}
        {new Date(video.createdAt).toLocaleDateString("ko-KR")}
      </p>
      {video.description && (
        <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
      )}
    </div>
  );
}
