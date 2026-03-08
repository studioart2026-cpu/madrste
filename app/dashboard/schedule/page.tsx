"use client"

import { useState, useEffect, useRef, type CSSProperties } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Download, Filter, Printer, RefreshCw, Save, Search, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"

// تعريف أنواع البيانات
type Period = {
  id: number
  time: string
  subject: string
  teacher: string
  room: string
}

type DaySchedule = {
  id: number
  day: string
  periods: Period[]
}

type PeriodSlot = {
  id: number
  name: string
  start: string
  end: string
}

// بيانات الجدول الافتراضية
const defaultScheduleData: DaySchedule[] = [
  {
    id: 1,
    day: "الأحد",
    periods: [
      { id: 1, time: "08:00 - 08:45", subject: "الرياضيات", teacher: "أ. محمد أحمد", room: "101" },
      { id: 2, time: "08:50 - 09:35", subject: "اللغة العربية", teacher: "أ. سارة خالد", room: "102" },
      { id: 3, time: "09:40 - 10:25", subject: "العلوم", teacher: "أ. أحمد محمود", room: "103" },
      { id: 4, time: "10:30 - 11:15", subject: "استراحة", teacher: "", room: "" },
      { id: 5, time: "11:20 - 12:05", subject: "اللغة الإنجليزية", teacher: "أ. فاطمة علي", room: "104" },
      { id: 6, time: "12:10 - 12:55", subject: "التربية الإسلامية", teacher: "أ. عبدالله محمد", room: "105" },
      { id: 7, time: "13:00 - 13:45", subject: "الاجتماعيات", teacher: "أ. نورة سعيد", room: "106" },
    ],
  },
  {
    id: 2,
    day: "الاثنين",
    periods: [
      { id: 1, time: "08:00 - 08:45", subject: "العلوم", teacher: "أ. أحمد محمود", room: "103" },
      { id: 2, time: "08:50 - 09:35", subject: "الرياضيات", teacher: "أ. محمد أحمد", room: "101" },
      { id: 3, time: "09:40 - 10:25", subject: "اللغة الإنجليزية", teacher: "أ. فاطمة علي", room: "104" },
      { id: 4, time: "10:30 - 11:15", subject: "استراحة", teacher: "", room: "" },
      { id: 5, time: "11:20 - 12:05", subject: "اللغة العربية", teacher: "أ. سارة خالد", room: "102" },
      { id: 6, time: "12:10 - 12:55", subject: "التربية البدنية", teacher: "أ. خالد عمر", room: "ملعب" },
      { id: 7, time: "13:00 - 13:45", subject: "الحاسوب", teacher: "أ. ليلى حسن", room: "معمل 1" },
    ],
  },
  {
    id: 3,
    day: "الثلاثاء",
    periods: [
      { id: 1, time: "08:00 - 08:45", subject: "اللغة العربية", teacher: "أ. سارة خالد", room: "102" },
      { id: 2, time: "08:50 - 09:35", subject: "الاجتماعيات", teacher: "أ. نورة سعيد", room: "106" },
      { id: 3, time: "09:40 - 10:25", subject: "الرياضيات", teacher: "أ. محمد أحمد", room: "101" },
      { id: 4, time: "10:30 - 11:15", subject: "استراحة", teacher: "", room: "" },
      { id: 5, time: "11:20 - 12:05", subject: "العلوم", teacher: "أ. أحمد محمود", room: "103" },
      { id: 6, time: "12:10 - 12:55", subject: "اللغة الإنجليزية", teacher: "أ. فاطمة علي", room: "104" },
      { id: 7, time: "13:00 - 13:45", subject: "الفنية", teacher: "أ. سمية ناصر", room: "107" },
    ],
  },
  {
    id: 4,
    day: "الأربعاء",
    periods: [
      { id: 1, time: "08:00 - 08:45", subject: "التربية الإسلامية", teacher: "أ. عبدالله محمد", room: "105" },
      { id: 2, time: "08:50 - 09:35", subject: "العلوم", teacher: "أ. أحمد محمود", room: "103" },
      { id: 3, time: "09:40 - 10:25", subject: "اللغة العربية", teacher: "أ. سارة خالد", room: "102" },
      { id: 4, time: "10:30 - 11:15", subject: "استراحة", teacher: "", room: "" },
      { id: 5, time: "11:20 - 12:05", subject: "الرياضيات", teacher: "أ. محمد أحمد", room: "101" },
      { id: 6, time: "12:10 - 12:55", subject: "الحاسوب", teacher: "أ. ليلى حسن", room: "معمل 1" },
      { id: 7, time: "13:00 - 13:45", subject: "اللغة الإنجليزية", teacher: "أ. فاطمة علي", room: "104" },
    ],
  },
  {
    id: 5,
    day: "الخميس",
    periods: [
      { id: 1, time: "08:00 - 08:45", subject: "اللغة الإنجليزية", teacher: "أ. فاطمة علي", room: "104" },
      { id: 2, time: "08:50 - 09:35", subject: "الرياضيات", teacher: "أ. محمد أحمد", room: "101" },
      { id: 3, time: "09:40 - 10:25", subject: "التربية الإسلامية", teacher: "أ. عبدالله محمد", room: "105" },
      { id: 4, time: "10:30 - 11:15", subject: "استراحة", teacher: "", room: "" },
      { id: 5, time: "11:20 - 12:05", subject: "اللغة العربية", teacher: "أ. سارة خالد", room: "102" },
      { id: 6, time: "12:10 - 12:55", subject: "العلوم", teacher: "أ. أحمد محمود", room: "103" },
      { id: 7, time: "13:00 - 13:45", subject: "التربية البدنية", teacher: "أ. خالد عمر", room: "ملعب" },
    ],
  },
]

