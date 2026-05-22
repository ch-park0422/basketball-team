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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">팀 빌더</h1>
        <p className="text-gray-500 text-sm mt-1">
          경기를 선택하고 드래그 앤 드랍으로 팀을 구성하세요
        </p>
      </div>
      <TeamBuilderClient matches={matches ?? []} />
    </div>
  );
}
