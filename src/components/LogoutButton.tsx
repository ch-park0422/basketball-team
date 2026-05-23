"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-all"
    >
      로그아웃
    </button>
  );
}
