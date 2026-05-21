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
    <div className="max-w-md mx-auto mt-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-full mb-3">
          <span className="text-3xl">🏀</span>
        </div>
        <h1 className="text-2xl font-bold">팀 합류하기</h1>
        <p className="text-gray-500 text-sm mt-1">농구팀 멤버로 등록합니다</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-5"
      >
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="실명 또는 닉네임"
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            이메일 <span className="text-red-500">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="example@email.com"
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            비밀번호 <span className="text-red-500">*</span>
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="6자 이상"
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              등번호
            </label>
            <input
              name="jersey_number"
              type="number"
              min={0}
              max={99}
              placeholder="예) 23"
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              선호 포지션
            </label>
            <select
              name="position"
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
            >
              <option value="">미정</option>
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "가입 중..." : "팀 합류하기"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-orange-500 font-medium hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
