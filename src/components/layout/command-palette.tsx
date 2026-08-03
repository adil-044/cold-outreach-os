"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  FileText,
  LayoutDashboard,
  Megaphone,
  Settings,
  Users,
  ListTodo,
  BarChart3,
  Inbox,
  Target,
} from "lucide-react";
import { useOutreachStore } from "@/lib/store";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const pages = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/prospects", label: "Prospects", icon: Users },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/scripts", label: "Scripts", icon: FileText },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/templates", label: "Templates", icon: Target },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function CommandPalette({
  open,
  onOpenChange,
  onQuickAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onQuickAdd: () => void;
}) {
  const router = useRouter();
  const prospects = useOutreachStore((s) => s.prospects);
  const scripts = useOutreachStore((s) => s.scripts);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const filteredProspects = useMemo(() => {
    const query = q.toLowerCase();
    return prospects
      .filter((p) =>
        [p.business, p.name, p.email, p.phone, p.city, p.industry, ...(p.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 8);
  }, [prospects, q]);

  const filteredScripts = useMemo(() => {
    const query = q.toLowerCase();
    return scripts.filter((s) => s.title.toLowerCase().includes(query)).slice(0, 6);
  }, [scripts, q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 max-w-xl">
        <Command className="rounded-xl" shouldFilter={false}>
          <div className="flex items-center border-b border-border px-3">
            <Command.Input
              value={q}
              onValueChange={setQ}
              placeholder="Type a command or search…"
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No results.</Command.Empty>
            <Command.Group heading="Actions" className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              <Command.Item
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                onSelect={() => {
                  onOpenChange(false);
                  onQuickAdd();
                }}
              >
                New prospect <span className="ml-auto kbd">N</span>
              </Command.Item>
            </Command.Group>
            <Command.Group heading="Pages" className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              {pages.map((p) => {
                const Icon = p.icon;
                return (
                  <Command.Item
                    key={p.href}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                    onSelect={() => {
                      onOpenChange(false);
                      router.push(p.href);
                    }}
                  >
                    <Icon className="h-4 w-4" /> {p.label}
                  </Command.Item>
                );
              })}
            </Command.Group>
            {filteredProspects.length > 0 && (
              <Command.Group heading="Prospects" className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                {filteredProspects.map((p) => (
                  <Command.Item
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                    onSelect={() => {
                      onOpenChange(false);
                      router.push(`/prospects?focus=${p.id}`);
                    }}
                  >
                    <Users className="h-4 w-4" />
                    <span className="truncate">{p.business}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{p.city}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {filteredScripts.length > 0 && (
              <Command.Group heading="Scripts" className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                {filteredScripts.map((s) => (
                  <Command.Item
                    key={s.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                    onSelect={() => {
                      onOpenChange(false);
                      router.push(`/scripts?id=${s.id}`);
                    }}
                  >
                    <FileText className="h-4 w-4" /> {s.title}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
