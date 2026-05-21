import Link from "next/link";
import LogoutButton from "./LogoutButton";

async function getUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl?.startsWith("https://") || !supabaseKey) return null;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export default async function Navbar() {
  const user = await getUser();

  const name = user?.user_metadata?.name as string | undefined;
  const jerseyNumber = user?.user_metadata?.jersey_number as number | undefined;
  const position = user?.user_metadata?.position as string | undefined;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-14">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span>🏀</span>
          <span className="text-orange-500">MyTeam</span>
        </Link>

        {/* 메뉴 */}
        <div className="flex items-center gap-6 text-sm">
          <Link href="/board" className="hover:text-orange-500 transition-colors">
            게시판
          </Link>
          <Link href="/videos" className="hover:text-orange-500 transition-colors">
            영상
          </Link>

          {user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-1.5 hover:text-orange-500 transition-colors"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 rounded-full text-xs font-bold text-orange-600">
                  {jerseyNumber ?? "#"}
                </span>
                <span className="font-medium">{name ?? user.email}</span>
                {position && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {position}
                  </span>
                )}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-orange-500 transition-colors">
                로그인
              </Link>
              <Link
                href="/register"
                className="bg-orange-500 text-white px-3 py-1.5 rounded-md hover:bg-orange-600 transition-colors"
              >
                팀 합류하기
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
