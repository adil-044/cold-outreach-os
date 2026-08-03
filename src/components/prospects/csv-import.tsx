"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOutreachStore } from "@/lib/store";
import { uid } from "@/lib/utils";
import type { Prospect, ProspectStatus } from "@/lib/types";

const TARGETS = [
  "skip", "name", "business", "industry", "email", "instagram", "linkedin", "twitter",
  "phone", "website", "source", "status", "city", "state", "notes", "tags",
] as const;

type Target = (typeof TARGETS)[number];

const AUTO: Record<string, Target> = {
  name: "name", full_name: "name", contact: "name",
  business: "business", company: "business", company_name: "business",
  industry: "industry", trade: "industry",
  email: "email", email_address: "email",
  instagram: "instagram", ig: "instagram",
  linkedin: "linkedin", twitter: "twitter", x: "twitter",
  phone: "phone", phone_e164: "phone", mobile: "phone",
  website: "website", url: "website", web: "website",
  source: "source", status: "status",
  city: "city", state: "state", notes: "notes", tags: "tags",
};

export function CsvImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const upsertProspects = useOutreachStore((s) => s.upsertProspects);
  const addActivity = useOutreachStore((s) => s.addActivity);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, Target>>({});
  const [mode, setMode] = useState<"merge" | "overwrite">("merge");
  const [errors, setErrors] = useState<string[]>([]);

  function onFile(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const hs = res.meta.fields || [];
        const map: Record<string, Target> = {};
        hs.forEach((h) => {
          const key = h.trim().toLowerCase().replace(/\s+/g, "_");
          map[h] = AUTO[key] || "skip";
        });
        setHeaders(hs);
        setRows((res.data || []).slice(0, 5000));
        setMapping(map);
        const errs = (res.errors || []).slice(0, 5).map((e) => e.message);
        setErrors(errs);
        if (!hs.length) toast.error("No headers found");
      },
    });
  }

  const preview = useMemo(() => rows.slice(0, 5), [rows]);

  function importRows() {
    const mapped = Object.values(mapping);
    if (!mapped.includes("business") && !mapped.includes("email") && !mapped.includes("phone")) {
      toast.error("Map at least business, email, or phone");
      return;
    }
    const now = new Date().toISOString();
    const prospects: Prospect[] = rows.map((row) => {
      const get = (t: Target) => {
        const header = Object.entries(mapping).find(([, v]) => v === t)?.[0];
        return header ? (row[header] || "").trim() : "";
      };
      const tagsRaw = get("tags");
      const status = (get("status") || "new") as ProspectStatus;
      return {
        id: uid("prs"),
        name: get("name"),
        business: get("business") || get("name") || "Unknown",
        industry: get("industry") || "General",
        email: get("email"),
        instagram: get("instagram"),
        linkedin: get("linkedin"),
        twitter: get("twitter"),
        phone: get("phone"),
        website: get("website"),
        city: get("city"),
        state: get("state"),
        source: get("source") || "csv",
        status: ["new","queued","contacted","replied","meeting","won","lost","nurture"].includes(status) ? status : "new",
        notes: get("notes"),
        tags: tagsRaw ? tagsRaw.split(/[|,]/).map((t) => t.trim()).filter(Boolean) : ["csv"],
        createdAt: now,
        updatedAt: now,
      };
    });
    const result = upsertProspects(prospects, mode);
    prospects.slice(0, 20).forEach((p) => addActivity({ prospectId: p.id, type: "imported", title: "CSV import" }));
    toast.success(`Import done · +${result.added} · updated ${result.updated}`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>CSV import</DialogTitle>
          <DialogDescription>Auto-map columns · preview · merge or overwrite duplicates</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <input type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} className="text-sm" />
          {errors.length > 0 && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              {errors.map((e) => <div key={e}>{e}</div>)}
            </div>
          )}
          {headers.length > 0 && (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                {headers.map((h) => (
                  <div key={h} className="flex items-center gap-2">
                    <Label className="w-28 truncate text-xs">{h}</Label>
                    <Select value={mapping[h]} onValueChange={(v) => setMapping((m) => ({ ...m, [h]: v as Target }))}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TARGETS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Label>Duplicates</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as "merge" | "overwrite")}>
                  <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merge">Merge</SelectItem>
                    <SelectItem value="overwrite">Overwrite</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">{rows.length} rows</span>
              </div>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50"><tr>{headers.map((h) => <th key={h} className="px-2 py-1.5 text-left font-medium">{h}</th>)}</tr></thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        {headers.map((h) => <td key={h} className="px-2 py-1.5 max-w-[140px] truncate">{r[h]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={importRows}>Import {rows.length}</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
