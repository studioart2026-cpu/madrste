"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileDown, Printer, Search } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { fetchReportData } from "@/lib/school-api"
import { ALL_SUBJECTS, buildReportProfiles, type StudentReportProfile } from "@/lib/school-data"

type StudentProfile = StudentReportProfile

const studentProfiles: StudentProfile[] = [
  {
    id: "1",
    name: "سارة أحمد",
    className: "الصف الأول",
    term: "الترم الأول",
    grades: [
      { subject: "الرياضيات", score: 85 },
      { subject: "العلوم", score: 92 },
      { subject: "اللغة العربية", score: 78 },
    ],
    attendance: [
      { date: "2026-02-24", status: "حاضر" },
      { date: "2026-02-25", status: "حاضر" },
      { date: "2026-02-26", status: "متأخر" },
      { date: "2026-02-27", status: "غائب" },
      { date: "2026-02-28", status: "حاضر" },
    ],
  },
  {
    id: "2",
    name: "نورة محمد",
    className: "الصف الأول",
    term: "الترم الثاني",
    grades: [
      { subject: "الرياضيات", score: 90 },
      { subject: "العلوم", score: 88 },
      { subject: "اللغة العربية", score: 95 },
    ],
    attendance: [
      { date: "2026-02-24", status: "حاضر" },
      { date: "2026-02-25", status: "حاضر" },
      { date: "2026-02-26", status: "حاضر" },
      { date: "2026-02-27", status: "حاضر" },
      { date: "2026-02-28", status: "متأخر" },
    ],
  },
  {
    id: "3",
    name: "فاطمة علي",
    className: "الصف الثاني",
    term: "الترم الأول",
    grades: [
      { subject: "الرياضيات", score: 75 },
      { subject: "العلوم", score: 82 },
      { subject: "اللغة العربية", score: 88 },
    ],
    attendance: [
      { date: "2026-02-24", status: "حاضر" },
      { date: "2026-02-25", status: "غائب" },
      { date: "2026-02-26", status: "حاضر" },
      { date: "2026-02-27", status: "متأخر" },
      { date: "2026-02-28", status: "حاضر" },
    ],
  },
]

const studentEmailToName: Record<string, string> = {
  "student@example.com": "سارة أحمد",
  "student2@example.com": "نورة محمد",
}

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim()

function getStatusVariant(status: "حاضر" | "غائب" | "متأخر"): "default" | "destructive" | "outline" {
  if (status === "غائب") return "destructive"
  if (status === "متأخر") return "outline"
  return "default"
}

