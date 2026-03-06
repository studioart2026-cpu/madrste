"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"

interface Student {
  id: string
  name: string
  class: string
  section: string
  grades: {
    subject: string
    grade: number
    date: string
    examType: string // إضافة نوع الاختبار
  }[]
}

interface DirectoryStudent {
  id?: string
  name?: string
  grade?: string
  classroom?: string
}

interface GradeStats {
  average: number
  highest: number
  lowest: number
  passing: number
  total: number
}

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim()

const classFromLevel = (level: string): string => {
  if (["1", "١"].includes(level)) return "أول متوسط"
  if (["2", "٢"].includes(level)) return "ثاني متوسط"
  if (["3", "٣"].includes(level)) return "ثالث متوسط"
  return "أول متوسط"
}

const classFromDirectory = (grade?: string, classroom?: string, index = 0): string => {
  if (grade && grade.trim().length > 0) return normalizeClassLabel(grade, index)

  if (classroom && classroom.includes("/")) {
    const level = classroom.split("/")[0]?.trim() || ""
    return classFromLevel(level)
  }

  return "أول متوسط"
}

const sectionFromClassroom = (classroom?: string, index = 0): string => {
  if (classroom && classroom.includes("/")) {
    const section = classroom.split("/")[1]?.trim() || ""
    if (section) return `شعبة ${section}`
  }
  return normalizeSectionLabel(undefined, index)
}

const normalizeClassLabel = (className: string, index = 0): string => {
  if (className.includes("متوسط")) return className
  if (className.includes("الصف الأول")) return "أول متوسط"
  if (className.includes("الصف الثاني")) return "ثاني متوسط"
  if (className.includes("الصف الثالث")) return "ثالث متوسط"
  return className
}

const normalizeSectionLabel = (sectionName?: string, index = 0): string => {
  if (sectionName && sectionName.includes("شعبة")) return sectionName
  if (sectionName && sectionName.trim().length > 0) return `شعبة ${sectionName}`
  return `شعبة ${((index % 4) + 1).toString()}`
}

const ALL_SUBJECTS = [
  "الرياضيات",
  "العلوم",
  "اللغة العربية",
  "اللغة الإنجليزية",
  "التربية الإسلامية",
  "الاجتماعيات",
  "الحاسب",
  "التربية الفنية",
  "التربية البدنية",
]

const DEFAULT_STUDENTS: Student[] = [
  {
    id: "1",
    name: "سارة أحمد",
    class: "أول متوسط",
    section: "شعبة 1",
    grades: [
      { subject: "الرياضيات", grade: 85, date: "2023-09-15", examType: "فصلي أول" },
      { subject: "العلوم", grade: 92, date: "2023-09-16", examType: "فصلي أول" },
      { subject: "اللغة العربية", grade: 78, date: "2023-09-17", examType: "فصلي أول" },
    ],
  },
  {
    id: "2",
    name: "نورة محمد",
    class: "أول متوسط",
    section: "شعبة 2",
    grades: [
      { subject: "الرياضيات", grade: 90, date: "2023-09-15", examType: "فصلي أول" },
      { subject: "العلوم", grade: 88, date: "2023-09-16", examType: "فصلي أول" },
      { subject: "اللغة العربية", grade: 95, date: "2023-09-17", examType: "فصلي أول" },
    ],
  },
  {
    id: "3",
    name: "فاطمة علي",
    class: "ثاني متوسط",
    section: "شعبة 1",
    grades: [
      { subject: "الرياضيات", grade: 75, date: "2023-09-15", examType: "فصلي أول" },
      { subject: "العلوم", grade: 82, date: "2023-09-16", examType: "فصلي أول" },
      { subject: "اللغة العربية", grade: 88, date: "2023-09-17", examType: "فصلي أول" },
    ],
  },
  {
    id: "4",
    name: "منى خالد",
    class: "ثاني متوسط",
    section: "شعبة 2",
    grades: [
      { subject: "الرياضيات", grade: 95, date: "2023-09-15", examType: "فصلي أول" },
      { subject: "العلوم", grade: 91, date: "2023-09-16", examType: "فصلي أول" },
      { subject: "اللغة العربية", grade: 89, date: "2023-09-17", examType: "فصلي أول" },
    ],
  },
  {
    id: "5",
    name: "ليلى عبدالله",
    class: "ثالث متوسط",
    section: "شعبة 1",
    grades: [
      { subject: "الرياضيات", grade: 68, date: "2023-09-15", examType: "فصلي أول" },
      { subject: "العلوم", grade: 72, date: "2023-09-16", examType: "فصلي أول" },
      { subject: "اللغة العربية", grade: 80, date: "2023-09-17", examType: "فصلي أول" },
    ],
  },
]

