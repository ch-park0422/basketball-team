"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const POSITIONS = [
  { value: "PG", label: "PG — 포인트가드" },
  { value: "SG", label: "SG — 슈팅가드" },
  { value: "SF", label: "SF — 스몰포워드" },
  { value: "PF", label: "PF — 파워포워드" },
  { value: "C",  label: "C  — 센터" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string).trim();
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const jerseyNumber = form.get("jersey_number") as string;
    const position = form.get("position") as string;

    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          jersey_number: jerseyNumber ? Number(jerseyNumber) : null,
          position: position || null,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/register/confirm");
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0071e3] rounded-2xl mb-4 shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 5C19 12 5 12 5 19" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M5 5C5 12 19 12 19 19" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-[22px] font-bold text-[#1d1d1f] tracking-tight">팀 합류하기</h1>
          <p className="text-[#6e6e73] text-[15px] mt-1">농구팀 멤버로 등록합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-7 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">
              이름 <span className="text-[#0071e3]">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="실명 또는 닉네임"
              className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">
              이메일 <span className="text-[#0071e3]">*</span>
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="example@email.com"
              className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">
              비밀번호 <span className="text-[#0071e3]">*</span>
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="6자 이상"
              className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">등번호</label>
              <input
                name="jersey_number"
                type="number"
                min={0}
                max={99}
                placeholder="예) 23"
                className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">포지션</label>
              <select
                name="position"
                className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-[14px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
              >
                <option value="">미정</option>
                {POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0071e3] text-white py-3 rounded-xl font-medium text-[15px] hover:bg-[#0077ed] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "가입 중..." : "팀 합류하기"}
          </button>
        </form>

        <p className="mt-5 text-center text-[14px] text-[#6e6e73]">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-[#0071e3] font-medium hover:text-[#0077ed] transition-colors">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
