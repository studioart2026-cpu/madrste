"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  UserCheck,
  UserX,
  CalendarIcon,
  Edit,
  Check,
  AlertCircle,
  Save,
  Filter,
  Clock,
  FileCheck,
  BarChart3,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { fetchAttendanceData, saveAttendanceRecords as saveAttendanceRecordsData } from "@/lib/school-api"
import { defaultAttendanceRecords, type AttendanceRecord, type SchoolStudentSummary } from "@/lib/school-data"
import { defaultClassrooms, mergeWithDefaultStudentRoster } from "@/lib/student-roster"

// Define student type
interface Student {
  id: number
  name: string
  status: "present" | "absent" | "late" | "excused"
  notes?: string
}

interface SchoolStudent {
  id: string
  name: string
  classroom: string
}

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim()

const mapToSchoolStudents = (students: SchoolStudentSummary[]): SchoolStudent[] =>
  students
    .map((student) => ({
      id: student.id,
      name: student.name,
      classroom: student.classroom,
    }))

export default function AttendancePage() {
  const { userType, email, userName } = useAuth()
  const isStudent = userType === "student"
  const { toast } = useToast()
  const [date, setDate] = useState<Date>(new Date())
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [editedStudent, setEditedStudent] = useState<Student | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [schoolStudents, setSchoolStudents] = useState<SchoolStudent[]>(
    mapToSchoolStudents(
      mergeWithDefaultStudentRoster().map((student) => ({
        id: student.id,
        name: student.name,
        classroom: student.classroom,
      })),
    ),
  )
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false)
  const hasInitializedPersistence = useRef(false)

  const studentEmailToName: Record<string, string> = {
    "student@example.com": "سارة أحمد",
    "student2@example.com": "نورة محمد",
  }
  const inferredStudentName = normalizeText(userName || (email ? studentEmailToName[email] || "" : ""))

  // Dummy data for attendance records
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(defaultAttendanceRecords)

  // Current attendance record based on selected date and class
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null)

  useEffect(() => {
    let isActive = true

    void (async () => {
      try {
        const response = await fetchAttendanceData()
        if (!isActive) return
        setSchoolStudents(mapToSchoolStudents(response.students))
        setAttendanceRecords(response.attendanceRecords)
      } catch (error) {
        if (!isActive) return
        toast({
          title: "تعذر تحميل بيانات الحضور",
          description: error instanceof Error ? error.message : "تم استخدام البيانات الحالية مؤقتًا",
          variant: "destructive",
        })
      } finally {
        if (isActive) {
          setHasLoadedFromServer(true)
        }
      }
    })()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!hasLoadedFromServer) return
    if (!hasInitializedPersistence.current) {
      hasInitializedPersistence.current = true
      return
    }

    void saveAttendanceRecordsData(attendanceRecords).catch((error) => {
      toast({
        title: "تعذر حفظ سجل الحضور",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ التعديلات",
        variant: "destructive",
      })
    })
  }, [attendanceRecords, hasLoadedFromServer, toast])

  const classOptions = useMemo(() => {
    const classes = Array.from(new Set(schoolStudents.map((student) => student.classroom)))
    if (classes.length > 0) return classes.sort((a, b) => a.localeCompare(b, "ar"))
    return defaultClassrooms
  }, [schoolStudents])

  const studentProfile = useMemo(() => {
    if (!isStudent || !inferredStudentName) return null
    return schoolStudents.find((student) => normalizeText(student.name) === inferredStudentName) || null
  }, [isStudent, inferredStudentName, schoolStudents])

  const visibleClassOptions = useMemo(() => {
    if (isStudent && studentProfile?.classroom) return [studentProfile.classroom]
    return classOptions
  }, [isStudent, studentProfile, classOptions])

  useEffect(() => {
    if (isStudent && studentProfile?.classroom) {
      if (selectedClass !== studentProfile.classroom) {
        setSelectedClass(studentProfile.classroom)
      }
      return
    }

    if (!selectedClass || !visibleClassOptions.includes(selectedClass)) {
      setSelectedClass(visibleClassOptions[0])
    }
  }, [isStudent, selectedClass, visibleClassOptions, studentProfile])

  // Update current record when date or class changes
  useEffect(() => {
    if (!selectedClass) return

    const classRoster: Student[] =
      schoolStudents.length > 0
        ? schoolStudents
            .filter((student) => student.classroom === selectedClass)
            .map((student, index) => ({
              id: Number.parseInt(student.id, 10) || 1000 + index,
              name: student.name,
              status: "present",
            }))
        : []

    const formattedDate = format(date, "yyyy-MM-dd")
    const record = attendanceRecords.find((record) => record.date === formattedDate && record.class === selectedClass)

    if (record) {
      const syncedStudents = classRoster.length
        ? classRoster.map((baseStudent) => {
            const existing = record.students.find((s) => s.id === baseStudent.id || s.name === baseStudent.name)
            return existing ? { ...baseStudent, status: existing.status, notes: existing.notes } : baseStudent
          })
        : record.students

      setCurrentRecord({ ...record, students: syncedStudents })
    } else {
      // Create a new record if none exists for this date and class
      const newRecord: AttendanceRecord = {
        id: Math.max(0, ...attendanceRecords.map((record) => record.id)) + 1,
        date: formattedDate,
        class: selectedClass,
        students:
          classRoster.length > 0
            ? classRoster
            : [
                { id: 1, name: "سارة أحمد", status: "present" },
                { id: 2, name: "نورة محمد", status: "present" },
                { id: 3, name: "هند خالد", status: "present" },
                { id: 4, name: "ريم عبدالله", status: "present" },
                { id: 5, name: "لمى سعد", status: "present" },
                { id: 6, name: "دانة فهد", status: "present" },
                { id: 7, name: "منى علي", status: "present" },
                { id: 8, name: "جواهر سلطان", status: "present" },
              ],
      }
      setCurrentRecord(newRecord)
    }
  }, [date, selectedClass, attendanceRecords, schoolStudents])

  const handleEditStudent = (student: Student) => {
    if (isStudent) return
    setSelectedStudent(student)
    setEditedStudent({ ...student })
    setIsEditDialogOpen(true)
  }

  const saveEditedStudent = () => {
    if (isStudent) return
    if (editedStudent && currentRecord) {
      const updatedStudents = currentRecord.students.map((student) =>
        student.id === editedStudent.id ? editedStudent : student,
      )

      const updatedRecord = {
        ...currentRecord,
        students: updatedStudents,
      }

      setAttendanceRecords(attendanceRecords.map((record) => (record.id === currentRecord.id ? updatedRecord : record)))

      setCurrentRecord(updatedRecord)

      toast({
        title: "تم تحديث بيانات الطالبة",
        description: "تم تحديث حالة الحضور بنجاح",
        variant: "default",
      })
    }
    setIsEditDialogOpen(false)
  }

  const updateStudentStatus = (studentId: number, newStatus: "present" | "absent" | "late" | "excused") => {
    if (isStudent) return
    if (currentRecord) {
      const updatedStudents = currentRecord.students.map((student) =>
        student.id === studentId ? { ...student, status: newStatus } : student,
      )

      const updatedRecord = {
        ...currentRecord,
        students: updatedStudents,
      }

      // If the record already exists in attendanceRecords, update it
      if (attendanceRecords.some((record) => record.id === currentRecord.id)) {
        setAttendanceRecords(
          attendanceRecords.map((record) => (record.id === currentRecord.id ? updatedRecord : record)),
        )
      }

      setCurrentRecord(updatedRecord)
    }
  }

  const saveAttendanceRecord = () => {
    if (isStudent) return
    if (currentRecord) {
      const now = new Date()
      const updatedRecord = {
        ...currentRecord,
        savedAt: now.toISOString(),
      }

      // If the record already exists in attendanceRecords, update it
      if (attendanceRecords.some((record) => record.id === currentRecord.id)) {
        setAttendanceRecords(
          attendanceRecords.map((record) => (record.id === currentRecord.id ? updatedRecord : record)),
        )
      } else {
        // Otherwise, add it as a new record
        setAttendanceRecords([...attendanceRecords, updatedRecord])
      }

      setCurrentRecord(updatedRecord)

      toast({
        title: "تم حفظ سجل الحضور",
        description: `تم حفظ سجل الحضور لفصل ${selectedClass} بتاريخ ${format(date, "dd/MM/yyyy", { locale: ar })}`,
        variant: "default",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            حاضرة
          </Badge>
        )
      case "absent":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            غائبة
          </Badge>
        )
      case "late":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            متأخرة
          </Badge>
        )
      case "excused":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            بإذن
          </Badge>
        )
      default:
        return <Badge variant="outline">غير محدد</Badge>
    }
  }

  const filteredStudents = currentRecord
    ? currentRecord.students.filter((student) => {
        const matchesStatus = filterStatus === "all" || student.status === filterStatus
        const matchesSearch = student.name.includes(searchTerm)
        return matchesStatus && matchesSearch
      })
    : []

  const visibleStudents = isStudent
    ? filteredStudents.filter((student) => normalizeText(student.name) === inferredStudentName)
    : filteredStudents

  // Calculate attendance statistics
  const attendanceStats = visibleStudents.length > 0
    ? {
        total: visibleStudents.length,
        present: visibleStudents.filter((s) => s.status === "present").length,
        absent: visibleStudents.filter((s) => s.status === "absent").length,
        late: visibleStudents.filter((s) => s.status === "late").length,
        excused: visibleStudents.filter((s) => s.status === "excused").length,
        presentPercentage:
          (visibleStudents.filter((s) => s.status === "present").length / visibleStudents.length) * 100,
      }
    : {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        presentPercentage: 0,
      }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تسجيل الحضور</h1>
            <p className="text-gray-500 mt-1">
              {isStudent ? "عرض حالة حضورك اليومية" : "إدارة حضور وغياب الطالبات بطريقة سهلة ومنظمة"}
            </p>
          </div>
          {!isStudent && <div className="flex items-center gap-2">
            <Button onClick={saveAttendanceRecord} className="bg-[#0a8a74] hover:bg-[#097a67]">
              <Save className="ml-2 h-4 w-4" />
              حفظ سجل الحضور
            </Button>
          </div>}
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isStudent}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="اختر الفصل" />
              </SelectTrigger>
              <SelectContent>
                {visibleClassOptions.map((classroom) => (
                  <SelectItem key={classroom} value={classroom}>
                    الصف {classroom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy", { locale: ar }) : "اختر التاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  locale={ar}
                />
              </PopoverContent>
            </Popover>
          </div>

          {!isStudent && <div className="flex gap-2">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter className="ml-2 h-4 w-4" />
                  تصفية
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">تصفية حسب</h4>
                  <div className="space-y-2">
                    <Label htmlFor="status">حالة الحضور</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="present">حاضرة</SelectItem>
                        <SelectItem value="absent">غائبة</SelectItem>
                        <SelectItem value="late">متأخرة</SelectItem>
                        <SelectItem value="excused">بإذن</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search">بحث باسم الطالبة</Label>
                    <Input
                      id="search"
                      placeholder="اكتب اسم الطالبة..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFilterStatus("all")
                        setSearchTerm("")
                      }}
                    >
                      إعادة ضبط
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>}
        </div>
      </div>

      <Tabs defaultValue="daily">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="daily" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <CalendarIcon className="h-4 w-4 ml-2" />
            تسجيل اليومي
          </TabsTrigger>
          <TabsTrigger value="report" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4 ml-2" />
            تقرير الحضور
          </TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>تسجيل حضور الصف {selectedClass}</CardTitle>
                  <CardDescription>
                    تاريخ اليوم: {date ? format(date, "dd MMMM yyyy", { locale: ar }) : ""}
                    {currentRecord?.savedAt && (
                      <span className="text-green-600 mr-2">
                        (تم الحفظ في {format(new Date(currentRecord.savedAt), "HH:mm", { locale: ar })})
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    حاضرات: {attendanceStats.present}
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    غائبات: {attendanceStats.absent}
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    متأخرات: {attendanceStats.late}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    بإذن: {attendanceStats.excused}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {visibleStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">لا توجد بيانات</h3>
                  <p className="text-gray-500 mt-1">لم يتم العثور على أي طالبات تطابق معايير البحث</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[50px] text-center">الرقم</TableHead>
                        <TableHead>اسم الطالبة</TableHead>
                        <TableHead className="text-center">الحالة</TableHead>
                        <TableHead>ملاحظات</TableHead>
                        {!isStudent && <TableHead className="text-left">الإجراءات</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleStudents.map((student) => (
                        <TableRow key={student.id} className="group hover:bg-gray-50 transition-colors">
                          <TableCell className="text-center font-medium">{student.id}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              {student.status === "present" ? (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 px-3 py-1"
                                >
                                  <UserCheck className="h-3.5 w-3.5 mr-1" /> حاضرة
                                </Badge>
                              ) : student.status === "absent" ? (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3 py-1">
                                  <UserX className="h-3.5 w-3.5 mr-1" /> غائبة
                                </Badge>
                              ) : student.status === "late" ? (
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-50 text-yellow-700 border-yellow-200 px-3 py-1"
                                >
                                  <Clock className="h-3.5 w-3.5 mr-1" /> متأخرة
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                                  <FileCheck className="h-3.5 w-3.5 mr-1" /> بإذن
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm">{student.notes || "-"}</TableCell>
                          {!isStudent && <TableCell className="text-left">
                            <div className="flex space-x-1 space-x-reverse justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => updateStudentStatus(student.id, "present")}
                                title="تسجيل حضور"
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => updateStudentStatus(student.id, "absent")}
                                title="تسجيل غياب"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                onClick={() => updateStudentStatus(student.id, "late")}
                                title="تسجيل تأخر"
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => updateStudentStatus(student.id, "excused")}
                                title="تسجيل إذن"
                              >
                                <FileCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                onClick={() => handleEditStudent(student)}
                                title="تعديل"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-6 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-500">حاضرات: {attendanceStats.present}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-500">غائبات: {attendanceStats.absent}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-500">متأخرات: {attendanceStats.late}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-500">بإذن: {attendanceStats.excused}</span>
                </div>
              </div>
              {!isStudent && <Button onClick={saveAttendanceRecord} className="bg-[#0a8a74] hover:bg-[#097a67]">
                <Save className="ml-2 h-4 w-4" />
                حفظ سجل الحضور
              </Button>}
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="report">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="overflow-hidden border-0 shadow-md">
              <div className="bg-green-500 h-2" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">نسبة الحضور</p>
                    <h3 className="text-3xl font-bold mt-1 text-green-600">
                      {attendanceStats.presentPercentage.toFixed(1)}%
                    </h3>
                  </div>
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${attendanceStats.presentPercentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-md">
              <div className="bg-red-500 h-2" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">نسبة الغياب</p>
                    <h3 className="text-3xl font-bold mt-1 text-red-600">
                      {((attendanceStats.absent / attendanceStats.total) * 100).toFixed(1)}%
                    </h3>
                  </div>
                  <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                    <UserX className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${(attendanceStats.absent / attendanceStats.total) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-md">
              <div className="bg-blue-500 h-2" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">إجمالي الطالبات</p>
                    <h3 className="text-3xl font-bold mt-1 text-blue-600">{attendanceStats.total}</h3>
                  </div>
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <CalendarIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-gray-500">حاضرات</span>
                    <span className="text-lg font-bold text-green-600">{attendanceStats.present}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-gray-500">غائبات</span>
                    <span className="text-lg font-bold text-red-600">{attendanceStats.absent}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-gray-500">متأخرات</span>
                    <span className="text-lg font-bold text-yellow-600">{attendanceStats.late}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-gray-500">بإذن</span>
                    <span className="text-lg font-bold text-blue-600">{attendanceStats.excused}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>سجل الحضور الأسبوعي</CardTitle>
              <CardDescription>
                {isStudent ? "عرض سجلك الأسبوعي للحضور" : `عرض سجل الحضور للأسبوع الحالي للفصل ${selectedClass}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead className="text-center">عدد الحاضرات</TableHead>
                      <TableHead className="text-center">عدد الغائبات</TableHead>
                      <TableHead className="text-center">نسبة الحضور</TableHead>
                      {!isStudent && <TableHead className="text-left">الإجراءات</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords
                      .filter((record) => record.class === selectedClass)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 7)
                      .map((record) => {
                        const presentCount = record.students.filter((s) => s.status === "present").length
                        const absentCount = record.students.filter((s) => s.status === "absent").length
                        const presentPercentage = (presentCount / record.students.length) * 100

                        return (
                          <TableRow key={record.id} className="group hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium">
                              {format(new Date(record.date), "EEEE, dd/MM/yyyy", { locale: ar })}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {presentCount}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                {absentCount}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-3 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ease-in-out ${
                                      presentPercentage > 80
                                        ? "bg-green-500"
                                        : presentPercentage > 60
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                    }`}
                                    style={{ width: `${presentPercentage}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{presentPercentage.toFixed(1)}%</span>
                              </div>
                            </TableCell>
                            {!isStudent && <TableCell className="text-left">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => {
                                  setDate(new Date(record.date))
                                }}
                              >
                                <Edit className="ml-2 h-4 w-4" />
                                تعديل
                              </Button>
                            </TableCell>}
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen && !isStudent} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل حالة الحضور</DialogTitle>
            <DialogDescription>
              تعديل حالة حضور الطالبة {editedStudent?.name} ليوم {format(date, "dd/MM/yyyy", { locale: ar })}
            </DialogDescription>
          </DialogHeader>
          {editedStudent && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">حالة الحضور</Label>
                <Select
                  value={editedStudent.status}
                  onValueChange={(value) =>
                    setEditedStudent({
                      ...editedStudent,
                      status: value as "present" | "absent" | "late" | "excused",
                    })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">حاضرة</SelectItem>
                    <SelectItem value="absent">غائبة</SelectItem>
                    <SelectItem value="late">متأخرة</SelectItem>
                    <SelectItem value="excused">بإذن</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Input
                  id="notes"
                  placeholder="أدخل ملاحظات (اختياري)"
                  value={editedStudent.notes || ""}
                  onChange={(e) => setEditedStudent({ ...editedStudent, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={saveEditedStudent} className="bg-[#0a8a74] hover:bg-[#097a67]">
              <Check className="ml-2 h-4 w-4" />
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
