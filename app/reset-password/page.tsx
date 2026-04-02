"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { resetPassword } from "@/lib/api/auth"
import { Loader2, Lock } from "lucide-react"

export default function ResetPasswordPage() {
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
    if (!tokenAvailable) setError("Reset token is missing.")
  }, [tokenAvailable])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!tokenAvailable) {
      setError("Reset token is missing.")
      return
    }
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    try {
      const resp = await resetPassword(token, newPassword)
      setSuccess(resp.message || "Password reset successful.")
      setTimeout(() => router.push("/sign-in"), 2200)
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
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter a new password for your account.
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
                placeholder="Enter new password"
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

            <div className="pt-2 text-sm text-muted-foreground flex items-center justify-between">
              <Link href="/sign-in" className="text-[#70c82a] hover:underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

