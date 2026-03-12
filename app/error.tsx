"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    // تسجيل الخطأ في الخادم
    console.error(error)

    // محاولة الحصول على نوع المستخدم من localStorage بدلاً من useAuth
    try {
      const storedUserType = localStorage.getItem("userType")
      setUserType(storedUserType)
    } catch (e) {
      console.error("Failed to get user type from localStorage:", e)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl">حدث خطأ</CardTitle>
          <CardDescription>نعتذر عن هذا الخطأ، يرجى التواصل مع مدير النظام</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <p className="text-red-700 text-sm">{error.message || "حدث خطأ غير متوقع في النظام"}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border">
            <h3 className="font-semibold mb-2">للتواصل مع مدير النظام:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="font-semibold ml-2">البريد الإلكتروني:</span>
                <a href="mailto:mohamm3dalfeel@gmail.com" className="text-primary hover:underline">
                  mohamm3dalfeel@gmail.com
                </a>
              </li>
              <li className="flex items-center">
                <span className="font-semibold ml-2">رقم الجوال:</span>
                <span>05XXXXXXXX</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={reset} className="w-full">
            محاولة مرة أخرى
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href={userType ? "/dashboard" : "/"}>العودة إلى الصفحة الرئيسية</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
