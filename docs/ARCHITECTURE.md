# Folder architecture

```
src/
  app/(dashboard)/     # App Router pages
  components/
    layout/            # Sidebar, TopBar, CommandPalette, Shell
    prospects/         # Table, CSV import, QuickAdd
    scripts/ campaigns/ inbox/ tasks/ analytics/ templates/ settings/
    dashboard/         # Home widgets
    ui/                # shadcn-style primitives
  lib/
    store.ts           # Zustand + persist (localStorage)
    types.ts seed.ts variables.ts utils.ts
supabase/schema.sql    # Optional Postgres schema
public/samples/        # Sample CSV
docs/                  # ER + architecture
```

Data layer: local-first Zustand persist. Supabase schema ready for multi-device sync.
