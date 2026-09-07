# Outreach OS

Personal cold outreach operating system — Linear/Notion/Superhuman energy.

**Live:** https://adil-044.github.io/cold-outreach-os/

**Focus (one lead):** https://adil-044.github.io/cold-outreach-os/focus/

**Brantford SMS desk (phone):** https://adil-044.github.io/cold-outreach-os/brantford-sms/

## Stack

Next.js 15 · TypeScript · Tailwind v4 · shadcn-style UI · Zustand · TanStack Table/Query/Virtual · Framer Motion · Recharts · Papa Parse

## Features

- **Focus** — one lead card · Open Gmail · Copy DM + IG · disposition
- Prospects table (virtualized) · CSV import/export · bulk actions · keyboard nav
- Scripts with `{{variables}}` · live preview · version history · folders
- Campaigns · Inbox timeline · Tasks · Analytics · Templates · Settings
- Command palette `⌘K` · shortcuts `N` `S` `C`
- Dark/Light/System · backup/restore JSON

## Local

```bash
npm install
npm run dev
```

Open http://localhost:3000

## GitHub Pages build

```bash
GITHUB_PAGES=true npm run build:gh
# static site in ./out
```

## Sample data

- Seeded roofer ICP prospects + AI Estimator scripts on first load
- CSV: `public/samples/prospects-sample.csv`

## Supabase (optional)

See `supabase/schema.sql` and `docs/ER.md`. Default store is localStorage.

## Keyboard

| Key | Action |
|-----|--------|
| `N` | New prospect |
| `S` / `⌘K` | Search / command palette |
| `C` | Campaigns |
| `Enter` | Edit note on focused prospect row |
| `Esc` | Close dialogs |
