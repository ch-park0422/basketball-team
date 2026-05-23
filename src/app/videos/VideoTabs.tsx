"use client";

import { useState } from "react";
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
  isAdmin?: boolean;
};

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

function formatMatchLabel(m: Match) {
  const d = new Date(m.date);
  return `${d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })} · ${m.location}`;
}

function VideoCard({
  video,
  taggedProfiles,
  isAdmin,
  confirmId,
  deletingId,
  onDelete,
}: {
  video: VideoItem;
  taggedProfiles: Profile[];
  isAdmin?: boolean;
  confirmId: string | null;
  deletingId: string | null;
  onDelete: (id: string) => void;
}) {
  const ytId = extractYouTubeId(video.youtube_url);
  const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
  const watchUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : video.youtube_url;
  const date = new Date(video.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  const isConfirm = confirmId === video.id;
  const isDeleting = deletingId === video.id;

  return (
    <div className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <a
        href={watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative aspect-video bg-black/[0.04] overflow-hidden">
          {thumbnail ? (
            <Image src={thumbnail} alt={video.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[#aeaeb2] text-5xl">▶</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-[#1d1d1f] text-xl ml-1">▶</span>
            </div>
          </div>
          <div className="absolute top-2.5 left-2.5">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${
              video.category === "full" ? "bg-black/70 text-white" : "bg-[#3a3a3c]/80 text-white"
            }`}>
              {video.category === "full" ? "Full Game" : "Highlight"}
            </span>
          </div>
        </div>

        <div className="p-4">
          <p className="font-semibold text-[#1d1d1f] text-[14px] line-clamp-2 mb-2 leading-snug">
            {video.title}
          </p>
          {taggedProfiles.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {taggedProfiles.map((p) => (
                <span key={p.id} className="text-[11px] bg-black/[0.04] text-[#6e6e73] px-2 py-0.5 rounded-full font-medium">
                  {p.name}
                </span>
              ))}
            </div>
          )}
          <p className="text-[12px] text-[#6e6e73]">{date}</p>
        </div>
      </a>

      {isAdmin && (
        <div className="px-4 pb-3 flex justify-end border-t border-black/[0.04] pt-2.5">
          <button
            onClick={() => onDelete(video.id)}
            disabled={isDeleting}
            className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${
              isConfirm
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-black/[0.04] text-[#6e6e73] hover:bg-red-50 hover:text-red-500"
            }`}
          >
            {isDeleting ? "삭제 중…" : isConfirm ? "정말 삭제" : "삭제"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function VideoTabs({ videos, matches, profiles, category, matchId, playerId, isAdmin }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (confirmId !== id) {
      setConfirmId(id);
      setTimeout(() => setConfirmId((prev) => (prev === id ? null : prev)), 3000);
      return;
    }
    setDeletingId(id);
    await fetch(`/api/videos/${id}`, { method: "DELETE" });
    setDeletingId(null);
    setConfirmId(null);
    router.refresh();
  }

  function navigate(params: { category?: string; matchId?: string | null; playerId?: string | null }) {
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
      {/* iOS Segmented Control 스타일 탭 */}
      <div className="inline-flex bg-black/[0.06] rounded-xl p-1 mb-6">
        <button
          onClick={() => navigate({ category: "full", matchId: null, playerId: null })}
          className={`px-5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
            category === "full"
              ? "bg-white text-[#1d1d1f] shadow-sm"
              : "text-[#6e6e73] hover:text-[#1d1d1f]"
          }`}
        >
          경기 풀 영상
        </button>
        <button
          onClick={() => navigate({ category: "highlight", matchId: null, playerId: null })}
          className={`px-5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
            category === "highlight"
              ? "bg-white text-[#1d1d1f] shadow-sm"
              : "text-[#6e6e73] hover:text-[#1d1d1f]"
          }`}
        >
          하이라이트
        </button>
      </div>

      {/* 필터 */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 mb-6">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-[12px] font-semibold text-[#6e6e73] shrink-0">경기</label>
          <select
            value={matchId ?? ""}
            onChange={(e) => navigate({ matchId: e.target.value || null, playerId: null })}
            className="flex-1 sm:flex-none bg-black/[0.04] rounded-lg px-3 py-1.5 text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all sm:min-w-[160px]"
          >
            <option value="">전체 경기</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>{formatMatchLabel(m)}</option>
            ))}
          </select>
        </div>

        {category === "highlight" && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-[12px] font-semibold text-[#6e6e73] shrink-0">선수</label>
            <select
              value={playerId ?? ""}
              onChange={(e) => navigate({ playerId: e.target.value || null })}
              className="flex-1 sm:flex-none bg-black/[0.04] rounded-lg px-3 py-1.5 text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all sm:min-w-[120px]"
            >
              <option value="">전체 선수</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {(matchId || playerId) && (
          <button
            onClick={() => navigate({ matchId: null, playerId: null })}
            className="text-[13px] font-medium text-[#0071e3] hover:text-[#0077ed] transition-colors self-center"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 영상 그리드 */}
      {videos.length === 0 ? (
        <div className="text-center py-24 text-[#6e6e73] bg-white rounded-2xl shadow-sm">
          <p className="text-4xl mb-3 opacity-30">{category === "full" ? "🎬" : "⭐"}</p>
          <p className="font-semibold text-[#1d1d1f]">
            {matchId || playerId ? "해당 조건의 영상이 없습니다" : category === "full" ? "등록된 풀 영상이 없습니다" : "등록된 하이라이트가 없습니다"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => {
            const taggedProfiles = (video.player_ids ?? []).map((id) => profileMap.get(id)).filter((p): p is Profile => !!p);
            return (
              <VideoCard
                key={video.id}
                video={video}
                taggedProfiles={taggedProfiles}
                isAdmin={isAdmin}
                confirmId={confirmId}
                deletingId={deletingId}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
