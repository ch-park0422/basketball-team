"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg text-blue-600">
          MyWebSite
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/board" className="hover:text-blue-600 transition-colors">
            게시판
          </Link>
          <Link href="/videos" className="hover:text-blue-600 transition-colors">
            영상
          </Link>
          {session ? (
            <>
              <Link href="/profile" className="hover:text-blue-600 transition-colors">
                {session.user?.name ?? session.user?.email}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-600 transition-colors">
                로그인
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
