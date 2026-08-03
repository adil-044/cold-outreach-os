"use client";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOutreachStore } from "@/lib/store";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const settings = useOutreachStore((s) => s.settings);
  const updateSettings = useOutreachStore((s) => s.updateSettings);
  const resetDemo = useOutreachStore((s) => s.resetDemo);
  const prospects = useOutreachStore((s) => s.prospects);
  const scripts = useOutreachStore((s) => s.scripts);
  const campaigns = useOutreachStore((s) => s.campaigns);
  const dispositions = useOutreachStore((s) => s.dispositions);
  const activities = useOutreachStore((s) => s.activities);
  const tasks = useOutreachStore((s) => s.tasks);

  function exportBackup() {
    const payload = { prospects, scripts, campaigns, dispositions, activities, tasks, settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "outreach-os-backup.json"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  }

  function restoreBackup(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        localStorage.setItem("cold-outreach-os-v1", JSON.stringify({ state: data, version: 0 }));
        toast.success("Backup restored — reload page");
        setTimeout(() => window.location.reload(), 600);
      } catch {
        toast.error("Invalid backup file");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Theme · backup · shortcuts</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Theme</CardTitle><CardDescription>Dark / Light / System</CardDescription></CardHeader>
        <CardContent className="flex gap-2">
          {(["dark","light","system"] as const).map((t) => (
            <Button key={t} variant={theme===t?"default":"outline"} onClick={() => { setTheme(t); updateSettings({ theme: t }); }}>{t}</Button>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Daily outreach goal</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-3">
          <Label>Messages / day</Label>
          <Input type="number" className="w-28" value={settings.dailyOutreachGoal} onChange={(e) => updateSettings({ dailyOutreachGoal: Number(e.target.value) || 0 })} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Backup / Restore</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={exportBackup}>Export backup JSON</Button>
          <label className="inline-flex h-9 cursor-pointer items-center rounded-md border border-border px-4 text-sm hover:bg-accent">
            Restore backup
            <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && restoreBackup(e.target.files[0])} />
          </label>
          <Button variant="destructive" onClick={() => { resetDemo(); toast.success("Demo data reset"); }}>Reset demo data</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Keyboard shortcuts</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            ["N", "New prospect"],
            ["S / ⌘K", "Search / command palette"],
            ["C", "Campaigns"],
            ["Enter", "Edit note on focused prospect"],
            ["Esc", "Close dialogs"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-border py-2"><span>{v}</span><span className="kbd">{k}</span></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
