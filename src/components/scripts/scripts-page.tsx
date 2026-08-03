"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Archive, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOutreachStore } from "@/lib/store";
import { extractVariables, renderTemplate } from "@/lib/variables";
import { uid } from "@/lib/utils";
import type { Channel, Script } from "@/lib/types";

const CATEGORIES: Channel[] = [
  "email","dm","instagram","facebook","linkedin","twitter","phone",
  "follow_up_1","follow_up_2","follow_up_3","breakup",
];

export function ScriptsPage() {
  const scripts = useOutreachStore((s) => s.scripts);
  const upsertScript = useOutreachStore((s) => s.upsertScript);
  const duplicateScript = useOutreachStore((s) => s.duplicateScript);
  const archiveScript = useOutreachStore((s) => s.archiveScript);
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewVars, setPreviewVars] = useState({
    first_name: "Alex",
    business: "Five Star Roofing",
    city: "Tampa",
    industry: "Roofing",
    pain_point: "slow estimates losing jobs",
    website: "https://example.com",
    offer: "AI Estimator — $500 + $50/estimate",
  });

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) setSelectedId(id);
    else if (scripts[0]) setSelectedId(scripts[0].id);
  }, [scripts]);

  const folders = useMemo(() => ["all", ...new Set(scripts.map((s) => s.folder))], [scripts]);
  const filtered = scripts.filter((s) => {
    if (folder !== "all" && s.folder !== folder) return false;
    if (!q) return true;
    return (s.title + s.body + s.category).toLowerCase().includes(q.toLowerCase());
  });
  const selected = scripts.find((s) => s.id === selectedId) || null;

  function savePatch(patch: Partial<Script>) {
    if (!selected) return;
    const body = patch.body ?? selected.body;
    const subject = patch.subject ?? selected.subject;
    const next: Script = {
      ...selected,
      ...patch,
      variables: extractVariables(`${subject}\n${body}`),
      version: selected.version + (patch.body || patch.subject ? 1 : 0),
      versions:
        patch.body || patch.subject
          ? [
              { version: selected.version, body: selected.body, subject: selected.subject, savedAt: new Date().toISOString() },
              ...selected.versions,
            ].slice(0, 20)
          : selected.versions,
      updatedAt: new Date().toISOString(),
    };
    upsertScript(next);
  }

  function createNew() {
    const s: Script = {
      id: uid("scr"),
      title: "New script",
      category: "email",
      subject: "{{business}} — quick idea",
      body: "Hey {{first_name}},\n\n{{offer}}\n\n— Adil",
      variables: ["first_name", "business", "offer"],
      folder: "Inbox",
      archived: false,
      version: 1,
      versions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    upsertScript(s);
    setSelectedId(s.id);
    toast.success("Script created");
  }

  const previewSubject = selected ? renderTemplate(selected.subject, previewVars) : "";
  const previewBody = selected ? renderTemplate(selected.body, previewVars) : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Scripts</h1>
          <p className="text-sm text-muted-foreground">Variables · preview · version history</p>
        </div>
        <Button size="sm" onClick={createNew}><Plus className="h-3.5 w-3.5" /> New script</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr_320px]">
        <Card className="h-[calc(100vh-200px)] overflow-hidden">
          <CardHeader className="space-y-2">
            <Input placeholder="Search scripts…" value={q} onChange={(e) => setQ(e.target.value)} />
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger><SelectValue placeholder="Folder" /></SelectTrigger>
              <SelectContent>
                {folders.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-1 overflow-y-auto max-h-[calc(100vh-320px)]">
            {filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={`w-full rounded-md border px-2.5 py-2 text-left text-sm transition-colors ${
                  selectedId === s.id ? "border-primary bg-primary/10" : "border-transparent hover:bg-accent"
                }`}
              >
                <div className="font-medium truncate">{s.title}</div>
                <div className="mt-1 flex gap-1">
                  <Badge variant="secondary">{s.category}</Badge>
                  {s.archived && <Badge variant="outline">archived</Badge>}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="min-h-[480px]">
          {selected ? (
            <>
              <CardHeader className="flex-row items-center justify-between space-y-0 gap-2">
                <CardTitle className="truncate">{selected.title}</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { duplicateScript(selected.id); toast.success("Duplicated"); }}>
                    <Copy className="h-3.5 w-3.5" /> Duplicate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => archiveScript(selected.id)}>
                    <Archive className="h-3.5 w-3.5" /> {selected.archived ? "Unarchive" : "Archive"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label>Title</Label><Input value={selected.title} onChange={(e) => savePatch({ title: e.target.value })} /></div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={selected.category} onValueChange={(v) => savePatch({ category: v as Channel })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Folder</Label><Input value={selected.folder} onChange={(e) => savePatch({ folder: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Version</Label><Input readOnly value={`v${selected.version}`} /></div>
                </div>
                <div className="space-y-1.5"><Label>Subject</Label><Input value={selected.subject} onChange={(e) => savePatch({ subject: e.target.value })} placeholder="Email subject / optional" /></div>
                <div className="space-y-1.5">
                  <Label>Message (markdown ok)</Label>
                  <Textarea className="min-h-[260px] font-mono text-xs" value={selected.body} onChange={(e) => savePatch({ body: e.target.value })} />
                </div>
                <div className="flex flex-wrap gap-1">
                  {selected.variables.map((v) => <Badge key={v} variant="outline">{`{{${v}}}`}</Badge>)}
                </div>
                {selected.versions.length > 0 && (
                  <div className="rounded-md border border-border p-3 text-xs text-muted-foreground space-y-1">
                    <div className="font-medium text-foreground">Version history</div>
                    {selected.versions.slice(0, 5).map((v) => (
                      <div key={v.version}>v{v.version} · {new Date(v.savedAt).toLocaleString()}</div>
                    ))}
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="p-8 text-sm text-muted-foreground">Select a script</CardContent>
          )}
        </Card>

        <Card>
          <CardHeader><CardTitle>Live preview</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              {Object.entries(previewVars).map(([k, v]) => (
                <div key={k} className="space-y-1">
                  <Label className="text-xs">{k}</Label>
                  <Input className="h-8" value={v} onChange={(e) => setPreviewVars((p) => ({ ...p, [k]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
              {previewSubject && <div className="mb-2 font-medium">Subject: {previewSubject}</div>}
              {previewBody}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const text = previewSubject ? `Subject: ${previewSubject}\n\n${previewBody}` : previewBody;
                navigator.clipboard.writeText(text);
                toast.success("Preview copied");
              }}
            >
              Copy preview
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
