export type Channel =
  | "email"
  | "dm"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "twitter"
  | "phone"
  | "follow_up_1"
  | "follow_up_2"
  | "follow_up_3"
  | "breakup";

export type ProspectStatus =
  | "new"
  | "queued"
  | "contacted"
  | "replied"
  | "meeting"
  | "won"
  | "lost"
  | "nurture";

export interface Prospect {
  id: string;
  name: string;
  business: string;
  industry: string;
  email: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  phone: string;
  website: string;
  city: string;
  state: string;
  source: string;
  status: ProspectStatus;
  scriptId?: string;
  campaignId?: string;
  lastContacted?: string;
  followUpDate?: string;
  notes: string;
  dispositionId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Script {
  id: string;
  title: string;
  category: Channel;
  subject: string;
  body: string;
  variables: string[];
  folder: string;
  archived: boolean;
  version: number;
  versions: { version: number; body: string; subject: string; savedAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  status: "draft" | "active" | "paused" | "completed";
  scriptId?: string;
  prospectIds: string[];
  sent: number;
  replies: number;
  meetings: number;
  createdAt: string;
}

export interface Disposition {
  id: string;
  name: string;
  color: string;
  icon: string;
  automation?: string;
  followUpDelayDays: number;
}

export interface Activity {
  id: string;
  prospectId: string;
  type:
    | "imported"
    | "email_sent"
    | "dm_sent"
    | "opened"
    | "clicked"
    | "replied"
    | "meeting_booked"
    | "note"
    | "disposition"
    | "closed";
  title: string;
  detail?: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  prospectId?: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  done: boolean;
  createdAt: string;
}

export interface AppSettings {
  theme: "dark" | "light" | "system";
  dailyOutreachGoal: number;
}
