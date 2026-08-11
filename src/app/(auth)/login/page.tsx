"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleNotch } from "@phosphor-icons/react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    // Normalize ID so CEO@Hridesh maps to ceo@hridesh.co in Supabase
    const normalizedEmail = (email.includes(".") ? email : `${email}.co`).toLowerCase()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (signInError) {
      const msg = signInError.message === "{}" || !signInError.message 
        ? "Database not initialized. Please run 000_full_setup.sql in your Supabase SQL Editor." 
        : signInError.message
      setError(msg)
      setIsLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <Card className="w-full bg-card border border-border shadow-sm border-none p-8">
      <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
      <CardHeader className="space-y-3 pb-6 text-center">
        <div className="mx-auto w-16 h-16 bg-muted border border-border rounded-2xl flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-primary">M</span>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">MIOS</CardTitle>
        <CardDescription className="text-muted-foreground font-medium">Marketing Intelligence OS</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSignIn} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground font-bold">User ID</Label>
            <Input 
              id="email" 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-accent text-accent-foreground border-none text-foreground focus-visible:ring-primary h-12"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-muted-foreground font-bold">Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 font-medium">
                Forgot password?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-accent text-accent-foreground border-none text-foreground focus-visible:ring-primary h-12"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full neo-primary text-primary-foreground font-bold hover:bg-accent hover:text-accent-foreground transition-colors py-6 rounded-xl" 
            disabled={isLoading}
          >
            {isLoading ? <CircleNotch weight="duotone" className="w-4 h-4 mr-2 animate-spin" /> : null}
            Sign In
          </Button>
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
