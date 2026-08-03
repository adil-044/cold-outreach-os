"use client";

import { Bell, Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TopBar({
  onQuickAdd,
  onCommand,
}: {
  onQuickAdd?: () => void;
  onCommand?: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <button type="button" onClick={onCommand} className="relative hidden sm:flex flex-1 max-w-md items-center text-left">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input readOnly placeholder="Search prospects, scripts, campaigns…" className="pl-9 cursor-pointer bg-muted/40" />
        <span className="pointer-events-none absolute right-3 kbd">⌘K</span>
      </button>
      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onCommand}>
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search</span>
        </Button>
        <Button size="sm" className="gap-1.5" onClick={onQuickAdd}>
          <Plus className="h-3.5 w-3.5" />
          Quick Add
        </Button>
        <Button size="icon" variant="ghost" aria-label="Notifications"><Bell className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" aria-label="Profile"><User className="h-4 w-4" /></Button>
      </div>
    </header>
  );
}
