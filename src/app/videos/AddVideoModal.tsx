"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Match = { id: string; date: string; location: string };
type Profile = { id: string; name: string };

type Props = {
  matches: Match[];
  profiles: Profile[];
};

function formatMatchLabel(m: Match) {
  const d = new Date(m.date);
  return `${d.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  })} · ${m.location}`;
}

export default function AddVideoModal({ matches, profiles }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [category, setCategory] = useState<"full" | "highlight">("full");
  const [matchId, setMatchId] = useState("");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  function reset() {
    setTitle("");
    setYoutubeUrl("");
    setCategory("full");
    setMatchId("");
    setSelectedPlayerIds([]);
    setError(null);
  }

  function togglePlayer(id: string) {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        youtube_url: youtubeUrl,
        category,
        match_id: matchId || null,
        player_ids: category === "highlight" ? selectedPlayerIds : [],
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      reset();
      setOpen(false);
      router.refresh();
    } else {
      const { error: msg } = await res.json();
      setError(msg ?? "오류가 발생했습니다.");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors"
      >
        + 영상 등록
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">🎬 영상 등록</h2>
              <button
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-light"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  제목 <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="영상 제목을 입력하세요"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* 유튜브 링크 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  유튜브 링크 <span className="text-orange-500">*</span>
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  카테고리 <span className="text-orange-500">*</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCategory("full")}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ${
                      category === "full"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    🎬 경기 풀 영상
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory("highlight")}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ${
                      category === "highlight"
                        ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    ⭐ 하이라이트
                  </button>
                </div>
              </div>

              {/* 경기 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  연결할 경기{" "}
                  <span className="text-gray-400 font-normal text-xs">(선택)</span>
                </label>
                <select
                  value={matchId}
                  onChange={(e) => setMatchId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                >
                  <option value="">-- 경기를 선택하세요 --</option>
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {formatMatchLabel(m)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 하이라이트: 선수 태그 */}
              {category === "highlight" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    등장 선수 태그{" "}
                    <span className="text-gray-400 font-normal text-xs">
                      (선택, 복수 선택 가능)
                    </span>
                  </label>
                  <div className="border border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1.5 bg-gray-50">
                    {profiles.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2">
                        등록된 회원이 없습니다
                      </p>
                    ) : (
                      profiles.map((p) => {
                        const selected = selectedPlayerIds.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => togglePlayer(p.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                              selected
                                ? "bg-yellow-100 border border-yellow-400 text-yellow-800 font-semibold"
                                : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center text-xs flex-shrink-0 ${
                                selected ? "bg-yellow-500 text-white" : "border border-gray-300"
                              }`}
                            >
                              {selected ? "✓" : ""}
                            </span>
                            {p.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                  {selectedPlayerIds.length > 0 && (
                    <p className="text-xs text-yellow-700 mt-1.5 font-medium">
                      {selectedPlayerIds.length}명 선택됨
                    </p>
                  )}
                </div>
              )}

              {/* 에러 */}
              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              {/* 제출 */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-60 mt-2"
              >
                {submitting ? "등록 중..." : "영상 등록하기"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
