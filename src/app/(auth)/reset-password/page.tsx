"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleNotch } from "@phosphor-icons/react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if the user arrived here with a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // If there is no session, the recovery link might be invalid or expired
        // Try waiting a beat in case the hash is still processing
        setTimeout(async () => {
          const { data: { session: delayedSession } } = await supabase.auth.getSession()
          if (!delayedSession) {
            setError("Invalid or expired password reset link. Please request a new one.")
          }
        }, 1000)
      }
    }
    
    checkSession()
  }, [supabase.auth])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      setIsLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    // Redirect to dashboard upon successful password reset
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <Card className="w-full bg-card/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden rounded-2xl relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
      <CardHeader className="space-y-3 pb-6 text-center">
        <div className="mx-auto w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-inner mb-2">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">M</span>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">New Password</CardTitle>
        <CardDescription className="text-muted-foreground font-medium">Please enter your new password.</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleUpdate} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">New Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background/50 border-white/10 text-foreground focus-visible:ring-emerald-500/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-background/50 border-white/10 text-foreground focus-visible:ring-emerald-500/50"
            />
          </div>
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-foreground font-medium shadow-lg shadow-emerald-900/20 transition-all hover:shadow-emerald-900/40" 
              disabled={isLoading || error !== null}
            >
              {isLoading ? <CircleNotch weight="duotone" className="w-4 h-4 mr-2 animate-spin" /> : null}
              Update Password
            </Button>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex items-center justify-center pt-2 pb-6 border-t border-white/5">
        <p className="text-xs text-zinc-600">
          Internal Executive Portal • Authorized Personnel Only
        </p>
      </CardFooter>
    </Card>
  )
}
