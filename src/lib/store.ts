"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeedActivities,
  buildSeedCampaigns,
  buildSeedProspects,
  buildSeedTasks,
  defaultDispositions,
  seedScripts,
} from "./seed";
import type {
  Activity,
  AppSettings,
  Campaign,
  Disposition,
  Prospect,
  Script,
  TaskItem,
} from "./types";
import { uid } from "./utils";

interface OutreachState {
  hydrated: boolean;
  prospects: Prospect[];
  scripts: Script[];
  campaigns: Campaign[];
  dispositions: Disposition[];
  activities: Activity[];
  tasks: TaskItem[];
  settings: AppSettings;
  setHydrated: (v: boolean) => void;
  resetDemo: () => void;
  upsertProspect: (p: Prospect) => void;
  upsertProspects: (rows: Prospect[], mode: "merge" | "overwrite") => { added: number; updated: number; skipped: number };
  deleteProspects: (ids: string[]) => void;
  updateProspect: (id: string, patch: Partial<Prospect>) => void;
  addActivity: (a: Omit<Activity, "id" | "createdAt"> & { id?: string; createdAt?: string }) => void;
  upsertScript: (s: Script) => void;
  duplicateScript: (id: string) => void;
  archiveScript: (id: string) => void;
  upsertCampaign: (c: Campaign) => void;
  upsertDisposition: (d: Disposition) => void;
  toggleTask: (id: string) => void;
  addTask: (t: Omit<TaskItem, "id" | "createdAt" | "done">) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  logOutreach: (prospectId: string, channel: "email" | "dm") => void;
}

function bootstrap() {
  const prospects = buildSeedProspects();
  return {
    prospects,
    scripts: seedScripts,
    campaigns: buildSeedCampaigns(),
    dispositions: defaultDispositions,
    activities: buildSeedActivities(prospects),
    tasks: buildSeedTasks(prospects),
    settings: { theme: "dark" as const, dailyOutreachGoal: 50 },
  };
}

export const useOutreachStore = create<OutreachState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...bootstrap(),
      setHydrated: (v) => set({ hydrated: v }),
      resetDemo: () => set({ ...bootstrap(), hydrated: true }),
      upsertProspect: (p) =>
        set((s) => {
          const idx = s.prospects.findIndex((x) => x.id === p.id);
          if (idx === -1) return { prospects: [p, ...s.prospects] };
          const next = [...s.prospects];
          next[idx] = p;
          return { prospects: next };
        }),
      upsertProspects: (rows, mode) => {
        let added = 0;
        let updated = 0;
        const skipped = 0;
        const map = new Map(get().prospects.map((p) => [dedupeKey(p), p]));
        for (const row of rows) {
          const key = dedupeKey(row);
          const existing = map.get(key);
          if (existing) {
            if (mode === "overwrite") {
              map.set(key, { ...existing, ...row, id: existing.id, updatedAt: new Date().toISOString() });
              updated += 1;
            } else {
              map.set(key, {
                ...existing,
                ...Object.fromEntries(
                  Object.entries(row).filter(([, v]) => v !== "" && v != null),
                ),
                id: existing.id,
                tags: [...new Set([...(existing.tags || []), ...(row.tags || [])])],
                updatedAt: new Date().toISOString(),
              } as Prospect);
              updated += 1;
            }
          } else {
            map.set(key, row);
            added += 1;
          }
        }
        set({ prospects: [...map.values()] });
        return { added, updated, skipped };
      },
      deleteProspects: (ids) =>
        set((s) => ({ prospects: s.prospects.filter((p) => !ids.includes(p.id)) })),
      updateProspect: (id, patch) =>
        set((s) => ({
          prospects: s.prospects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
          ),
        })),
      addActivity: (a) =>
        set((s) => ({
          activities: [
            {
              id: a.id || uid("act"),
              createdAt: a.createdAt || new Date().toISOString(),
              prospectId: a.prospectId,
              type: a.type,
              title: a.title,
              detail: a.detail,
            },
            ...s.activities,
          ],
        })),
      upsertScript: (script) =>
        set((s) => {
          const idx = s.scripts.findIndex((x) => x.id === script.id);
          if (idx === -1) return { scripts: [script, ...s.scripts] };
          const next = [...s.scripts];
          next[idx] = script;
          return { scripts: next };
        }),
      duplicateScript: (id) =>
        set((s) => {
          const src = s.scripts.find((x) => x.id === id);
          if (!src) return s;
          const copy: Script = {
            ...src,
            id: uid("scr"),
            title: `${src.title} (copy)`,
            version: 1,
            versions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { scripts: [copy, ...s.scripts] };
        }),
      archiveScript: (id) =>
        set((s) => ({
          scripts: s.scripts.map((x) => (x.id === id ? { ...x, archived: !x.archived } : x)),
        })),
      upsertCampaign: (c) =>
        set((s) => {
          const idx = s.campaigns.findIndex((x) => x.id === c.id);
          if (idx === -1) return { campaigns: [c, ...s.campaigns] };
          const next = [...s.campaigns];
          next[idx] = c;
          return { campaigns: next };
        }),
      upsertDisposition: (d) =>
        set((s) => {
          const idx = s.dispositions.findIndex((x) => x.id === d.id);
          if (idx === -1) return { dispositions: [...s.dispositions, d] };
          const next = [...s.dispositions];
          next[idx] = d;
          return { dispositions: next };
        }),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),
      addTask: (t) =>
        set((s) => ({
          tasks: [
            { ...t, id: uid("tsk"), done: false, createdAt: new Date().toISOString() },
            ...s.tasks,
          ],
        })),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      logOutreach: (prospectId, channel) => {
        const type = channel === "email" ? "email_sent" : "dm_sent";
        get().addActivity({
          prospectId,
          type,
          title: channel === "email" ? "Cold email marked sent" : "Cold DM marked sent",
        });
        get().updateProspect(prospectId, {
          status: "contacted",
          lastContacted: new Date().toISOString(),
          followUpDate: new Date(Date.now() + 3 * 86400000).toISOString(),
        });
      },
    }),
    {
      name: "cold-outreach-os-v1",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

function dedupeKey(p: Pick<Prospect, "email" | "phone" | "website" | "business">) {
  const email = (p.email || "").trim().toLowerCase();
  const phone = (p.phone || "").replace(/\D/g, "");
  const website = (p.website || "").trim().toLowerCase().replace(/\/$/, "");
  const business = (p.business || "").trim().toLowerCase();
  return email || phone || website || business || uid("tmp");
}
