"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleNotch, ArrowLeft } from "@phosphor-icons/react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    // Normalize ID so CEO@Hridesh maps to ceo@hridesh.co in Supabase
    const normalizedEmail = (email.includes(".") ? email : `${email}.co`).toLowerCase()

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
  }

  return (
    <Card className="w-full bg-card/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden rounded-2xl relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
      <CardHeader className="space-y-3 pb-6 text-center">
        <div className="mx-auto w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-inner mb-2">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">M</span>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Reset Password</CardTitle>
        <CardDescription className="text-muted-foreground font-medium">Enter your email to receive a reset link.</CardDescription>
      </CardHeader>
      
      <CardContent>
        {success ? (
          <div className="p-4 text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg text-center space-y-4">
            <p>Check your email for the password reset link.</p>
            <Button asChild variant="outline" className="w-full bg-background/50 border-white/10 text-foreground hover:bg-white/10">
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">User ID</Label>
              <Input 
                id="email" 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 border-white/10 text-foreground focus-visible:ring-emerald-500/50"
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-foreground font-medium shadow-lg shadow-emerald-900/20 transition-all hover:shadow-emerald-900/40" 
                disabled={isLoading}
              >
                {isLoading ? <CircleNotch weight="duotone" className="w-4 h-4 mr-2 animate-spin" /> : null}
                Send Reset Link
              </Button>
              
              <Button asChild variant="outline" className="w-full bg-background/50 border-white/10 text-foreground hover:bg-white/10">
                <Link href="/login">
                  <ArrowLeft weight="duotone" className="w-4 h-4 mr-2" /> Back to Login
                </Link>
              </Button>
            </div>
          </form>
        )}
      </CardContent>
      
      <CardFooter className="flex items-center justify-center pt-2 pb-6 border-t border-white/5">
        <p className="text-xs text-zinc-600">
          Internal Executive Portal • Authorized Personnel Only
        </p>
      </CardFooter>
    </Card>
  )
}
