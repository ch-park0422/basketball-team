"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

export type VideoItem = {
  id: string;
  title: string;
  youtube_url: string;
  category: "full" | "highlight";
  match_id: string | null;
  player_ids: string[] | null;
  created_at: string;
};

type Match = { id: string; date: string; location: string };
type Profile = { id: string; name: string };

type Props = {
  videos: VideoItem[];
  matches: Match[];
  profiles: Profile[];
  category: "full" | "highlight";
  matchId: string | null;
  playerId: string | null;
};

// ── YouTube 유틸 ─────────────────────────────────────────
function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return m ? m[1] : null;
}

function formatMatchLabel(m: Match) {
  const d = new Date(m.date);
  return `${d.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  })} · ${m.location}`;
}

// ── 개별 영상 카드 ────────────────────────────────────────
function VideoCard({
  video,
  taggedProfiles,
}: {
  video: VideoItem;
  taggedProfiles: Profile[];
}) {
  const ytId = extractYouTubeId(video.youtube_url);
  const thumbnail = ytId
    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    : null;
  const watchUrl = ytId
    ? `https://www.youtube.com/watch?v=${ytId}`
    : video.youtube_url;

  const date = new Date(video.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <a
      href={watchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-orange-200 transition-all block"
    >
      {/* 썸네일 */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-300 text-5xl">▶</span>
          </div>
        )}
        {/* 재생 버튼 오버레이 */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xl ml-1">▶</span>
          </div>
        </div>
        {/* 카테고리 뱃지 */}
        <div className="absolute top-2 left-2">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              video.category === "full"
                ? "bg-orange-500 text-white"
                : "bg-yellow-400 text-yellow-900"
            }`}
          >
            {video.category === "full" ? "🎬 풀영상" : "⭐ 하이라이트"}
          </span>
        </div>
      </div>

      {/* 영상 정보 */}
      <div className="p-4">
        <p className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
          {video.title}
        </p>

        {/* 태그된 선수 */}
        {taggedProfiles.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {taggedProfiles.map((p) => (
              <span
                key={p.id}
                className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium"
              >
                ⭐ {p.name}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </a>
  );
}

// ── 메인 탭 컴포넌트 ──────────────────────────────────────
export default function VideoTabs({
  videos,
  matches,
  profiles,
  category,
  matchId,
  playerId,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  function navigate(params: {
    category?: string;
    matchId?: string | null;
    playerId?: string | null;
  }) {
    const sp = new URLSearchParams();
    const cat = params.category ?? category;
    const mid = "matchId" in params ? params.matchId : matchId;
    const pid = "playerId" in params ? params.playerId : playerId;

    sp.set("category", cat);
    if (mid) sp.set("matchId", mid);
    if (pid) sp.set("playerId", pid);

    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div>
      {/* ── 탭 버튼 ── */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() =>
            navigate({ category: "full", matchId: null, playerId: null })
          }
          className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
            category === "full"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🎬 경기 풀 영상
        </button>
        <button
          onClick={() =>
            navigate({ category: "highlight", matchId: null, playerId: null })
          }
          className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
            category === "highlight"
              ? "bg-white text-yellow-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          ⭐ 하이라이트
        </button>
      </div>

      {/* ── 필터 ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* 경기 필터 (양 탭 모두) */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500">경기</label>
          <select
            value={matchId ?? ""}
            onChange={(e) =>
              navigate({ matchId: e.target.value || null, playerId: null })
            }
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white min-w-[160px]"
          >
            <option value="">전체 경기</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {formatMatchLabel(m)}
              </option>
            ))}
          </select>
        </div>

        {/* 선수 필터 (하이라이트 탭만) */}
        {category === "highlight" && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500">선수</label>
            <select
              value={playerId ?? ""}
              onChange={(e) =>
                navigate({ playerId: e.target.value || null })
              }
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white min-w-[120px]"
            >
              <option value="">전체 선수</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 활성 필터 뱃지 */}
        {(matchId || playerId) && (
          <button
            onClick={() =>
              navigate({ matchId: null, playerId: null })
            }
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* ── 영상 그리드 ── */}
      {videos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">
            {category === "full" ? "🎬" : "⭐"}
          </p>
          <p className="font-medium">
            {matchId || playerId
              ? "해당 조건의 영상이 없습니다"
              : category === "full"
              ? "등록된 풀 영상이 없습니다"
              : "등록된 하이라이트가 없습니다"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => {
            const taggedProfiles = (video.player_ids ?? [])
              .map((id) => profileMap.get(id))
              .filter((p): p is Profile => !!p);
            return (
              <VideoCard
                key={video.id}
                video={video}
                taggedProfiles={taggedProfiles}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
