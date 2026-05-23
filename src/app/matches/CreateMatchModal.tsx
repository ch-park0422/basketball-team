"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateMatchModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.get("date"),
        location: form.get("location"),
        fee: Number(form.get("fee")) || 0,
        description: form.get("description") || null,
      }),
    });

    if (res.ok) {
      setIsOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "등록 실패");
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#0071e3] text-white px-4 py-2 rounded-full text-[13px] font-medium hover:bg-[#0077ed] transition-all"
      >
        + 경기 등록
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
              <h2 className="text-[16px] font-semibold text-[#1d1d1f]">경기 일정 등록</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-black/[0.06] text-[#6e6e73] hover:bg-black/[0.1] transition-all text-sm leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">
                  일시 <span className="text-[#0071e3]">*</span>
                </label>
                <input
                  name="date"
                  type="datetime-local"
                  required
                  className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-[14px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">
                  장소 <span className="text-[#0071e3]">*</span>
                </label>
                <input
                  name="location"
                  type="text"
                  required
                  placeholder="예) 잠실 체육관 2번 코트"
                  className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">
                  참가비
                </label>
                <div className="relative">
                  <input
                    name="fee"
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="0"
                    className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 pr-8 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#aeaeb2]">원</span>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">
                  메모
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="추가 안내사항을 입력하세요"
                  className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all resize-none"
                />
              </div>

              {error && (
                <p className="text-[13px] text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-black/[0.06] text-[#1d1d1f] py-2.5 rounded-xl font-medium text-[14px] hover:bg-black/[0.1] transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#0071e3] text-white py-2.5 rounded-xl font-medium text-[14px] hover:bg-[#0077ed] transition-all disabled:opacity-60"
                >
                  {loading ? "등록 중..." : "등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
