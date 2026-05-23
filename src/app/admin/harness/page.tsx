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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">Admin</p>
          <span className="text-[11px] font-semibold bg-[#0071e3] text-white px-2.5 py-0.5 rounded-full">
            Admin Only
          </span>
        </div>
        <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-tight">테스트 하네스</h1>
        <p className="text-[#6e6e73] text-[14px] mt-1">
          실제 DB 없이 Mock 데이터로 컴포넌트 레이아웃과 예외 상황을 시각적으로 검증합니다.
        </p>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">Dashboard 컴포넌트</h2>
          <span className="text-[11px] text-[#6e6e73] bg-black/[0.06] px-2.5 py-0.5 rounded-full">
            A / B / C 케이스
          </span>
        </div>
        <HarnessClient />
      </section>
    </div>
  );
}
