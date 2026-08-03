"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOutreachStore } from "@/lib/store";
import { uid } from "@/lib/utils";
import type { Prospect } from "@/lib/types";

export function QuickAddProspect({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const upsert = useOutreachStore((s) => s.upsertProspect);
  const addActivity = useOutreachStore((s) => s.addActivity);
  const [business, setBusiness] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("Roofing");
  const [notes, setNotes] = useState("");

  function reset() {
    setBusiness(""); setName(""); setEmail(""); setPhone(""); setWebsite(""); setCity(""); setIndustry("Roofing"); setNotes("");
  }

  function save() {
    if (!business.trim()) {
      toast.error("Business name required");
      return;
    }
    const now = new Date().toISOString();
    const p: Prospect = {
      id: uid("prs"),
      name: name.trim(),
      business: business.trim(),
      industry: industry.trim() || "General",
      email: email.trim(),
      instagram: "",
      linkedin: "",
      twitter: "",
      phone: phone.trim(),
      website: website.trim(),
      city: city.trim(),
      state: "",
      source: "manual",
      status: "new",
      notes: notes.trim(),
      tags: ["manual"],
      createdAt: now,
      updatedAt: now,
    };
    upsert(p);
    addActivity({ prospectId: p.id, type: "imported", title: "Prospect created" });
    toast.success(`Added ${p.business}`);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quick add prospect</DialogTitle>
          <DialogDescription>Keyboard shortcut <span className="kbd">N</span></DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5"><Label>Business *</Label><Input autoFocus value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Acme Roofing" /></div>
          <div className="space-y-1.5"><Label>Contact name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Industry</Label><Input value={industry} onChange={(e) => setIndustry(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Website</Label><Input value={website} onChange={(e) => setWebsite(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
          <div className="sm:col-span-2 space-y-1.5"><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save prospect</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
