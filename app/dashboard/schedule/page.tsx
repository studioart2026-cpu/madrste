"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
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
import { Clock, Plus, Printer, RefreshCw, Save, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import {
  fetchScheduleData as fetchScheduleSnapshot,
  fetchStudents as fetchStudentsData,
  saveScheduleData as saveScheduleSnapshot,
} from "@/lib/school-api"
import {
  defaultPeriodSlots,
  defaultScheduleData,
  scheduleClasses,
  scheduleSubjects as subjects,
  type ClassScheduleMap,
  type DaySchedule,
  type PeriodSlot,
} from "@/lib/school-data"

type TeacherOption = {
  id: string
  name: string
}

const fallbackClassNames = scheduleClasses.map((entry) => entry.name)
const fallbackTeacherOptions: TeacherOption[] = Array.from(
  new Set(
    defaultScheduleData.flatMap((day) =>
      day.periods.map((period) => String(period.teacher || "").trim()).filter(Boolean),
    ),
  ),
).map((teacherName, index) => ({
  id: `fallback-teacher-${index + 1}`,
  name: teacherName,
}))

const cloneScheduleData = (scheduleData: DaySchedule[]) =>
  scheduleData.map((day) => ({
    ...day,
    periods: day.periods.map((period) => ({ ...period })),
  }))

const buildDefaultClassSchedules = (classNames: string[]) =>
  Object.fromEntries(classNames.map((className) => [className, cloneScheduleData(defaultScheduleData)])) as ClassScheduleMap

const applyPeriodTimesToSchedule = (scheduleData: DaySchedule[], periodSlots: PeriodSlot[]) =>
  scheduleData.map((day) => ({
    ...day,
    periods: day.periods.map((period) => {
      const slot = periodSlots.find((entry) => entry.id === period.id)
      if (!slot || period.subject === "استراحة") {
        return { ...period }
      }

      return {
        ...period,
        time: `${slot.start} - ${slot.end}`,
      }
    }),
  }))

const getPeriodHeaderLabel = (period: DaySchedule["periods"][number], periodSlots: PeriodSlot[]) => {
  if (period.subject === "استراحة" || period.id === 4) {
    return "استراحة"
  }

  const slot = periodSlots.find((entry) => entry.id === period.id)
  return slot ? `الحصة ${slot.name}` : `الحصة ${period.id}`
}

const normalizeSearchTerm = (value: string) => value.trim().toLowerCase()
const normalizeLookupText = (value: string) => value.replace(/\s+/g, " ").trim().toLowerCase()

const filterScheduleData = (scheduleData: DaySchedule[], selectedTeacher: string, searchTerm: string) => {
  const normalizedSearchTerm = normalizeSearchTerm(searchTerm)

  return scheduleData.map((day) => ({
    ...day,
    periods: day.periods.map((period) => {
      if (period.subject === "استراحة") {
        return { ...period }
      }

      const matchesTeacher = selectedTeacher === "all" || period.teacher === selectedTeacher
      const matchesSearch =
        !normalizedSearchTerm ||
        [period.subject, period.teacher, period.room].some((value) => value.toLowerCase().includes(normalizedSearchTerm))

      if (matchesTeacher && matchesSearch) {
        return { ...period }
      }

      return {
        ...period,
        subject: "",
        teacher: "",
        room: "",
      }
    }),
  }))
}

export default function SchedulePage() {
  const { toast } = useToast()
  const { userType, userName } = useAuth()
  const isStudent = userType === "student"

  const [selectedClass, setSelectedClass] = useState(fallbackClassNames[0] || "")
  const [selectedTeacher, setSelectedTeacher] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [classNames, setClassNames] = useState<string[]>(fallbackClassNames)
  const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>(fallbackTeacherOptions)
  const [classSchedules, setClassSchedules] = useState<ClassScheduleMap>(() => buildDefaultClassSchedules(fallbackClassNames))
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
      backgroundColor: getSubjectColor(subject || "فارغ"),
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
    }) as CSSProperties

  useEffect(() => {
    let isActive = true

    void (async () => {
      try {
        const [scheduleResponse, studentsResponse] = await Promise.all([
          fetchScheduleSnapshot(),
          isStudent ? fetchStudentsData().catch(() => ({ students: [] })) : Promise.resolve({ students: [] }),
        ])
        if (!isActive) return

        const matchedStudent = studentsResponse.students.find(
          (student) => normalizeLookupText(student.name) === normalizeLookupText(userName || ""),
        )
        const resolvedStudentClass = matchedStudent?.classroom || ""
        const nextClassNames = scheduleResponse.classNames.length > 0 ? scheduleResponse.classNames : fallbackClassNames
        const nextTeacherOptions = Array.isArray(scheduleResponse.teacherOptions)
          ? scheduleResponse.teacherOptions
          : fallbackTeacherOptions
        const nextClassSchedules =
          Object.keys(scheduleResponse.classSchedules || {}).length > 0
            ? scheduleResponse.classSchedules
            : buildDefaultClassSchedules(nextClassNames)

        setClassNames(nextClassNames)
        setTeacherOptions(nextTeacherOptions)
        setClassSchedules(nextClassSchedules)
        setPeriodSlots(scheduleResponse.periodSlots)
        setSelectedTeacher((current) =>
          current === "all" || nextTeacherOptions.some((teacher) => teacher.name === current) ? current : "all",
        )
        setSelectedClass((current) => {
          const preferredClass =
            isStudent && resolvedStudentClass && nextClassNames.includes(resolvedStudentClass)
              ? resolvedStudentClass
              : current && nextClassNames.includes(current)
                ? current
                : nextClassNames[0] || fallbackClassNames[0] || ""

          return preferredClass
        })
      } catch (error) {
        if (!isActive) return
        setClassNames(fallbackClassNames)
        setTeacherOptions(fallbackTeacherOptions)
        setClassSchedules(buildDefaultClassSchedules(fallbackClassNames))
        setPeriodSlots(defaultPeriodSlots)
        toast({
          title: "تعذر تحميل الجدول",
          description: error instanceof Error ? error.message : "تم استخدام الجداول الافتراضية مؤقتًا",
          variant: "destructive",
        })
      }
    })()

    return () => {
      isActive = false
    }
  }, [isStudent, toast, userName])

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

  const currentSchedule = classSchedules[selectedClass] || defaultScheduleData
  const displayedSchedule = filterScheduleData(currentSchedule, selectedTeacher, searchTerm)
  const tableHeaderPeriods = currentSchedule[0]?.periods || defaultScheduleData[0]?.periods || []
  const hasActiveFilters = selectedTeacher !== "all" || normalizeSearchTerm(searchTerm).length > 0
  const hasVisibleLessons = displayedSchedule.some((day) =>
    day.periods.some((period) => period.subject && period.subject !== "استراحة"),
  )

  const persistSchedule = async (
    nextClassSchedules: ClassScheduleMap,
    nextPeriodSlots = periodSlots,
    options?: { successTitle: string; successDescription: string },
  ) => {
    const previousClassSchedules = classSchedules
    const previousPeriodSlots = periodSlots

    setClassSchedules(nextClassSchedules)
    setPeriodSlots(nextPeriodSlots)
    setIsSyncing(true)

    try {
      const response = await saveScheduleSnapshot(nextClassSchedules, nextPeriodSlots)
      const nextClassNames = response.classNames.length > 0 ? response.classNames : classNames
      const nextTeacherOptions = Array.isArray(response.teacherOptions) ? response.teacherOptions : teacherOptions
      const normalizedClassSchedules =
        Object.keys(response.classSchedules || {}).length > 0 ? response.classSchedules : nextClassSchedules

      setClassNames(nextClassNames)
      setTeacherOptions(nextTeacherOptions)
      setClassSchedules(normalizedClassSchedules)
      setPeriodSlots(response.periodSlots)
      setSelectedClass((current) => (nextClassNames.includes(current) ? current : nextClassNames[0] || current))
      setSelectedTeacher((current) =>
        current === "all" || nextTeacherOptions.some((teacher) => teacher.name === current) ? current : "all",
      )

      if (options) {
        toast({
          title: options.successTitle,
          description: options.successDescription,
        })
      }

      return true
    } catch (error) {
      setClassSchedules(previousClassSchedules)
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

  const persistSelectedClassSchedule = async (nextSchedule: DaySchedule[]) => {
    if (!selectedClass) {
      toast({
        title: "اختر فصلًا أولًا",
        description: "لا يمكن تعديل الجدول قبل تحديد الفصل المطلوب",
        variant: "destructive",
      })
      return false
    }

    const nextClassSchedules = {
      ...classSchedules,
      [selectedClass]: nextSchedule,
    }

    return persistSchedule(nextClassSchedules, periodSlots)
  }

  const applyPeriodTimes = async () => {
    const updatedClassSchedules = Object.fromEntries(
      Object.entries(classSchedules).map(([className, scheduleData]) => [
        className,
        applyPeriodTimesToSchedule(scheduleData, periodSlots),
      ]),
    ) as ClassScheduleMap

    const saved = await persistSchedule(updatedClassSchedules, periodSlots, {
      successTitle: "تم تحديث الأوقات",
      successDescription: "تم تطبيق أوقات الحصص الجديدة على جميع الفصول",
    })
    if (!saved) return
  }

  const resetAddEventFields = () => {
    setAddEventDay(currentSchedule[0]?.day || "الأحد")
    setAddEventPeriod(String(periodSlots[0]?.id || 1))
    setAddEventSubject("")
    setAddEventTeacher(selectedTeacher !== "all" ? selectedTeacher : "")
    setAddEventRoom("")
  }

  const openAddLessonDialog = () => {
    if (!selectedClass) {
      toast({
        title: "اختر فصلًا أولًا",
        description: "حدد الفصل المطلوب قبل إضافة الحصة",
        variant: "destructive",
      })
      return
    }

    resetAddEventFields()
    setIsAddEventOpen(true)
  }

  const openTestLessonDialog = () => {
    if (!selectedClass) {
      toast({
        title: "اختر فصلًا أولًا",
        description: "حدد الفصل المطلوب قبل إضافة الحصة الاختبارية",
        variant: "destructive",
      })
      return
    }

    setTestLessonDay(currentSchedule[0]?.day || "الأحد")
    setTestLessonPeriod(String(periodSlots[0]?.id || 1))
    setIsTestLessonDialogOpen(true)
  }

  const handleAddEvent = async () => {
    const periodId = Number.parseInt(addEventPeriod, 10)
    const nextSchedule = cloneScheduleData(currentSchedule)
    const dayIndex = nextSchedule.findIndex((day) => day.day === addEventDay)

    if (dayIndex === -1) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على اليوم المحدد",
        variant: "destructive",
      })
      return
    }

    const periodIndex = nextSchedule[dayIndex].periods.findIndex((period) => period.id === periodId)
    if (periodIndex === -1) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على الحصة المحددة",
        variant: "destructive",
      })
      return
    }

    if (!addEventSubject || !addEventTeacher || !addEventRoom) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    nextSchedule[dayIndex].periods[periodIndex] = {
      ...nextSchedule[dayIndex].periods[periodIndex],
      subject: addEventSubject,
      teacher: addEventTeacher,
      room: addEventRoom,
    }

    const saved = await persistSelectedClassSchedule(nextSchedule)
    if (!saved) return

    setIsAddEventOpen(false)
    resetAddEventFields()
    toast({
      title: "تمت الإضافة",
      description: `تمت إضافة حصة ${addEventSubject} إلى فصل ${selectedClass}`,
    })
  }

  const handleEditEvent = async () => {
    if (!editEventSubject || !editEventTeacher || !editEventRoom) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    const nextSchedule = cloneScheduleData(currentSchedule)
    nextSchedule[editEventDay].periods[editEventPeriod] = {
      ...nextSchedule[editEventDay].periods[editEventPeriod],
      subject: editEventSubject,
      teacher: editEventTeacher,
      room: editEventRoom,
    }

    const saved = await persistSelectedClassSchedule(nextSchedule)
    if (!saved) return

    setIsEditEventOpen(false)
    toast({
      title: "تم التعديل",
      description: `تم تعديل الحصة في فصل ${selectedClass} بنجاح`,
    })
  }

  const openEditDialog = (dayIndex: number, periodIndex: number) => {
    const period = currentSchedule[dayIndex].periods[periodIndex]

    setEditEventDay(dayIndex)
    setEditEventPeriod(periodIndex)
    setEditEventSubject(period.subject)
    setEditEventTeacher(period.teacher)
    setEditEventRoom(period.room)
    setIsEditEventOpen(true)
  }

  const saveFullSchedule = async () => {
    await persistSchedule(classSchedules, periodSlots, {
      successTitle: "تم الحفظ",
      successDescription: "تم حفظ جميع الجداول الدراسية بنجاح",
    })
  }

  const handlePrint = () => {
    if (!printableScheduleRef.current) return

    const printWindow = window.open("", "_blank", "width=1200,height=900")
    if (!printWindow) return

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join("")

    printWindow.document.open()
    printWindow.document.write(`
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>جدول الحصص - ${selectedClass}</title>
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
              <p>${selectedClass}${selectedTeacher !== "all" ? ` - ${selectedTeacher}` : ""}</p>
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

  const addTestLesson = async () => {
    const periodId = Number.parseInt(testLessonPeriod, 10)
    const nextSchedule = cloneScheduleData(currentSchedule)
    const dayIndex = nextSchedule.findIndex((day) => day.day === testLessonDay)

    if (dayIndex === -1) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على اليوم المحدد",
        variant: "destructive",
      })
      return
    }

    const periodIndex = nextSchedule[dayIndex].periods.findIndex((period) => period.id === periodId)
    if (periodIndex === -1) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على الحصة المحددة",
        variant: "destructive",
      })
      return
    }

    const targetSlot = nextSchedule[dayIndex].periods[periodIndex]
    if (targetSlot.subject === "استراحة") {
      toast({
        title: "خطأ",
        description: "لا يمكن إضافة حصة اختبارية في وقت الاستراحة",
        variant: "destructive",
      })
      return
    }

    const teacherName = selectedTeacher !== "all" ? selectedTeacher : targetSlot.teacher || teacherOptions[0]?.name || ""
    const roomName = targetSlot.room || "T-01"
    const replacedSubject = targetSlot.subject

    nextSchedule[dayIndex].periods[periodIndex] = {
      ...targetSlot,
      subject: "حصة اختبارية",
      teacher: teacherName,
      room: roomName,
    }

    const saved = await persistSelectedClassSchedule(nextSchedule)
    if (!saved) return

    markSlotAsHighlighted(dayIndex, periodIndex)
    setIsTestLessonDialogOpen(false)
    toast({
      title: "تمت الإضافة",
      description:
        replacedSubject && replacedSubject !== "حصة اختبارية"
          ? `تم استبدال ${replacedSubject} بحصة اختبارية في فصل ${selectedClass}`
          : `تمت إضافة حصة اختبارية إلى فصل ${selectedClass}`,
    })
  }

  const refreshSchedule = () => {
    void (async () => {
      setIsSyncing(true)
      try {
        const response = await fetchScheduleSnapshot()
        const nextClassNames = response.classNames.length > 0 ? response.classNames : fallbackClassNames
        const nextTeacherOptions = Array.isArray(response.teacherOptions) ? response.teacherOptions : fallbackTeacherOptions
        const nextClassSchedules =
          Object.keys(response.classSchedules || {}).length > 0
            ? response.classSchedules
            : buildDefaultClassSchedules(nextClassNames)

        setClassNames(nextClassNames)
        setTeacherOptions(nextTeacherOptions)
        setClassSchedules(nextClassSchedules)
        setPeriodSlots(response.periodSlots)
        setSelectedClass((current) => (nextClassNames.includes(current) ? current : nextClassNames[0] || current))
        setSelectedTeacher((current) =>
          current === "all" || nextTeacherOptions.some((teacher) => teacher.name === current) ? current : "all",
        )
        toast({
          title: "تم تحديث الجدول",
          description: "تم تحميل أحدث الجداول الدراسية",
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
    currentSchedule.find((day) => day.day === testLessonDay)?.periods.find((period) => period.id === Number.parseInt(testLessonPeriod, 10)) ||
    null

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-bold">الجدول الدراسي</h1>
          <p className="text-muted-foreground">
            {isStudent ? "عرض الجدول الدراسي الخاص بالفصل المسند للطالبة" : "إدارة الجداول الدراسية الخاصة بكل فصل"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={refreshSchedule} disabled={isSyncing}>
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handlePrint} disabled={!selectedClass}>
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
          {!isStudent && (
            <>
              <Button variant="outline" className="flex items-center gap-2" onClick={saveFullSchedule} disabled={isSyncing}>
                <Save className="h-4 w-4" />
                حفظ الكل
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

      {!isStudent && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>إعداد أوقات الحصص</CardTitle>
            <CardDescription>أوقات الحصص عامة على مستوى المدرسة، ويمكنك تطبيقها على جميع الجداول دفعة واحدة.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {periodSlots.map((slot, index) => (
                <div key={slot.id} className="space-y-2 rounded-md border p-3">
                  <p className="font-medium">الحصة {slot.name}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>من</Label>
                      <Input
                        type="time"
                        value={slot.start}
                        onChange={(event) => {
                          const nextSlots = [...periodSlots]
                          nextSlots[index] = { ...nextSlots[index], start: event.target.value }
                          setPeriodSlots(nextSlots)
                        }}
                      />
                    </div>
                    <div>
                      <Label>إلى</Label>
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={(event) => {
                          const nextSlots = [...periodSlots]
                          nextSlots[index] = { ...nextSlots[index], end: event.target.value }
                          setPeriodSlots(nextSlots)
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4 bg-[#0a8a74] hover:bg-[#097a67]" onClick={applyPeriodTimes} disabled={isSyncing}>
              تطبيق الأوقات
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>فلترة الجدول</CardTitle>
            <CardDescription>اختر الفصل المطلوب، ثم ضيّق العرض حسب المعلمة أو بالبحث داخل الجدول.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1 space-y-2">
                <Label htmlFor="class">الفصل</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isStudent}>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="اختر الفصل" />
                  </SelectTrigger>
                  <SelectContent>
                    {classNames.map((className) => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="teacher">المعلمة</Label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger id="teacher">
                    <SelectValue placeholder="اختر المعلمة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المعلمات</SelectItem>
                    {teacherOptions.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.name}>
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
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="ابحث عن مادة أو معلمة أو قاعة..."
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>التقويم</CardTitle>
            <CardDescription>عرض التاريخ الحالي بجانب الجدول</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
          </CardContent>
        </Card>
      </div>

      {!hasVisibleLessons && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          لا توجد حصص مطابقة للفلاتر الحالية داخل فصل {selectedClass || "المحدد"}.
        </div>
      )}

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="table">عرض جدول</TabsTrigger>
          <TabsTrigger value="grid">عرض شبكة</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-6">
          <div ref={printableScheduleRef}>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>جدول الحصص الأسبوعي</CardTitle>
                  <CardDescription>
                    {selectedClass || "لا يوجد فصل محدد"}
                    {selectedTeacher !== "all" && ` - ${selectedTeacher}`}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">اليوم</TableHead>
                        {tableHeaderPeriods.map((period) => (
                          <TableHead key={`header-${period.id}`}>{getPeriodHeaderLabel(period, periodSlots)}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedSchedule.map((day, dayIndex) => (
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
                              {period.subject === "استراحة" ? (
                                <div className="text-center font-medium text-muted-foreground">استراحة</div>
                              ) : period.subject ? (
                                <div className="text-xs">
                                  <div className="font-medium">{period.subject}</div>
                                  <div className="text-muted-foreground">{period.teacher}</div>
                                  <div className="text-muted-foreground">قاعة: {period.room}</div>
                                  {!isStudent && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="no-print mt-1 h-6 w-full text-xs"
                                      onClick={() => openEditDialog(dayIndex, periodIndex)}
                                    >
                                      تعديل
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <div className="py-3 text-center text-xs text-muted-foreground">
                                  {hasActiveFilters ? "لا توجد حصة مطابقة" : "لا توجد حصة"}
                                </div>
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
          </div>
        </TabsContent>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {displayedSchedule.map((day, dayIndex) => (
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
                        {period.subject === "استراحة" ? (
                          <div className="py-2 text-center font-medium">استراحة</div>
                        ) : period.subject ? (
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
                          <div className="py-2 text-center text-sm text-muted-foreground">
                            {hasActiveFilters ? "لا توجد حصة مطابقة" : "لا توجد حصة"}
                          </div>
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

      {!isStudent && (
        <Dialog open={isTestLessonDialogOpen} onOpenChange={setIsTestLessonDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة حصة اختبارية</DialogTitle>
              <DialogDescription>سيتم إضافة الحصة الاختبارية إلى الفصل المحدد حالياً: {selectedClass}</DialogDescription>
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
                    {currentSchedule.map((day) => (
                      <SelectItem key={day.id} value={day.day}>
                        {day.day}
                      </SelectItem>
                    ))}
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
                  <p>المعلمة: {selectedTestLessonSlot.teacher || "غير محددة"}</p>
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
        </Dialog>
      )}

      {!isStudent && (
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة حصة جديدة</DialogTitle>
              <DialogDescription>ستُضاف الحصة إلى جدول فصل {selectedClass}.</DialogDescription>
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
                    {currentSchedule.map((day) => (
                      <SelectItem key={day.id} value={day.day}>
                        {day.day}
                      </SelectItem>
                    ))}
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
                  المعلمة
                </Label>
                <Select value={addEventTeacher} onValueChange={setAddEventTeacher}>
                  <SelectTrigger id="add-teacher" className="col-span-3">
                    <SelectValue placeholder="اختر المعلمة" />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherOptions.map((teacher) => (
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
                  onChange={(event) => setAddEventRoom(event.target.value)}
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
        </Dialog>
      )}

      {!isStudent && (
        <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>تعديل الحصة</DialogTitle>
              <DialogDescription>سيتم حفظ التعديل داخل جدول فصل {selectedClass}.</DialogDescription>
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
                  المعلمة
                </Label>
                <Select value={editEventTeacher} onValueChange={setEditEventTeacher}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="اختر المعلمة" />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherOptions.map((teacher) => (
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
                  onChange={(event) => setEditEventRoom(event.target.value)}
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
        </Dialog>
      )}
    </div>
  )
}
