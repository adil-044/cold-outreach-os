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
  ShieldAlert,
  Ban,
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
  caslEligible?: boolean;
  consentBasis?: string;
  caslSender?: string;
  unsubscribe?: string;
};

type Pack = {
  title: string;
  updated: string;
  leads: Lead[];
  casl?: {
    law: string;
    crtcFaq: string;
    requirements: string[];
    deskPolicy: string;
  };
};

const STORAGE_KEY = "brantford-sms-desk-v1";
const CASL_GATE_KEY = "brantford-sms-casl-gate-v1";

type StatusMap = Record<string, "todo" | "sent" | "replied" | "skip">;

function basePath() {
  if (typeof window === "undefined") return "";
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
  const [filter, setFilter] = useState<"todo" | "all" | "sent" | "blocked">("todo");
  const [loadError, setLoadError] = useState("");
  const [caslAccepted, setCaslAccepted] = useState(false);
  const [checks, setChecks] = useState({
    sourceOpened: false,
    relevant: false,
    idOk: false,
    stopOk: false,
  });

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
    if (filter === "blocked") return leads.filter((l) => l.caslEligible === false);
    if (filter === "sent") return leads.filter((l) => status[l.id] === "sent" || status[l.id] === "replied");
    return leads.filter((l) => l.caslEligible !== false && (!status[l.id] || status[l.id] === "todo"));
  }, [pack, filter, status]);

  useEffect(() => {
    if (index >= queue.length) setIndex(0);
    setChecks({ sourceOpened: false, relevant: false, idOk: false, stopOk: false });
  }, [queue.length, index, filter]);

  const lead = queue[queue.length ? Math.min(index, queue.length - 1) : 0];
  const doneCount = pack
    ? pack.leads.filter((l) => status[l.id] === "sent" || status[l.id] === "replied").length
    : 0;

  const copyText = useCallback(async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label}`);
    } catch {
      toast.error("Copy failed — long-press the text");
    }
  }, []);

  function acceptCaslGate() {
    localStorage.setItem(CASL_GATE_KEY, "1");
    setCaslAccepted(true);
  }

  function mark(id: string, s: StatusMap[string]) {
    setStatus((prev) => ({ ...prev, [id]: s }));
    if (s === "sent" || s === "skip") {
      setTimeout(() => setIndex((i) => (queue.length ? (i + 1) % Math.max(queue.length, 1) : 0)), 200);
    }
  }

  const sendReady =
    !!lead &&
    lead.caslEligible !== false &&
    checks.sourceOpened &&
    checks.relevant &&
    checks.idOk &&
    checks.stopOk;

  if (loadError) {
    return (
      <div className="min-h-dvh bg-slate-950 text-zinc-100 p-6">
        <p className="text-red-400">{loadError}</p>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="min-h-dvh bg-slate-950 text-zinc-100 flex items-center justify-center p-6">
        <p className="text-zinc-400">Loading…</p>
      </div>
    );
  }

  if (!caslAccepted) {
    return (
      <div className="min-h-dvh bg-slate-950 text-zinc-100 px-4 py-8">
        <div className="mx-auto max-w-lg space-y-5 rounded-2xl border border-amber-500/40 bg-slate-900 p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-6 w-6 text-amber-400 shrink-0" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-amber-400">Canada first</p>
              <h1 className="text-xl font-semibold mt-1">CASL gate — read before any SMS</h1>
            </div>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Commercial texts in Canada are CEMs under{" "}
            <span className="text-zinc-100 font-medium">Canada&apos;s Anti-Spam Legislation (CASL)</span>.
            Desk will not open Text / Open SMS until you accept these rules.
          </p>
          <ul className="space-y-2 text-sm text-zinc-300">
            {(pack.casl?.requirements || []).map((r) => (
              <li key={r} className="flex gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-xl bg-black/30 p-3 text-xs text-zinc-400 space-y-2">
            <p>
              Implied consent from a published business number only works if the number was conspicuously
              published, has no &quot;no unsolicited messages&quot; note, and your message is relevant to
              their role — and you can prove it (source link + date).
            </p>
            <p>
              Leads marked <span className="text-red-300">texting unconfirmed</span> are blocked for SMS.
              Call only or get express consent.
            </p>
            <p>This is an ops checklist, not legal advice. When unsure: do not text.</p>
          </div>
          <a
            href={pack.casl?.crtcFaq || "https://crtc.gc.ca/eng/com500/faq500.htm/"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-emerald-400"
          >
            <ExternalLink className="h-4 w-4" /> CRTC CASL FAQ
          </a>
          <Button className="w-full h-12 bg-emerald-400 text-slate-950 hover:bg-emerald-400/90" onClick={acceptCaslGate}>
            I will follow CASL — unlock desk
          </Button>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-dvh bg-slate-950 text-zinc-100 flex items-center justify-center p-6">
        <p className="text-zinc-400">No leads in this filter.</p>
      </div>
    );
  }

  const st = status[lead.id] || "todo";
  const blocked = lead.caslEligible === false;

  return (
    <div className="min-h-dvh bg-slate-950 text-zinc-100 pb-28">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 backdrop-blur px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-emerald-400">Uptisement · CASL SMS desk</p>
            <h1 className="text-base font-semibold leading-tight">Brantford blue-collar</h1>
          </div>
          <div className="text-right text-xs text-zinc-400">
            <div>
              {doneCount}/{pack.leads.length} sent
            </div>
            <button
              type="button"
              className="text-amber-400 underline-offset-2 underline"
              onClick={() => {
                localStorage.removeItem(CASL_GATE_KEY);
                setCaslAccepted(false);
              }}
            >
              Re-show CASL gate
            </button>
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {(["todo", "all", "sent", "blocked"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f);
                setIndex(0);
              }}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium capitalize shrink-0",
                filter === f ? "bg-emerald-400 text-slate-950" : "bg-white/5 text-zinc-300",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4">
        {blocked ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-4 flex gap-3">
            <Ban className="h-5 w-5 text-red-400 shrink-0" />
            <div className="text-sm text-red-100 space-y-1">
              <p className="font-medium">SMS blocked — CASL</p>
              <p className="text-red-200/90">{lead.consentBasis}</p>
              <p className="text-xs text-red-200/70">You can still Call. Do not Open SMS / Text now.</p>
            </div>
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/10 text-zinc-100 hover:bg-white/10">#{lead.n}</Badge>
              <Badge className="bg-amber-500/20 text-amber-200 hover:bg-amber-500/20">Priority {lead.priority}</Badge>
              <Badge className="bg-white/10 text-zinc-300 hover:bg-white/10 capitalize">{st}</Badge>
              {blocked ? (
                <Badge className="bg-red-500/20 text-red-200 hover:bg-red-500/20">SMS blocked</Badge>
              ) : (
                <Badge className="bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/20">CASL candidate</Badge>
              )}
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
            {blocked || !sendReady ? (
              <button
                type="button"
                disabled
                className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-sm font-semibold text-zinc-500"
              >
                <MessageSquare className="h-4 w-4" /> SMS locked
              </button>
            ) : (
              <a
                href={smsHref(lead.phoneTel, lead.firstSms)}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3 text-sm font-semibold text-slate-950"
              >
                <MessageSquare className="h-4 w-4" /> Open SMS
              </a>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-500/30 bg-slate-900 p-4 space-y-3">
          <p className="text-sm font-medium text-amber-200">Per-lead CASL checks (required)</p>
          <p className="text-xs text-zinc-400 leading-relaxed">{lead.consentBasis}</p>
          <CheckRow
            checked={checks.sourceOpened}
            label="I opened Source 1 and confirmed the published number / listing"
            onChange={(v) => setChecks((c) => ({ ...c, sourceOpened: v }))}
            disabled={blocked}
          />
          <CheckRow
            checked={checks.relevant}
            label="This website offer is relevant to their business role"
            onChange={(v) => setChecks((c) => ({ ...c, relevant: v }))}
            disabled={blocked}
          />
          <CheckRow
            checked={checks.idOk}
            label="Message identifies Adil / Uptisement + contact (footer present)"
            onChange={(v) => setChecks((c) => ({ ...c, idOk: v }))}
            disabled={blocked}
          />
          <CheckRow
            checked={checks.stopOk}
            label="Message includes Reply STOP and I will honour opt-outs"
            onChange={(v) => setChecks((c) => ({ ...c, stopOk: v }))}
            disabled={blocked}
          />
          {!blocked && !sendReady ? (
            <p className="text-xs text-amber-300">Tick all four before Text / Open SMS unlocks.</p>
          ) : null}
        </section>

        <CopyBlock title="First SMS (CASL footer included)" text={lead.firstSms} onCopy={() => copyText("first SMS", lead.firstSms)} />
        <CopyBlock title="Follow-up SMS (CASL footer included)" text={lead.followupSms} onCopy={() => copyText("follow-up", lead.followupSms)} />

        <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 space-y-2">
          <p className="text-sm font-medium">Angle</p>
          <p className="text-sm text-zinc-300 leading-relaxed">{lead.angle}</p>
          <p className="text-xs text-zinc-500">{lead.websiteStatus}</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Link2 className="h-4 w-4 text-emerald-400" /> Sources (consent proof)
          </p>
          <SourceLink
            href={lead.source1}
            label="Source 1"
            onOpen={() => setChecks((c) => ({ ...c, sourceOpened: true }))}
          />
          <SourceLink href={lead.source2} label="Source 2 / search" />
          {lead.igProfile ? <SourceLink href={lead.igProfile} label="Instagram profile" icon="ig" /> : null}
          {lead.website ? <SourceLink href={lead.website} label="Website" icon="web" /> : null}
          {lead.maps ? <SourceLink href={lead.maps} label="Google Maps" icon="map" /> : null}
          <p className="pt-2 text-xs text-zinc-500 leading-relaxed">IG: {lead.igResearch}</p>
          <p className="text-xs text-zinc-500 leading-relaxed">GMB: {lead.gmbResearch}</p>
        </section>

        <section className="grid grid-cols-3 gap-2">
          <Button
            className="h-12 bg-emerald-400 text-slate-950 hover:bg-emerald-400/90 disabled:opacity-40"
            disabled={blocked || !sendReady}
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
            className="rounded-xl bg-white/10 py-3 text-sm font-medium disabled:opacity-40"
            disabled={blocked}
            onClick={() => copyText("first SMS", lead.firstSms)}
          >
            Copy SMS
          </button>
          {blocked || !sendReady ? (
            <button type="button" disabled className="rounded-xl bg-white/5 py-3 text-sm font-semibold text-zinc-500">
              Text locked
            </button>
          ) : (
            <a
              href={smsHref(lead.phoneTel, lead.firstSms)}
              className="rounded-xl bg-emerald-400 py-3 text-center text-sm font-semibold text-slate-950"
            >
              Text now
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckRow({
  checked,
  label,
  onChange,
  disabled,
}: {
  checked: boolean;
  label: string;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={cn("flex items-start gap-3 text-sm", disabled && "opacity-40")}>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 accent-emerald-400"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-zinc-300 leading-snug">{label}</span>
    </label>
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
  onOpen,
}: {
  href: string;
  label: string;
  icon?: "ig" | "web" | "map";
  onOpen?: () => void;
}) {
  if (!href) return null;
  const Icon = icon === "ig" ? AtSign : icon === "web" ? Globe : icon === "map" ? MapPin : ExternalLink;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => onOpen?.()}
      className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-sm text-zinc-200 active:bg-white/10"
    >
      <Icon className="h-4 w-4 shrink-0 text-emerald-400" />
      <span className="truncate flex-1">{label}</span>
      <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
    </a>
  );
}
