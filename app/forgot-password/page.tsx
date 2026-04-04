"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { forgotPassword } from "@/lib/api/auth"
import { Loader2, Phone, Mail, Lock } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!identifier.trim()) {
      setError("Please enter your registered email address or phone number.")
      return
    }

    setIsLoading(true)
    try {
      const resp = await forgotPassword(identifier.trim())
      setSuccess(
        resp.message ||
          "If an account matches your details, you will receive password reset instructions shortly."
      )
      setTimeout(() => router.push("/sign-in"), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request reset.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your email or phone. We will send a reset link.
          </p>
        </CardHeader>
        <CardContent>
          {(error || success) && (
            <Alert variant={error ? "destructive" : "default"}>
              <AlertDescription>{error || success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={onSubmit} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="identifier" className="flex items-center gap-2">
                {identifier.includes("@") ? <Mail className="h-4 w-4 text-[#70c82a]" /> : <Phone className="h-4 w-4 text-[#70c82a]" />}
                Email or Phone
              </Label>
              <Input
                id="identifier"
                name="identifier"
                placeholder="e.g. you@example.com or 09********"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isLoading}
                className="bg-background/50"
              />
            </div>

            <Button type="submit" className="w-full bg-[#70c82a] hover:bg-[#5aa022] text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Send reset link
                </>
              )}
            </Button>

            <div className="pt-2 text-sm text-muted-foreground flex items-center justify-between">
              <Link href="/sign-in" className="text-[#70c82a] hover:underline">
                Back to sign-in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

