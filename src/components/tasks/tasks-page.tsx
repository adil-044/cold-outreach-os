"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useOutreachStore } from "@/lib/store";
import { formatRelative } from "@/lib/utils";

export function TasksPage() {
  const tasks = useOutreachStore((s) => s.tasks);
  const toggle = useOutreachStore((s) => s.toggleTask);
  const addTask = useOutreachStore((s) => s.addTask);
  const [title, setTitle] = useState("");

  const groups = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const overdue = tasks.filter((t) => !t.done && new Date(t.dueDate) < today);
    const dueToday = tasks.filter((t) => !t.done && new Date(t.dueDate).toDateString() === today.toDateString());
    const upcoming = tasks.filter((t) => !t.done && new Date(t.dueDate) > today);
    return { overdue, dueToday, upcoming };
  }, [tasks]);

  function Section({ label, items }: { label: string; items: typeof tasks }) {
    return (
      <Card>
        <CardHeader><CardTitle>{label} <span className="text-muted-foreground font-normal">({items.length})</span></CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {items.length === 0 && <p className="text-sm text-muted-foreground">None</p>}
          {items.map((t) => (
            <label key={t.id} className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer">
              <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{t.title}</div>
                <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{t.priority}</Badge>
                  <span>{formatRelative(t.dueDate)}</span>
                </div>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">Today · overdue · upcoming · follow-up queue</p>
      </div>
      <div className="flex gap-2 max-w-xl">
        <Input placeholder="New task" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => {
          if (e.key === "Enter" && title.trim()) {
            addTask({ title: title.trim(), dueDate: new Date().toISOString(), priority: "medium" });
            setTitle("");
          }
        }} />
        <Button onClick={() => { if (!title.trim()) return; addTask({ title: title.trim(), dueDate: new Date().toISOString(), priority: "high" }); setTitle(""); }}>Add</Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Section label="Overdue" items={groups.overdue} />
        <Section label="Due today" items={groups.dueToday} />
        <Section label="Upcoming" items={groups.upcoming} />
      </div>
    </div>
  );
}
