import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4">MyWebSite에 오신 것을 환영합니다</h1>
      <p className="text-gray-500 mb-8 text-lg">
        게시판에서 글을 쓰고, 영상을 공유해 보세요.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/board"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          게시판 보기
        </Link>
        <Link
          href="/videos"
          className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
        >
          영상 보기
        </Link>
      </div>
    </div>
  );
}
