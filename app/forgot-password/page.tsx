"use client"

import Link from "next/link"
import { ArrowRight, KeyRound, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-[#e9f5f2] p-4">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center">
        <Card className="w-full max-w-xl border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f5f2] text-[#0a8a74]">
              <KeyRound className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl text-[#0a8a74]">استعادة كلمة المرور</CardTitle>
            <CardDescription>
              لأسباب أمنية، لا يسمح النظام بتغيير كلمة المرور من هذه الصفحة بدون تحقق إداري.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <ShieldAlert className="h-5 w-5" />
                حماية الحسابات مفعّلة
              </div>
              <p className="text-sm leading-7">
                إذا نسيت كلمة المرور، تواصل مع إدارة المدرسة أو الدعم الفني لإعادة تعيينها من لوحة الإدارة بشكل آمن.
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              <p>الخطوات الموصى بها:</p>
              <p className="mt-2">1. تواصل مع الإدارة من صفحة التواصل.</p>
              <p>2. زوّدهم بالبريد الإلكتروني المرتبط بالحساب.</p>
              <p>3. ستتم إعادة التعيين من داخل النظام بعد التحقق من الهوية.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="w-full bg-[#0a8a74] hover:bg-[#097a67] sm:w-auto">
              <Link href="/contact">التواصل مع الإدارة</Link>
            </Button>
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
