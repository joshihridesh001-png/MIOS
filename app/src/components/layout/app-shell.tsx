"use client"

import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AppShellProps {
  user: any
  children: ReactNode
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname()

  const topNav = [
    { label: "Overview", href: "/dashboard", enabled: true },
    { label: "Campaigns", href: "/campaigns", enabled: true },
    { label: "Creative Library", href: "/creatives", enabled: true },
    { label: "Experiments", href: "/experiments", enabled: true },
    { label: "Customers", href: "/customers", enabled: true },
    { label: "Intel Vault", href: "/knowledge", enabled: true },
  ]

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col w-full overflow-hidden text-zinc-100 font-sans selection:bg-[#00dbe9] selection:text-black">
      {/* Top Executive Suite Navigation (Desktop & Tablet) */}
      <header className="h-14 border-b border-zinc-800 bg-black/95 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shrink-0 select-none z-30">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-white hover:text-[#00dbe9] transition-colors">
            <span className="font-bold text-sm md:text-base tracking-tight">Marketing Intelligence</span>
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase border border-zinc-800 px-1.5 py-0.5">
              CEO DASHBOARD
            </span>
          </Link>

          {/* Center Top Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {topNav.map((tab) => {
              const active = pathname.startsWith(tab.href)
              return (
                <Link
                  key={tab.label}
                  href={tab.enabled ? tab.href : "#"}
                  className={cn(
                    "px-3 py-1.5 font-medium text-xs tracking-wide uppercase rounded-none transition-all",
                    !tab.enabled
                      ? "text-zinc-600 cursor-not-allowed opacity-50"
                      : active
                      ? "bg-zinc-900 text-[#00dbe9] border-b-2 border-[#00dbe9] font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                  )}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right Status Bar */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00dbe9]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider">LIVE SYNCHRONIZED</span>
          </div>
        </div>
      </header>

      {/* Mobile Header (Shown only on small screens) */}
      <div className="md:hidden">
        <Header user={user} />
      </div>

      {/* Main Container: Left Console Sidebar + Center Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Console Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col w-[260px] border-r border-zinc-800 bg-black shrink-0 h-[calc(100vh-3.5rem)] sticky top-14">
          <Sidebar user={user} />
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0e0e0e]">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl h-full">
              {children}
            </div>
          </div>

          {/* Bottom Clean Telemetry Bar */}
          <footer className="h-7 border-t border-zinc-800 bg-black px-4 flex items-center justify-between font-mono text-[10px] text-zinc-500 shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00dbe9]" />
              <span className="text-zinc-400 font-semibold uppercase tracking-wider">MARKETING INTELLIGENCE OS</span>
              <span className="hidden sm:inline text-zinc-700">|</span>
              <span className="hidden sm:inline">ALL PROTOCOLS ACTIVE</span>
            </div>
            <div className="flex items-center gap-3">
              <span>LATENCY: 12ms</span>
              <span>VERSION 2.1.0</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
