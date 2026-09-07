"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  MessageSquare,
  Phone,
  Check,
  RotateCcw,
  Link2,
  AtSign,
  Globe,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Lead = {
  id: string;
  n: number;
  business: string;
  originalListing: string;
  owner: string;
  phone: string;
  phoneTel: string;
  priority: string;
  smsStatus: string;
  websiteStatus: string;
  angle: string;
  igResearch: string;
  gmbResearch: string;
  firstSms: string;
  followupSms: string;
  verification: string;
  source1: string;
  source2: string;
  bestWindow: string;
  igProfile: string;
  website: string;
  maps: string;
};

type Pack = { title: string; updated: string; leads: Lead[] };

const STORAGE_KEY = "brantford-sms-desk-v1";

type StatusMap = Record<string, "todo" | "sent" | "replied" | "skip">;

function basePath() {
  if (typeof window === "undefined") return "";
  // GitHub Pages base
  if (window.location.pathname.startsWith("/cold-outreach-os")) return "/cold-outreach-os";
  return "";
}

function smsHref(phoneTel: string, body: string) {
  const digits = phoneTel.replace(/[^\d+]/g, "");
  return `sms:${digits}?&body=${encodeURIComponent(body)}`;
}

export function BrantfordSmsDesk() {
  const [pack, setPack] = useState<Pack | null>(null);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<StatusMap>({});
  const [filter, setFilter] = useState<"todo" | "all" | "sent">("todo");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStatus(JSON.parse(raw) as StatusMap);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
  }, [status]);

  useEffect(() => {
    const url = `${basePath()}/data/brantford-sms-leads.json`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Load failed ${r.status}`);
        return r.json();
      })
      .then((data: Pack) => setPack(data))
      .catch((e: Error) => setLoadError(e.message || "Failed to load leads"));
  }, []);

  const queue = useMemo(() => {
    if (!pack) return [];
    const leads = [...pack.leads].sort((a, b) => {
      const pa = a.priority === "A" ? 0 : a.priority === "B" ? 1 : 2;
      const pb = b.priority === "A" ? 0 : b.priority === "B" ? 1 : 2;
      if (pa !== pb) return pa - pb;
      return a.n - b.n;
    });
    if (filter === "all") return leads;
    if (filter === "sent") return leads.filter((l) => status[l.id] === "sent" || status[l.id] === "replied");
    return leads.filter((l) => !status[l.id] || status[l.id] === "todo");
  }, [pack, filter, status]);

  useEffect(() => {
    if (index >= queue.length) setIndex(0);
  }, [queue.length, index]);

  const lead = queue[queue.length ? Math.min(index, queue.length - 1) : 0];
  const doneCount = pack ? pack.leads.filter((l) => status[l.id] === "sent" || status[l.id] === "replied").length : 0;

  const copyText = useCallback(async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label}`);
    } catch {
      toast.error("Copy failed - long-press the text");
    }
  }, []);

  function mark(id: string, s: StatusMap[string]) {
    setStatus((prev) => ({ ...prev, [id]: s }));
    if (s === "sent" || s === "skip") {
      setTimeout(() => setIndex((i) => (queue.length ? (i + 1) % Math.max(queue.length, 1) : 0)), 200);
    }
  }

  if (loadError) {
    return (
      <div className="min-h-dvh bg-slate-950 text-zinc-100 p-6">
        <p className="text-red-400">{loadError}</p>
      </div>
    );
  }

  if (!pack || !lead) {
    return (
      <div className="min-h-dvh bg-slate-950 text-zinc-100 flex items-center justify-center p-6">
        <p className="text-zinc-400">{pack && !queue.length ? "No leads in this filter." : "Loading…"}</p>
      </div>
    );
  }

  const st = status[lead.id] || "todo";

  return (
    <div className="min-h-dvh bg-slate-950 text-zinc-100 pb-28">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 backdrop-blur px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-emerald-400">Uptisement | SMS desk</p>
            <h1 className="text-base font-semibold leading-tight">Brantford blue-collar</h1>
          </div>
          <div className="text-right text-xs text-zinc-400">
            <div>
              {doneCount}/{pack.leads.length} sent
            </div>
            <div>
              {index + 1}/{queue.length} in view
            </div>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          {(["todo", "all", "sent"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f);
                setIndex(0);
              }}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium capitalize",
                filter === f ? "bg-emerald-400 text-slate-950" : "bg-white/5 text-zinc-300",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/10 text-zinc-100 hover:bg-white/10">#{lead.n}</Badge>
              <Badge
                className={cn(
                  "hover:bg-opacity-100",
                  lead.priority === "A"
                    ? "bg-amber-500/20 text-amber-200"
                    : lead.priority === "B"
                      ? "bg-sky-500/20 text-sky-200"
                      : "bg-zinc-500/20 text-zinc-300",
                )}
              >
                Priority {lead.priority}
              </Badge>
              <Badge className="bg-white/10 text-zinc-300 hover:bg-white/10 capitalize">{st}</Badge>
            </div>
            <h2 className="mt-2 text-xl font-semibold leading-snug break-words">{lead.business}</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {lead.owner !== "Not publicly found" ? lead.owner : "Owner unknown"} | {lead.smsStatus}
            </p>
            {lead.bestWindow ? <p className="mt-1 text-xs text-emerald-400">{lead.bestWindow}</p> : null}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 text-zinc-200"
              onClick={() => setIndex((i) => (i - 1 + queue.length) % queue.length)}
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 text-zinc-200"
              onClick={() => setIndex((i) => (i + 1) % queue.length)}
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-200">Phone</p>
            <button
              type="button"
              className="text-xs text-emerald-400 flex items-center gap-1"
              onClick={() => copyText("phone", lead.phone)}
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{lead.phone}</p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${lead.phoneTel}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-sm font-medium"
            >
              <Phone className="h-4 w-4" /> Call
            </a>
            <a
              href={smsHref(lead.phoneTel, lead.firstSms)}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3 text-sm font-semibold text-slate-950"
            >
              <MessageSquare className="h-4 w-4" /> Open SMS
            </a>
          </div>
        </section>

        <CopyBlock title="First SMS" text={lead.firstSms} onCopy={() => copyText("first SMS", lead.firstSms)} />
        <CopyBlock title="Follow-up SMS" text={lead.followupSms} onCopy={() => copyText("follow-up", lead.followupSms)} />

        <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 space-y-2">
          <p className="text-sm font-medium">Angle</p>
          <p className="text-sm text-zinc-300 leading-relaxed">{lead.angle}</p>
          <p className="text-xs text-zinc-500">{lead.websiteStatus}</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Link2 className="h-4 w-4 text-emerald-400" /> Sources
          </p>
          <SourceLink href={lead.source1} label="Source 1" />
          <SourceLink href={lead.source2} label="Source 2 / search" />
          {lead.igProfile ? (
            <SourceLink href={lead.igProfile} label="Instagram profile" icon="ig" />
          ) : null}
          {lead.website ? <SourceLink href={lead.website} label="Website" icon="web" /> : null}
          {lead.maps ? <SourceLink href={lead.maps} label="Google Maps" icon="map" /> : null}
          <p className="pt-2 text-xs text-zinc-500 leading-relaxed">IG: {lead.igResearch}</p>
          <p className="text-xs text-zinc-500 leading-relaxed">GMB: {lead.gmbResearch}</p>
        </section>

        <section className="grid grid-cols-3 gap-2">
          <Button
            className="h-12 bg-emerald-400 text-slate-950 hover:bg-emerald-400/90"
            onClick={() => mark(lead.id, "sent")}
          >
            <Check className="h-4 w-4 mr-1" /> Sent
          </Button>
          <Button
            variant="secondary"
            className="h-12 bg-white/10 text-zinc-100 hover:bg-white/15"
            onClick={() => mark(lead.id, "replied")}
          >
            Replied
          </Button>
          <Button
            variant="secondary"
            className="h-12 bg-white/10 text-zinc-100 hover:bg-white/15"
            onClick={() => mark(lead.id, "skip")}
          >
            Skip
          </Button>
        </section>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 py-3 text-xs text-zinc-500"
          onClick={() => {
            setStatus({});
            toast.message("Progress cleared");
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset all progress on this phone
        </button>
      </main>

      <div className="fixed bottom-0 inset-x-0 border-t border-white/10 bg-slate-950/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-lg grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-xl bg-white/10 py-3 text-sm font-medium"
            onClick={() => copyText("first SMS", lead.firstSms)}
          >
            Copy SMS
          </button>
          <a
            href={smsHref(lead.phoneTel, lead.firstSms)}
            className="rounded-xl bg-emerald-400 py-3 text-center text-sm font-semibold text-slate-950"
          >
            Text now
          </a>
        </div>
      </div>
    </div>
  );
}

function CopyBlock({ title, text, onCopy }: { title: string; text: string; onCopy: () => void }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{title}</p>
        <button type="button" onClick={onCopy} className="flex items-center gap-1 text-xs text-emerald-400">
          <Copy className="h-3.5 w-3.5" /> Copy
        </button>
      </div>
      <p className="text-[15px] leading-relaxed text-zinc-200 whitespace-pre-wrap select-text">{text}</p>
    </section>
  );
}

function SourceLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: "ig" | "web" | "map";
}) {
  if (!href) return null;
  const Icon = icon === "ig" ? AtSign : icon === "web" ? Globe : icon === "map" ? MapPin : ExternalLink;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-sm text-zinc-200 active:bg-white/10"
    >
      <Icon className="h-4 w-4 shrink-0 text-emerald-400" />
      <span className="truncate flex-1">{label}</span>
      <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
    </a>
  );
}