export default function ReportsPage() {
  const { userType, email, userName } = useAuth()
  const { toast } = useToast()
  const isStudent = userType === "student"
  const reportRef = useRef<HTMLDivElement | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState<"الترم الأول" | "الترم الثاني">("الترم الأول")
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [reportProfiles, setReportProfiles] = useState<StudentProfile[]>(studentProfiles)

  const inferredStudentName = (email && studentEmailToName[email]) || userName || ""
  const normalizedAccountStudentName = normalizeText(inferredStudentName)

  useEffect(() => {
    let isActive = true

    void (async () => {
      try {
        const response = await fetchReportData()
        if (!isActive) return

        const builtProfiles = buildReportProfiles({
          students: response.students,
          gradeStudents: response.gradeStudents,
          attendanceRecords: response.attendanceRecords,
        })

        if (builtProfiles.length > 0) {
          setReportProfiles(builtProfiles)
          return
        }
      } catch (error) {
        if (!isActive) return
        toast({
          title: "تعذر تحميل التقارير",
          description: error instanceof Error ? error.message : "تم استخدام البيانات الحالية مؤقتًا",
          variant: "destructive",
        })
      }

      if (isActive) {
        setReportProfiles(studentProfiles)
      }
    })()

    return () => {
      isActive = false
    }
  }, [email, inferredStudentName, isStudent, normalizedAccountStudentName])

  const accountStudentProfiles = useMemo(() => {
    if (!isStudent || !normalizedAccountStudentName) return []
    return reportProfiles.filter((student) => normalizeText(student.name) === normalizedAccountStudentName)
  }, [isStudent, normalizedAccountStudentName, reportProfiles])

  const defaultStudent = useMemo(() => {
    const fallbackName = inferredStudentName || "حساب الطالبة"

    if (isStudent) {
      return (
        accountStudentProfiles.find((student) => student.term === selectedTerm) ||
        accountStudentProfiles[0] || {
          id: email || `current-student-${normalizeText(fallbackName) || "student"}`,
          name: fallbackName,
          className: "الصف الأول",
          term: selectedTerm,
          grades: [],
          attendance: [],
        }
      )
    }

    return reportProfiles.find((student) => student.term === selectedTerm) || reportProfiles[0]
  }, [accountStudentProfiles, email, inferredStudentName, isStudent, reportProfiles, selectedTerm])

  const visibleStudents = useMemo(() => {
    const byTerm = reportProfiles.filter((s) => s.term === selectedTerm)
    if (isStudent) {
      const scoped = byTerm.filter((s) => s.id === defaultStudent.id)
      return scoped.length > 0 ? scoped : [defaultStudent]
    }
    if (byTerm.length === 0) return reportProfiles
    return byTerm
  }, [isStudent, defaultStudent.id, selectedTerm, reportProfiles])

  const allSelectableStudents = useMemo(() => {
    if (isStudent) return [defaultStudent]
    const unique = new Map<string, StudentProfile>()
    reportProfiles.forEach((student) => {
      if (!unique.has(student.id)) unique.set(student.id, student)
    })
    return Array.from(unique.values())
  }, [isStudent, defaultStudent, reportProfiles])

  useEffect(() => {
    if (isStudent) {
      if (selectedStudentId !== defaultStudent.id) {
        setSelectedStudentId(defaultStudent.id)
      }
      return
    }

    const hasSelected = allSelectableStudents.some((student) => student.id === selectedStudentId)
    if (!hasSelected && allSelectableStudents.length > 0) {
      setSelectedStudentId(allSelectableStudents[0].id)
    }
  }, [allSelectableStudents, defaultStudent.id, isStudent, selectedStudentId])

  const selectedStudent = useMemo(() => {
    if (isStudent) return visibleStudents[0] || defaultStudent
    const selectedInTerm = reportProfiles.find((s) => s.id === selectedStudentId && s.term === selectedTerm)
    return selectedInTerm || allSelectableStudents.find((s) => s.id === selectedStudentId) || defaultStudent
  }, [isStudent, selectedStudentId, visibleStudents, selectedTerm, allSelectableStudents, defaultStudent, reportProfiles])

  const searchedStudents = useMemo(() => {
    const query = normalizeText(studentSearchQuery)
    if (!query) return allSelectableStudents
    return allSelectableStudents.filter((student) => normalizeText(student.name).includes(query))
  }, [allSelectableStudents, studentSearchQuery])

  const handleStudentSearch = () => {
    const query = normalizeText(studentSearchQuery)

    if (!query) {
      if (allSelectableStudents.length > 0) {
        setSelectedStudentId(allSelectableStudents[0].id)
      }
      return
    }

    if (searchedStudents.length === 0) {
      toast({
        title: "لا توجد نتائج",
        description: "لم يتم العثور على طالبة بهذا الاسم.",
        variant: "destructive",
      })
      return
    }

    setSelectedStudentId(searchedStudents[0].id)
  }

  const termFilteredAttendance = selectedStudent.attendance
  const total = termFilteredAttendance.length
  const present = termFilteredAttendance.filter((a) => a.status === "حاضر").length
  const absent = termFilteredAttendance.filter((a) => a.status === "غائب").length
  const late = termFilteredAttendance.filter((a) => a.status === "متأخر").length

  const averageGrade =
    selectedStudent.grades.length > 0
      ? selectedStudent.grades.reduce((sum, g) => sum + g.score, 0) / selectedStudent.grades.length
      : 0

  const attendanceRate = total > 0 ? (present / total) * 100 : 0

  const getSafeStudentFileName = () => {
    const cleaned = selectedStudent.name.replace(/[\\/:*?"<>|]/g, "-").trim()
    return cleaned || "تقرير-طالبة"
  }

  const printReport = () => {
    if (!reportRef.current) return

    const printWindow = window.open("", "_blank", "width=1024,height=1400")
    if (!printWindow) {
      toast({
        title: "تعذر الطباعة",
        description: "يرجى السماح بفتح نافذة الطباعة من المتصفح.",
        variant: "destructive",
      })
      return
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join("")

    const content = reportRef.current.innerHTML
    const title = selectedStudent.name

    printWindow.document.open()
    printWindow.document.write(`
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${title}</title>
          ${styles}
          <style>
            body { direction: rtl; margin: 16px; background: #fff; }
            .print\\:hidden, .no-print { display: none !important; }
          </style>
        </head>
        <body>
          ${content}
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

  const exportPdf = async () => {
    if (!reportRef.current || isExporting) return

    try {
      setIsExporting(true)
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")])

      const canvas = await html2canvas(reportRef.current, {
        scale: Math.min(window.devicePixelRatio || 2, 3),
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight,
      })
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 8
      const printableWidth = pageWidth - margin * 2
      const printableHeight = pageHeight - margin * 2
      const pxPerMm = canvas.width / printableWidth
      const pageHeightPx = Math.floor(printableHeight * pxPerMm)

      let renderedHeightPx = 0
      let pageIndex = 0

      while (renderedHeightPx < canvas.height) {
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedHeightPx)
        const pageCanvas = document.createElement("canvas")
        pageCanvas.width = canvas.width
        pageCanvas.height = sliceHeightPx

        const pageContext = pageCanvas.getContext("2d")
        if (!pageContext) throw new Error("Failed to create page canvas context")

        pageContext.fillStyle = "#ffffff"
        pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
        pageContext.drawImage(
          canvas,
          0,
          renderedHeightPx,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          canvas.width,
          sliceHeightPx,
        )

        const sliceHeightMm = sliceHeightPx / pxPerMm
        const image = pageCanvas.toDataURL("image/png", 1)

        if (pageIndex > 0) {
          pdf.addPage()
        }
        pdf.addImage(image, "PNG", margin, margin, printableWidth, sliceHeightMm, undefined, "FAST")

        renderedHeightPx += sliceHeightPx
        pageIndex += 1
      }

      pdf.save(`${getSafeStudentFileName()}.pdf`)
    } catch (error) {
      console.error("PDF export failed:", error)
      toast({
        title: "تعذر التصدير",
        description: "حدث خطأ أثناء إنشاء ملف PDF. جربي مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div ref={reportRef} className="space-y-6 print:space-y-3 print:text-black" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:gap-2">
        <div>
          <h1 className="text-3xl font-bold print:text-2xl">{selectedStudent.name}</h1>
          <p className="text-muted-foreground mt-1 print:text-black">
            تقرير متكامل عن حالة الطالبة (درجات + حضور + غياب + تأخر)
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" onClick={exportPdf} disabled={isExporting}>
            <FileDown className="ml-2 h-4 w-4" />
            {isExporting ? "جاري التصدير..." : "تصدير PDF"}
          </Button>
          <Button variant="outline" onClick={printReport}>
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
        </div>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>خيارات التقرير</CardTitle>
          <CardDescription>الترمين المعتمدان: الترم الأول والترم الثاني</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm mb-2 block">الترم</label>
            <Select value={selectedTerm} onValueChange={(v) => setSelectedTerm(v as "الترم الأول" | "الترم الثاني")}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الترم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="الترم الأول">الترم الأول</SelectItem>
                <SelectItem value="الترم الثاني">الترم الثاني</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isStudent && (
            <>
              <div>
                <label className="text-sm mb-2 block">بحث بالاسم</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="اكتب اسم الطالبة"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleStudentSearch()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleStudentSearch}>
                    <Search className="ml-2 h-4 w-4" />
                    بحث
                  </Button>
                </div>
              </div>
              <div>
              <label className="text-sm mb-2 block">الطالبة</label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الطالبة" />
                </SelectTrigger>
                <SelectContent>
                  {searchedStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - {student.className}
                    </SelectItem>
                  ))}
                  {searchedStudents.length === 0 && (
                    <div className="px-2 py-2 text-sm text-muted-foreground">لا توجد طالبة بهذا الاسم</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">الطالبة</p>
            <p className="text-xl font-bold mt-1">{selectedStudent.name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">متوسط الدرجات</p>
            <p className="text-xl font-bold mt-1">{averageGrade.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">نسبة الحضور</p>
            <p className="text-xl font-bold mt-1">{attendanceRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">الغياب / التأخر</p>
            <p className="text-xl font-bold mt-1">
              {absent} / {late}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle>تقرير الدرجات - {selectedTerm}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المادة</TableHead>
                <TableHead className="text-right">الدرجة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ALL_SUBJECTS.map((subject) => {
                const grade = selectedStudent.grades.find((g) => g.subject === subject)
                return (
                  <TableRow key={subject}>
                    <TableCell>{subject}</TableCell>
                    <TableCell>{grade ? grade.score : "-"}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle>تقرير الحضور والغياب والتأخر - {selectedTerm}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {termFilteredAttendance.map((item, idx) => (
                <TableRow key={`${item.date}-${idx}`}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
