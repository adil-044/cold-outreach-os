"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { QuickAddProspect } from "@/components/prospects/quick-add";
import { useOutreachStore } from "@/lib/store";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useOutreachStore((s) => s.hydrated);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    const result = useOutreachStore.persist.rehydrate();
    Promise.resolve(result).finally(() => {
      useOutreachStore.getState().setHydrated(true);
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen(true);
        return;
      }
      if (typing) return;
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setQuickOpen(true);
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        setCmdOpen(true);
      } else if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        router.push("/campaigns");
      } else if (e.key === "?") {
        e.preventDefault();
        router.push("/settings");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onCommand={() => setCmdOpen(true)} onQuickAdd={() => setQuickOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          {!hydrated ? (
            <div className="text-sm text-muted-foreground">Loading workspace…</div>
          ) : (
            children
          )}
        </main>
      </div>
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} onQuickAdd={() => setQuickOpen(true)} />
      <QuickAddProspect open={quickOpen} onOpenChange={setQuickOpen} />
    </div>
  );
}
