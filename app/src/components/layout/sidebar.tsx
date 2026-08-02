"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Megaphone, 
  Paintbrush, 
  FlaskConical, 
  Users, 
  BookOpen, 
  LogOut, 
  RefreshCw,
  Shield
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, enabled: true },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone, enabled: true },
  { href: "/creatives", label: "Creative Library", icon: Paintbrush, enabled: true },
  { href: "/experiments", label: "Experiments", icon: FlaskConical, enabled: true },
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
    <nav className={cn("flex flex-col justify-between p-4 w-full h-full text-xs select-none bg-black border-r border-zinc-800", className)}>
      {/* Top Brand Section */}
      <div className="space-y-6">
        <div className="px-2 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
              <span className="font-mono text-sm font-bold text-[#00dbe9]">P</span>
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white leading-none">
                PestControl OS
              </div>
              <div className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-1">
                CEO DASHBOARD
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-widest mb-2 px-2">
            INTELLIGENCE
          </div>

          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon

            if (!item.enabled) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-none text-zinc-600 cursor-not-allowed select-none border border-transparent group"
                >
                  <Icon className="w-4 h-4 opacity-40 shrink-0" />
                  <span className="font-medium text-xs opacity-60 truncate">
                    {item.label}
                  </span>
                  <span className="ml-auto text-[9px] font-mono bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded-none border border-zinc-800">
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-none transition-all duration-150 border-y border-r font-medium text-xs group",
                  isActive
                    ? "bg-zinc-900/90 text-[#00dbe9] border-y-zinc-800/80 border-r-zinc-800/80 border-l-2 border-l-[#00dbe9] font-semibold"
                    : "text-zinc-400 border-transparent hover:bg-zinc-900/50 hover:text-zinc-100"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors shrink-0",
                    isActive ? "text-[#00dbe9]" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-none bg-[#00dbe9] shrink-0" />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom Profile & Actions Section */}
      <div className="space-y-3 pt-6 border-t border-zinc-800">
        <button
          type="button"
          onClick={handleSyncData}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-none border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-white font-mono text-xs font-semibold tracking-wider uppercase transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#00dbe9]" />
          <span>SYNC DATA</span>
        </button>

        {/* Executive Profile Card */}
        <div className="flex items-center gap-3 p-2.5 rounded-none border border-zinc-800 bg-zinc-900/40">
          <div className="w-8 h-8 bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
            <span className="font-mono text-xs font-bold text-zinc-300">
              {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : "JD"}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-zinc-200 truncate">
              {user?.full_name || "James Dalton"}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase">
              {user?.role?.replace("_", " ") || "CHIEF EXECUTIVE OFFICER"}
            </div>
          </div>
          <Shield className="w-4 h-4 text-[#00dbe9] ml-auto shrink-0" />
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 py-2 px-2 text-zinc-500 hover:text-rose-400 transition-colors text-left text-xs tracking-wider uppercase font-mono"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>SIGN OUT</span>
        </button>
      </div>
    </nav>
  )
}

