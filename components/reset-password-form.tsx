"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const validateToken = async () => {
      if (!token) {
        if (active) {
          setErrorMessage("رابط إعادة التعيين غير مكتمل")
          setIsLoading(false)
        }
        return
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`, {
          method: "GET",
          cache: "no-store",
        })

        const data = (await response.json()) as { ok?: boolean; error?: string }
        if (!response.ok) {
          throw new Error(data.error || "رابط إعادة التعيين غير صالح أو انتهت صلاحيته")
        }

        if (active) {
          setErrorMessage(null)
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : "تعذر التحقق من الرابط")
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void validateToken()

    return () => {
      active = false
    }
  }, [token])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (newPassword.length < 8) {
      setErrorMessage("يجب أن تكون كلمة المرور 8 أحرف على الأقل")
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("تأكيد كلمة المرور غير مطابق")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      })

      const data = (await response.json()) as { ok?: boolean; error?: string }
      if (!response.ok) {
        throw new Error(data.error || "تعذر إعادة تعيين كلمة المرور")
      }

      setSuccessMessage("تم تعيين كلمة المرور الجديدة بنجاح. يمكنك الآن تسجيل الدخول.")
      setNewPassword("")
      setConfirmPassword("")
      window.setTimeout(() => {
        router.replace("/login")
      }, 1200)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "تعذر إعادة تعيين كلمة المرور")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-[#e9f5f2] p-4">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center">
        <Card className="w-full max-w-xl border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f5f2] text-[#0a8a74]">
              <LockKeyhole className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl text-[#0a8a74]">تعيين كلمة مرور جديدة</CardTitle>
            <CardDescription>أدخل كلمة مرور جديدة وآمنة للحساب.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isLoading ? <div className="text-center text-sm text-muted-foreground">جاري التحقق من الرابط...</div> : null}

            {errorMessage ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>تعذر المتابعة</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            {successMessage ? (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>تم التحديث</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            ) : null}

            {!isLoading && !errorMessage ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="pl-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((current) => !current)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="pl-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-[#0a8a74] hover:bg-[#097a67]" disabled={isSubmitting}>
                  {isSubmitting ? "جاري حفظ كلمة المرور..." : "حفظ كلمة المرور الجديدة"}
                </Button>
              </form>
            ) : null}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/login" className="inline-flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                العودة إلى تسجيل الدخول
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
