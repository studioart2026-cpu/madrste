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
import { Clock, Filter, Printer, RefreshCw, Save, Search, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { fetchScheduleData as fetchScheduleSnapshot, saveScheduleData as saveScheduleSnapshot } from "@/lib/school-api"
import {
  defaultPeriodSlots,
  defaultScheduleData,
  scheduleClasses as classes,
  scheduleSubjects as subjects,
  scheduleTeachers as teachers,
  type DaySchedule,
  type PeriodSlot,
} from "@/lib/school-data"

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
  const [isSyncing, setIsSyncing] = useState(false)

  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [addEventDay, setAddEventDay] = useState("الأحد")
  const [addEventPeriod, setAddEventPeriod] = useState("1")
  const [addEventSubject, setAddEventSubject] = useState("")
  const [addEventTeacher, setAddEventTeacher] = useState("")
  const [addEventRoom, setAddEventRoom] = useState("")
  const [isTestLessonDialogOpen, setIsTestLessonDialogOpen] = useState(false)
  const [testLessonDay, setTestLessonDay] = useState("الأحد")
  const [testLessonPeriod, setTestLessonPeriod] = useState("1")

  // حالات مربع حوار تعديل حصة
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [editEventDay, setEditEventDay] = useState(0)
  const [editEventPeriod, setEditEventPeriod] = useState(0)
  const [editEventSubject, setEditEventSubject] = useState("")
  const [editEventTeacher, setEditEventTeacher] = useState("")
  const [editEventRoom, setEditEventRoom] = useState("")
  const printableScheduleRef = useRef<HTMLDivElement | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [highlightedSlot, setHighlightedSlot] = useState<{ dayIndex: number; periodIndex: number } | null>(null)

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

  useEffect(() => {
    let isActive = true

    void (async () => {
      try {
        const response = await fetchScheduleSnapshot()
        if (!isActive) return
        setScheduleData(response.scheduleData)
        setPeriodSlots(response.periodSlots)
      } catch (error) {
        if (!isActive) return
        toast({
          title: "تعذر تحميل الجدول",
          description: error instanceof Error ? error.message : "تم استخدام الجدول الافتراضي مؤقتًا",
          variant: "destructive",
        })
      }
    })()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
    }
  }, [])

  const markSlotAsHighlighted = (dayIndex: number, periodIndex: number) => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current)
    }

    setHighlightedSlot({ dayIndex, periodIndex })
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedSlot(null)
      highlightTimeoutRef.current = null
    }, 4000)
  }

  const persistSchedule = async (nextSchedule: DaySchedule[], nextPeriodSlots = periodSlots) => {
    const previousSchedule = scheduleData
    const previousPeriodSlots = periodSlots
    setIsSyncing(true)

    try {
      const response = await saveScheduleSnapshot(nextSchedule, nextPeriodSlots)
      setScheduleData(response.scheduleData)
      setPeriodSlots(response.periodSlots)
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الجدول بنجاح",
      })
      return true
    } catch (error) {
      setScheduleData(previousSchedule)
      setPeriodSlots(previousPeriodSlots)
      toast({
        title: "تعذر حفظ الجدول",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ الجدول",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSyncing(false)
    }
  }

  const applyPeriodTimes = async () => {
    const updatedSchedule = scheduleData.map((day) => ({
      ...day,
      periods: day.periods.map((period) => {
        const slot = periodSlots.find((s) => s.id === period.id)
        if (!slot) return period
        return { ...period, time: `${slot.start} - ${slot.end}` }
      }),
    }))

    setScheduleData(updatedSchedule)
    const saved = await persistSchedule(updatedSchedule, periodSlots)
    if (!saved) return
    toast({
      title: "تم تحديث الأوقات",
      description: "تم تطبيق أوقات الحصص الجديدة بنجاح",
    })
  }

  const openAddLessonDialog = () => {
    resetAddEventFields()
    setIsAddEventOpen(true)
  }

  const openTestLessonDialog = () => {
    setTestLessonDay(scheduleData[0]?.day || "الأحد")
    setTestLessonPeriod(String(periodSlots[0]?.id || 1))
    setIsTestLessonDialogOpen(true)
  }

  // وظيفة إضافة حصة جديدة
  const handleAddEvent = async () => {
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

    setScheduleData(updatedSchedule)
    const saved = await persistSchedule(updatedSchedule)
    if (!saved) return

    // إغلاق مربع الحوار وإعادة تعيين الحقول
    setIsAddEventOpen(false)
    resetAddEventFields()

    toast({
      title: "تمت الإضافة",
      description: `تمت إضافة حصة ${addEventSubject} بنجاح`,
    })
  }

  // وظيفة تعديل حصة
  const handleEditEvent = async () => {
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

    setScheduleData(updatedSchedule)
    const saved = await persistSchedule(updatedSchedule)
    if (!saved) return

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
  const saveFullSchedule = async () => {
    await persistSchedule(scheduleData)
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
  const addTestLesson = async () => {
    const periodId = Number.parseInt(testLessonPeriod, 10)
    const dayIndex = scheduleData.findIndex((day) => day.day === testLessonDay)

    if (dayIndex === -1) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على اليوم المحدد",
        variant: "destructive",
      })
      return
    }

    const periodIndex = scheduleData[dayIndex].periods.findIndex((period) => period.id === periodId)
    if (periodIndex === -1) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على الحصة المحددة",
        variant: "destructive",
      })
      return
    }

    const targetSlot = scheduleData[dayIndex].periods[periodIndex]
    if (targetSlot.subject === "استراحة") {
      toast({
        title: "خطأ",
        description: "لا يمكن إضافة حصة اختبارية في وقت الاستراحة",
        variant: "destructive",
      })
      return
    }

    const selectedTeacherName =
      selectedTeacher !== "all"
        ? teachers.find((teacher) => teacher.id === selectedTeacher)?.name || teachers[0].name
        : ""
    const teacherName = selectedTeacherName || targetSlot.teacher || teachers[0].name
    const roomName = targetSlot.room || "T-01"
    const replacedSubject = targetSlot.subject

    const updatedSchedule = [...scheduleData]
    updatedSchedule[dayIndex].periods[periodIndex] = {
      ...updatedSchedule[dayIndex].periods[periodIndex],
      subject: "حصة اختبارية",
      teacher: teacherName,
      room: roomName,
    }

    setScheduleData(updatedSchedule)
    const saved = await persistSchedule(updatedSchedule)
    if (!saved) return

    markSlotAsHighlighted(dayIndex, periodIndex)
    setIsTestLessonDialogOpen(false)

    toast({
      title: "تمت الإضافة",
      description:
        replacedSubject && replacedSubject !== "حصة اختبارية"
          ? `تم استبدال ${replacedSubject} بحصة اختبارية في ${scheduleData[dayIndex].day} - ${targetSlot.time}`
          : `تمت إضافة حصة اختبارية في ${scheduleData[dayIndex].day} - ${targetSlot.time}`,
    })
  }

  const refreshSchedule = () => {
    void (async () => {
      setIsSyncing(true)
      try {
        const response = await fetchScheduleSnapshot()
        setScheduleData(response.scheduleData)
        setPeriodSlots(response.periodSlots)
        toast({
          title: "تم تحديث الجدول",
          description: "تم تحميل أحدث نسخة من الجدول الدراسي",
        })
      } catch (error) {
        toast({
          title: "تعذر تحديث الجدول",
          description: error instanceof Error ? error.message : "حدث خطأ أثناء تحميل الجدول",
          variant: "destructive",
        })
      } finally {
        setIsSyncing(false)
      }
    })()
  }

  const selectedTestLessonSlot =
    scheduleData.find((day) => day.day === testLessonDay)?.periods.find((period) => period.id === Number.parseInt(testLessonPeriod, 10)) ||
    null

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
          <Button variant="outline" className="flex items-center gap-2" onClick={refreshSchedule} disabled={isSyncing}>
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
          {!isStudent && (
            <>
              <Button variant="outline" className="flex items-center gap-2" onClick={saveFullSchedule} disabled={isSyncing}>
                <Save className="h-4 w-4" />
                حفظ الجدول
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={openTestLessonDialog} disabled={isSyncing}>
                <Plus className="h-4 w-4" />
                إضافة حصة اختبارية
              </Button>
              <Button
                className="flex items-center gap-2 bg-[#0a8a74] hover:bg-[#097a67]"
                onClick={openAddLessonDialog}
                disabled={isSyncing}
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
                            className={`text-slate-900 transition-all ${
                              highlightedSlot?.dayIndex === dayIndex && highlightedSlot?.periodIndex === periodIndex
                                ? "ring-2 ring-emerald-600 ring-inset shadow-[0_0_0_2px_rgba(5,150,105,0.2)]"
                                : ""
                            }`}
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
                      <div
                        key={period.id}
                        className={`p-3 transition-all ${
                          period.subject === "استراحة" ? "bg-gray-100" : ""
                        } ${
                          highlightedSlot?.dayIndex === dayIndex && highlightedSlot?.periodIndex === periodIndex
                            ? "ring-2 ring-emerald-600 ring-inset bg-emerald-50"
                            : ""
                        }`}
                      >
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

      {!isStudent && <Dialog open={isTestLessonDialogOpen} onOpenChange={setIsTestLessonDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة حصة اختبارية</DialogTitle>
            <DialogDescription>اختر اليوم والحصة من القائمة ليتم وضع الحصة الاختبارية في المكان الذي تحدده.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="test-day" className="text-right">
                اليوم
              </Label>
              <Select value={testLessonDay} onValueChange={setTestLessonDay}>
                <SelectTrigger id="test-day" className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="test-period" className="text-right">
                الحصة
              </Label>
              <Select value={testLessonPeriod} onValueChange={setTestLessonPeriod}>
                <SelectTrigger id="test-period" className="col-span-3">
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
            {selectedTestLessonSlot && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <p className="font-medium text-slate-900">معاينة الحصة</p>
                <p>الوقت: {selectedTestLessonSlot.time}</p>
                <p>المادة الحالية: {selectedTestLessonSlot.subject || "فارغة"}</p>
                <p>المعلم: {selectedTestLessonSlot.teacher || "غير محدد"}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsTestLessonDialogOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" onClick={addTestLesson} className="bg-[#0a8a74] hover:bg-[#097a67]">
              إضافة الحصة الاختبارية
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>}

      {!isStudent && <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة حصة جديدة</DialogTitle>
            <DialogDescription>أدخل بيانات الحصة ثم اضغط إضافة.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-day" className="text-right">
                اليوم
              </Label>
              <Select value={addEventDay} onValueChange={setAddEventDay}>
                <SelectTrigger id="add-day" className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-period" className="text-right">
                الحصة
              </Label>
              <Select value={addEventPeriod} onValueChange={setAddEventPeriod}>
                <SelectTrigger id="add-period" className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-subject" className="text-right">
                المادة
              </Label>
              <Select value={addEventSubject} onValueChange={setAddEventSubject}>
                <SelectTrigger id="add-subject" className="col-span-3">
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
              <Label htmlFor="add-teacher" className="text-right">
                المعلم
              </Label>
              <Select value={addEventTeacher} onValueChange={setAddEventTeacher}>
                <SelectTrigger id="add-teacher" className="col-span-3">
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
              <Label htmlFor="add-room" className="text-right">
                القاعة
              </Label>
              <Input
                id="add-room"
                value={addEventRoom}
                onChange={(e) => setAddEventRoom(e.target.value)}
                className="col-span-3"
                placeholder="رقم القاعة"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddEvent} className="bg-[#0a8a74] hover:bg-[#097a67]">
              إضافة الحصة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>}

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
