# Marketing Intelligence OS (MIOS) — Dependency Register & Rationale

## 1. Executive Summary
This document catalogs the primary runtime and development dependencies of MIOS, explaining why each package was chosen and where it is used across the codebase.

## 2. Core Runtime Dependencies

| Package | Version | Why It Exists | Where Used | Possible Alternatives |
| :--- | :---: | :--- | :--- | :--- |
| `next` | `16.2.x` | React App Router framework providing RSC, edge routing, and Server Actions. | Globally across `app/*` and server actions. | Remix, Astro, Nuxt |
| `react` / `react-dom` | `19.0.x` | Core UI rendering engine supporting React Server Components and concurrent rendering. | All component surfaces. | Vue 3, Svelte 5 |
| `@supabase/supabase-js` | `^2.x` | Strongly-typed JavaScript SDK for querying PostgreSQL tables and listening to Realtime channels. | `@/lib/supabase/client.ts`, custom hooks. | Firebase SDK, Prisma + PG |
| `@supabase/ssr` | `^0.5.x` | Server-side cookie-based Supabase authentication helper for Next.js App Router. | `@/lib/supabase/server.ts`, middleware. | NextAuth.js (Auth.js) |
| `lucide-react` | `^1.x` | Crisp, geometric SVG icon library for industrial terminal indicators. | Navigation sidebar, tables, status bars. | Radix Icons, Heroicons |
| `sonner` | `^1.x` | Lightweight, high-performance toast notification engine for terminal alerts. | `app/layout.tsx`, API error handlers. | react-hot-toast |
| `clsx` / `tailwind-merge` | `^2.x` | Utility helper (`cn()`) for merging conditional Tailwind CSS classes cleanly. | `@/lib/utils.ts` and all UI components. | classnames |

## 3. Design & Styling Dependencies

| Package | Version | Why It Exists | Where Used | Possible Alternatives |
| :--- | :---: | :--- | :--- | :--- |
| `tailwindcss` | `^4.x` | Utility-first CSS engine powering the zero-emoji, 0px border-radius industrial theme. | `app/globals.css`, component classNames. | Vanilla CSS, UnoCSS |
| `@radix-ui/react-dialog` | `^1.x` | Accessible, unstyled modal primitive powering `RecordResultsModal`. | `@/components/ui/dialog.tsx` | Headless UI |
| `@radix-ui/react-select` | `^2.x` | Accessible dropdown select menu for campaign status and platform filters. | `@/components/ui/select.tsx` | Native `<select>` |
