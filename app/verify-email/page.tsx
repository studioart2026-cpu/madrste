"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { email } = useAuth()

  useEffect(() => {
    // اعتبار البريد الإلكتروني محققاً تلقائياً والتوجيه إلى صفحة انتظار الموافقة
    setTimeout(() => {
      router.push("/pending-approval")
    }, 1000)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white p-4 text-center">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-green-600">تم التحقق من البريد الإلكتروني</h1>
          <p className="text-gray-600">
            لقد تم التحقق من بريدك الإلكتروني بنجاح. سيتم توجيهك إلى صفحة انتظار الموافقة.
          </p>
        </div>
        <div className="pt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-full animate-pulse rounded-full bg-green-500"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
