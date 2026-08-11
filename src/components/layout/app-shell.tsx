"use client"

import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { Broadcast } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "framer-motion"

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
    <div className="min-h-screen bg-background flex flex-col w-full overflow-hidden text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      {/* Top Navigation (Desktop & Tablet) */}
      <header className="h-16 neo-flat border-none px-4 md:px-6 flex items-center justify-between shrink-0 select-none z-30 mb-2">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <div className="w-8 h-8 rounded-full neo-convex flex items-center justify-center text-primary font-bold">
              M
            </div>
            <span className="font-bold text-sm md:text-base tracking-tight text-foreground/80">MIOS</span>
          </Link>

          {/* Center Top Nav */}
          <nav className="hidden md:flex items-center gap-3">
            {topNav.map((tab) => {
              const active = pathname.startsWith(tab.href)
              return (
                <Link
                  key={tab.label}
                  href={tab.enabled ? tab.href : "#"}
                  className={cn(
                    "px-4 py-2 font-bold text-xs tracking-wide rounded-full neo-interactive",
                    !tab.enabled
                      ? "text-muted-foreground cursor-not-allowed opacity-50"
                      : active
                      ? "neo-pressed text-primary"
                      : "text-muted-foreground hover:neo-flat hover:text-foreground"
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
          {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
            <div className="hidden sm:flex items-center gap-2 neo-pressed px-3 py-1.5 text-primary rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-bold uppercase tracking-wider">DEMO MODE ACTIVE</span>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-2 neo-flat px-3 py-1.5 text-primary rounded-full mr-2">
            <Broadcast weight="duotone" className="w-4 h-4 animate-pulse" />
            <span className="font-bold uppercase tracking-wider">LIVE</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Header (Shown only on small screens) */}
      <div className="md:hidden">
        <Header user={user} />
      </div>

      {/* Main Container: Left Console Sidebar + Center Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Console Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col w-[260px] neo-flat mx-2 mb-2 rounded-3xl shrink-0 h-[calc(100vh-5rem)] sticky top-20">
          <Sidebar user={user} />
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 flex flex-col h-[calc(100vh-5rem)] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto max-w-7xl h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
