"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Mail,
  Check,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Lead = {
  id: string;
  n: number;
  business: string;
  service: string;
  email: string;
  subject: string;
  body: string;
  priority: string;
  angle: string;
  sourceUrl: string;
  sourceType: string;
  consentBasis: string;
  caslEligible?: boolean;
  tribe?: { conversion: number; subjectVariant: string };
};

type Pack = {
  title: string;
  inbox?: string;
  leads: Lead[];
  casl?: { requirements: string[]; crtcFaq: string };
};

const STORAGE_KEY = "ottawa-email-desk-v1";
const CASL_GATE_KEY = "ottawa-email-casl-gate-v1";
type StatusMap = Record<string, "todo" | "sent" | "replied" | "skip">;

function basePath() {
  if (typeof window === "undefined") return "";
  if (window.location.pathname.startsWith("/cold-outreach-os")) return "/cold-outreach-os";
  return "";
}

function mailtoHref(email: string, subject: string, body: string) {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function OttawaEmailDesk() {
  const [pack, setPack] = useState<Pack | null>(null);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<StatusMap>({});
  const [filter, setFilter] = useState<"todo" | "all" | "sent">("todo");
  const [caslAccepted, setCaslAccepted] = useState(false);
  const [checks, setChecks] = useState({ source: false, relevant: false, idOk: false, unsub: false });
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStatus(JSON.parse(raw) as StatusMap);
      if (localStorage.getItem(CASL_GATE_KEY) === "1") setCaslAccepted(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
  }, [status]);

  useEffect(() => {
    fetch(`${basePath()}/data/ottawa-email-leads.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`Load failed ${r.status}`);
        return r.json();
      })
      .then((d: Pack) => setPack(d))
      .catch((e: Error) => setLoadError(e.message));
  }, []);

  const queue = useMemo(() => {
    if (!pack) return [];
    const leads = [...pack.leads].sort((a, b) => {
      const pa = a.priority === "A" ? 0 : 1;
      const pb = b.priority === "A" ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return a.n - b.n;
    });
    if (filter === "all") return leads;
    if (filter === "sent") return leads.filter((l) => status[l.id] === "sent" || status[l.id] === "replied");
    return leads.filter((l) => !status[l.id] || status[l.id] === "todo");
  }, [pack, filter, status]);

  useEffect(() => {
    if (index >= queue.length) setIndex(0);
    setChecks({ source: false, relevant: false, idOk: false, unsub: false });
  }, [queue.length, index, filter]);

  const lead = queue[queue.length ? Math.min(index, queue.length - 1) : 0];
  const doneCount = pack ? pack.leads.filter((l) => status[l.id] === "sent" || status[l.id] === "replied").length : 0;
  const sendReady = !!lead && checks.source && checks.relevant && checks.idOk && checks.unsub;

  const copyText = useCallback(async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label}`);
    } catch {
      toast.error("Copy failed");
    }
  }, []);

  if (loadError) {
    return (
      <div className="min-h-dvh bg-slate-950 text-zinc-100 p-6">
        <p className="text-red-400">{loadError}</p>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="min-h-dvh bg-slate-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Loading…</p>
      </div>
    );
  }

  if (!caslAccepted) {
    return (
      <div className="min-h-dvh bg-slate-950 text-zinc-100 px-4 py-8">
        <div className="mx-auto max-w-lg space-y-5 rounded-2xl border border-amber-500/40 bg-slate-900 p-5">
          <div className="flex gap-3">
            <ShieldAlert className="h-6 w-6 text-amber-400 shrink-0" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-amber-400">Canada first</p>
              <h1 className="text-xl font-semibold mt-1">CASL gate — before any cold email</h1>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-zinc-300">
            {(pack.casl?.requirements || []).map((r) => (
              <li key={r} className="flex gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-zinc-500">Ops checklist, not legal advice. Unsure → do not send.</p>
          <a href={pack.casl?.crtcFaq} target="_blank" rel="noreferrer" className="text-sm text-emerald-400 flex items-center gap-2">
            <ExternalLink className="h-4 w-4" /> CRTC CASL FAQ
          </a>
          <Button
            className="w-full h-12 bg-emerald-400 text-slate-950 hover:bg-emerald-400/90"
            onClick={() => {
              localStorage.setItem(CASL_GATE_KEY, "1");
              setCaslAccepted(true);
            }}
          >
            I will follow CASL — unlock desk
          </Button>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-dvh bg-slate-950 text-zinc-100 flex items-center justify-center p-6">
        <p className="text-zinc-400">No leads in filter.</p>
      </div>
    );
  }

  const st = status[lead.id] || "todo";

  return (
    <div className="min-h-dvh bg-slate-950 text-zinc-100 pb-28">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 backdrop-blur px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div className="flex justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-emerald-400">Uptisement · CASL email desk</p>
            <h1 className="text-base font-semibold">Ottawa blue-collar</h1>
            {pack.inbox ? <p className="text-[11px] text-zinc-500 mt-0.5">From: {pack.inbox}</p> : null}
          </div>
          <div className="text-right text-xs text-zinc-400">
            <div>
              {doneCount}/{pack.leads.length} sent
            </div>
            <button
              type="button"
              className="text-amber-400 underline"
              onClick={() => {
                localStorage.removeItem(CASL_GATE_KEY);
                setCaslAccepted(false);
              }}
            >
              Re-show CASL
            </button>
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
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/10 text-zinc-100 hover:bg-white/10">#{lead.n}</Badge>
              <Badge className="bg-amber-500/20 text-amber-200 hover:bg-amber-500/20">Priority {lead.priority}</Badge>
              <Badge className="bg-white/10 text-zinc-300 hover:bg-white/10 capitalize">{st}</Badge>
              {lead.tribe ? (
                <Badge className="bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/20">
                  Tribe {lead.tribe.conversion.toFixed(2)}
                </Badge>
              ) : null}
            </div>
            <h2 className="mt-2 text-xl font-semibold">{lead.business}</h2>
            <p className="text-sm text-zinc-400">{lead.service}</p>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-10 w-10" onClick={() => setIndex((i) => (i - 1 + queue.length) % queue.length)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-10 w-10" onClick={() => setIndex((i) => (i + 1) % queue.length)}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 space-y-2">
          <div className="flex justify-between">
            <p className="text-sm font-medium">To</p>
            <button type="button" className="text-xs text-emerald-400 flex items-center gap-1" onClick={() => copyText("email", lead.email)}>
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <p className="text-lg font-medium break-all">{lead.email}</p>
        </section>

        <section className="rounded-2xl border border-amber-500/30 bg-slate-900 p-4 space-y-3">
          <p className="text-sm font-medium text-amber-200">Per-lead CASL checks</p>
          <p className="text-xs text-zinc-400">{lead.consentBasis}</p>
          {(
            [
              ["source", "Opened Source URL and confirmed published business email"],
              ["relevant", "Website offer is relevant to their trade role"],
              ["idOk", "Body identifies Adil / Uptisement + contact"],
              ["unsub", "Body has Reply UNSUBSCRIBE — I will honour opt-outs"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 accent-emerald-400"
                checked={checks[key]}
                onChange={(e) => setChecks((c) => ({ ...c, [key]: e.target.checked }))}
              />
              <span className="text-zinc-300">{label}</span>
            </label>
          ))}
          {!sendReady ? <p className="text-xs text-amber-300">Tick all four before Open mail unlocks.</p> : null}
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 space-y-2">
          <div className="flex justify-between">
            <p className="text-sm font-medium">Subject</p>
            <button type="button" className="text-xs text-emerald-400" onClick={() => copyText("subject", lead.subject)}>
              Copy
            </button>
          </div>
          <p className="text-[15px] text-zinc-200">{lead.subject}</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 space-y-2">
          <div className="flex justify-between">
            <p className="text-sm font-medium">Email body</p>
            <button type="button" className="text-xs text-emerald-400" onClick={() => copyText("body", lead.body)}>
              Copy
            </button>
          </div>
          <p className="text-[15px] leading-relaxed text-zinc-200 whitespace-pre-wrap">{lead.body}</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 space-y-2">
          <p className="text-sm font-medium">Angle</p>
          <p className="text-sm text-zinc-300">{lead.angle}</p>
          <a href={lead.sourceUrl} target="_blank" rel="noreferrer" onClick={() => setChecks((c) => ({ ...c, source: true }))} className="flex items-center gap-2 text-sm text-emerald-400">
            <ExternalLink className="h-4 w-4" /> {lead.sourceType}
          </a>
        </section>

        <section className="grid grid-cols-3 gap-2">
          <Button
            className="h-12 bg-emerald-400 text-slate-950 hover:bg-emerald-400/90 disabled:opacity-40"
            disabled={!sendReady}
            onClick={() => {
              setStatus((s) => ({ ...s, [lead.id]: "sent" }));
              setTimeout(() => setIndex((i) => (i + 1) % Math.max(queue.length, 1)), 200);
            }}
          >
            Sent
          </Button>
          <Button variant="secondary" className="h-12 bg-white/10 text-zinc-100" onClick={() => setStatus((s) => ({ ...s, [lead.id]: "replied" }))}>
            Replied
          </Button>
          <Button
            variant="secondary"
            className="h-12 bg-white/10 text-zinc-100"
            onClick={() => {
              setStatus((s) => ({ ...s, [lead.id]: "skip" }));
              setTimeout(() => setIndex((i) => (i + 1) % Math.max(queue.length, 1)), 200);
            }}
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
          <RotateCcw className="h-3.5 w-3.5" /> Reset progress
        </button>
      </main>

      <div className="fixed bottom-0 inset-x-0 border-t border-white/10 bg-slate-950/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-lg grid grid-cols-2 gap-2">
          <button type="button" className="rounded-xl bg-white/10 py-3 text-sm" onClick={() => copyText("full email", `To: ${lead.email}\nSubject: ${lead.subject}\n\n${lead.body}`)}>
            Copy all
          </button>
          {sendReady ? (
            <a href={mailtoHref(lead.email, lead.subject, lead.body)} className="rounded-xl bg-emerald-400 py-3 text-center text-sm font-semibold text-slate-950 flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" /> Open mail
            </a>
          ) : (
            <button type="button" disabled className="rounded-xl bg-white/5 py-3 text-sm text-zinc-500">
              Mail locked
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
