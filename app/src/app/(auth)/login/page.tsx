"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

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
    <Card className="w-full bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden rounded-2xl relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
      <CardHeader className="space-y-3 pb-6 text-center">
        <div className="mx-auto w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-inner mb-2">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">M</span>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight text-white">MIOS</CardTitle>
        <CardDescription className="text-zinc-400 font-medium">Marketing Intelligence OS</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSignIn} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">User ID</Label>
            <Input 
              id="email" 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-black/50 border-white/10 text-white focus-visible:ring-emerald-500/50"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
            </div>
            <Input 
              id="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-black/50 border-white/10 text-white focus-visible:ring-emerald-500/50"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/20 transition-all hover:shadow-emerald-900/40" 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
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
