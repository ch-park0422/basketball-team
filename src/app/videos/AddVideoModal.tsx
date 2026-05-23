"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Match = { id: string; date: string; location: string };
type Profile = { id: string; name: string };
type Props = { matches: Match[]; profiles: Profile[] };

function formatMatchLabel(m: Match) {
  const d = new Date(m.date);
  return `${d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })} · ${m.location}`;
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
    setTitle(""); setYoutubeUrl(""); setCategory("full");
    setMatchId(""); setSelectedPlayerIds([]); setError(null);
  }

  function togglePlayer(id: string) {
    setSelectedPlayerIds((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, youtube_url: youtubeUrl, category, match_id: matchId || null, player_ids: category === "highlight" ? selectedPlayerIds : [] }),
    });

    setSubmitting(false);
    if (res.ok) { reset(); setOpen(false); router.refresh(); }
    else { const { error: msg } = await res.json(); setError(msg ?? "오류가 발생했습니다."); }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-[#0071e3] text-white px-4 py-2 rounded-full text-[13px] font-medium hover:bg-[#0077ed] transition-all"
      >
        + 영상 등록
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
              <h2 className="text-[16px] font-semibold text-[#1d1d1f]">영상 등록</h2>
              <button
                onClick={() => { reset(); setOpen(false); }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-black/[0.06] text-[#6e6e73] hover:bg-black/[0.1] transition-all text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">
                  제목 <span className="text-[#0071e3]">*</span>
                </label>
                <input
                  type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                  placeholder="영상 제목을 입력하세요"
                  className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">
                  유튜브 링크 <span className="text-[#0071e3]">*</span>
                </label>
                <input
                  type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} required
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">
                  카테고리 <span className="text-[#0071e3]">*</span>
                </label>
                <div className="inline-flex bg-black/[0.06] rounded-xl p-1 w-full">
                  <button
                    type="button" onClick={() => setCategory("full")}
                    className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all ${
                      category === "full" ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#6e6e73] hover:text-[#1d1d1f]"
                    }`}
                  >
                    경기 풀 영상
                  </button>
                  <button
                    type="button" onClick={() => setCategory("highlight")}
                    className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all ${
                      category === "highlight" ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#6e6e73] hover:text-[#1d1d1f]"
                    }`}
                  >
                    하이라이트
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">
                  연결할 경기 <span className="text-[#aeaeb2] font-normal">(선택)</span>
                </label>
                <select
                  value={matchId} onChange={(e) => setMatchId(e.target.value)}
                  className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-[14px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
                >
                  <option value="">-- 경기를 선택하세요 --</option>
                  {matches.map((m) => <option key={m.id} value={m.id}>{formatMatchLabel(m)}</option>)}
                </select>
              </div>

              {category === "highlight" && (
                <div>
                  <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">
                    등장 선수 태그 <span className="text-[#aeaeb2] font-normal">(선택)</span>
                  </label>
                  <div className="bg-[#f5f5f7] rounded-xl p-3 max-h-40 overflow-y-auto space-y-1.5">
                    {profiles.length === 0 ? (
                      <p className="text-[13px] text-[#6e6e73] text-center py-2">등록된 회원이 없습니다</p>
                    ) : (
                      profiles.map((p) => {
                        const selected = selectedPlayerIds.includes(p.id);
                        return (
                          <button
                            key={p.id} type="button" onClick={() => togglePlayer(p.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all text-left ${
                              selected ? "bg-[#0071e3] text-white font-medium" : "bg-white text-[#1d1d1f] hover:bg-black/[0.04]"
                            }`}
                          >
                            <span className={`w-4 h-4 flex items-center justify-center text-[11px] flex-shrink-0 rounded-full border ${
                              selected ? "bg-white/30 border-white/50 text-white" : "border-[#c7c7cc] text-transparent"
                            }`}>
                              {selected ? "✓" : ""}
                            </span>
                            {p.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                  {selectedPlayerIds.length > 0 && (
                    <p className="text-[12px] text-[#6e6e73] mt-1.5 font-medium">{selectedPlayerIds.length}명 선택됨</p>
                  )}
                </div>
              )}

              {error && (
                <p className="text-[13px] text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
              )}

              <button
                type="submit" disabled={submitting}
                className="w-full bg-[#0071e3] text-white py-3 rounded-xl font-medium text-[15px] hover:bg-[#0077ed] transition-all disabled:opacity-60 mt-2"
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
