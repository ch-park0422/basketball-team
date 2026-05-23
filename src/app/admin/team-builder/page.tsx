import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TeamBuilderClient from "./TeamBuilderClient";

export default async function TeamBuilderPage() {
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

  // 모든 경기 목록 (날짜 오름차순)
  const { data: matches } = await supabase
    .from("matches")
    .select("id, date, location")
    .order("date", { ascending: true });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-tight">팀 빌더</h1>
        <p className="text-[#6e6e73] text-[14px] mt-1">
          경기를 선택하고 드래그 앤 드랍으로 팀을 구성하세요
        </p>
      </div>
      <TeamBuilderClient matches={matches ?? []} />
    </div>
  );
}
