"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Home,
  Loader2, 
  Eye, 
  EyeOff, 
  Phone, 
  Lock 
} from "lucide-react"
import { motion } from "framer-motion"
import { validateUser, setSession, getSession, isSessionExpired, getAuthHeaders } from "@/lib/auth"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

function SignInForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    document.documentElement.classList.remove("dark")
  }, [])

  // If already logged in, redirect to equipment dashboard (default post-login page)
  useEffect(() => {
    const session = getSession()
    if (session && !isSessionExpired(session)) {
      router.replace("/equipment/dashboard")
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (formData.password.length !== 6 || !/^\d{6}$/.test(formData.password)) {
      setError("Password must be exactly 6 digits.")
      return
    }
    setIsLoading(true)
    const user = validateUser(formData.phone.trim(), formData.password)
    if (!user) {
      setError("Invalid phone number or password. Only whitelisted accounts can sign in.")
      setIsLoading(false)
      return
    }
    setSession(user)
    try {
      await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ action: 'login' }),
      })
    } catch (err) {
      if (typeof console !== 'undefined') console.warn('Audit log (login) failed:', err)
    }
    router.push("/equipment/dashboard")
    setIsLoading(false)
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/80 dark:bg-zinc-900/80 border border-[#70c82a]/20 hover:border-[#70c82a] hover:bg-[#70c82a]/5 transition-all backdrop-blur-sm"
        >
          <Home className="h-4 w-4 text-[#70c82a]" />
          <span className="text-sm font-medium text-foreground">Back to Home</span>
        </Link>
      </div>

      {/* Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#70c82a]/5 via-background to-background dark:from-[#70c82a]/10 overflow-y-auto">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl bg-gradient-to-br from-background/95 via-background/90 to-muted/30 dark:from-zinc-950/95 dark:via-zinc-950/90 dark:to-zinc-900/30 relative overflow-visible border border-[#70c82a]/20 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#70c82a]/10 via-[#70c82a]/5 to-[#5aa022]/10 dark:from-[#70c82a]/15 dark:via-[#70c82a]/10 dark:to-[#5aa022]/15" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#70c82a]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#5aa022]/5 rounded-full blur-3xl"></div>
            <CardHeader className="space-y-2 relative z-10 pb-6 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Left Section - Logo */}
                <div className="flex justify-center md:justify-start">
                  <Link href="/" className="relative cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="absolute inset-0 bg-[#70c82a]/10 rounded-full blur-xl"></div>
                    <Image
                      src="/ecwc png logo.png"
                      alt="ECWC Logo"
                      width={80}
                      height={80}
                      className="h-16 w-auto object-contain relative z-10 drop-shadow-lg"
                      quality={100}
                      unoptimized
                      priority
                    />
                  </Link>
                </div>
                
                {/* Right Section - Title and Description */}
                <div className="text-center md:text-left space-y-3 relative overflow-visible">
                  <div className="space-y-2 overflow-visible">
                    <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#70c82a] via-[#5aa022] to-[#70c82a] bg-clip-text text-transparent pb-2 leading-tight overflow-visible">
                      Sign In
                    </CardTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                      Welcome back!
                    </p>
                  </div>
                  {/* Decorative horizontal line - left to right */}
                  <div className="relative mt-4 pt-4">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#70c82a] via-[#5aa022] to-[#70c82a]"></div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 py-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4"
                  >
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#70c82a]" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="e.g. 09********"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="bg-background/50 h-9 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#70c82a]" />
                    Password (6 digits) *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="6-digit password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      maxLength={6}
                      disabled={isLoading}
                      className="bg-background/50 pr-10 h-9 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#70c82a] hover:bg-[#5aa022] text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="relative z-10 pt-4 pb-8 mb-2">
              <p className="text-xs text-muted-foreground text-center w-full">
                Only whitelisted accounts can sign in. Contact admin for access.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function SignInPageFallback() {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/80 dark:bg-zinc-900/80 border border-[#70c82a]/20 hover:border-[#70c82a] hover:bg-[#70c82a]/5 transition-all backdrop-blur-sm"
        >
          <Home className="h-4 w-4 text-[#70c82a]" />
          <span className="text-sm font-medium text-foreground">Back to Home</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#70c82a]/5 via-background to-background dark:from-[#70c82a]/10">
        <Card className="w-full max-w-md border border-[#70c82a]/20 animate-pulse">
          <CardHeader>
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInPageFallback />}>
      <SignInForm />
    </Suspense>
  )
}