"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOutreachStore } from "@/lib/store";
import { formatRelative } from "@/lib/utils";

export function InboxPage() {
  const activities = useOutreachStore((s) => s.activities);
  const prospects = useOutreachStore((s) => s.prospects);
  const addActivity = useOutreachStore((s) => s.addActivity);
  const [selectedProspectId, setSelectedProspectId] = useState(prospects[0]?.id || "");
  const [note, setNote] = useState("");

  const timeline = useMemo(
    () => activities.filter((a) => a.prospectId === selectedProspectId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [activities, selectedProspectId],
  );
  const prospect = prospects.find((p) => p.id === selectedProspectId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
        <p className="text-sm text-muted-foreground">Activity timeline · notes after every interaction</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="max-h-[70vh] overflow-y-auto">
          <CardHeader><CardTitle>Prospects</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {prospects.slice(0, 40).map((p) => (
              <button key={p.id} type="button" onClick={() => setSelectedProspectId(p.id)} className={`w-full rounded-md px-2 py-2 text-left text-sm ${selectedProspectId===p.id?"bg-primary/15":"hover:bg-accent"}`}>
                <div className="font-medium truncate">{p.business}</div>
                <div className="text-xs text-muted-foreground capitalize">{p.status}</div>
              </button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{prospect?.business || "Select prospect"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {timeline.map((a) => (
                <div key={a.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium">{a.title}</div>
                    <Badge variant="outline">{a.type}</Badge>
                  </div>
                  {a.detail && <p className="mt-1 text-xs text-muted-foreground">{a.detail}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{formatRelative(a.createdAt)}</p>
                </div>
              ))}
              {timeline.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
            </div>
            <div className="space-y-2">
              <Textarea placeholder="Add note…" value={note} onChange={(e) => setNote(e.target.value)} />
              <Button disabled={!selectedProspectId || !note.trim()} onClick={() => {
                addActivity({ prospectId: selectedProspectId, type: "note", title: "Note added", detail: note.trim() });
                setNote("");
              }}>Add note</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
