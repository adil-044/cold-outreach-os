"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOutreachStore } from "@/lib/store";
import { formatRelative } from "@/lib/utils";

export function DashboardHome() {
  const prospects = useOutreachStore((s) => s.prospects);
  const campaigns = useOutreachStore((s) => s.campaigns);
  const tasks = useOutreachStore((s) => s.tasks);
  const activities = useOutreachStore((s) => s.activities);
  const goal = useOutreachStore((s) => s.settings.dailyOutreachGoal);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const sentToday = activities.filter(
      (a) => (a.type === "email_sent" || a.type === "dm_sent") && new Date(a.createdAt).toDateString() === today,
    ).length;
    const emails = activities.filter((a) => a.type === "email_sent").length;
    const dms = activities.filter((a) => a.type === "dm_sent").length;
    const replies = activities.filter((a) => a.type === "replied").length;
    const meetings = prospects.filter((p) => p.status === "meeting").length;
    const followUps = prospects.filter((p) => p.followUpDate && new Date(p.followUpDate) <= new Date()).length;
    const responseRate = emails + dms > 0 ? Math.round((replies / (emails + dms)) * 100) : 0;
    return { sentToday, emails, dms, replies, meetings, followUps, responseRate };
  }, [activities, prospects]);

  const chart = useMemo(() => {
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toDateString();
      const sent = activities.filter(
        (a) => (a.type === "email_sent" || a.type === "dm_sent") && new Date(a.createdAt).toDateString() === key,
      ).length;
      const replies = activities.filter(
        (a) => a.type === "replied" && new Date(a.createdAt).toDateString() === key,
      ).length;
      return { day: d.toLocaleDateString("en-US", { weekday: "short" }), sent, replies };
    });
    return days;
  }, [activities]);

  const dueTasks = tasks.filter((t) => !t.done).slice(0, 5);
  const cards = [
    { label: "Today's outreach", value: stats.sentToday, hint: `Goal ${goal}` },
    { label: "Emails sent", value: stats.emails, hint: "All time" },
    { label: "DMs sent", value: stats.dms, hint: "All time" },
    { label: "Replies", value: stats.replies, hint: `${stats.responseRate}% rate` },
    { label: "Meetings", value: stats.meetings, hint: "In pipeline" },
    { label: "Follow-ups due", value: stats.followUps, hint: "Needs action" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">ADHD-friendly outreach OS · keyboard-first</p>
        </div>
        <div className="flex gap-2">
          <Link href="/tasks" className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm hover:bg-accent">Tasks</Link>
          <Link href="/prospects" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm text-primary-foreground hover:bg-primary/90">Open prospects</Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardDescription>{c.label}</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{c.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">{c.hint}</CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity (7 days)</CardTitle>
            <CardDescription>Sent vs replies</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={28} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="sent" stroke="var(--primary)" fill="color-mix(in oklab, var(--primary) 25%, transparent)" />
                <Area type="monotone" dataKey="replies" stroke="var(--success)" fill="color-mix(in oklab, var(--success) 20%, transparent)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Due tasks</CardTitle>
            <CardDescription>Follow-up queue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {dueTasks.length === 0 && <p className="text-sm text-muted-foreground">Inbox zero.</p>}
            {dueTasks.map((t) => (
              <div key={t.id} className="rounded-md border border-border p-2.5">
                <div className="text-sm font-medium">{t.title}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{t.priority}</Badge>
                  <span>{formatRelative(t.dueDate)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
            <CardDescription>Active pipelines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.channel} · {c.status}</div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>{c.sent} sent</div>
                  <div>{c.replies} replies · {c.meetings} meetings</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardDescription>{prospects.length} prospects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(["new", "queued", "contacted", "replied", "meeting", "won"] as const).map((status) => {
              const n = prospects.filter((p) => p.status === status).length;
              const pct = prospects.length ? Math.round((n / prospects.length) * 100) : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="capitalize">{status}</span><span>{n}</span></div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