// بيانات الفصول
const classes = [
  { id: "1-1", name: "١/١" },
  { id: "1-2", name: "١/٢" },
  { id: "1-3", name: "١/٣" },
  { id: "1-4", name: "١/٤" },
  { id: "1-5", name: "١/٥" },
  { id: "2-1", name: "٢/١" },
  { id: "2-2", name: "٢/٢" },
  { id: "2-3", name: "٢/٣" },
  { id: "2-4", name: "٢/٤" },
  { id: "2-5", name: "٢/٥" },
  { id: "3-1", name: "٣/١" },
  { id: "3-2", name: "٣/٢" },
  { id: "3-3", name: "٣/٣" },
  { id: "3-4", name: "٣/٤" },
  { id: "3-5", name: "٣/٥" },
]

// بيانات المعلمين
const teachers = [
  { id: "T1", name: "أ. محمد أحمد" },
  { id: "T2", name: "أ. سارة خالد" },
  { id: "T3", name: "أ. أحمد محمود" },
  { id: "T4", name: "أ. فاطمة علي" },
  { id: "T5", name: "أ. عبدالله محمد" },
  { id: "T6", name: "أ. نورة سعيد" },
  { id: "T7", name: "أ. خالد عمر" },
  { id: "T8", name: "أ. ليلى حسن" },
  { id: "T9", name: "أ. سمية ناصر" },
]

// بيانات المواد الدراسية
const subjects = [
  "الرياضيات",
  "اللغة العربية",
  "العلوم",
  "اللغة الإنجليزية",
  "التربية الإسلامية",
  "الاجتماعيات",
  "التربية البدنية",
  "الحاسوب",
  "الفنية",
]

const defaultPeriodSlots: PeriodSlot[] = [
  { id: 1, name: "الأولى", start: "08:00", end: "08:45" },
  { id: 2, name: "الثانية", start: "08:50", end: "09:35" },
  { id: 3, name: "الثالثة", start: "09:40", end: "10:25" },
  { id: 5, name: "الرابعة", start: "11:20", end: "12:05" },
  { id: 6, name: "الخامسة", start: "12:10", end: "12:55" },
  { id: 7, name: "السادسة", start: "13:00", end: "13:45" },
]

