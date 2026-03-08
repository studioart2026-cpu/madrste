"use client"

import type React from "react"
import { useEffect, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Clock, GraduationCap, Save, School, SquarePen, Users, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function DashboardPage() {
  const { userName, userType, email } = useAuth()

  const isAdmin = userType === "admin"
  const canEditPrincipalMessage =
    userType === "admin" ||
    userType === "vice_admin" ||
    email === "principal@school.edu.sa" ||
    email === "mohamm3dalfeel@gmail.com" ||
    email === "admin2@school.edu.sa"
  const isTeacher = userType === "teacher"
  const isStudent = userType === "student"
  const principalTitleStorageKey = "dashboard-principal-message-title"
  const principalBodyStorageKey = "dashboard-principal-message-body"
  const defaultPrincipalTitle = "كلمة المديرة: الجازي العقيل للطالبات 💖"
  const defaultPrincipalBody = `بناتي الغاليات،
السلام عليكن ورحمة الله وبركاته،
أود أن أعبّر عن فخري الكبير بكن اليوم... أنتن الأمل والمستقبل، وبكن نرتقي ونفخر. اجتهدن، وامنحن أنفسكن الفرصة لتألّق لا ينطفئ. تذكّرن دائمًا أن الطموح لا سقف له، وأن لكل مجتهدة نصيب.
أثق أنكن قادرات على تحقيق أحلامكن، فكوني أنتِ البداية الجميلة لما تتمنين 💫
مع أطيب الأمنيات بالتوفيق والنجاح،
مديرتكن المحبة: الجازي العقيل 🌷`
  const [principalMessageTitle, setPrincipalMessageTitle] = useState(defaultPrincipalTitle)
  const [principalMessageBody, setPrincipalMessageBody] = useState(defaultPrincipalBody)
  const [draftPrincipalMessageTitle, setDraftPrincipalMessageTitle] = useState(defaultPrincipalTitle)
  const [draftPrincipalMessageBody, setDraftPrincipalMessageBody] = useState(defaultPrincipalBody)
  const [isEditingPrincipalMessage, setIsEditingPrincipalMessage] = useState(false)

  useEffect(() => {
    const storedTitle = localStorage.getItem(principalTitleStorageKey)
    const storedBody = localStorage.getItem(principalBodyStorageKey)

    if (storedTitle?.trim()) {
      setPrincipalMessageTitle(storedTitle)
      setDraftPrincipalMessageTitle(storedTitle)
    }
    if (storedBody?.trim()) {
      setPrincipalMessageBody(storedBody)
      setDraftPrincipalMessageBody(storedBody)
    }
  }, [])

  const startEditPrincipalMessage = () => {
    setDraftPrincipalMessageTitle(principalMessageTitle)
    setDraftPrincipalMessageBody(principalMessageBody)
    setIsEditingPrincipalMessage(true)
  }

  const cancelEditPrincipalMessage = () => {
    setDraftPrincipalMessageTitle(principalMessageTitle)
    setDraftPrincipalMessageBody(principalMessageBody)
    setIsEditingPrincipalMessage(false)
  }

  const savePrincipalMessage = () => {
    const nextTitle = draftPrincipalMessageTitle.trim() || defaultPrincipalTitle
    const nextBody = draftPrincipalMessageBody.trim() || defaultPrincipalBody

    setPrincipalMessageTitle(nextTitle)
    setPrincipalMessageBody(nextBody)
    localStorage.setItem(principalTitleStorageKey, nextTitle)
    localStorage.setItem(principalBodyStorageKey, nextBody)
    setIsEditingPrincipalMessage(false)
  }

  const getCurrentDay = () => {
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    return days[new Date().getDay()]
  }

  const getCurrentDateFormatted = () => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
    return new Date().toLocaleDateString("ar-SA", options)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">أهلاً بك، {userName || "مستخدم النظام"}</h1>
        <p className="text-gray-500">
          {getCurrentDay()} - {getCurrentDateFormatted()}
        </p>
      </div>

      <Alert>
        <AlertTitle className="text-lg font-semibold">مرحباً بك في نظام إدارة المدرسة المتوسطة ١٣٦</AlertTitle>
        <AlertDescription>
          يمكنك الوصول إلى جميع الخدمات والمعلومات المتاحة لك من خلال القائمة الجانبية أو من خلال البطاقات أدناه.
        </AlertDescription>
      </Alert>

      {/* كلمة المديرة */}
      <Card className="border-2 border-[#0a8a74]/20 bg-gradient-to-r from-white to-[#0a8a74]/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-[#0a8a74]">
              <MessageCircleHeartIcon className="w-5 h-5 text-[#0a8a74]" />
              <span>{principalMessageTitle}</span>
            </CardTitle>
            {canEditPrincipalMessage && !isEditingPrincipalMessage && (
              <Button variant="outline" size="sm" onClick={startEditPrincipalMessage}>
                <SquarePen className="ml-1 h-4 w-4" />
                تعديل
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          {canEditPrincipalMessage && isEditingPrincipalMessage ? (
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">عنوان الكلمة</p>
                <Textarea
                  value={draftPrincipalMessageTitle}
                  onChange={(e) => setDraftPrincipalMessageTitle(e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <p className="mb-1 text-sm text-muted-foreground">نص الكلمة</p>
                <Textarea
                  value={draftPrincipalMessageBody}
                  onChange={(e) => setDraftPrincipalMessageBody(e.target.value)}
                  rows={8}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={savePrincipalMessage} className="bg-[#0a8a74] hover:bg-[#097a67]">
                  <Save className="ml-1 h-4 w-4" />
                  حفظ
                </Button>
                <Button variant="outline" onClick={cancelEditPrincipalMessage}>
                  <X className="ml-1 h-4 w-4" />
                  إلغاء
                </Button>
              </div>
            </div>
          ) : (
            principalMessageBody
              .split("\n")
              .filter((line) => line.trim().length > 0)
              .map((line, idx, arr) => (
                <p key={`${line}-${idx}`} className={idx === arr.length - 1 ? "pt-2 font-semibold text-[#0a8a74]" : ""}>
                  {line}
                </p>
              ))
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <span>جدول اليوم</span>
            </CardTitle>
            <CardDescription>حصص {getCurrentDay()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">الحصة الأولى</span>
                <span className="text-xs text-gray-500">7:15 - 8:00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">الحصة الثانية</span>
                <span className="text-xs text-gray-500">8:00 - 8:45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">الحصة الثالثة</span>
                <span className="text-xs text-gray-500">8:45 - 9:30</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">الفسحة</span>
                <span className="text-xs text-gray-500">9:30 - 10:00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">الحصة الرابعة</span>
                <span className="text-xs text-gray-500">10:00 - 10:45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">الحصة الخامسة</span>
                <span className="text-xs text-gray-500">10:45 - 11:30</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">الحصة السادسة</span>
                <span className="text-xs text-gray-500">11:30 - 12:15</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>الحصة الحالية</span>
            </CardTitle>
            <CardDescription>
              <CurrentPeriod />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">المادة:</span>
                <span className="text-sm">الرياضيات</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">الوقت المتبقي:</span>
                <span className="text-sm">15 دقيقة</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">الفصل:</span>
                <span className="text-sm">الصف الثالث (أ)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">المعلم/ة:</span>
                <span className="text-sm">أ. نورة الأحمد</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>إحصائيات المستخدمين</span>
              </CardTitle>
              <CardDescription>بيانات المستخدمين في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">المعلمين:</span>
                  <span className="text-sm">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">الطلاب:</span>
                  <span className="text-sm">412</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">الفصول:</span>
                  <span className="text-sm">15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">طلبات التسجيل الجديدة:</span>
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isTeacher && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <span>فصولي الدراسية</span>
              </CardTitle>
              <CardDescription>الفصول التي تقوم بتدريسها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">الصف الثالث (أ):</span>
                  <span className="text-sm">28 طالب/ة</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">الصف الثالث (ب):</span>
                  <span className="text-sm">30 طالب/ة</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">الصف الثاني (أ):</span>
                  <span className="text-sm">26 طالب/ة</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">عدد الحصص الأسبوعية:</span>
                  <span className="text-sm">18 حصة</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isStudent && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <School className="w-5 h-5 text-primary" />
                <span>معلومات الفصل</span>
              </CardTitle>
              <CardDescription>بيانات الفصل الدراسي</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">الفصل:</span>
                  <span className="text-sm">الصف الثالث (أ)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">رائد الفصل:</span>
                  <span className="text-sm">أ. خالد العمري</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">عدد الطلاب:</span>
                  <span className="text-sm">28 طالب/ة</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">الغياب الشهري:</span>
                  <span className="text-sm">1 يوم</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <AlertIcon className="w-5 h-5 text-primary" />
              <span>الإشعارات</span>
            </CardTitle>
            <CardDescription>آخر التحديثات والإشعارات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border-r-2 border-primary pr-3 py-1">
                <p className="text-sm font-medium">تم إضافة اختبار جديد</p>
                <p className="text-xs text-gray-500">مادة الرياضيات - الأسبوع القادم</p>
              </div>
              <div className="border-r-2 border-primary pr-3 py-1">
                <p className="text-sm font-medium">واجب منزلي جديد</p>
                <p className="text-xs text-gray-500">مادة اللغة العربية - تسليم غداً</p>
              </div>
              <div className="border-r-2 border-primary pr-3 py-1">
                <p className="text-sm font-medium">اجتماع أولياء الأمور</p>
                <p className="text-xs text-gray-500">الخميس القادم - الساعة 10 صباحاً</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assignments">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assignments">الواجبات</TabsTrigger>
          <TabsTrigger value="exams">الاختبارات</TabsTrigger>
          <TabsTrigger value="activities">الأنشطة</TabsTrigger>
        </TabsList>
        <TabsContent value="assignments" className="space-y-4">
          <h2 className="text-xl font-bold">الواجبات الحالية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">واجب الرياضيات</CardTitle>
                <CardDescription>حل تمارين الفصل السابع</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">تاريخ التسليم: 20/5/2023</p>
                <p className="text-sm text-gray-500">المعلم/ة: أ. نورة الأحمد</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">واجب العلوم</CardTitle>
                <CardDescription>بحث عن الطاقة المتجددة</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">تاريخ التسليم: 25/5/2023</p>
                <p className="text-sm text-gray-500">المعلم/ة: أ. فاطمة السعيد</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">واجب اللغة العربية</CardTitle>
                <CardDescription>تلخيص قصة "الشاعر الصغير"</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">تاريخ التسليم: 18/5/2023</p>
                <p className="text-sm text-gray-500">المعلم/ة: أ. محمد العتيبي</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Link href="/dashboard/homework" className="text-primary hover:underline text-sm">
              عرض جميع الواجبات
            </Link>
          </div>
        </TabsContent>
        <TabsContent value="exams" className="space-y-4">
          <h2 className="text-xl font-bold">الاختبارات القادمة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">اختبار الرياضيات</CardTitle>
                <CardDescription>الفصل الدراسي النهائي</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">التاريخ: 10/6/2023</p>
                <p className="text-sm text-gray-500">المعلم/ة: أ. نورة الأحمد</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">اختبار العلوم</CardTitle>
                <CardDescription>الفصل الدراسي النهائي</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">التاريخ: 12/6/2023</p>
                <p className="text-sm text-gray-500">المعلم/ة: أ. فاطمة السعيد</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">اختبار اللغة العربية</CardTitle>
                <CardDescription>الفصل الدراسي النهائي</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">التاريخ: 15/6/2023</p>
                <p className="text-sm text-gray-500">المعلم/ة: أ. محمد العتيبي</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Link href="/dashboard/grades" className="text-primary hover:underline text-sm">
              عرض جميع الاختبارات
            </Link>
          </div>
        </TabsContent>
        <TabsContent value="activities" className="space-y-4">
          <h2 className="text-xl font-bold">الأنشطة المدرسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">مسابقة الخط العربي</CardTitle>
                <CardDescription>مسابقة على مستوى المدرسة</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">التاريخ: 22/5/2023</p>
                <p className="text-sm text-gray-500">المشرف/ة: أ. سارة العبدالله</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">يوم الأنشطة الرياضية</CardTitle>
                <CardDescription>فعاليات رياضية متنوعة</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">التاريخ: 29/5/2023</p>
                <p className="text-sm text-gray-500">المشرف/ة: أ. ناصر القحطاني</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">معرض العلوم</CardTitle>
                <CardDescription>مشاريع علمية من إبداع الطلاب</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">التاريخ: 5/6/2023</p>
                <p className="text-sm text-gray-500">المشرف/ة: أ. فاطمة السعيد</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CurrentPeriod() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const time = hours * 60 + minutes

  if (time >= 7 * 60 + 15 && time < 8 * 60) {
    return "الحصة الأولى (7:15 - 8:00)"
  } else if (time >= 8 * 60 && time < 8 * 60 + 45) {
    return "الحصة الثانية (8:00 - 8:45)"
  } else if (time >= 8 * 60 + 45 && time < 9 * 60 + 30) {
    return "الحصة الثالثة (8:45 - 9:30)"
  } else if (time >= 9 * 60 + 30 && time < 10 * 60) {
    return "الفسحة (9:30 - 10:00)"
  } else if (time >= 10 * 60 && time < 10 * 60 + 45) {
    return "الحصة الرابعة (10:00 - 10:45)"
  } else if (time >= 10 * 60 + 45 && time < 11 * 60 + 30) {
    return "الحصة الخامسة (10:45 - 11:30)"
  } else if (time >= 11 * 60 + 30 && time < 12 * 60 + 15) {
    return "الحصة السادسة (11:30 - 12:15)"
  } else {
    return "لا توجد حصة حالياً"
  }
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function MessageCircleHeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M15.8 9.2a2.5 2.5 0 0 0-3.5 0l-.3.4-.3-.4a2.5 2.5 0 0 0-3.5 3.5L12 16l3.8-3.8a2.5 2.5 0 0 0 0-3.5Z" />
    </svg>
  )
}
