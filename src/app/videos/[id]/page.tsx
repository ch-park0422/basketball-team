import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: video } = await supabase
    .from("videos")
    .select("id, title, youtube_url, category, match_id, player_ids, created_at")
    .eq("id", id)
    .single();

  if (!video) notFound();

  // 태그된 선수 이름 조회
  const playerIds: string[] = video.player_ids ?? [];
  const { data: playersData } =
    playerIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, name")
          .in("id", playerIds)
      : { data: [] };
  const players = playersData ?? [];

  // 연결된 경기 정보 조회
  const { data: match } = video.match_id
    ? await supabase
        .from("matches")
        .select("date, location")
        .eq("id", video.match_id)
        .single()
    : { data: null };

  const ytId = extractYouTubeId(video.youtube_url);
  const embedUrl = ytId ? `https://www.youtube.com/embed/${ytId}` : null;
  const date = new Date(video.created_at).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* 뒤로가기 */}
      <Link
        href="/videos"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors mb-6"
      >
        ← 영상 목록으로
      </Link>

      {/* 영상 플레이어 */}
      <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-6 shadow-sm">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black/[0.08]">
            <p className="text-[#6e6e73]">영상을 불러올 수 없습니다</p>
          </div>
        )}
      </div>

      {/* 영상 정보 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-[20px] font-bold text-[#1d1d1f] leading-snug flex-1">
            {video.title}
          </h1>
          <span className={`flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
            video.category === "full"
              ? "bg-[#1d1d1f] text-white"
              : "bg-[#0071e3]/[0.1] text-[#0071e3]"
          }`}>
            {video.category === "full" ? "Full Game" : "Highlight"}
          </span>
        </div>

        <p className="text-[13px] text-[#6e6e73] mb-4">{date} 등록</p>

        {match && (
          <div className="flex items-center gap-2 text-[13px] text-[#6e6e73] mb-4 pb-4 border-b border-black/[0.06]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#6e6e73" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M19 5C19 12 5 12 5 19" stroke="#6e6e73" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M5 5C5 12 19 12 19 19" stroke="#6e6e73" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {new Date(match.date).toLocaleDateString("ko-KR", {
              month: "long", day: "numeric", weekday: "short",
            })} · {match.location}
          </div>
        )}

        {players.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-2">
              태그된 선수
            </p>
            <div className="flex flex-wrap gap-1.5">
              {players.map((p) => (
                <span
                  key={p.id}
                  className="text-[12px] bg-black/[0.04] text-[#6e6e73] px-2.5 py-1 rounded-full font-medium"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
