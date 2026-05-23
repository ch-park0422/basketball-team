"use client";

import { useState } from "react";

type Props = { profileId: string; currentRole: string };

export default function RoleSelector({ profileId, currentRole }: Props) {
  const [role, setRole] = useState(currentRole);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleChange(newRole: string) {
    setStatus("saving");
    setRole(newRole);

    const res = await fetch("/api/admin/update-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: profileId, newRole }),
    });

    if (res.ok) {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } else {
      const data = await res.json();
      alert(data.error ?? "저장 실패");
      setRole(currentRole);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1500);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        onChange={(e) => handleChange(e.target.value)}
        disabled={status === "saving"}
        className="text-[12px] bg-black/[0.04] rounded-lg px-2.5 py-1.5 text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] disabled:opacity-50 transition-all"
      >
        <option value="user">일반</option>
        <option value="admin">관리자</option>
      </select>
      {status === "saving" && <span className="text-[12px] text-[#6e6e73]">저장 중...</span>}
      {status === "saved" && <span className="text-[12px] text-[#34c759] font-semibold">✓ 저장됨</span>}
      {status === "error" && <span className="text-[12px] text-red-500">✗ 실패</span>}
    </div>
  );
}
