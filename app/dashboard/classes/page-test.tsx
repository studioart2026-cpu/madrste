"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// بيانات تجريبية للفصول
const classesData = [
  {
    id: "1",
    name: "الصف الأول أ",
    grade: "الأول",
    section: "أ",
    teacher: "أ. فاطمة محمد",
    students: 25,
  },
  {
    id: "2",
    name: "الصف الثاني ب",
    grade: "الثاني",
    section: "ب",
    teacher: "أ. نورة أحمد",
    students: 22,
  },
  {
    id: "3",
    name: "الصف الثالث ج",
    grade: "الثالث",
    section: "ج",
    teacher: "أ. عائشة علي",
    students: 28,
  },
]

export default function ClassesTestPage() {
  const [componentToTest, setComponentToTest] = useState<string>("none")

  // اختبار مكون Card
  const testCard = () => {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classesData.map((cls) => (
          <Card key={cls.id}>
            <CardHeader className="pb-2">
              <CardTitle>{cls.name}</CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge>{cls.grade}</Badge>
                <Badge variant="outline">الشعبة {cls.section}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المعلم:</span>
                  <span>{cls.teacher}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">عدد الطلاب:</span>
                  <span>{cls.students}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // اختبار مكون Button
  const testButton = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <Button variant="default">زر أساسي</Button>
          <Button variant="secondary">زر ثانوي</Button>
          <Button variant="outline">زر محيط</Button>
          <Button variant="ghost">زر شبح</Button>
          <Button variant="link">زر رابط</Button>
          <Button variant="destructive">زر حذف</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="default">حجم افتراضي</Button>
          <Button size="sm">حجم صغير</Button>
          <Button size="lg">حجم كبير</Button>
          <Button size="icon">
            <svg
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
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </Button>
        </div>
      </div>
    )
  }

  // اختبار مكون Badge
  const testBadge = () => {
    return (
      <div className="flex flex-wrap gap-4">
        <Badge>أساسي</Badge>
        <Badge variant="secondary">ثانوي</Badge>
        <Badge variant="outline">محيط</Badge>
        <Badge variant="destructive">حذف</Badge>
      </div>
    )
  }

  // اختبار مكونات أساسية
  const testBasicComponents = () => {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">اختبار مكون Card</h3>
          {testCard()}
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">اختبار مكون Button</h3>
          {testButton()}
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">اختبار مكون Badge</h3>
          {testBadge()}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">اختبار مكونات واجهة المستخدم</h1>

      <div className="flex flex-wrap gap-4 mb-8">
        <Button variant={componentToTest === "none" ? "default" : "outline"} onClick={() => setComponentToTest("none")}>
          الصفحة الرئيسية
        </Button>
        <Button
          variant={componentToTest === "basic" ? "default" : "outline"}
          onClick={() => setComponentToTest("basic")}
        >
          المكونات الأساسية
        </Button>
        <Button variant={componentToTest === "card" ? "default" : "outline"} onClick={() => setComponentToTest("card")}>
          مكون Card
        </Button>
        <Button
          variant={componentToTest === "button" ? "default" : "outline"}
          onClick={() => setComponentToTest("button")}
        >
          مكون Button
        </Button>
        <Button
          variant={componentToTest === "badge" ? "default" : "outline"}
          onClick={() => setComponentToTest("badge")}
        >
          مكون Badge
        </Button>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        {componentToTest === "none" && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">مرحباً بك في صفحة اختبار المكونات</h2>
            <p className="text-muted-foreground mb-6">
              اختر أحد المكونات من الأزرار أعلاه لاختباره والتحقق من عمله بشكل صحيح.
            </p>
            <Button onClick={() => setComponentToTest("basic")}>بدء الاختبار</Button>
          </div>
        )}
        {componentToTest === "basic" && testBasicComponents()}
        {componentToTest === "card" && testCard()}
        {componentToTest === "button" && testButton()}
        {componentToTest === "badge" && testBadge()}
      </div>
    </div>
  )
}
