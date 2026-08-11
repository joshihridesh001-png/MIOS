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

  // Use the profile if found, otherwise create a fallback from the auth user
  const userData = profile || {
    id: user.id,
    full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
    role: "user",
    avatar_url: user.user_metadata?.avatar_url
  }

  const upperName = (userData.full_name || "").toUpperCase()
  if (upperName.includes("SWARIT")) {
    userData.role = "CTO"
  } else if (upperName.includes("RIYA")) {
    userData.role = "CEO's waifu"
  }

  return <AppShell user={userData}>{children}</AppShell>
}
