import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HarnessClient from "./HarnessClient";

export default async function HarnessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">테스트 하네스</h1>
          <span className="text-xs font-bold bg-red-100 text-red-600 border border-red-200 px-2.5 py-1 rounded-full uppercase tracking-wide">
            Admin Only
          </span>
        </div>
        <p className="text-gray-500 text-sm">
          실제 DB 없이 Mock 데이터로 컴포넌트 레이아웃과 예외 상황을 시각적으로 검증합니다.
          이 페이지는 배포 후에도 일반 유저에게 노출되지 않습니다.
        </p>
      </div>

      {/* 경기 카드 하네스 */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1 h-5 bg-orange-500 rounded-full" />
          <h2 className="text-base font-bold text-gray-800">MatchCard 컴포넌트</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
            3가지 케이스
          </span>
        </div>
        <HarnessClient />
      </section>
    </div>
  );
}
