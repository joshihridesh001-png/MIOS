"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { SquaresFour, Megaphone, PaintBrush, Flask, Users, BookOpen, SignOut, ArrowsClockwise, Shield } from "@phosphor-icons/react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour, enabled: true },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone, enabled: true },
  { href: "/creatives", label: "Creative Library", icon: PaintBrush, enabled: true },
  { href: "/experiments", label: "Experiments", icon: Flask, enabled: true },
  { href: "/customers", label: "Customer Profiles", icon: Users, enabled: true },
  { href: "/knowledge", label: "Knowledge Base", icon: BookOpen, enabled: true },
]

interface SidebarProps {
  className?: string
  user?: any
}

export function Sidebar({ className, user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSyncData = () => {
    toast.loading("Synchronizing institutional intel...", {
      duration: 1200,
    })
    setTimeout(() => {
      toast.success("Intelligence cache synchronized")
      router.refresh()
    }, 1200)
  }

  const handleSignOut = async () => {
    toast("Signing out of session...")
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <nav className={cn("flex flex-col justify-between p-4 w-full h-full text-sm select-none", className)}>
      <div className="space-y-8">
        
        {/* Navigation Section */}
        <div className="space-y-3 mt-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-2">
            INTELLIGENCE
          </div>

          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon

            if (!item.enabled) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground cursor-not-allowed select-none group"
                >
                  <Icon className="w-5 h-5 opacity-40 shrink-0" />
                  <span className="font-bold opacity-60 truncate">
                    {item.label}
                  </span>
                  <span className="ml-auto text-[10px] font-bold bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    SOON
                  </span>
                </div>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-bold group",
                  isActive
                    ? "neo-pressed text-primary"
                    : "text-foreground hover:neo-flat"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-primary shrink-0 neo-convex" />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom Profile & Actions Section */}
      <div className="space-y-4 pt-6">
        <button
          type="button"
          onClick={handleSyncData}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl neo-interactive neo-flat text-foreground hover:text-primary font-bold tracking-wide uppercase transition-all"
        >
          <ArrowsClockwise weight="duotone" className="w-4 h-4 text-primary" />
          <span>SYNC DATA</span>
        </button>

        {/* Executive Profile Card */}
        <div className="flex items-center gap-3 p-3 rounded-3xl neo-flat">
          <div className="w-10 h-10 neo-convex rounded-2xl flex items-center justify-center shrink-0">
            <span className="font-bold text-primary">
              {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : "JD"}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-foreground truncate">
              {user?.full_name || "James Dalton"}
            </div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase">
              {user?.role?.replace("_", " ") || "CEO"}
            </div>
          </div>
          <Shield className="w-5 h-5 text-primary ml-auto shrink-0 drop-shadow-md" />
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 text-muted-foreground hover:text-destructive neo-interactive hover:neo-pressed rounded-2xl transition-all text-sm tracking-widest font-bold uppercase"
        >
          <SignOut weight="duotone" className="w-4 h-4" />
          <span>SIGN OUT</span>
        </button>
      </div>
    </nav>
  )
}
