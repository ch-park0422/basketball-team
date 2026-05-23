"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.get("email") as string,
      password: form.get("password") as string,
    });

    if (signInError) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0071e3] rounded-2xl mb-4 shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 5C19 12 5 12 5 19" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M5 5C5 12 19 12 19 19" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-[22px] font-bold text-[#1d1d1f] tracking-tight">로그인</h1>
          <p className="text-[#6e6e73] text-[15px] mt-1">팀 계정으로 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-7 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">이메일</label>
            <input
              name="email"
              type="email"
              required
              placeholder="example@email.com"
              className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#6e6e73] mb-1.5">비밀번호</label>
            <input
              name="password"
              type="password"
              required
              placeholder="비밀번호"
              className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0071e3] text-white py-3 rounded-xl font-medium text-[15px] hover:bg-[#0077ed] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="mt-5 text-center text-[14px] text-[#6e6e73]">
          아직 계정이 없으신가요?{" "}
          <Link href="/register" className="text-[#0071e3] font-medium hover:text-[#0077ed] transition-colors">
            팀 합류하기
          </Link>
        </p>
      </div>
    </div>
  );
}
