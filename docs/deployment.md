# Marketing Intelligence OS (MIOS) — Deployment & DevOps Guide

## 1. Executive Summary & Target Environment
MIOS is built on Next.js 16 and is optimized for deployment on serverless or edge-hosting platforms such as **Vercel**, **AWS Amplify**, or self-hosted **Docker / Node.js 20+** Linux instances.

## 2. Production Environment Variables (`.env.local` / `.env.production`)
The following environment variables must be defined in the production runtime:
```env
# Supabase Cloud Project Connectivity
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Settings
NEXT_PUBLIC_APP_URL=https://mios.MIOS.os
```

## 3. Build & Production Verification Workflow
Before promoting any release to production, the engineering team must run the verification pipeline:
```bash
# 1. Install dependencies cleanly
npm ci

# 2. Execute Next.js production build verification (Turbopack)
npm run build

# 3. Start production preview server locally to verify zero runtime hydration errors
npm run start
```

## 4. Production Deployment Checklist
- [ ] **Zero Emojis Verified**: Confirm no emojis were introduced into UI badges or copy.
- [ ] **Widescreen Modal Width Verified**: Ensure `RecordResultsModal` spans `1152px` (`sm:!max-w-6xl`) without breaking on responsive viewports.
- [ ] **RLS Policies Enabled**: Verify that all Supabase tables (`campaigns`, `creatives`, `experiments`, `learnings`) have Row Level Security enabled.
- [ ] **Executive Credentials Validated**: Ensure the primary `CEO@Hridesh` identity can authenticate and perform mutations across all domains.
