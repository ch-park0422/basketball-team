"use client";

import { useState } from "react";

type Props = {
  profileId: string;
  currentRole: string;
};

const ROLE_LABELS: Record<string, string> = {
  user: "일반",
  admin: "관리자",
};

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
      setRole(currentRole); // 롤백
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
        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50"
      >
        <option value="user">일반</option>
        <option value="admin">관리자</option>
      </select>
      {status === "saving" && (
        <span className="text-xs text-gray-400">저장 중...</span>
      )}
      {status === "saved" && (
        <span className="text-xs text-green-500">✓ 저장됨</span>
      )}
      {status === "error" && (
        <span className="text-xs text-red-500">✗ 실패</span>
      )}
    </div>
  );
}
