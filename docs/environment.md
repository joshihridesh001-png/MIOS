# Marketing Intelligence OS (MIOS) — Environment Configuration & Setup Guide

## 1. Executive Summary & Local Development Setup
This document describes the environment variable setup, local Next.js development server configuration, and PostgreSQL database connection requirements for MIOS.

## 2. Environment Variables Specification (`.env.local`)
Create a `.env.local` file inside `E:\MIOS\app\` with the following parameters:

```env
# -----------------------------------------------------
# SUPABASE DATABASE & AUTHENTICATION CONNECTORS
# -----------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Service role key for administrative migrations or backend batch workers (NEVER expose to browser)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# -----------------------------------------------------
# APPLICATION METADATA & HOSTING CONFIGURATION
# -----------------------------------------------------
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 3. Local Development Commands
Run the following terminal commands inside `E:\MIOS\app` to operate the system locally:

```bash
# Install Node.js dependencies cleanly
npm install

# Start local Next.js development server with Turbopack acceleration
npm run dev
# -> Opens executive dashboard at http://localhost:3000

# Perform static TypeScript & lint inspection
npm run lint

# Execute full production build compile verification
npm run build
```

## 4. Environment Comparison Matrix

| Variable / Behavior | Development (`NODE_ENV=development`) | Production (`NODE_ENV=production`) |
| :--- | :--- | :--- |
| **Error Traces** | Rich client-side error overlays for rapid debugging. | Sanitized toast alerts; detailed stack traces logged to server console. |
| **Caching** | Aggressive RSC revalidation for live code editing. | Optimized server caching with `revalidatePath` invalidation triggers. |
| **API Base URL** | `http://localhost:3000` | Hosted edge URL (e.g., `https://mios.MIOS.os`) |
