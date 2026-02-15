# Diamond Management

A diamond inventory management app for tracking **kapaans** (diamond batches/packages), **persons**, and **receive entries**.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**, TypeScript
- **Zustand** (state management with `immer` + `persist` middleware → localStorage)
- **shadcn/ui** + Radix UI primitives
- **Tailwind CSS v4**
- **Moment.js** (date formatting)

## Data Model

- **Person** — `id`, `name`, `phone?`
- **Kapaan** — `id`, `kapaanNo`, `date`, `pcs`, `weight`, `personId`
- **Receive** — `id`, `kapaanId`, `date`, `shape`, `pcs`, `weight`, `purity`, `color`, `lab` (IGI/GIA)

One kapaan belongs to one person. One kapaan can have many receives.

## Key Features

- **Kapaan table** with inline actions (add receive, edit, delete) and row-click to open a detail sheet
- **Filters**: multi-select kapaan dropdown, person dropdown, date range (Calendar + Popover pickers)
- **Add/Edit Kapaan dialog** — single component handles both modes via an optional `kapaan` prop
- **Add Receive dialog** — fields: date, lab, shape (free text), pcs, weight, purity, color
- **Receive Sheet** — side panel showing summary cards and a table of all receives for a kapaan
- **Add Person inline** — nested dialog inside Add Kapaan; includes "Add & Submit Kapaan" shortcut
- **localStorage persistence** via a custom `useLocalStorage` hook and Zustand adapter
- **Empty states** for kapaans and persons with CTAs

## File Structure

```
app/
  layout.tsx          — root layout, metadata
  page.tsx            — renders KapaanTable

components/
  kapaan-table.tsx    — main table with filters, edit/delete, row click → sheet
  add-kapaan-dialog.tsx — add + edit kapaan (unified)
  add-receive-dialog.tsx — add receive entry
  add-person-inline.tsx  — nested person dialog
  receive-sheet.tsx   — side sheet with receive details
  date-picker.tsx     — reusable Calendar+Popover date picker
  multi-select-kapaan.tsx — multi-select dropdown with checkboxes
  ui/                 — shadcn/ui primitives

lib/
  store.ts            — Zustand store (kapaans, persons, receives)
  utils.ts            — cn() helper

hooks/
  use-local-storage.ts — localStorage hook + Zustand storage adapter
```

## Running

```bash
bun install
bun dev
```
