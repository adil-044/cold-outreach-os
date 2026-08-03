"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useOutreachStore } from "@/lib/store";
import { uid } from "@/lib/utils";
import type { Campaign } from "@/lib/types";

export function CampaignsPage() {
  const campaigns = useOutreachStore((s) => s.campaigns);
  const scripts = useOutreachStore((s) => s.scripts);
  const upsert = useOutreachStore((s) => s.upsertCampaign);
  const [name, setName] = useState("");

  function create() {
    if (!name.trim()) return toast.error("Name required");
    const c: Campaign = {
      id: uid("cmp"),
      name: name.trim(),
      channel: "email",
      status: "draft",
      scriptId: scripts[0]?.id,
      prospectIds: [],
      sent: 0,
      replies: 0,
      meetings: 0,
      createdAt: new Date().toISOString(),
    };
    upsert(c);
    setName("");
    toast.success("Campaign created");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
        <p className="text-sm text-muted-foreground">Group scripts + prospects · track sent/replies</p>
      </div>
      <Card>
        <CardHeader><CardTitle>New campaign</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Campaign name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={create}>Create</Button>
        </CardContent>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {campaigns.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{c.name}</CardTitle>
                <Badge>{c.status}</Badge>
              </div>
              <CardDescription>{c.channel} · {scripts.find((s) => s.id === c.scriptId)?.title || "—"}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 text-sm text-muted-foreground">
              <span>{c.sent} sent</span>
              <span>{c.replies} replies</span>
              <span>{c.meetings} meetings</span>
              <Button size="sm" variant="outline" className="ml-auto" onClick={() => upsert({ ...c, status: c.status === "active" ? "paused" : "active" })}>
                {c.status === "active" ? "Pause" : "Activate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
