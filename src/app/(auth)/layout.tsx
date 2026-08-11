import { ReactNode } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 relative z-10 w-full max-w-md mx-auto">
        {children}
      </div>
    </div>
  )
}
