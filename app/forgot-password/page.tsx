"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { ArrowRight, CheckCircle2, KeyRound, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      })

      const data = (await response.json()) as { ok?: boolean; message?: string; error?: string }
      if (!response.ok) {
        throw new Error(data.error || "تعذر إرسال رابط إعادة التعيين")
      }

      setSuccessMessage(data.message || "إذا كان البريد الإلكتروني مسجلاً في النظام، فسيصلك رابط إعادة التعيين.")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "تعذر إرسال رابط إعادة التعيين")
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
              <KeyRound className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl text-[#0a8a74]">استعادة كلمة المرور</CardTitle>
            <CardDescription>أدخل بريدك الإلكتروني وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {successMessage ? (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>تم إرسال الطلب</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            ) : null}

            {errorMessage ? (
              <Alert variant="destructive">
                <AlertTitle>تعذر الإرسال</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    dir="ltr"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                صلاحية الرابط 30 دقيقة. عند استخدام الرابط سيتم تسجيل خروج الجلسات السابقة للحساب لحماية الوصول.
              </div>

              <Button type="submit" className="w-full bg-[#0a8a74] hover:bg-[#097a67]" disabled={isSubmitting}>
                {isSubmitting ? "جاري إرسال الرابط..." : "إرسال رابط إعادة التعيين"}
              </Button>
            </form>
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
