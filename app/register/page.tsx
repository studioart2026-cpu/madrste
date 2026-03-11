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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { AlertCircle, Eye, EyeOff, ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [userType, setUserType] = useState<"teacher" | "student">("student")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { registerWithVerification, isReady } = useAuth()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (password !== confirmPassword) {
        throw new Error("كلمات المرور غير متطابقة")
      }

      // إنشاء الحساب على الخادم ثم تحويل المستخدم إلى صفحة انتظار المراجعة
      await registerWithVerification(userType, name, email, password, phoneNumber)

      toast({
        title: "تم إنشاء الحساب",
        description: "تم إرسال طلب التسجيل إلى الإدارة بانتظار التفعيل.",
      })

      // توجيه المستخدم مباشرة إلى صفحة انتظار الموافقة
      router.push("/pending-approval")
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء التسجيل")
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
              <p className="text-gray-600 mb-6">انضم إلينا اليوم واستفد من خدمات النظام المتكاملة</p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#0a8a74] text-white flex items-center justify-center">
                    <span>١</span>
                  </div>
                  <span className="mr-3 text-gray-700">سجل حسابك بسهولة</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#0a8a74] text-white flex items-center justify-center">
                    <span>٢</span>
                  </div>
                  <span className="mr-3 text-gray-700">أرسل طلب التسجيل للإدارة</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#0a8a74] text-white flex items-center justify-center">
                    <span>٣</span>
                  </div>
                  <span className="mr-3 text-gray-700">انتظر مراجعة الإدارة وتفعيل الحساب</span>
                </div>
              </div>
            </div>
          </div>

          {/* الجانب الأيسر - نموذج التسجيل */}
          <div className="w-full md:w-1/2 p-8 flex items-center">
            <Card className="w-full border-0 shadow-none">
              <CardHeader className="text-center pb-2">
                <h1 className="text-3xl font-bold text-[#0a8a74]">إنشاء حساب جديد</h1>
                <p className="text-gray-500 mt-2">أدخل بياناتك للتسجيل في النظام</p>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>خطأ</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-lg font-medium">
                      الاسم الكامل
                    </Label>
                    <Input
                      id="name"
                      placeholder="أدخل اسمك الكامل"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 text-lg pr-4"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-lg font-medium">
                      البريد الإلكتروني
                    </Label>
                    <Input
                      id="email"
                      placeholder="أدخل بريدك الإلكتروني"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 text-lg pr-4"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-lg font-medium">
                      رقم الجوال
                    </Label>
                    <Input
                      id="phoneNumber"
                      placeholder="05xxxxxxxx"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="h-12 text-lg pr-4"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-lg font-medium">
                      كلمة المرور
                    </Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-lg font-medium">
                      تأكيد كلمة المرور
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="أعد إدخال كلمة المرور"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 text-lg pr-4"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg font-medium">نوع المستخدم</Label>
                    <RadioGroup
                      value={userType}
                      onValueChange={(value) => setUserType(value as "teacher" | "student")}
                      className="flex space-x-4 space-x-reverse"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student">طالب/ة</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="teacher" id="teacher" />
                        <Label htmlFor="teacher">معلم/ة</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg mt-4 bg-[#0a8a74] hover:bg-[#097a67]"
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
                        جاري التسجيل...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        إنشاء حساب
                        <ArrowRight className="mr-2" size={20} />
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center pt-2">
                <p className="text-gray-600">
                  لديك حساب بالفعل؟{" "}
                  <Link href="/login" className="text-[#0a8a74] font-medium hover:underline">
                    تسجيل الدخول
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
