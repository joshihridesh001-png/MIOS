import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login")
  }

  // Fetch the user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // If the DB profile was created via a trigger but full_name is null, fall back to auth data
  const finalFullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
  const finalRole = profile?.role || "user"

  const userData = {
    id: user.id,
    full_name: finalFullName,
    role: finalRole,
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url
  }

  const upperName = finalFullName.toUpperCase()
  if (upperName.includes("SWARIT")) {
    userData.role = "CTO"
  } else if (upperName.includes("RIYA")) {
    userData.role = "CEO's waifu"
  }

  return <AppShell user={userData}>{children}</AppShell>
}
