import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RoleSelector from "./RoleSelector";

type Profile = {
  id: string;
  name: string;
  jersey_number: number | null;
  position: string | null;
  role: string;
  created_at: string;
};

const POSITION_LABELS: Record<string, string> = {
  PG: "PG · 포인트가드",
  SG: "SG · 슈팅가드",
  SF: "SF · 스몰포워드",
  PF: "PF · 파워포워드",
  C: "C · 센터",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 현재 유저의 role 확인
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (myProfile?.role !== "admin") redirect("/");

  // 전체 회원 목록
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, jersey_number, position, role, created_at")
    .order("created_at", { ascending: true });

  const members = (profiles ?? []) as Profile[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-tight">회원 관리</h1>
        <p className="text-[#6e6e73] text-[14px] mt-1">
          총 {members.length}명 · 관리자만 접근 가능한 페이지입니다
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="border-b border-black/[0.06]">
            <tr>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest w-8">#</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">이름</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">등번호</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">포지션</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">등급</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">가입일</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest">등급 변경</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {members.map((profile, i) => (
              <tr
                key={profile.id}
                className={`hover:bg-black/[0.02] transition-colors ${profile.id === user.id ? "bg-black/[0.02]" : ""}`}
              >
                <td className="px-5 py-4 text-[#6e6e73] text-[13px]">{i + 1}</td>
                <td className="px-5 py-4 font-semibold text-[14px] text-[#1d1d1f]">
                  {profile.name}
                  {profile.id === user.id && (
                    <span className="ml-2 text-[12px] text-[#6e6e73] font-normal">(나)</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  {profile.jersey_number != null ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-[#0071e3] text-white text-[13px] font-bold rounded-full">
                      {profile.jersey_number}
                    </span>
                  ) : (
                    <span className="text-[#c7c7cc]">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-[#6e6e73] text-[13px]">
                  {profile.position ? POSITION_LABELS[profile.position] ?? profile.position : <span className="text-[#c7c7cc]">—</span>}
                </td>
                <td className="px-5 py-4">
                  <RoleBadge role={profile.role} />
                </td>
                <td className="px-5 py-4 text-[#6e6e73] text-[13px]">
                  {new Date(profile.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-5 py-4">
                  {profile.id !== user.id ? (
                    <RoleSelector profileId={profile.id} currentRole={profile.role} />
                  ) : (
                    <span className="text-[12px] text-[#c7c7cc]">변경 불가</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && (
          <p className="text-center text-[#6e6e73] py-12">가입된 회원이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[#0071e3] text-white">
        관리자
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full bg-black/[0.06] text-[#6e6e73]">
      일반
    </span>
  );
}
