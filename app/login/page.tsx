"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { AlertCircle, Eye, EyeOff, ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { login, isReady } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const user = await login(email, password)

      if (!user.isApproved) {
        router.push("/pending-approval")
      } else {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في نظام إدارة المدرسة",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f8f9fa] to-[#e9f5f2]">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl bg-white">
          {/* الجانب الأيمن - الصورة والشعار */}
          <div className="w-full md:w-1/2 bg-[#e9f5f2] p-8 flex flex-col items-center justify-center">
            <div className="mb-8 text-center">
              <Image
                src="/images/moe-vision-logo.png"
                alt="شعار وزارة التعليم - رؤية 2030"
                width={300}
                height={300}
                className="mx-auto"
              />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#0a8a74] mb-4">نظام إدارة المدرسة المتوسطة ١٣٦</h2>
              <p className="text-gray-600 mb-6">منصة تعليمية متكاملة لإدارة العملية التعليمية بكفاءة وفاعلية</p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#0a8a74] text-white flex items-center justify-center">
                    <span>١</span>
                  </div>
                  <span className="mr-3 text-gray-700">إدارة الفصول الدراسية بسهولة</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#0a8a74] text-white flex items-center justify-center">
                    <span>٢</span>
                  </div>
                  <span className="mr-3 text-gray-700">متابعة تقدم الطلاب بشكل مستمر</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#0a8a74] text-white flex items-center justify-center">
                    <span>٣</span>
                  </div>
                  <span className="mr-3 text-gray-700">تواصل فعال بين المعلمين وأولياء الأمور</span>
                </div>
              </div>
            </div>
          </div>

          {/* الجانب الأيسر - نموذج تسجيل الدخول */}
          <div className="w-full md:w-1/2 p-8 flex items-center">
            <Card className="w-full border-0 shadow-none">
              <CardHeader className="text-center pb-2">
                <h1 className="text-3xl font-bold text-[#0a8a74]">تسجيل الدخول</h1>
                <p className="text-gray-500 mt-2">أدخل بيانات الدخول للوصول إلى حسابك</p>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>خطأ</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-lg font-medium">
                      البريد الإلكتروني
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        placeholder="أدخل البريد الإلكتروني"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 text-lg pr-4"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-lg font-medium">
                        كلمة المرور
                      </Label>
                      <Link href="/forgot-password" className="text-sm text-[#0a8a74] hover:underline">
                        نسيت كلمة المرور؟
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="أدخل كلمة المرور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 text-lg pr-4"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg bg-[#0a8a74] hover:bg-[#097a67]"
                    disabled={isLoading || !isReady}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        جاري تسجيل الدخول...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        تسجيل الدخول
                        <ArrowRight className="mr-2" size={20} />
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center pt-2">
                <p className="text-gray-600">
                  ليس لديك حساب؟{" "}
                  <Link href="/register" className="text-[#0a8a74] font-medium hover:underline">
                    إنشاء حساب جديد
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <footer className="bg-[#0a8a74] text-white py-4 text-center">
        <div className="container mx-auto">
          <p>جميع الحقوق محفوظة © المدرسة المتوسطة ١٣٦ - وزارة التعليم - {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
