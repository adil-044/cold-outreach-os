"use client";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useOutreachStore } from "@/lib/store";

export function AnalyticsPage() {
  const activities = useOutreachStore((s) => s.activities);
  const campaigns = useOutreachStore((s) => s.campaigns);
  const dispositions = useOutreachStore((s) => s.dispositions);
  const prospects = useOutreachStore((s) => s.prospects);
  const scripts = useOutreachStore((s) => s.scripts);

  const dispositionBreakdown = useMemo(() => {
    return dispositions.map((d) => ({
      name: d.name,
      count: prospects.filter((p) => p.dispositionId === d.id).length,
    })).filter((x) => x.count > 0);
  }, [dispositions, prospects]);

  const scriptPerf = useMemo(() => {
    return scripts.slice(0, 6).map((s) => ({
      name: s.title.slice(0, 18),
      uses: prospects.filter((p) => p.scriptId === s.id).length,
    }));
  }, [scripts, prospects]);

  const totals = {
    sent: activities.filter((a) => a.type === "email_sent" || a.type === "dm_sent").length,
    replies: activities.filter((a) => a.type === "replied").length,
    meetings: activities.filter((a) => a.type === "meeting_booked").length,
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Daily/weekly/monthly · campaign · script · disposition</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardHeader><CardDescription>Sent</CardDescription><CardTitle className="text-2xl">{totals.sent}</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardDescription>Replies</CardDescription><CardTitle className="text-2xl">{totals.replies}</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardDescription>Meetings</CardDescription><CardTitle className="text-2xl">{totals.meetings}</CardTitle></CardHeader></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Campaign comparison</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {campaigns.map((c) => (
              <div key={c.id} className="flex justify-between text-sm border-b border-border py-2">
                <span>{c.name}</span>
                <span className="text-muted-foreground">{c.sent} sent · {c.replies} replies · {c.meetings} mtgs</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Script performance</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scriptPerf}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} width={28} fontSize={12} />
                <Tooltip />
                <Bar dataKey="uses" fill="var(--primary)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Disposition breakdown</CardTitle></CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {dispositionBreakdown.map((d) => (
              <div key={d.name} className="rounded-md border border-border p-3 flex justify-between text-sm">
                <span>{d.name}</span><span className="tabular-nums">{d.count}</span>
              </div>
            ))}
            {dispositionBreakdown.length === 0 && <p className="text-sm text-muted-foreground">No dispositions yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
