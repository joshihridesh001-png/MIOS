# Marketing Intelligence OS (MIOS) — State Management & Caching Architecture

## 1. Executive Summary & Philosophy
MIOS adopts a hybrid state management model:
1. **Server State as Source of Truth**: PostgreSQL tables read via React Server Components (RSC) and Supabase client hooks serve as the authoritative state.
2. **Local Component State for Forms & Calculators**: Transient UI interactions (such as active tab selections, modal open/close toggles, and live lift calculator previews) are managed via standard React `useState` and `useCallback` in `'use client'` boundaries.
3. **Zero Heavy Client State Stores**: No Redux, MobX, or Zustand stores are used, avoiding client memory bloat and stale cache synchronization issues.

## 2. State Flow & Hydration Diagram
```mermaid
graph TD
    subgraph "Server Tier (Next.js Node / Edge)"
        RSC["Server Component (app/experiments/[id]/page.tsx)"]
        Fetch["Supabase Server SDK Fetch"]
    end

    subgraph "Client Tier (React 19 Browser)"
        Hydrate["Initial Page Hydration (Server Payload)"]
        ClientHook["Custom Hook (useExperiment / useCampaigns)"]
        LocalState["Modal Local Form State (useState)"]
        UI["Rendered Executive Terminal"]
    end

    RSC --> Fetch
    Fetch --> Hydrate
    Hydrate --> UI
    UI -->|Open Widescreen Modal| LocalState
    LocalState -->|Submit Mutation| ClientHook
    ClientHook -->|router.refresh() / Revalidate| RSC
```

## 3. Core State Hooks (`/src/hooks`)

### 3.1 `useCampaigns()` / `useCampaign(id)`
- **Responsibility**: Manages fetching, loading states, error states, and mutations for campaign rows and `campaigns_with_metrics` view records.
- **Cache Invalidation**: Invokes `refetch()` or Next.js `router.refresh()` after successful create, update, or delete operations.

### 3.2 `useExperiments()` / `useExperiment(id)`
- **Responsibility**: Manages experimental matrices, traffic split ratios, and Metrics updates.
- **Optimistic Calculator State**: Inside `RecordResultsModal`, typing numbers into Control or Variant inputs immediately updates the calculated lift and confidence preview without triggering network calls until "SAVE Strategy DATA" is pressed.

### 3.3 `useCreatives()`
- **Responsibility**: Manages creative assets and AI Quick-Paste string transformations.

## 4. Toast Notifications & User Feedback
- Global toast notifications are managed by `sonner` (`<Toaster />` in `app/layout.tsx`).
- Any mutation error or success event triggers an immediate high-contrast terminal toast notification.
