"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { Clock, LogOut, ArrowRight } from "lucide-react"

export default function PendingApprovalPage() {
  const { email, userName, userType, logout } = useAuth()

  // التحقق من حالة المستخدم
  useEffect(() => {
    // يمكن إضافة منطق للتحقق من حالة الموافقة هنا
  }, [])

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
                  <span className="mr-3 text-gray-700">تم إنشاء الحساب بنجاح</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#0a8a74] text-white flex items-center justify-center">
                    <span>٢</span>
                  </div>
                  <span className="mr-3 text-gray-700">تم إرسال الطلب للإدارة</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center">
                    <span>٣</span>
                  </div>
                  <span className="mr-3 text-gray-700">في انتظار موافقة مدير النظام</span>
                </div>
              </div>
            </div>
          </div>

          {/* الجانب الأيسر - معلومات الانتظار */}
          <div className="w-full md:w-1/2 p-8 flex items-center">
            <Card className="w-full border-0 shadow-none">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-10 w-10 text-amber-500" />
                </div>
                <CardTitle className="text-3xl font-bold text-[#0a8a74]">في انتظار الموافقة</CardTitle>
                <CardDescription className="text-lg mt-2">
                  تم إنشاء حسابك بنجاح وهو الآن قيد المراجعة من قبل مدير النظام
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">معلومات الحساب:</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>
                      <span className="font-medium">الاسم:</span> {userName}
                    </p>
                    <p>
                      <span className="font-medium">البريد الإلكتروني:</span> {email}
                    </p>
                    <p>
                      <span className="font-medium">نوع المستخدم:</span>{" "}
                      {userType === "teacher" ? "معلم/ة" : userType === "student" ? "طالب/ة" : ""}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <h3 className="font-medium text-amber-800 mb-2">ماذا يحدث الآن؟</h3>
                  <p className="text-amber-700">
                    سيقوم مدير النظام بمراجعة طلبك وتفعيل الحساب. بعد الموافقة يمكنك تسجيل الدخول واستخدام النظام بشكل
                    كامل.
                  </p>
                </div>

                <div className="flex flex-col space-y-3">
                  <Button
                    variant="outline"
                    className="border-[#0a8a74] text-[#0a8a74] hover:bg-[#e9f5f2]"
                    onClick={() => window.location.reload()}
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
                    تحديث الصفحة
                  </Button>
                  <Button variant="outline" className="border-gray-300 text-gray-700" onClick={logout}>
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center pt-2">
                <p className="text-gray-600">
                  هل تحتاج إلى مساعدة؟{" "}
                  <Link href="/contact" className="text-[#0a8a74] font-medium hover:underline">
                    تواصل معنا
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
