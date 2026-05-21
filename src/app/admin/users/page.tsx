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
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">회원 관리</h1>
        <p className="text-gray-500 text-sm mt-1">
          총 {members.length}명 · 관리자만 접근 가능한 페이지입니다
        </p>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600 w-8">#</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">이름</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">등번호</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">포지션</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">등급</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">가입일</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">등급 변경</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((profile, i) => (
              <tr
                key={profile.id}
                className={`hover:bg-gray-50 transition-colors ${
                  profile.id === user.id ? "bg-orange-50/40" : ""
                }`}
              >
                <td className="px-5 py-4 text-gray-400">{i + 1}</td>
                <td className="px-5 py-4 font-medium">
                  {profile.name}
                  {profile.id === user.id && (
                    <span className="ml-2 text-xs text-orange-500 font-normal">(나)</span>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {profile.jersey_number != null ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full text-sm font-bold text-orange-600">
                      {profile.jersey_number}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {profile.position
                    ? POSITION_LABELS[profile.position] ?? profile.position
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-5 py-4">
                  <RoleBadge role={profile.role} />
                </td>
                <td className="px-5 py-4 text-gray-400">
                  {new Date(profile.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-5 py-4">
                  {profile.id !== user.id ? (
                    <RoleSelector
                      profileId={profile.id}
                      currentRole={profile.role}
                    />
                  ) : (
                    <span className="text-xs text-gray-300">변경 불가</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {members.length === 0 && (
          <p className="text-center text-gray-400 py-12">가입된 회원이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
        관리자
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
      일반
    </span>
  );
}
