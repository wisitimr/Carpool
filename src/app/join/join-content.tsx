"use client";

import { useState } from "react";
import { createGroup } from "@/lib/group-actions";
import { useRouter } from "next/navigation";

interface JoinContentProps {
  locale: string;
}

export default function JoinContent({ locale }: JoinContentProps) {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const th = locale === "th";

  async function handleCreate() {
    if (!groupName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createGroup(groupName);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create party");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {th ? "ชื่อปาร์ตี้" : "Party Name"}
        </label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder={th ? "เช่น ทีม Office" : "e.g. Office Commute"}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          autoFocus
        />
      </div>
      {error && <p className="text-sm text-debt">{error}</p>}
      <button
        onClick={handleCreate}
        disabled={loading || !groupName.trim()}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? (th ? "กำลังสร้าง..." : "Creating...") : (th ? "สร้างปาร์ตี้" : "Create Party")}
      </button>
    </div>
  );
}