export default function GradesPage() {
  const { toast } = useToast()
  const { userType, email, userName } = useAuth()
  const isStudent = userType === "student"
  const [students, setStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedSection, setSelectedSection] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [studentSearchText, setStudentSearchText] = useState("")
  const [newGrade, setNewGrade] = useState({
    studentId: "",
    subject: "",
    grade: "",
    examType: "فصلي أول", // القيمة الافتراضية لنوع الاختبار
  })

  const studentEmailToName: Record<string, string> = {
    "student@example.com": "سارة أحمد",
    "student2@example.com": "نورة محمد",
  }

  // Load students from localStorage on component mount
  useEffect(() => {
    const savedStudents = localStorage.getItem("studentsWithGrades")
    const studentsDirectory = localStorage.getItem("studentsData")
    try {
      let normalized: Student[] = []

      if (savedStudents) {
        const parsed = JSON.parse(savedStudents) as Partial<Student>[]
        normalized = (Array.isArray(parsed) ? parsed : [])
          .filter((student) => student && typeof student.id === "string" && typeof student.name === "string")
          .map((student, index) => ({
            id: student.id as string,
            name: student.name as string,
            class: normalizeClassLabel(student.class || "أول متوسط", index),
            section: normalizeSectionLabel(student.section, index),
            grades: Array.isArray(student.grades)
              ? student.grades.map((grade) => ({
                  subject: grade.subject || "الرياضيات",
                  grade: Number(grade.grade) || 0,
                  date: grade.date || new Date().toISOString().split("T")[0],
                  examType: grade.examType || "فصلي أول",
                }))
              : [],
          }))
      }

      const byId = new Map(normalized.map((student) => [student.id, student]))
      const byName = new Map(normalized.map((student) => [normalizeText(student.name), student]))

      if (studentsDirectory) {
        const parsedDirectory = JSON.parse(studentsDirectory) as DirectoryStudent[]
        if (Array.isArray(parsedDirectory)) {
          parsedDirectory.forEach((dirStudent, index) => {
            if (!dirStudent?.name) return
            const dirId = (dirStudent.id || `dir-${index + 1}`).toString()
            const dirName = normalizeText(dirStudent.name)
            const existing = byId.get(dirId) || byName.get(dirName)

            if (existing) {
              const updated: Student = {
                ...existing,
                class: classFromDirectory(dirStudent.grade, dirStudent.classroom, index),
                section: sectionFromClassroom(dirStudent.classroom, index),
              }
              byId.set(updated.id, updated)
              byName.set(normalizeText(updated.name), updated)
              return
            }

            const created: Student = {
              id: dirId,
              name: dirStudent.name,
              class: classFromDirectory(dirStudent.grade, dirStudent.classroom, index),
              section: sectionFromClassroom(dirStudent.classroom, index),
              grades: [],
            }
            byId.set(created.id, created)
            byName.set(normalizeText(created.name), created)
          })
        }
      }

      const merged = Array.from(byId.values())
      if (merged.length > 0) {
        setStudents(merged)
        localStorage.setItem("studentsWithGrades", JSON.stringify(merged))
        return
      }
    } catch {
      // fallback to defaults
    }

    setStudents(DEFAULT_STUDENTS)
    localStorage.setItem("studentsWithGrades", JSON.stringify(DEFAULT_STUDENTS))
  }, [])

  // Save students to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("studentsWithGrades", JSON.stringify(students))
  }, [students])

  const matchedStudentName = (email && studentEmailToName[email]) || userName || ""
  const studentScoped = students.filter((student) => student.name === matchedStudentName)
  const scopedStudents = isStudent ? (studentScoped.length > 0 ? studentScoped : students.slice(0, 1)) : students

  const filteredStudents = scopedStudents.filter((student) => {
    const matchesSearch = student.name.includes(searchQuery) || student.class.includes(searchQuery)

    const matchesClass = selectedClass === "all" || student.class === selectedClass
    const matchesSection = selectedSection === "all" || student.section === selectedSection

    return matchesSearch && matchesClass && matchesSection
  })

  const classesFromScope = Array.from(new Set(scopedStudents.map((student) => student.class)))
  const classes = classesFromScope.length > 0 ? classesFromScope : ["أول متوسط", "ثاني متوسط", "ثالث متوسط"]

  const sectionsFromScope = Array.from(new Set(scopedStudents.map((student) => student.section)))
  const sections = sectionsFromScope.length > 0 ? sectionsFromScope : ["شعبة 1", "شعبة 2", "شعبة 3", "شعبة 4"]

  const subjectsFromScope = Array.from(new Set(scopedStudents.flatMap((student) => student.grades.map((grade) => grade.subject))))
  const subjects = Array.from(new Set([...ALL_SUBJECTS, ...subjectsFromScope]))

  const handleAddGrade = () => {
    const normalizedInput = normalizeText(studentSearchText)
    const exactMatch = normalizedInput
      ? students.find((student) => normalizeText(student.name) === normalizedInput)
      : undefined
    const partialMatches = exactMatch
      ? []
      : normalizedInput
        ? students.filter((student) => normalizeText(student.name).includes(normalizedInput))
        : []
    const matchedStudentByText = exactMatch || (partialMatches.length === 1 ? partialMatches[0] : undefined)
    const targetStudentId = newGrade.studentId || matchedStudentByText?.id || ""

    if (!exactMatch && partialMatches.length > 1 && !newGrade.studentId) {
      toast({
        title: "الاسم غير محدد",
        description: "يوجد أكثر من طالبة بنفس التشابه، اكتبي الاسم كاملًا.",
        variant: "destructive",
      })
      return
    }

    if (!targetStudentId || !newGrade.subject || !newGrade.grade) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار/كتابة الطالبة وملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    const gradeValue = Number.parseInt(newGrade.grade)
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال درجة صحيحة بين 0 و 100",
        variant: "destructive",
      })
      return
    }

    const today = new Date()
    const formattedDate = today.toISOString().split("T")[0]

    const updatedStudents = students.map((student) => {
      if (student.id === targetStudentId) {
        return {
          ...student,
          grades: [
            ...student.grades,
            {
              subject: newGrade.subject,
              grade: gradeValue,
              date: formattedDate,
              examType: newGrade.examType, // إضافة نوع الاختبار
            },
          ],
        }
      }
      return student
    })

    setStudents(updatedStudents)
    localStorage.setItem("studentsWithGrades", JSON.stringify(updatedStudents))

    setNewGrade({
      studentId: "",
      subject: "",
      grade: "",
      examType: "فصلي أول",
    })
    setStudentSearchText("")
    setIsAddDialogOpen(false)

    const student = students.find((s) => s.id === targetStudentId)
    toast({
      title: "تم إضافة الدرجة",
      description: `تم إضافة درجة ${newGrade.subject} للطالبة ${student?.name}`,
    })
  }

  const calculateStats = (subject = "all", classFilter = "all", sectionFilter = "all"): GradeStats => {
    const grades: number[] = []

    scopedStudents.forEach((student) => {
      if ((classFilter === "all" || student.class === classFilter) && (sectionFilter === "all" || student.section === sectionFilter)) {
        student.grades.forEach((grade) => {
          if (subject === "all" || grade.subject === subject) {
            grades.push(grade.grade)
          }
        })
      }
    })

    if (grades.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        passing: 0,
        total: 0,
      }
    }

    const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length
    const highest = Math.max(...grades)
    const lowest = Math.min(...grades)
    const passing = grades.filter((grade) => grade >= 60).length

    return {
      average: Number.parseFloat(average.toFixed(2)),
      highest,
      lowest,
      passing,
      total: grades.length,
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600"
    if (grade >= 80) return "text-blue-600"
    if (grade >= 70) return "text-yellow-600"
    if (grade >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const stats = calculateStats(selectedSubject, selectedClass, selectedSection)

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">سجل الدرجات</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="بحث..."
              className="w-64 pl-8 rtl:pr-8 rtl:pl-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {!isStudent && <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                إضافة درجة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة درجة جديدة</DialogTitle>
                <DialogDescription>أدخل معلومات الدرجة الجديدة هنا. اضغط على حفظ عند الانتهاء.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="student">الطالبة</Label>
                  <Input
                    id="student"
                    list="students-list"
                    placeholder="اكتبي اسم الطالبة يدويًا"
                    value={studentSearchText}
                    onChange={(e) => {
                      const value = e.target.value
                      const normalizedValue = normalizeText(value)
                      setStudentSearchText(value)
                      const exact = students.find((student) => normalizeText(student.name) === normalizedValue)
                      if (exact) {
                        setNewGrade({ ...newGrade, studentId: exact.id })
                        return
                      }
                      const partial = students.filter((student) =>
                        normalizeText(student.name).includes(normalizedValue),
                      )
                      setNewGrade({ ...newGrade, studentId: partial.length === 1 ? partial[0].id : "" })
                    }}
                  />
                  <datalist id="students-list">
                    {students.map((student) => (
                      <option key={student.id} value={student.name}>
                        {student.name} - {student.class} - {student.section}
                      </option>
                    ))}
                  </datalist>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">المادة</Label>
                  <Select
                    value={newGrade.subject}
                    onValueChange={(value) => setNewGrade({ ...newGrade, subject: value })}
                  >
                    <SelectTrigger id="subject">
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
                <div className="grid gap-2">
                  <Label htmlFor="examType">نوع الاختبار</Label>
                  <Select
                    value={newGrade.examType}
                    onValueChange={(value) => setNewGrade({ ...newGrade, examType: value })}
                  >
                    <SelectTrigger id="examType">
                      <SelectValue placeholder="اختر نوع الاختبار" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="فصلي أول">فصلي أول</SelectItem>
                      <SelectItem value="فصلي ثاني">فصلي ثاني</SelectItem>
                      <SelectItem value="نهائي">نهائي</SelectItem>
                      <SelectItem value="شهري">شهري</SelectItem>
                      <SelectItem value="قصير">اختبار قصير</SelectItem>
                      <SelectItem value="واجب">واجب</SelectItem>
                      <SelectItem value="مشروع">مشروع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="grade">الدرجة</Label>
                  <Input
                    id="grade"
                    type="number"
                    min="0"
                    max="100"
                    value={newGrade.grade}
                    onChange={(e) => setNewGrade({ ...newGrade, grade: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddGrade}>حفظ</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">متوسط الدرجات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">أعلى درجة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.highest}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">أدنى درجة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowest}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">نسبة النجاح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.passing / stats.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <Label htmlFor="class-filter">تصفية حسب الصف</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger id="class-filter">
              <SelectValue placeholder="اختر الصف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفصول</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/3">
          <Label htmlFor="subject-filter">تصفية حسب المادة</Label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger id="subject-filter">
              <SelectValue placeholder="اختر المادة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المواد</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/3">
          <Label htmlFor="section-filter">قائمة الشعبة</Label>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger id="section-filter">
              <SelectValue placeholder="اختر الشعبة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الشعب</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section} value={section}>
                  {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="table">جدول الدرجات</TabsTrigger>
          <TabsTrigger value="students">الطالبات</TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="space-y-4">
          <div className="bg-white rounded-md shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الطالبة</TableHead>
                  <TableHead>الصف</TableHead>
                  <TableHead>الشعبة</TableHead>
                  <TableHead>المادة</TableHead>
                  <TableHead>نوع الاختبار</TableHead>
                  <TableHead>الدرجة</TableHead>
                  <TableHead>التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.flatMap((student) =>
                  student.grades
                    .filter((grade) => selectedSubject === "all" || grade.subject === selectedSubject)
                    .map((grade, index) => (
                      <TableRow key={`${student.id}-${index}`}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell>{student.section}</TableCell>
                        <TableCell>{grade.subject}</TableCell>
                        <TableCell>{grade.examType}</TableCell>
                        <TableCell className={getGradeColor(grade.grade)}>{grade.grade}%</TableCell>
                        <TableCell>{grade.date}</TableCell>
                      </TableRow>
                    )),
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <Card key={student.id}>
                <CardHeader>
                  <CardTitle>{student.name}</CardTitle>
                  <CardDescription>{student.class} - {student.section}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {student.grades
                      .filter((grade) => selectedSubject === "all" || grade.subject === selectedSubject)
                      .map((grade, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span>{grade.subject}</span>
                            <Badge variant="outline">{grade.examType}</Badge>
                          </div>
                          <span className={getGradeColor(grade.grade)}>{grade.grade}%</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
