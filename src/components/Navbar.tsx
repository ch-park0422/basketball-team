import Link from "next/link";
import LogoutButton from "./LogoutButton";
import NavbarMobile from "./NavbarMobile";

async function getUserWithRole() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl?.startsWith("https://") || !supabaseKey) return null;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { user, role: profile?.role ?? "user" };
}

function BasketballIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 5C19 12 5 12 5 19" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 5C5 12 19 12 19 19" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export default async function Navbar() {
  const result = await getUserWithRole();
  const user = result?.user;
  const role = result?.role;

  const name = user?.user_metadata?.name as string | undefined;
  const jerseyNumber = user?.user_metadata?.jersey_number as number | undefined;
  const position = user?.user_metadata?.position as string | undefined;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-black/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 group">
          <BasketballIcon size={20} color="#1d1d1f" />
          <span className="font-semibold text-[15px] text-[#1d1d1f] group-hover:text-[#6e6e73] transition-colors">
            MY TEAM
          </span>
        </Link>

        {/* 데스크톱 메뉴 (md 이상) */}
        <div className="hidden md:flex items-center gap-1 text-[13px] font-medium">
          <Link href="/matches" className="px-3 py-1.5 rounded-lg text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-all">
            경기 일정
          </Link>
          <Link href="/videos" className="px-3 py-1.5 rounded-lg text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-all">
            영상
          </Link>

          {role === "admin" && (
            <>
              <Link href="/admin/users" className="px-3 py-1.5 rounded-lg text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-all">
                회원 관리
              </Link>
              <Link href="/admin/team-builder" className="px-3 py-1.5 rounded-lg text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-all">
                팀 빌더
              </Link>
              <Link href="/admin/harness" className="px-3 py-1.5 rounded-lg text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-all">
                하네스
              </Link>
            </>
          )}

          {user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-all"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 bg-[#0071e3] rounded-full text-[11px] font-bold text-white">
                  {jerseyNumber ?? "#"}
                </span>
                <span className="text-[13px] font-medium text-[#1d1d1f]">
                  {name ?? user.email}
                </span>
                {position && (
                  <span className="text-[11px] text-[#6e6e73] bg-black/[0.04] px-2 py-0.5 rounded-full">
                    {position}
                  </span>
                )}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1.5 rounded-lg text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-all">
                로그인
              </Link>
              <Link
                href="/register"
                className="ml-1 bg-[#0071e3] text-white px-4 py-1.5 rounded-full text-[13px] font-medium hover:bg-[#0077ed] transition-all"
              >
                팀 합류하기
              </Link>
            </>
          )}
        </div>

        {/* 모바일 햄버거 메뉴 */}
        <NavbarMobile
          role={role ?? null}
          isLoggedIn={!!user}
          name={name}
          jerseyNumber={jerseyNumber}
          email={user?.email}
          position={position}
        />
      </div>
    </nav>
  );
}
