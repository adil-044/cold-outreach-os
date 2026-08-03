import { uid } from "./utils";
import type {
  Activity,
  Campaign,
  Disposition,
  Prospect,
  Script,
  TaskItem,
} from "./types";

const now = () => new Date().toISOString();
const daysFromNow = (n: number) =>
  new Date(Date.now() + n * 86400000).toISOString();

export const defaultDispositions: Disposition[] = [
  { id: "d_interested", name: "Interested", color: "#3DDC97", icon: "sparkles", followUpDelayDays: 1, automation: "create_task" },
  { id: "d_meeting", name: "Meeting Booked", color: "#60A5FA", icon: "calendar", followUpDelayDays: 0, automation: "mark_meeting" },
  { id: "d_no_response", name: "No Response", color: "#94A3B8", icon: "moon", followUpDelayDays: 3, automation: "queue_followup" },
  { id: "d_follow_up", name: "Follow Up", color: "#FBBF24", icon: "clock", followUpDelayDays: 2, automation: "queue_followup" },
  { id: "d_not_interested", name: "Not Interested", color: "#F87171", icon: "x", followUpDelayDays: 0 },
  { id: "d_wrong", name: "Wrong Contact", color: "#FB923C", icon: "user-x", followUpDelayDays: 0 },
  { id: "d_bounced", name: "Bounced", color: "#E11D48", icon: "mail-x", followUpDelayDays: 0 },
  { id: "d_replied", name: "Replied", color: "#A78BFA", icon: "message-circle", followUpDelayDays: 0 },
  { id: "d_won", name: "Closed Won", color: "#22C55E", icon: "trophy", followUpDelayDays: 0 },
  { id: "d_lost", name: "Closed Lost", color: "#64748B", icon: "ban", followUpDelayDays: 0 },
];

export const seedScripts: Script[] = [
  {
    id: "s_email_estimator",
    title: "AI Estimator — Cold Email",
    category: "email",
    subject: "{{business}} — first price wins the roof job in {{city}}",
    body: `Hi {{business}} team,

Found you for residential {{industry}} in {{city}}.

Not pitching "AI" or another CRM. Pitching closed jobs.

Problem: {{pain_point}}. Owner/sales bottlenecking estimates = lost $12–15k tickets.

Offer (AI Estimator):
• I build + customize a quote tool for your pricing / photos
• Train you in ~30 minutes — done for you
• Price in front of the lead while you're still on site

Pricing (performance):
• $500 setup
• Then $50 per estimate OR 5–10% of jobs closed through the tool
• Use it 30 days; if it doesn't replace estimating bottleneck → setup refunded

Reply YES for a 10-min Loom, or book: calendly.com/uptisement/30min

— Adil
P.S. Site I saw: {{website}}`,
    variables: ["business", "city", "industry", "pain_point", "website"],
    folder: "Roofer ICP",
    archived: false,
    version: 1,
    versions: [],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "s_dm_estimator",
    title: "AI Estimator — Cold DM",
    category: "dm",
    subject: "",
    body: `Hey {{business}} — saw you for {{industry}} in {{city}}.

When homeowner calls 3–4 roofers after hail/leak, first written price wins ~70%. If owner/sales still drives out + quotes 48 hrs later — you lose $12–15k jobs.

Offer: I build an AI estimator (photos → price on the ladder). DFY.

De-risk: $500 setup, then $50/estimate OR 5–10% closed. Refund if it doesn't replace bottleneck in 30 days.

Worth a 10-min look?`,
    variables: ["business", "industry", "city"],
    folder: "Roofer ICP",
    archived: false,
    version: 1,
    versions: [],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "s_fu1",
    title: "Follow Up 1 — Bump",
    category: "follow_up_1",
    subject: "Re: {{business}} — quick bump",
    body: `Hey {{first_name}} — bumping this once.

Still open to a 10-min look at the estimator (pay only when estimates go out)?

If timing's off, say "later" and I'll park it.`,
    variables: ["first_name", "business"],
    folder: "Sequences",
    archived: false,
    version: 1,
    versions: [],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "s_fu2",
    title: "Follow Up 2 — Proof Angle",
    category: "follow_up_2",
    subject: "Re: first-to-price in {{city}}",
    body: `{{first_name}} — one more angle.

Storm week = 3–4 quotes racing. Whoever texts a number first usually wins.

I can Loom a demo configured for {{business}} in {{city}} this week. Want it?`,
    variables: ["first_name", "business", "city"],
    folder: "Sequences",
    archived: false,
    version: 1,
    versions: [],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "s_breakup",
    title: "Breakup Email",
    category: "breakup",
    subject: "Closing the loop — {{business}}",
    body: `Hey {{first_name}} — I'll close the loop so I'm not noise.

If estimate speed / first-to-price ever becomes a priority for {{business}}, reply "estimator" and I'll restart.

Either way, good luck with the season in {{city}}.`,
    variables: ["first_name", "business", "city"],
    folder: "Sequences",
    archived: false,
    version: 1,
    versions: [],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "s_linkedin",
    title: "LinkedIn Connect + Note",
    category: "linkedin",
    subject: "",
    body: `Hi {{first_name}} — work with 1–5 crew {{industry}} shops on speed-to-quote (first price wins ~70% of jobs). Curious how {{business}} handles estimates after storm leads hit. Open to a short note?`,
    variables: ["first_name", "industry", "business"],
    folder: "Channels",
    archived: false,
    version: 1,
    versions: [],
    createdAt: now(),
    updatedAt: now(),
  },
];

