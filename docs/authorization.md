# Marketing Intelligence OS (MIOS) — Authorization & RBAC Architecture

## 1. Executive Summary & Purpose
MIOS enforces authorization at the database layer using PostgreSQL Row Level Security (RLS) combined with Role-Based Access Control (RBAC) defined in the `profiles` table.
This guarantees that even if a client-side route is bypassed, the database engine will reject unauthorized reads or writes.

## 2. Role Hierarchy & Permissions Matrix

| Role | Read Campaigns | Create/Edit Campaigns | Create/Edit Experiments | Record Metrics | Administer Users |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **CEO** (`CEO@Hridesh`) | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **ADMIN** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access | ❌ Restricted |
| **ANALYST** | ✅ Full Access | ❌ Read Only | ❌ Read Only | ✅ Record Metrics | ❌ Restricted |

## 3. Row Level Security (RLS) Policies
All primary tables (`campaigns`, `creatives`, `experiments`, `learnings`) implement explicit RLS policies:
```sql
-- Example: Read access for all authenticated internal users
CREATE POLICY "Enable read access for authenticated users"
ON public.campaigns
FOR SELECT
TO authenticated
USING (true);

-- Example: Write access restricted to campaign owners or CEO/ADMIN roles
CREATE POLICY "Enable update for owners or executives"
ON public.campaigns
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('CEO', 'ADMIN')
  )
);
```

## 4. Enforcement Points
1. **Database Layer (Primary Defense)**: RLS policies execute on every query via `auth.uid()`.
2. **Server Actions (Secondary Guard)**: Next.js Server Actions verify user session identity and role before executing mutations.
3. **UI Layer (UX Guard)**: Buttons such as "TERMINATE Strategy" or "RECORD RESULTS" are conditionally disabled or hidden for non-authorized roles to prevent unnecessary error prompts.
