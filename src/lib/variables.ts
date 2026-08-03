export const VARIABLE_KEYS = [
  "first_name",
  "business",
  "city",
  "state",
  "industry",
  "pain_point",
  "website",
  "offer",
  "phone",
] as const;

export type VariableKey = (typeof VARIABLE_KEYS)[number];

export function extractVariables(text: string): string[] {
  const matches = text.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
  return [...new Set([...matches].map((m) => m[1]))];
}

export function renderTemplate(
  template: string,
  vars: Partial<Record<VariableKey | string, string>>,
) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const value = vars[key];
    return value && value.length > 0 ? value : `{{${key}}}`;
  });
}

export function prospectToVars(p: {
  name?: string;
  business?: string;
  city?: string;
  state?: string;
  industry?: string;
  website?: string;
  phone?: string;
  notes?: string;
}) {
  const first = (p.name || "").split(" ")[0] || p.business?.split(" ")[0] || "there";
  return {
    first_name: first,
    business: p.business || "",
    city: p.city || "",
    state: p.state || "",
    industry: p.industry || "",
    pain_point: "slow estimates losing jobs to faster competitors",
    website: p.website || "",
    offer: "AI Estimator — $500 setup + $50/estimate or 5–10% of closed jobs",
    phone: p.phone || "",
  };
}