export default function SchedulePage() {
  const { toast } = useToast()
  const { userType, email } = useAuth()
  const isStudent = userType === "student"
  const studentEmailToClass: Record<string, string> = {
    "student@example.com": "1-1",
    "student2@example.com": "1-2",
  }

  // حالات الصفحة
  const [selectedClass, setSelectedClass] = useState(studentEmailToClass[email || ""] || "1-1")
  const [selectedTeacher, setSelectedTeacher] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [scheduleData, setScheduleData] = useState<DaySchedule[]>(defaultScheduleData)
  const [periodSlots, setPeriodSlots] = useState<PeriodSlot[]>(defaultPeriodSlots)

  // حالات مربع حوار إضافة حصة
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [addEventDay, setAddEventDay] = useState("الأحد")
  const [addEventPeriod, setAddEventPeriod] = useState("1")
  const [addEventSubject, setAddEventSubject] = useState("")
  const [addEventTeacher, setAddEventTeacher] = useState("")
  const [addEventRoom, setAddEventRoom] = useState("")

  // حالات مربع حوار تعديل حصة
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [editEventDay, setEditEventDay] = useState(0)
  const [editEventPeriod, setEditEventPeriod] = useState(0)
  const [editEventSubject, setEditEventSubject] = useState("")
  const [editEventTeacher, setEditEventTeacher] = useState("")
  const [editEventRoom, setEditEventRoom] = useState("")
  const printableScheduleRef = useRef<HTMLDivElement | null>(null)

  const subjectColorMap: Record<string, string> = {
    الرياضيات: "#dbeafe",
    "اللغة العربية": "#fce7f3",
    العلوم: "#dcfce7",
    "اللغة الإنجليزية": "#fef3c7",
    "التربية الإسلامية": "#e0e7ff",
    الاجتماعيات: "#ffedd5",
    "التربية البدنية": "#dcfce7",
    الحاسوب: "#cffafe",
    الفنية: "#f3e8ff",
  }

  const fallbackColors = ["#e2e8f0", "#d1fae5", "#fef9c3", "#f3e8ff", "#ffedd5", "#dbeafe"]

  const getSubjectColor = (subject: string) => {
    if (subject === "استراحة") return "#f1f5f9"
    const known = subjectColorMap[subject]
    if (known) return known

    const hash = Array.from(subject).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    return fallbackColors[hash % fallbackColors.length]
  }

  const getPeriodCellStyle = (subject: string) =>
    ({
      backgroundColor: getSubjectColor(subject),
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
    }) as CSSProperties

  // استرجاع البيانات المحفوظة عند تحميل الصفحة
  useEffect(() => {
    const savedSchedule = localStorage.getItem("schoolSchedule")
    if (savedSchedule) {
      try {
        const parsedSchedule = JSON.parse(savedSchedule) as DaySchedule[]
        setScheduleData(parsedSchedule)

        // مزامنة أوقات الحصص من الجدول المحفوظ
        const sampleDay = parsedSchedule[0]
        if (sampleDay) {
          const syncedSlots = defaultPeriodSlots.map((slot) => {
            const p = sampleDay.periods.find((period) => period.id === slot.id)
            if (!p) return slot
            const parts = p.time.split(" - ")
            if (parts.length === 2) {
              return { ...slot, start: parts[0].trim(), end: parts[1].trim() }
            }
            return slot
          })
          setPeriodSlots(syncedSlots)
        }
      } catch (e) {
        console.error("خطأ في قراءة الجدول المحفوظ:", e)
      }
    }
  }, [])

  // حفظ الجدول في التخزين المحلي
  const saveScheduleToStorage = (schedule: DaySchedule[]) => {
    localStorage.setItem("schoolSchedule", JSON.stringify(schedule))
    toast({
      title: "تم الحفظ",
      description: "تم حفظ الجدول بنجاح",
    })
  }

  const applyPeriodTimes = () => {
    const updatedSchedule = scheduleData.map((day) => ({
      ...day,
      periods: day.periods.map((period) => {
        const slot = periodSlots.find((s) => s.id === period.id)
        if (!slot) return period
        return { ...period, time: `${slot.start} - ${slot.end}` }
      }),
    }))

    setScheduleData(updatedSchedule)
    saveScheduleToStorage(updatedSchedule)
    toast({
      title: "تم تحديث الأوقات",
      description: "تم تطبيق أوقات الحصص الجديدة بنجاح",
    })
  }

  // وظيفة إضافة حصة جديدة
  const handleAddEvent = () => {
    // تحويل رقم الحصة إلى رقم
    const periodId = Number.parseInt(addEventPeriod, 10)

    // البحث عن اليوم المحدد
    const dayIndex = scheduleData.findIndex((day) => day.day === addEventDay)
    if (dayIndex === -1) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على اليوم المحدد",
        variant: "destructive",
      })
      return
    }

    // البحث عن الحصة المحددة
    const periodIndex = scheduleData[dayIndex].periods.findIndex((period) => period.id === periodId)
    if (periodIndex === -1) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على الحصة المحددة",
        variant: "destructive",
      })
      return
    }

    // التحقق من البيانات
    if (!addEventSubject || !addEventTeacher || !addEventRoom) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    // تحديث الجدول
    const updatedSchedule = [...scheduleData]
    updatedSchedule[dayIndex].periods[periodIndex] = {
      ...updatedSchedule[dayIndex].periods[periodIndex],
      subject: addEventSubject,
      teacher: addEventTeacher,
      room: addEventRoom,
    }

    // حفظ التغييرات
    setScheduleData(updatedSchedule)
    saveScheduleToStorage(updatedSchedule)

    // إغلاق مربع الحوار وإعادة تعيين الحقول
    setIsAddEventOpen(false)
    resetAddEventFields()

    toast({
      title: "تمت الإضافة",
      description: `تمت إضافة حصة ${addEventSubject} بنجاح`,
    })
  }

  // وظيفة تعديل حصة
  const handleEditEvent = () => {
    // التحقق من البيانات
    if (!editEventSubject || !editEventTeacher || !editEventRoom) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    // تحديث الجدول
    const updatedSchedule = [...scheduleData]
    updatedSchedule[editEventDay].periods[editEventPeriod] = {
      ...updatedSchedule[editEventDay].periods[editEventPeriod],
      subject: editEventSubject,
      teacher: editEventTeacher,
      room: editEventRoom,
    }

    // حفظ التغييرات
    setScheduleData(updatedSchedule)
    saveScheduleToStorage(updatedSchedule)

    // إغلاق مربع الحوار
    setIsEditEventOpen(false)

    toast({
      title: "تم التعديل",
      description: `تم تعديل حصة ${editEventSubject} بنجاح`,
    })
  }

  // وظيفة فتح مربع حوار تعديل الحصة
  const openEditDialog = (dayIndex: number, periodIndex: number) => {
    const period = scheduleData[dayIndex].periods[periodIndex]

    setEditEventDay(dayIndex)
    setEditEventPeriod(periodIndex)
    setEditEventSubject(period.subject)
    setEditEventTeacher(period.teacher)
    setEditEventRoom(period.room)

    setIsEditEventOpen(true)
  }

  // وظيفة إعادة تعيين حقول إضافة الحصة
  const resetAddEventFields = () => {
    setAddEventDay("الأحد")
    setAddEventPeriod("1")
    setAddEventSubject("")
    setAddEventTeacher("")
    setAddEventRoom("")
  }

  // وظيفة حفظ الجدول كاملاً
  const saveFullSchedule = () => {
    saveScheduleToStorage(scheduleData)
  }

  // وظيفة طباعة الجدول
  const handlePrint = () => {
    if (!printableScheduleRef.current) return

    const printWindow = window.open("", "_blank", "width=1200,height=900")
    if (!printWindow) return

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join("")

    const className = classes.find((c) => c.id === selectedClass)?.name || "جميع الفصول"
    const teacherName = selectedTeacher !== "all" ? teachers.find((t) => t.id === selectedTeacher)?.name || "" : ""

    printWindow.document.open()
    printWindow.document.write(`
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>جدول الحصص - ${className}</title>
          ${styles}
          <style>
            @page { size: A4 landscape; margin: 10mm; }
            body { direction: rtl; margin: 0; background: #fff; }
            .print-wrapper { padding: 8px; }
            .print-heading { margin-bottom: 12px; }
            .print-heading h1 { font-size: 22px; margin: 0 0 6px 0; }
            .print-heading p { margin: 0; color: #334155; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #cbd5e1; padding: 6px; vertical-align: top; }
            th { background: #e2e8f0; }
            td, th {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            <div class="print-heading">
              <h1>جدول الحصص الأسبوعي</h1>
              <p>${className}${teacherName ? ` - ${teacherName}` : ""}</p>
            </div>
            ${printableScheduleRef.current.innerHTML}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  // وظيفة إضافة حصة اختبارية سريعة
  const addTestLesson = () => {
    // اختيار يوم وحصة عشوائية
    const randomDayIndex = Math.floor(Math.random() * scheduleData.length)
    const randomPeriodIndex = Math.floor(Math.random() * 7)

    // تجاوز فترة الاستراحة
    if (scheduleData[randomDayIndex].periods[randomPeriodIndex].subject === "استراحة") {
      toast({
        title: "تنبيه",
        description: "لا يمكن تعديل فترة الاستراحة، يرجى المحاولة مرة أخرى",
      })
      return
    }

    // اختيار مادة ومعلم وقاعة عشوائية
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
    const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)].name
    const randomRoom = `${Math.floor(Math.random() * 10) + 100}`

    // تحديث الجدول
    const updatedSchedule = [...scheduleData]
    updatedSchedule[randomDayIndex].periods[randomPeriodIndex] = {
      ...updatedSchedule[randomDayIndex].periods[randomPeriodIndex],
      subject: randomSubject,
      teacher: randomTeacher,
      room: randomRoom,
    }

    // حفظ التغييرات
    setScheduleData(updatedSchedule)
    saveScheduleToStorage(updatedSchedule)

    toast({
      title: "تمت الإضافة",
      description: `تمت إضافة حصة اختبارية (${randomSubject}) بنجاح`,
    })
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">الجدول الدراسي</h1>
          <p className="text-muted-foreground">
            {isStudent ? "عرض الجدول الدراسي الخاص بالطالبة" : "إدارة وعرض الجداول الدراسية للفصول والمعلمين"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            تصدير
          </Button>
          {!isStudent && (
            <>
              <Button variant="outline" className="flex items-center gap-2" onClick={saveFullSchedule}>
                <Save className="h-4 w-4" />
                حفظ الجدول
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={addTestLesson}>
                <Plus className="h-4 w-4" />
                إضافة حصة اختبارية
              </Button>
              <Button
                className="flex items-center gap-2 bg-[#0a8a74] hover:bg-[#097a67]"
                onClick={() => {
                  resetAddEventFields()
                  setIsAddEventOpen(true)
                }}
              >
                <Clock className="h-4 w-4" />
                إضافة حصة
              </Button>
            </>
          )}
        </div>
      </div>

      {/* نموذج إضافة حصة مبسط */}
      {!isStudent && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>إعداد أوقات الحصص</CardTitle>
            <CardDescription>يمكنك تعديل وقت كل حصة ثم الضغط على تطبيق الأوقات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {periodSlots.map((slot, index) => (
                <div key={slot.id} className="border rounded-md p-3 space-y-2">
                  <p className="font-medium">الحصة {slot.name}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>من</Label>
                      <Input
                        type="time"
                        value={slot.start}
                        onChange={(e) => {
                          const next = [...periodSlots]
                          next[index] = { ...next[index], start: e.target.value }
                          setPeriodSlots(next)
                        }}
                      />
                    </div>
                    <div>
                      <Label>إلى</Label>
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={(e) => {
                          const next = [...periodSlots]
                          next[index] = { ...next[index], end: e.target.value }
                          setPeriodSlots(next)
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4 bg-[#0a8a74] hover:bg-[#097a67]" onClick={applyPeriodTimes}>
              تطبيق الأوقات
            </Button>
          </CardContent>
        </Card>
      )}

      {!isStudent && <Card className="mb-6">
        <CardHeader>
          <CardTitle>إضافة حصة جديدة</CardTitle>
          <CardDescription>أضف حصة جديدة إلى الجدول الدراسي بشكل مباشر</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="simple-day">اليوم</Label>
              <Select value={addEventDay} onValueChange={setAddEventDay}>
                <SelectTrigger id="simple-day">
                  <SelectValue placeholder="اختر اليوم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الأحد">الأحد</SelectItem>
                  <SelectItem value="الاثنين">الاثنين</SelectItem>
                  <SelectItem value="الثلاثاء">الثلاثاء</SelectItem>
                  <SelectItem value="الأربعاء">الأربعاء</SelectItem>
                  <SelectItem value="الخميس">الخميس</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="simple-period">الحصة</Label>
              <Select value={addEventPeriod} onValueChange={setAddEventPeriod}>
                <SelectTrigger id="simple-period">
                  <SelectValue placeholder="اختر الحصة" />
                </SelectTrigger>
                <SelectContent>
                  {periodSlots.map((slot) => (
                    <SelectItem key={slot.id} value={String(slot.id)}>
                      {slot.name} ({slot.start} - {slot.end})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="simple-subject">المادة</Label>
              <Select value={addEventSubject} onValueChange={setAddEventSubject}>
                <SelectTrigger id="simple-subject">
                  <SelectValue placeholder="اختر المادة" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="simple-teacher">المعلم</Label>
              <Select value={addEventTeacher} onValueChange={setAddEventTeacher}>
                <SelectTrigger id="simple-teacher">
                  <SelectValue placeholder="اختر المعلم" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.name}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="simple-room">القاعة</Label>
              <Input
                id="simple-room"
                value={addEventRoom}
                onChange={(e) => setAddEventRoom(e.target.value)}
                placeholder="رقم القاعة"
              />
            </div>
          </div>
          <Button className="mt-4 bg-[#0a8a74] hover:bg-[#097a67]" onClick={handleAddEvent}>
            إضافة الحصة
          </Button>
        </CardContent>
      </Card>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>فلترة الجدول</CardTitle>
            <CardDescription>اختر الفصل أو المعلم لعرض الجدول الخاص به</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="class">الفصل</Label>
                <Select
                  value={selectedClass}
                  onValueChange={setSelectedClass}
                  disabled={isStudent}
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder="اختر الفصل" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="teacher">المعلم</Label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger id="teacher">
                    <SelectValue placeholder="اختر المعلم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المعلمين</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="search">بحث</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="search" placeholder="ابحث عن مادة أو قاعة..." className="pl-10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>التقويم</CardTitle>
            <CardDescription>عرض الجدول حسب التاريخ</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="table">عرض جدول</TabsTrigger>
          <TabsTrigger value="grid">عرض شبكة</TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="mt-6">
          <Card ref={printableScheduleRef}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>جدول الحصص الأسبوعي</CardTitle>
                <CardDescription>
                  {classes.find((c) => c.id === selectedClass)?.name || "جميع الفصول"}
                  {selectedTeacher !== "all" && ` - ${teachers.find((t) => t.id === selectedTeacher)?.name || ""}`}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-2 no-print">
                <Filter className="h-4 w-4" />
                فلترة متقدمة
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">اليوم</TableHead>
                      <TableHead>الحصة 1</TableHead>
                      <TableHead>الحصة 2</TableHead>
                      <TableHead>الحصة 3</TableHead>
                      <TableHead>استراحة</TableHead>
                      <TableHead>الحصة 4</TableHead>
                      <TableHead>الحصة 5</TableHead>
                      <TableHead>الحصة 6</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduleData.map((day, dayIndex) => (
                      <TableRow key={day.id}>
                        <TableCell className="font-medium">{day.day}</TableCell>
                        {day.periods.map((period, periodIndex) => (
                          <TableCell
                            key={period.id}
                            style={getPeriodCellStyle(period.subject)}
                            className="text-slate-900"
                          >
                            {period.subject !== "استراحة" ? (
                              <div className="text-xs">
                                <div className="font-medium">{period.subject}</div>
                                <div className="text-muted-foreground">{period.teacher}</div>
                                <div className="text-muted-foreground">قاعة: {period.room}</div>
                                {!isStudent && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-1 h-6 w-full text-xs no-print"
                                    onClick={() => openEditDialog(dayIndex, periodIndex)}
                                  >
                                    تعديل
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="text-center font-medium text-muted-foreground">استراحة</div>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {scheduleData.map((day, dayIndex) => (
              <Card key={day.id} className="overflow-hidden">
                <CardHeader className="bg-primary/10 py-3">
                  <CardTitle className="text-center text-lg">{day.day}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {day.periods.map((period, periodIndex) => (
                      <div key={period.id} className={`p-3 ${period.subject === "استراحة" ? "bg-gray-100" : ""}`}>
                        <div className="text-xs text-muted-foreground">{period.time}</div>
                        {period.subject !== "استراحة" ? (
                          <>
                            <div className="font-medium">{period.subject}</div>
                            <div className="text-sm text-muted-foreground">{period.teacher}</div>
                            <div className="text-xs text-muted-foreground">قاعة: {period.room}</div>
                            {!isStudent && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1 h-6 w-full text-xs"
                                onClick={() => openEditDialog(dayIndex, periodIndex)}
                              >
                                تعديل
                              </Button>
                            )}
                          </>
                        ) : (
                          <div className="font-medium text-center py-2">استراحة</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* مربع حوار تعديل الحصة */}
      {!isStudent && <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل الحصة</DialogTitle>
            <DialogDescription>قم بتعديل بيانات الحصة. اضغط حفظ عند الانتهاء.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-subject" className="text-right">
                المادة
              </Label>
              <Select value={editEventSubject} onValueChange={setEditEventSubject}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر المادة" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-teacher" className="text-right">
                المعلم
              </Label>
              <Select value={editEventTeacher} onValueChange={setEditEventTeacher}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر المعلم" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.name}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-room" className="text-right">
                القاعة
              </Label>
              <Input
                id="edit-room"
                value={editEventRoom}
                onChange={(e) => setEditEventRoom(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditEvent} className="bg-[#0a8a74] hover:bg-[#097a67]">
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>}
    </div>
  )
}
