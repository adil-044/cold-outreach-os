"use client";

import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Download, Upload, Trash2, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useOutreachStore } from "@/lib/store";
import { formatRelative } from "@/lib/utils";
import type { Prospect } from "@/lib/types";
import { CsvImportDialog } from "@/components/prospects/csv-import";
import { renderTemplate, prospectToVars } from "@/lib/variables";

export function ProspectsPage() {
  const prospects = useOutreachStore((s) => s.prospects);
  const scripts = useOutreachStore((s) => s.scripts);
  const dispositions = useOutreachStore((s) => s.dispositions);
  const deleteProspects = useOutreachStore((s) => s.deleteProspects);
  const logOutreach = useOutreachStore((s) => s.logOutreach);
  const updateProspect = useOutreachStore((s) => s.updateProspect);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [importOpen, setImportOpen] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("focus");
    if (id) setFocusId(id);
  }, []);

  const columns = useMemo<ColumnDef<Prospect>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />
        ),
        size: 36,
      },
      { accessorKey: "name", header: "Name", cell: ({ row }) => row.original.name || "—" },
      { accessorKey: "business", header: "Business", cell: ({ row }) => <span className="font-medium">{row.original.business}</span> },
      { accessorKey: "industry", header: "Industry" },
      { accessorKey: "email", header: "Email", cell: ({ getValue }) => <span className="text-muted-foreground">{(getValue() as string) || "—"}</span> },
      { accessorKey: "instagram", header: "Instagram", cell: ({ getValue }) => (getValue() as string) || "—" },
      { accessorKey: "linkedin", header: "LinkedIn", cell: ({ getValue }) => (getValue() as string) || "—" },
      { accessorKey: "twitter", header: "Twitter", cell: ({ getValue }) => (getValue() as string) || "—" },
      { accessorKey: "phone", header: "Phone" },
      {
        accessorKey: "website",
        header: "Website",
        cell: ({ row }) =>
          row.original.website ? (
            <a className="text-primary hover:underline" href={row.original.website} target="_blank" rel="noreferrer">
              link
            </a>
          ) : (
            "—"
          ),
      },
      { accessorKey: "source", header: "Source" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge variant="secondary" className="capitalize">{row.original.status}</Badge>,
      },
      {
        id: "script",
        header: "Script",
        cell: ({ row }) => scripts.find((s) => s.id === row.original.scriptId)?.title || "—",
      },
      {
        id: "campaign",
        header: "Campaign",
        cell: ({ row }) => row.original.campaignId || "—",
      },
      {
        accessorKey: "lastContacted",
        header: "Last Contacted",
        cell: ({ row }) => formatRelative(row.original.lastContacted),
      },
      {
        accessorKey: "followUpDate",
        header: "Follow-up",
        cell: ({ row }) => formatRelative(row.original.followUpDate),
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => <span className="max-w-[180px] truncate block">{row.original.notes || "—"}</span>,
      },
      {
        id: "disposition",
        header: "Disposition",
        cell: ({ row }) => dispositions.find((d) => d.id === row.original.dispositionId)?.name || "—",
      },
      {
        id: "tags",
        header: "Tags",
        cell: ({ row }) => (
          <div className="flex gap-1 flex-wrap max-w-[160px]">
            {row.original.tags?.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </div>
        ),
      },
    ],
    [scripts, dispositions],
  );

  const table = useReactTable({
    data: prospects,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    globalFilterFn: (row, _col, filter) => {
      const q = String(filter).toLowerCase();
      const p = row.original;
      return [p.name, p.business, p.email, p.phone, p.city, p.industry, p.notes, ...(p.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(q);
    },
  });

  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 12,
  });

  const selected = table.getSelectedRowModel().rows.map((r) => r.original);

  function exportCsv() {
    const data = (selected.length ? selected : prospects).map((p) => ({
      name: p.name,
      business: p.business,
      industry: p.industry,
      email: p.email,
      instagram: p.instagram,
      linkedin: p.linkedin,
      twitter: p.twitter,
      phone: p.phone,
      website: p.website,
      source: p.source,
      status: p.status,
      city: p.city,
      state: p.state,
      notes: p.notes,
      tags: p.tags.join("|"),
      lastContacted: p.lastContacted || "",
      followUpDate: p.followUpDate || "",
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prospects-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length}`);
  }

  function copyScript(channel: "email" | "dm") {
    if (!selected[0]) {
      toast.error("Select a prospect");
      return;
    }
    const p = selected[0];
    const script = scripts.find((s) => s.category === (channel === "email" ? "email" : "dm"));
    if (!script) {
      toast.error("No script");
      return;
    }
    const vars = prospectToVars(p);
    const body = renderTemplate(script.body, vars);
    const subject = renderTemplate(script.subject, vars);
    const text = channel === "email" && subject ? `Subject: ${subject}\n\n${body}` : body;
    navigator.clipboard.writeText(text);
    logOutreach(p.id, channel);
    toast.success(`Copied ${channel} · marked sent`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Prospects</h1>
          <p className="text-sm text-muted-foreground">{prospects.length} records · virtualized table</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}><Upload className="h-3.5 w-3.5" /> Import CSV</Button>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-3.5 w-3.5" /> Export</Button>
          <Button variant="outline" size="sm" onClick={() => copyScript("email")} disabled={!selected.length}><Mail className="h-3.5 w-3.5" /> Copy email</Button>
          <Button variant="outline" size="sm" onClick={() => copyScript("dm")} disabled={!selected.length}><MessageSquare className="h-3.5 w-3.5" /> Copy DM</Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={!selected.length}
            onClick={() => {
              deleteProspects(selected.map((p) => p.id));
              setRowSelection({});
              toast.success("Deleted");
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      <Input
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Filter prospects…"
        className="max-w-md"
      />

      <div ref={parentRef} className="h-[calc(100vh-220px)] overflow-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap cursor-pointer select-none"
                    onClick={h.column.getToggleSortingHandler()}
                    style={{ width: h.getSize() }}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] || null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            {virtualizer.getVirtualItems().map((vr) => {
              const row = rows[vr.index];
              const active = focusId === row.original.id || row.getIsSelected();
              return (
                <tr
                  key={row.id}
                  data-index={vr.index}
                  ref={virtualizer.measureElement}
                  className={`absolute left-0 w-full border-b border-border hover:bg-accent/40 ${active ? "table-row-active" : ""}`}
                  style={{ transform: `translateY(${vr.start}px)` }}
                  onClick={() => {
                    setFocusId(row.original.id);
                    row.toggleSelected();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const note = prompt("Add note", row.original.notes || "");
                      if (note != null) updateProspect(row.original.id, { notes: note });
                    }
                  }}
                  tabIndex={0}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 whitespace-nowrap align-middle" style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No prospects. Import CSV or press N.</div>}
      </div>

      <CsvImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
