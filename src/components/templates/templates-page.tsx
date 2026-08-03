"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOutreachStore } from "@/lib/store";

export function TemplatesPage() {
  const scripts = useOutreachStore((s) => s.scripts);
  const templates = scripts.filter((s) => !s.archived);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-sm text-muted-foreground">Best-performing script library (mirrors Scripts)</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{s.title}</CardTitle>
                <Badge variant="secondary">{s.category}</Badge>
              </div>
              <CardDescription>{s.folder} · v{s.version}</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-xs text-muted-foreground line-clamp-6 font-mono">{s.body}</pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
