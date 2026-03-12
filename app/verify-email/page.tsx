"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function VerifyEmailPage() {
  const router = useRouter()

  useEffect(() => {
    // لا توجد في هذه النسخة خدمة بريد فعلي، لذا يتم تحويل المستخدم إلى انتظار المراجعة.
    setTimeout(() => {
      router.push("/pending-approval")
    }, 1000)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white p-4 text-center">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-green-600">جارٍ تجهيز الحساب</h1>
          <p className="text-gray-600">
            يتم الآن تحويلك إلى صفحة انتظار المراجعة الإدارية لاستكمال تفعيل الحساب.
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
