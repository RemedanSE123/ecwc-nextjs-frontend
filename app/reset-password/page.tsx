"use client"

import type React from "react"
import { useEffect, useMemo, useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { resetPassword } from "@/lib/api/auth"
import { Loader2, Lock } from "lucide-react"

function passwordMeetsRules(password: string): boolean {
  if (password.length < 6) return false
  if (!/[A-Za-z]/.test(password)) return false
  if (!/[0-9]/.test(password)) return false
  return true
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const tokenAvailable = useMemo(() => token.trim().length > 0, [token])

  useEffect(() => {
    if (!tokenAvailable) setError("This reset link is invalid or incomplete. Please request a new link from the sign-in page.")
  }, [tokenAvailable])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!tokenAvailable) {
      setError("This reset link is invalid or incomplete. Please request a new link from the sign-in page.")
      return
    }
    if (!passwordMeetsRules(newPassword)) {
      setError("Password must be at least 6 characters and include at least one letter and one number.")
      return
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    try {
      const resp = await resetPassword(token, newPassword)
      setSuccess(resp.message || "Your password has been updated. You may now sign in.")
      setTimeout(() => router.push("/sign-in"), 2800)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Set a new password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose a new password for your ECWC PEMS account. After saving, sign in with your email or phone and the new password.
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
              <Label htmlFor="newPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#70c82a]" />
                New Password
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="At least 6 characters, letters and numbers"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={isLoading}
                className="bg-background/50"
              />
            </div>

            <Button type="submit" className="w-full bg-[#70c82a] hover:bg-[#5aa022] text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Use at least 6 characters, including at least one letter (A–Z) and one number (0–9), matching your registration rules.
            </p>
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
