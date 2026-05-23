import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UsersTable, { type Profile } from "./UsersTable";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (myProfile?.role !== "admin") redirect("/");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, jersey_number, position, role, created_at")
    .order("created_at", { ascending: true });

  const members = (profiles ?? []) as Profile[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-2">
        <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-tight">회원 관리</h1>
      </div>

      <UsersTable initialMembers={members} currentUserId={user.id} />
    </div>
  );
}