const sampleBusinesses = [
  ["Five Star Roofing", "Tampa", "FL", "(844) 647-1396", "https://fivestarroofingconstruction.com/", 368],
  ["Downunder Roofing", "Kansas City", "MO", "(816) 547-0713", "https://www.downunderroofing.com/", 111],
  ["Highland Roofing", "Louisville", "KY", "(502) 968-2009", "https://highlandroofing.com/", 95],
  ["Hi-5 Roofing", "Columbus", "OH", "(614) 313-7721", "https://hi-5roofingohio.com/", 76],
  ["Rogue Carolina Roofing", "Charlotte", "NC", "(980) 403-4545", "https://roguecarolinaroofing.com/", 68],
  ["Pioneer Roofing", "Columbus", "OH", "(614) 504-4600", "https://www.pioneerroofingohio.com/", 200],
  ["Charlotte Ace Roofing", "Charlotte", "NC", "(704) 396-8383", "https://charlotteaceroofing.com/", 350],
  ["Best Roofing Now", "Charlotte", "NC", "(704) 605-6047", "https://www.bestroofingnow.com/", 65],
  ["Barkley-Jensen Roofing", "Cary", "NC", "(919) 750-0911", "https://barkleyjensenroofing.com/", 377],
  ["Indy Rooftops", "Indianapolis", "IN", "(317) 617-3928", "https://indyrooftops.com/", 450],
  ["Imperial Roofing", "Columbus", "OH", "(614) 263-7663", "https://imperialroofer.com/", 270],
  ["Davis Roofing Solutions", "Fort Worth", "TX", "(817) 555-0142", "https://davisroofingsolutions.com/", 300],
  ["Roof Dawgs", "Raleigh", "NC", "(910) 978-9431", "https://www.roofdawgs.com/", 226],
  ["HRP Construction", "Raleigh", "NC", "(919) 758-3380", "https://hrp-roof.com/", 55],
  ["SPG Roofing", "Indianapolis", "IN", "(317) 707-6637", "https://www.spgroof.com/", 247],
];

export function buildSeedProspects(): Prospect[] {
  return sampleBusinesses.map(([business, city, state, phone, website, reviews], i) => {
    const created = new Date(Date.now() - i * 3600000).toISOString();
    return {
      id: uid("prs"),
      name: "",
      business: String(business),
      industry: "Roofing",
      email: "",
      instagram: "",
      linkedin: "",
      twitter: "",
      phone: String(phone),
      website: String(website),
      city: String(city),
      state: String(state),
      source: "google_maps",
      status: (["new", "queued", "contacted", "replied", "meeting"] as const)[i % 5],
      scriptId: i % 2 === 0 ? "s_email_estimator" : "s_dm_estimator",
      campaignId: "c_roofer_estimator",
      lastContacted: i % 3 === 0 ? daysFromNow(-i) : undefined,
      followUpDate: i % 2 === 0 ? daysFromNow(i % 4) : daysFromNow(-1),
      notes: `${reviews} Google reviews · ICP mid-size residential`,
      dispositionId: i % 5 === 3 ? "d_replied" : i % 5 === 4 ? "d_meeting" : undefined,
      tags: ["roofer", "icp", "estimate-speed"],
      createdAt: created,
      updatedAt: created,
    };
  });
}

export function buildSeedCampaigns(): Campaign[] {
  return [
    {
      id: "c_roofer_estimator",
      name: "Roofer ICP — AI Estimator",
      channel: "email",
      status: "active",
      scriptId: "s_email_estimator",
      prospectIds: [],
      sent: 42,
      replies: 7,
      meetings: 2,
      createdAt: now(),
    },
    {
      id: "c_roofer_dm",
      name: "Roofer ICP — Cold DM",
      channel: "dm",
      status: "active",
      scriptId: "s_dm_estimator",
      prospectIds: [],
      sent: 28,
      replies: 4,
      meetings: 1,
      createdAt: now(),
    },
  ];
}

export function buildSeedActivities(prospects: Prospect[]): Activity[] {
  const acts: Activity[] = [];
  prospects.slice(0, 8).forEach((p, i) => {
    acts.push({
      id: uid("act"),
      prospectId: p.id,
      type: "imported",
      title: "Imported from CSV",
      createdAt: daysFromNow(-10 + i),
    });
    if (i > 1) {
      acts.push({
        id: uid("act"),
        prospectId: p.id,
        type: "email_sent",
        title: "Cold email sent",
        detail: "AI Estimator — Cold Email",
        createdAt: daysFromNow(-5 + i),
      });
    }
    if (i > 3) {
      acts.push({
        id: uid("act"),
        prospectId: p.id,
        type: "replied",
        title: "Prospect replied",
        detail: "Asked about pricing",
        createdAt: daysFromNow(-2),
      });
    }
  });
  return acts;
}

export function buildSeedTasks(prospects: Prospect[]): TaskItem[] {
  return prospects.slice(0, 6).map((p, i) => ({
    id: uid("tsk"),
    title: i % 2 === 0 ? `Follow up — ${p.business}` : `Send estimator Loom — ${p.business}`,
    prospectId: p.id,
    dueDate: daysFromNow(i - 2),
    priority: (["high", "medium", "low"] as const)[i % 3],
    done: false,
    createdAt: now(),
  }));
}
