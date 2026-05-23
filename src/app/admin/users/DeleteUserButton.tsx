"use client";

import { useState } from "react";

type Props = {
  profileId: string;
  name: string;
  onDeleted: (id: string) => void;
};

export default function DeleteUserButton({ profileId, name, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `정말로 이 회원을 팀에서 삭제하시겠습니까?\n관련 투표 기록도 함께 삭제됩니다.\n\n대상: ${name}`
    );
    if (!confirmed) return;

    setDeleting(true);
    const res = await fetch("/api/admin/delete-user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: profileId }),
    });
    setDeleting(false);

    if (res.ok) {
      onDeleted(profileId);
    } else {
      const data = await res.json();
      alert(data.error ?? "삭제에 실패했습니다.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-black/[0.04] text-[#ff3b30] hover:bg-red-50 transition-all disabled:opacity-50 whitespace-nowrap"
    >
      {deleting ? "삭제 중…" : "회원 추방"}
    </button>
  );
}
