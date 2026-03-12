"use client"

import { useState, useEffect, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pencil,
  Trash2,
  UserPlus,
  Search,
  X,
  BarChart3,
  Users,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Eye,
  RefreshCw,
  Download,
  FileText,
  FileSpreadsheet,
  FileIcon as FilePdf,
  Filter,
  MessageCircle,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/auth-provider"
import { fetchStudents as fetchStudentsData, saveStudents as saveStudentsData } from "@/lib/school-api"
import {
  defaultClassrooms as classrooms,
  defaultGrades as grades,
  defaultStudentRoster,
  mergeWithDefaultStudentRoster,
} from "@/lib/student-roster"

const normalizeArabicText = (value: string) =>
  value
    .replace(/[أإآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()

// نموذج بيانات الطالبة
interface Student {
  id: string
  name: string
  studentId: string
  grade: string
  classroom: string
  parentPhone: string
  status: "نشط" | "غير نشط" | "منقول"
  birthDate: string
  address: string
  notes?: string
  attendance?: number
  academicPerformance?: number
  behaviorRating?: number
  lastLogin?: string
  profileImage?: string
  parentEmail?: string
  emergencyContact?: string
  medicalNotes?: string
  joinDate?: string
  activities?: string[]
}

// قائمة الأنشطة
const activities = [
  "النادي العلمي",
  "كرة القدم",
  "كرة السلة",
  "السباحة",
  "الرسم",
  "الموسيقى",
  "التمثيل",
  "القراءة",
  "الشطرنج",
  "البرمجة",
  "الروبوتات",
]

// حقول التصدير المتاحة
const exportableFields = [
  { id: "name", label: "الاسم", defaultSelected: true },
  { id: "studentId", label: "الرقم التعريفي", defaultSelected: true },
  { id: "grade", label: "الصف الدراسي", defaultSelected: true },
  { id: "classroom", label: "الفصل", defaultSelected: true },
  { id: "parentPhone", label: "رقم ولي الأمر", defaultSelected: true },
  { id: "status", label: "الحالة", defaultSelected: true },
  { id: "birthDate", label: "تاريخ الميلاد", defaultSelected: false },
  { id: "address", label: "العنوان", defaultSelected: false },
  { id: "attendance", label: "نسبة الحضور", defaultSelected: true },
  { id: "academicPerformance", label: "الأداء الأكاديمي", defaultSelected: true },
  { id: "behaviorRating", label: "تقييم السلوك", defaultSelected: false },
  { id: "parentEmail", label: "البريد الإلكتروني لولي الأمر", defaultSelected: false },
  { id: "emergencyContact", label: "رقم الطوارئ", defaultSelected: false },
  { id: "medicalNotes", label: "ملاحظات طبية", defaultSelected: false },
  { id: "joinDate", label: "تاريخ الالتحاق", defaultSelected: false },
  { id: "activities", label: "الأنشطة", defaultSelected: false },
  { id: "notes", label: "ملاحظات عامة", defaultSelected: false },
]

export default function StudentsPage() {
  const STUDENTS_PER_PAGE = 20
  const { toast } = useToast()
  const { userName } = useAuth()
  const [students, setStudents] = useState<Student[]>(defaultStudentRoster)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterGrade, setFilterGrade] = useState<string>("")
  const [filterClassroom, setFilterClassroom] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [filterActivity, setFilterActivity] = useState<string>("")
  const [sortField, setSortField] = useState<keyof Student>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"table" | "cards" | "detailed">("table")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [attendanceFilter, setAttendanceFilter] = useState<number | null>(null)
  const [academicFilter, setAcademicFilter] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isSaving, setIsSaving] = useState(false)

  // حالات مربعات الحوار
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)

  // إعدادات التصدير
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "pdf">("csv")
  const [exportScope, setExportScope] = useState<"filtered" | "all" | "selected">("filtered")
  const [exportFields, setExportFields] = useState<string[]>(
    exportableFields.filter((field) => field.defaultSelected).map((field) => field.id),
  )
  const [exportFileName, setExportFileName] = useState(`بيانات_الطالبات_${new Date().toLocaleDateString("ar-SA")}`)
  const [includeHeader, setIncludeHeader] = useState(true)
  const [exportOrientation, setExportOrientation] = useState<"portrait" | "landscape">("landscape")
  const exportLinkRef = useRef<HTMLAnchorElement>(null)

  const persistStudents = async (nextStudents: Student[]) => {
    const previousStudents = students
    setStudents(nextStudents)
    setIsSaving(true)

    try {
      const response = await saveStudentsData(nextStudents)
      setStudents(mergeWithDefaultStudentRoster(response.students))
      return true
    } catch (error) {
      setStudents(previousStudents)
      toast({
        title: "تعذر حفظ البيانات",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ بيانات الطالبات",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  // نموذج إضافة طالبة جديدة
  const [newStudent, setNewStudent] = useState<Omit<Student, "id">>({
    name: "",
    studentId: "",
    grade: "",
    classroom: "",
    parentPhone: "",
    status: "نشط",
    birthDate: "",
    address: "",
    attendance: 100,
    academicPerformance: 85,
    behaviorRating: 90,
    activities: [],
  })

  useEffect(() => {
    let isActive = true

    void (async () => {
      setIsLoading(true)
      try {
        const response = await fetchStudentsData()
        if (!isActive) return
        setStudents(mergeWithDefaultStudentRoster(response.students))
      } catch (error) {
        if (!isActive) return
        toast({
          title: "تعذر تحميل الطالبات",
          description: error instanceof Error ? error.message : "تم استخدام البيانات الافتراضية مؤقتًا",
          variant: "destructive",
        })
        setStudents(defaultStudentRoster)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      isActive = false
    }
  }, [toast])

  const sendWhatsAppToParent = (student: Student) => {
    const rawPhone = (student.parentPhone || "").replace(/\D/g, "")
    if (!rawPhone) {
      toast({
        title: "تعذر فتح واتساب",
        description: "رقم ولي الأمر غير متوفر",
        variant: "destructive",
      })
      return
    }

    let phone = rawPhone
    if (phone.startsWith("0")) {
      phone = `966${phone.slice(1)}`
    }

    const schoolName = "المدرسة المتوسطة ١٣٦"
    const teacherName = userName?.trim() ? userName.trim() : "المعلمة"
    const message = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته
معكم ${teacherName} من ${schoolName}.
نود التواصل بخصوص الطالبة: ${student.name}.
رقم الطالبة: ${student.studentId}.`,
    )
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
  }

  // تصفية الطالبات حسب البحث والفلاتر
  const filteredStudents = students.filter((student) => {
    const normalizedSearchTerm = normalizeArabicText(searchTerm)
    const matchesSearch =
      !normalizedSearchTerm ||
      normalizeArabicText(student.name).includes(normalizedSearchTerm) ||
      student.studentId.includes(searchTerm.trim()) ||
      student.parentPhone.includes(searchTerm.trim()) ||
      student.classroom.includes(searchTerm.trim()) ||
      student.grade.includes(searchTerm.trim()) ||
      Boolean(student.parentEmail && student.parentEmail.toLowerCase().includes(searchTerm.trim().toLowerCase()))

    const matchesGrade = filterGrade ? student.grade === filterGrade : true
    const matchesClassroom = filterClassroom ? student.classroom === filterClassroom : true
    const matchesStatus = filterStatus ? student.status === filterStatus : true
    const matchesActivity = filterActivity ? student.activities?.some((activity) => activity === filterActivity) : true

    const matchesAttendance = attendanceFilter ? (student.attendance || 0) >= attendanceFilter : true

    const matchesAcademic = academicFilter ? (student.academicPerformance || 0) >= academicFilter : true

    return (
      matchesSearch &&
      matchesGrade &&
      matchesClassroom &&
      matchesStatus &&
      matchesActivity &&
      matchesAttendance &&
      matchesAcademic
    )
  })

  // ترتيب الطالبات
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / STUDENTS_PER_PAGE))
  const normalizedCurrentPage = Math.min(currentPage, totalPages)
  const paginatedStudents = sortedStudents.slice(
    (normalizedCurrentPage - 1) * STUDENTS_PER_PAGE,
    normalizedCurrentPage * STUDENTS_PER_PAGE,
  )

  useEffect(() => {
    if (currentPage !== normalizedCurrentPage) {
      setCurrentPage(normalizedCurrentPage)
    }
  }, [currentPage, normalizedCurrentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterGrade, filterClassroom, filterStatus, filterActivity, attendanceFilter, academicFilter, sortField, sortDirection, viewMode])

  // تبديل اتجاه الترتيب
  const toggleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // إضافة طالبة جديدة
  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.studentId || !newStudent.grade || !newStudent.classroom || !newStudent.parentPhone) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى تعبئة الحقول المطلوبة: الاسم، رقم الطالبة، الصف، الفصل، رقم ولي الأمر.",
        variant: "destructive",
      })
      return
    }

    const normalizedStudentId = newStudent.studentId.trim()
    const duplicateStudentId = students.some((s) => s.studentId === normalizedStudentId)
    if (duplicateStudentId) {
      toast({
        title: "رقم طالبة مكرر",
        description: "رقم الطالبة موجود مسبقًا، يرجى إدخال رقم مختلف.",
        variant: "destructive",
      })
      return
    }

    const numericIds = students
      .map((s) => Number.parseInt(s.id, 10))
      .filter((n) => Number.isFinite(n))
    const nextId = (numericIds.length > 0 ? Math.max(...numericIds) : 0) + 1
    const newId = nextId.toString()
    const studentWithId = {
      ...newStudent,
      name: newStudent.name.trim(),
      studentId: normalizedStudentId,
      parentPhone: newStudent.parentPhone.trim(),
      id: newId,
      joinDate: new Date().toISOString().split("T")[0],
      lastLogin: new Date().toISOString().split("T")[0],
    }

    const saveSucceeded = await persistStudents([...students, studentWithId])
    if (!saveSucceeded) return
    setAddDialogOpen(false)
    toast({
      title: "تمت الإضافة بنجاح",
      description: `تمت إضافة الطالبة ${newStudent.name} بنجاح`,
      variant: "default",
    })

    // إعادة تعيين نموذج الإضافة
    setNewStudent({
      name: "",
      studentId: "",
      grade: "",
      classroom: "",
      parentPhone: "",
      status: "نشط",
      birthDate: "",
      address: "",
      attendance: 100,
      academicPerformance: 85,
      behaviorRating: 90,
      activities: [],
    })
  }

  // تعديل بيانات طالبة
  const handleEditStudent = async () => {
    if (!currentStudent) return

    const saveSucceeded = await persistStudents(
      students.map((student) => (student.id === currentStudent.id ? currentStudent : student)),
    )
    if (!saveSucceeded) return

    setEditDialogOpen(false)
    toast({
      title: "تم التعديل بنجاح",
      description: `تم تعديل بيانات الطالبة ${currentStudent.name} بنجاح`,
      variant: "default",
    })
  }

  // حذف طالبة
  const handleDeleteStudent = async () => {
    if (!currentStudent) return

    const saveSucceeded = await persistStudents(students.filter((student) => student.id !== currentStudent.id))
    if (!saveSucceeded) return
    setDeleteDialogOpen(false)
    toast({
      title: "تم الحذف بنجاح",
      description: `تم حذف الطالبة ${currentStudent.name} بنجاح`,
      variant: "destructive",
    })
  }

  // تغيير حالة الطالبة (نشط/غير نشط)
  const toggleStudentStatus = async (student: Student | null) => {
    if (!student) return

    const newStatus: Student["status"] = student.status === "نشط" ? "غير نشط" : "نشط"
    const updatedStudents = students.map((s) => {
      if (s.id === student.id) {
        return { ...s, status: newStatus }
      }
      return s
    })

    const saveSucceeded = await persistStudents(updatedStudents)
    if (!saveSucceeded) return

    toast({
      title: "تم تغيير الحالة بنجاح",
      description: `تم تغيير حالة الطالبة ${student.name} إلى ${newStatus}`,
      variant: newStatus === "نشط" ? "default" : "destructive",
    })
  }

  // تحديد/إلغاء تحديد جميع الطالبات
  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map((student) => student.id))
    }
  }

  // تحديد/إلغاء تحديد طالبة
  const toggleSelectStudent = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter((studentId) => studentId !== id))
    } else {
      setSelectedStudents([...selectedStudents, id])
    }
  }

  // إجراء على الطالبات المحددة
  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedStudents.length === 0) return

    let updatedStudents = [...students]
    let actionMessage = ""

    if (action === "delete") {
      updatedStudents = students.filter((student) => !selectedStudents.includes(student.id))
      actionMessage = "تم حذف الطالبات المحددة بنجاح"
    } else {
      updatedStudents = students.map((student) => {
        if (selectedStudents.includes(student.id)) {
          return {
            ...student,
            status: action === "activate" ? "نشط" : "غير نشط",
          }
        }
        return student
      })
      actionMessage =
        action === "activate" ? "تم تنشيط الطالبات المحددة بنجاح" : "تم إلغاء تنشيط الطالبات المحددة بنجاح"
    }

    const saveSucceeded = await persistStudents(updatedStudents)
    if (!saveSucceeded) return
    setSelectedStudents([])
    setBulkActionDialogOpen(false)

    toast({
      title: "تم تنفيذ الإجراء",
      description: actionMessage,
      variant: action === "delete" ? "destructive" : "default",
    })
  }

  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSearchTerm("")
    setFilterGrade("")
    setFilterClassroom("")
    setFilterStatus("")
    setFilterActivity("")
    setAttendanceFilter(null)
    setAcademicFilter(null)
    setShowAdvancedFilters(false)
  }

  // تحديث البيانات
  const refreshData = () => {
    void (async () => {
      setIsLoading(true)
      try {
        const response = await fetchStudentsData()
        setStudents(mergeWithDefaultStudentRoster(response.students))
        toast({
          title: "تم تحديث البيانات",
          description: "تم تحميل أحدث بيانات الطالبات بنجاح",
        })
      } catch (error) {
        toast({
          title: "تعذر تحديث البيانات",
          description: error instanceof Error ? error.message : "حدث خطأ أثناء تحديث بيانات الطالبات",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    })()
  }

  // إحصائيات الطالبات
  const studentStats = {
    total: students.length,
    active: students.filter((s) => s.status === "نشط").length,
    inactive: students.filter((s) => s.status === "غير نشط").length,
    transferred: students.filter((s) => s.status === "منقول").length,
    averageAttendance: Math.round(
      students.reduce((sum, student) => sum + (student.attendance || 0), 0) / students.length,
    ),
    averagePerformance: Math.round(
      students.reduce((sum, student) => sum + (student.academicPerformance || 0), 0) / students.length,
    ),
  }

  // تبديل حالة حقل التصدير
  const toggleExportField = (fieldId: string) => {
    if (exportFields.includes(fieldId)) {
      setExportFields(exportFields.filter((id) => id !== fieldId))
    } else {
      setExportFields([...exportFields, fieldId])
    }
  }

  // تحديد كل حقول التصدير
  const selectAllExportFields = () => {
    setExportFields(exportableFields.map((field) => field.id))
  }

  // إلغاء تحديد كل حقول التصدير
  const deselectAllExportFields = () => {
    setExportFields([])
  }

  // الحصول على البيانات المراد تصديرها
  const getExportData = () => {
    let dataToExport: Student[] = []

    try {
      switch (exportScope) {
        case "all":
          dataToExport = [...students]
          break
        case "filtered":
          dataToExport = [...sortedStudents]
          break
        case "selected":
          dataToExport = students.filter((student) => selectedStudents.includes(student.id))
          break
        default:
          dataToExport = [...filteredStudents]
      }
    } catch (error) {
      console.error("Error al obtener datos para exportar:", error)
    }

    return dataToExport
  }

  // تصدير البيانات كملف CSV
  const exportToCSV = () => {
    const dataToExport = getExportData()

    // تحديد الحقول المطلوبة للتصدير
    const fields = exportableFields.filter((field) => exportFields.includes(field.id))

    // إنشاء رأس الجدول
    const header = fields.map((field) => field.label).join(",")

    // تحويل البيانات إلى تنسيق CSV
    const csvData = [
      ...(includeHeader ? [header] : []),
      ...dataToExport.map((student) =>
        fields
          .map((field) => {
            const value = student[field.id as keyof Student]
            if (Array.isArray(value)) {
              return `"${value.join(", ")}"`
            }
            if (typeof value === "string" && value.includes(",")) {
              return `"${value}"`
            }
            return value
          })
          .join(","),
      ),
    ].join("\n")

    // إنشاء رابط تنزيل
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    if (exportLinkRef.current) {
      exportLinkRef.current.setAttribute("href", url)
      exportLinkRef.current.setAttribute("download", `${exportFileName}.csv`)
      exportLinkRef.current.click()
    }

    toast({
      title: "تم تصدير البيانات",
      description: `تم تصدير ${dataToExport.length} طالبة بنجاح بتنسيق CSV`,
    })

    setExportDialogOpen(false)
  }

  // تصدير البيانات كملف Excel
  const exportToExcel = () => {
    const dataToExport = getExportData()

    // محاكاة تصدير Excel (في التطبيق الحقيقي، يمكن استخدام مكتبة مثل xlsx)
    toast({
      title: "تم تصدير البيانات",
      description: `تم تصدير ${dataToExport.length} طالبة بنجاح بتنسيق Excel`,
    })

    setExportDialogOpen(false)
  }

  // تصدير البيانات كملف PDF
  const exportToPDF = () => {
    const dataToExport = getExportData()

    // محاكاة تصدير PDF (في التطبيق الحقيقي، يمكن استخدام مكتبة مثل jspdf)
    toast({
      title: "تم تصدير البيانات",
      description: `تم تصدير ${dataToExport.length} طالبة بنجاح بتنسيق PDF`,
    })

    setExportDialogOpen(false)
  }

  // تنفيذ التصدير حسب التنسيق المحدد
  const handleExport = () => {
    switch (exportFormat) {
      case "csv":
        exportToCSV()
        break
      case "excel":
        exportToExcel()
        break
      case "pdf":
        exportToPDF()
        break
    }
  }

  // تحديد لون البطاقة حسب الحالة
  const getCardColor = (status: string) => {
    switch (status) {
      case "نشط":
        return "border-green-200 bg-green-50"
      case "غير نشط":
        return "border-red-200 bg-red-50"
      case "منقول":
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  // تحديد لون شريط التقدم حسب القيمة
  const getProgressColor = (value: number) => {
    if (value >= 90) return "bg-green-500"
    if (value >= 75) return "bg-emerald-500"
    if (value >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  // تطبيق فلتر سريع للحالة
  const applyStatusFilter = (status: string) => {
    setFilterStatus(status)
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">إدارة الطالبات</h1>
            <p className="text-gray-500 mt-1">إضافة وتعديل وحذف بيانات الطالبات</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="flex items-center gap-2 bg-[#0a8a74] hover:bg-[#097a67]"
            >
              <UserPlus className="h-4 w-4" />
              <span>إضافة طالبة</span>
            </Button>
            <Button variant="outline" onClick={refreshData} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>تحديث</span>
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      <Separator className="my-6" />

      {/* بطاقات الإحصائيات */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              إجمالي الطالبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studentStats.total}</div>
            <p className="text-sm text-muted-foreground mt-1">طالبة مسجلة في النظام</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-green-300 transition-colors"
          onClick={() => applyStatusFilter("نشط")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              الطالبات النشطات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studentStats.active}</div>
            <p className="text-sm text-muted-foreground mt-1">
              نسبة {Math.round((studentStats.active / studentStats.total) * 100)}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-red-300 transition-colors"
          onClick={() => applyStatusFilter("غير نشط")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserX className="h-5 w-5 text-red-500" />
              الطالبات غير النشطات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studentStats.inactive + studentStats.transferred}</div>
            <p className="text-sm text-muted-foreground mt-1">منها {studentStats.transferred} طالبة منقولة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              متوسط الأداء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studentStats.averagePerformance}%</div>
            <div className="mt-2">
              <Progress value={studentStats.averagePerformance} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>قائمة الطالبات</CardTitle>
              <CardDescription>
                {isLoading ? (
                  <span>جاري تحميل البيانات...</span>
                ) : (
                  <span>
                    عدد الطالبات: {filteredStudents.length} من أصل {students.length}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative min-w-[240px]">
                <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث سريع: الاسم أو الرقم أو الفصل"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-8"
                />
              </div>
              {searchTerm && (
                <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>
                  <X className="h-4 w-4 ml-1" />
                  مسح
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    <span>فلتر سريع</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>تصفية حسب الحالة</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => applyStatusFilter("")}>الكل</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyStatusFilter("نشط")}>
                    <UserCheck className="h-4 w-4 ml-2 text-green-500" />
                    نشط
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyStatusFilter("غير نشط")}>
                    <UserX className="h-4 w-4 ml-2 text-red-500" />
                    غير نشط
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyStatusFilter("منقول")}>منقول</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>طريقة العرض</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>اختر طريقة العرض</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setViewMode("table")}>جدول</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode("cards")}>بطاقات</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode("detailed")}>تفصيلي</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setExportDialogOpen(true)}
              >
                <Download className="h-4 w-4" />
                <span>تصدير</span>
              </Button>

              {selectedStudents.length > 0 && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        إجراءات ({selectedStudents.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>إجراءات متعددة</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBulkAction("activate")}>
                        تنشيط الطالبات المحددة
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("deactivate")}>
                        إلغاء تنشيط الطالبات المحددة
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setBulkActionDialogOpen(true)} className="text-red-500">
                        حذف الطالبات المحددة
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="destructive" size="sm" onClick={() => setBulkActionDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 ml-1" />
                    حذف المحدد
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="list">قائمة الطالبات</TabsTrigger>
              <TabsTrigger value="filters">البحث والفلترة</TabsTrigger>
            </TabsList>

            <TabsContent value="filters">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label>البحث</Label>
                    <div className="relative">
                      <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="اسم الطالبة أو الرقم أو رقم الهاتف"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>الصف الدراسي</Label>
                    <Select value={filterGrade} onValueChange={setFilterGrade}>
                      <SelectTrigger>
                        <SelectValue placeholder="جميع الصفوف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">جميع الصفوف</SelectItem>
                        {grades.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>الفصل</Label>
                    <Select value={filterClassroom} onValueChange={setFilterClassroom}>
                      <SelectTrigger>
                        <SelectValue placeholder="جميع الفصول" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">جميع الفصول</SelectItem>
                        {classrooms.map((classroom) => (
                          <SelectItem key={classroom} value={classroom}>
                            {classroom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>الحالة</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="جميع الحالات" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">جميع الحالات</SelectItem>
                        <SelectItem value="نشط">نشط</SelectItem>
                        <SelectItem value="غير نشط">غير نشط</SelectItem>
                        <SelectItem value="منقول">منقول</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Accordion
                  type="single"
                  collapsible
                  value={showAdvancedFilters ? "advanced" : ""}
                  onValueChange={(value) => setShowAdvancedFilters(value === "advanced")}
                >
                  <AccordionItem value="advanced">
                    <AccordionTrigger className="py-2">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>فلاتر متقدمة</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label>النشاط</Label>
                          <Select value={filterActivity} onValueChange={setFilterActivity}>
                            <SelectTrigger>
                              <SelectValue placeholder="جميع الأنشطة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">جميع الأنشطة</SelectItem>
                              {activities.map((activity) => (
                                <SelectItem key={activity} value={activity}>
                                  {activity}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>نسبة الحضور (أكبر من أو يساوي)</Label>
                          <Select
                            value={attendanceFilter?.toString() || ""}
                            onValueChange={(value) => setAttendanceFilter(value ? Number.parseInt(value) : null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="جميع النسب" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">جميع النسب</SelectItem>
                              <SelectItem value="95">95% أو أعلى</SelectItem>
                              <SelectItem value="90">90% أو أعلى</SelectItem>
                              <SelectItem value="85">85% أو أعلى</SelectItem>
                              <SelectItem value="80">80% أو أعلى</SelectItem>
                              <SelectItem value="75">75% أو أعلى</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>الأداء الأكاديمي (أكبر من أو يساوي)</Label>
                          <Select
                            value={academicFilter?.toString() || ""}
                            onValueChange={(value) => setAcademicFilter(value ? Number.parseInt(value) : null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="جميع المستويات" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">جميع المستويات</SelectItem>
                              <SelectItem value="95">95% أو أعلى</SelectItem>
                              <SelectItem value="90">90% أو أعلى</SelectItem>
                              <SelectItem value="85">85% أو أعلى</SelectItem>
                              <SelectItem value="80">80% أو أعلى</SelectItem>
                              <SelectItem value="75">75% أو أعلى</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    <span>إعادة تعيين الفلاتر</span>
                  </Button>

                  <Button
                    variant="secondary"
                    className="flex items-center gap-2"
                    onClick={() => setExportDialogOpen(true)}
                  >
                    <Download className="h-4 w-4" />
                    <span>تصدير البيانات</span>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="list">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="w-full h-16 bg-gray-100 animate-pulse rounded-md" />
                  ))}
                </div>
              ) : (
                <>
                  {viewMode === "table" && (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={
                                  selectedStudents.length === filteredStudents.length && filteredStudents.length > 0
                                }
                                onCheckedChange={toggleSelectAll}
                                aria-label="تحديد الكل"
                              />
                            </TableHead>
                            <TableHead className="text-right cursor-pointer" onClick={() => toggleSort("name")}>
                              <div className="flex items-center gap-1">
                                الاسم
                                {sortField === "name" &&
                                  (sortDirection === "asc" ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  ))}
                              </div>
                            </TableHead>
                            <TableHead className="text-right">الرقم</TableHead>
                            <TableHead className="text-right cursor-pointer" onClick={() => toggleSort("grade")}>
                              <div className="flex items-center gap-1">
                                الصف
                                {sortField === "grade" &&
                                  (sortDirection === "asc" ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  ))}
                              </div>
                            </TableHead>
                            <TableHead className="text-right">الفصل</TableHead>
                            <TableHead className="text-right">رقم ولي الأمر</TableHead>
                            <TableHead className="text-right cursor-pointer" onClick={() => toggleSort("status")}>
                              <div className="flex items-center gap-1">
                                الحالة
                                {sortField === "status" &&
                                  (sortDirection === "asc" ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  ))}
                              </div>
                            </TableHead>
                            <TableHead className="text-right">الإجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                    <TableBody>
                      {paginatedStudents.length > 0 ? (
                        paginatedStudents.map((student) => (
                              <TableRow key={student.id} className="hover:bg-muted/50">
                                <TableCell>
                                  <Checkbox
                                    checked={selectedStudents.includes(student.id)}
                                    onCheckedChange={() => toggleSelectStudent(student.id)}
                                    aria-label={`تحديد ${student.name}`}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{student.name}</TableCell>
                                <TableCell>{student.studentId}</TableCell>
                                <TableCell>{student.grade}</TableCell>
                                <TableCell>{student.classroom}</TableCell>
                                <TableCell dir="ltr" className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <span>{student.parentPhone}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-green-700 hover:text-green-800 hover:bg-green-50"
                                      onClick={() => sendWhatsAppToParent(student)}
                                      title="التواصل عبر واتساب"
                                    >
                                      <MessageCircle className="h-4 w-4 ml-1" />
                                      واتساب
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      student.status === "نشط"
                                        ? "default"
                                        : student.status === "غير نشط"
                                          ? "destructive"
                                          : "outline"
                                    }
                                  >
                                    {student.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setCurrentStudent(student)
                                        setViewDialogOpen(true)
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span className="sr-only">عرض</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setCurrentStudent(student)
                                        setEditDialogOpen(true)
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                      <span className="sr-only">تعديل</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setCurrentStudent(student)
                                        setDeleteDialogOpen(true)
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">حذف</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleStudentStatus(student)
                                      }}
                                      title={student.status === "نشط" ? "تغيير إلى غير نشط" : "تغيير إلى نشط"}
                                    >
                                      {student.status === "نشط" ? (
                                        <UserX className="h-4 w-4 text-red-500" />
                                      ) : (
                                        <UserCheck className="h-4 w-4 text-green-500" />
                                      )}
                                      <span className="sr-only">
                                        {student.status === "نشط" ? "تغيير إلى غير نشط" : "تغيير إلى نشط"}
                                      </span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                لا توجد طالبات تطابق معايير البحث
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {viewMode === "cards" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <AnimatePresence>
                      {paginatedStudents.map((student) => (
                          <motion.div
                            key={student.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className={`overflow-hidden ${getCardColor(student.status)}`}>
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-lg">{student.name}</CardTitle>
                                    <CardDescription>
                                      {student.grade} - {student.classroom}
                                    </CardDescription>
                                  </div>
                                  <Checkbox
                                    checked={selectedStudents.includes(student.id)}
                                    onCheckedChange={() => toggleSelectStudent(student.id)}
                                    aria-label={`تحديد ${student.name}`}
                                  />
                                </div>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">الرقم:</p>
                                    <p>{student.studentId}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">الحالة:</p>
                                    <Badge
                                      variant={
                                        student.status === "نشط"
                                          ? "default"
                                          : student.status === "غير نشط"
                                            ? "destructive"
                                            : "outline"
                                      }
                                    >
                                      {student.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">الحضور:</p>
                                    <div className="flex items-center gap-2">
                                      <Progress
                                        value={student.attendance}
                                        className={`h-2 ${getProgressColor(student.attendance || 0)}`}
                                      />
                                      <span className="text-xs">{student.attendance}%</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">الأداء:</p>
                                    <div className="flex items-center gap-2">
                                      <Progress
                                        value={student.academicPerformance}
                                        className={`h-2 ${getProgressColor(student.academicPerformance || 0)}`}
                                      />
                                      <span className="text-xs">{student.academicPerformance}%</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="flex justify-between pt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentStudent(student)
                                    setViewDialogOpen(true)
                                  }}
                                >
                                  عرض
                                </Button>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setCurrentStudent(student)
                                      setEditDialogOpen(true)
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setCurrentStudent(student)
                                      setDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleStudentStatus(student)
                                    }}
                                    title={student.status === "نشط" ? "تغيير إلى غير نشط" : "تغيير إلى نشط"}
                                  >
                                    {student.status === "نشط" ? (
                                      <UserX className="h-4 w-4 text-red-500" />
                                    ) : (
                                      <UserCheck className="h-4 w-4 text-green-500" />
                                    )}
                                  </Button>
                                </div>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {paginatedStudents.length === 0 && (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                          لا توجد طالبات تطابق معايير البحث
                        </div>
                      )}
                    </div>
                  )}

                  {viewMode === "detailed" && (
                    <div className="space-y-6">
                      {paginatedStudents.length > 0 ? (
                        paginatedStudents.map((student) => (
                          <motion.div
                            key={student.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card>
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                      <span className="text-lg font-bold text-primary">{student.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                      <CardTitle className="flex items-center gap-2">
                                        {student.name}
                                        <Badge
                                          variant={
                                            student.status === "نشط"
                                              ? "default"
                                              : student.status === "غير نشط"
                                                ? "destructive"
                                                : "outline"
                                          }
                                        >
                                          {student.status}
                                        </Badge>
                                      </CardTitle>
                                      <CardDescription>
                                        {student.grade} - {student.classroom} | الرقم: {student.studentId}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <Checkbox
                                    checked={selectedStudents.includes(student.id)}
                                    onCheckedChange={() => toggleSelectStudent(student.id)}
                                    aria-label={`تحديد ${student.name}`}
                                  />
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">معلومات الاتصال</h4>
                                      <div className="text-sm space-y-1">
                                        <p className="flex items-center gap-2">
                                          <span className="text-muted-foreground">رقم ولي الأمر:</span>
                                          <span dir="ltr">{student.parentPhone}</span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-green-700 hover:text-green-800 hover:bg-green-50"
                                            onClick={() => sendWhatsAppToParent(student)}
                                          >
                                            <MessageCircle className="h-4 w-4 ml-1" />
                                            واتساب
                                          </Button>
                                        </p>
                                        {student.parentEmail && (
                                          <p className="flex items-center gap-2">
                                            <span className="text-muted-foreground">البريد الإلكتروني:</span>
                                            <span dir="ltr">{student.parentEmail}</span>
                                          </p>
                                        )}
                                        {student.emergencyContact && (
                                          <p className="flex items-center gap-2">
                                            <span className="text-muted-foreground">رقم الطوارئ:</span>
                                            <span dir="ltr">{student.emergencyContact}</span>
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="text-sm font-medium mb-1">معلومات شخصية</h4>
                                      <div className="text-sm space-y-1">
                                        <p className="flex items-center gap-2">
                                          <span className="text-muted-foreground">تاريخ الميلاد:</span>
                                          <span>{student.birthDate}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                          <span className="text-muted-foreground">العنوان:</span>
                                          <span>{student.address}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                          <span className="text-muted-foreground">تاريخ الالتحاق:</span>
                                          <span>{student.joinDate || "غير محدد"}</span>
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">الأداء الأكاديمي</h4>
                                      <div className="space-y-3">
                                        <div>
                                          <div className="flex justify-between text-sm mb-1">
                                            <span>نسبة الحضور</span>
                                            <span>{student.attendance || 0}%</span>
                                          </div>
                                          <Progress
                                            value={student.attendance}
                                            className={`h-2 ${getProgressColor(student.attendance || 0)}`}
                                          />
                                        </div>
                                        <div>
                                          <div className="flex justify-between text-sm mb-1">
                                            <span>الأداء الأكاديمي</span>
                                            <span>{student.academicPerformance || 0}%</span>
                                          </div>
                                          <Progress
                                            value={student.academicPerformance}
                                            className={`h-2 ${getProgressColor(student.academicPerformance || 0)}`}
                                          />
                                        </div>
                                        <div>
                                          <div className="flex justify-between text-sm mb-1">
                                            <span>تقييم السلوك</span>
                                            <span>{student.behaviorRating || 0}%</span>
                                          </div>
                                          <Progress
                                            value={student.behaviorRating}
                                            className={`h-2 ${getProgressColor(student.behaviorRating || 0)}`}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {student.medicalNotes && (
                                      <div>
                                        <h4 className="text-sm font-medium mb-1">ملاحظات طبية</h4>
                                        <p className="text-sm">{student.medicalNotes}</p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">الأنشطة</h4>
                                      <div className="flex flex-wrap gap-1">
                                        {student.activities && student.activities.length > 0 ? (
                                          student.activities.map((activity, index) => (
                                            <Badge key={index} variant="outline">
                                              {activity}
                                            </Badge>
                                          ))
                                        ) : (
                                          <span className="text-sm text-muted-foreground">لا توجد أنشطة مسجلة</span>
                                        )}
                                      </div>
                                    </div>

                                    {student.notes && (
                                      <div>
                                        <h4 className="text-sm font-medium mb-1">ملاحظات</h4>
                                        <p className="text-sm">{student.notes}</p>
                                      </div>
                                    )}

                                    <div>
                                      <h4 className="text-sm font-medium mb-1">آخر تسجيل دخول</h4>
                                      <p className="text-sm">{student.lastLogin || "غير محدد"}</p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="flex justify-end gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentStudent(student)
                                    setViewDialogOpen(true)
                                  }}
                                >
                                  عرض التفاصيل
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentStudent(student)
                                    setEditDialogOpen(true)
                                  }}
                                >
                                  <Pencil className="h-4 w-4 ml-1" />
                                  تعديل
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 hover:text-red-600"
                                  onClick={() => {
                                    setCurrentStudent(student)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 ml-1" />
                                  حذف
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleStudentStatus(student)
                                  }}
                                  className={student.status === "نشط" ? "text-red-500" : "text-green-500"}
                                >
                                  {student.status === "نشط" ? (
                                    <>
                                      <UserX className="h-4 w-4 ml-1" />
                                      إلغاء تنشيط
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-4 w-4 ml-1" />
                                      تنشيط
                                    </>
                                  )}
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-muted-foreground">لا توجد طالبات تطابق معايير البحث</div>
                      )}
                    </div>
                  )}

                  {sortedStudents.length > 0 && (
                    <div className="flex items-center justify-between border-t pt-4 mt-4">
                      <p className="text-sm text-muted-foreground">
                        الصفحة {normalizedCurrentPage} من {totalPages} - عرض {paginatedStudents.length} من أصل{" "}
                        {sortedStudents.length}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={normalizedCurrentPage === 1}
                        >
                          السابق
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={normalizedCurrentPage === totalPages}
                        >
                          التالي
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* مربع حوار إضافة طالبة جديدة */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة طالبة جديدة</DialogTitle>
            <DialogDescription>أدخل بيانات الطالبة الجديدة. جميع الحقول المميزة بـ * مطلوبة.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الطالبة *</Label>
                <Input
                  id="name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="الاسم الكامل"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">رقم الطالبة *</Label>
                <Input
                  id="studentId"
                  value={newStudent.studentId}
                  onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                  placeholder="الرقم التعريفي"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">الصف الدراسي *</Label>
                <Select
                  value={newStudent.grade}
                  onValueChange={(value) => setNewStudent({ ...newStudent, grade: value })}
                >
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classroom">الفصل *</Label>
                <Select
                  value={newStudent.classroom}
                  onValueChange={(value) => setNewStudent({ ...newStudent, classroom: value })}
                >
                  <SelectTrigger id="classroom">
                    <SelectValue placeholder="اختر الفصل" />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms.map((classroom) => (
                      <SelectItem key={classroom} value={classroom}>
                        {classroom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentPhone">رقم هاتف ولي الأمر *</Label>
                <Input
                  id="parentPhone"
                  value={newStudent.parentPhone}
                  onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentEmail">البريد الإلكتروني لولي الأمر</Label>
                <Input
                  id="parentEmail"
                  value={newStudent.parentEmail || ""}
                  onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })}
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select
                  value={newStudent.status}
                  onValueChange={(value: "نشط" | "غير نشط" | "منقول") =>
                    setNewStudent({ ...newStudent, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نشط">نشط</SelectItem>
                    <SelectItem value="غير نشط">غير نشط</SelectItem>
                    <SelectItem value="منقول">منقول</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">تاريخ الميلاد</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={newStudent.birthDate}
                  onChange={(e) => setNewStudent({ ...newStudent, birthDate: e.target.value })}
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">رقم للطوارئ</Label>
                <Input
                  id="emergencyContact"
                  value={newStudent.emergencyContact || ""}
                  onChange={(e) => setNewStudent({ ...newStudent, emergencyContact: e.target.value })}
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activities">الأنشطة</Label>
                <Select
                  value={newStudent.activities?.length ? newStudent.activities[0] : ""}
                  onValueChange={(value) => setNewStudent({ ...newStudent, activities: value ? [value] : [] })}
                >
                  <SelectTrigger id="activities">
                    <SelectValue placeholder="اختر نشاط" />
                  </SelectTrigger>
                  <SelectContent>
                    {activities.map((activity) => (
                      <SelectItem key={activity} value={activity}>
                        {activity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={newStudent.address}
                  onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                  placeholder="العنوان التفصيلي"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="medicalNotes">ملاحظات طبية</Label>
                <Input
                  id="medicalNotes"
                  value={newStudent.medicalNotes || ""}
                  onChange={(e) => setNewStudent({ ...newStudent, medicalNotes: e.target.value })}
                  placeholder="أي ملاحظات طبية خاصة"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">ملاحظات عامة</Label>
                <Input
                  id="notes"
                  value={newStudent.notes || ""}
                  onChange={(e) => setNewStudent({ ...newStudent, notes: e.target.value })}
                  placeholder="أي ملاحظات إضافية"
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddStudent} className="bg-[#0a8a74] hover:bg-[#097a67]">
              إضافة الطالبة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار تعديل بيانات طالبة */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الطالبة</DialogTitle>
            <DialogDescription>تعديل بيانات الطالبة {currentStudent?.name}</DialogDescription>
          </DialogHeader>

          {currentStudent && (
            <ScrollArea className="max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">اسم الطالبة</Label>
                  <Input
                    id="edit-name"
                    value={currentStudent.name}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-studentId">رقم الطالبة</Label>
                  <Input
                    id="edit-studentId"
                    value={currentStudent.studentId}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, studentId: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-grade">الصف الدراسي</Label>
                  <Select
                    value={currentStudent.grade}
                    onValueChange={(value) => setCurrentStudent({ ...currentStudent, grade: value })}
                  >
                    <SelectTrigger id="edit-grade">
                      <SelectValue placeholder={currentStudent.grade || "اختر الصف"} />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-classroom">الفصل</Label>
                  <Select
                    value={currentStudent.classroom}
                    onValueChange={(value) => setCurrentStudent({ ...currentStudent, classroom: value })}
                  >
                    <SelectTrigger id="edit-classroom">
                      <SelectValue placeholder={currentStudent.classroom || "اختر الفصل"} />
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map((classroom) => (
                        <SelectItem key={classroom} value={classroom}>
                          {classroom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-parentPhone">رقم هاتف ولي الأمر</Label>
                  <Input
                    id="edit-parentPhone"
                    value={currentStudent.parentPhone}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, parentPhone: e.target.value })}
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-parentEmail">البريد الإلكتروني لولي الأمر</Label>
                  <Input
                    id="edit-parentEmail"
                    value={currentStudent.parentEmail || ""}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, parentEmail: e.target.value })}
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">الحالة</Label>
                  <Select
                    value={currentStudent.status}
                    onValueChange={(value: "نشط" | "غير نشط" | "منقول") =>
                      setCurrentStudent({ ...currentStudent, status: value })
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder={currentStudent.status || "اختر الحالة"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="نشط">نشط</SelectItem>
                      <SelectItem value="غير نشط">غير نشط</SelectItem>
                      <SelectItem value="منقول">منقول</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-birthDate">تاريخ الميلاد</Label>
                  <Input
                    id="edit-birthDate"
                    type="date"
                    value={currentStudent.birthDate}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, birthDate: e.target.value })}
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-attendance">نسبة الحضور</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-attendance"
                      type="number"
                      min="0"
                      max="100"
                      value={currentStudent.attendance || 0}
                      onChange={(e) =>
                        setCurrentStudent({
                          ...currentStudent,
                          attendance: Number.parseInt(e.target.value),
                        })
                      }
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-academicPerformance">الأداء الأكاديمي</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-academicPerformance"
                      type="number"
                      min="0"
                      max="100"
                      value={currentStudent.academicPerformance || 0}
                      onChange={(e) =>
                        setCurrentStudent({
                          ...currentStudent,
                          academicPerformance: Number.parseInt(e.target.value),
                        })
                      }
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-activities">الأنشطة</Label>
                  <Select
                    value={currentStudent.activities?.length ? currentStudent.activities[0] : ""}
                    onValueChange={(value) =>
                      setCurrentStudent({
                        ...currentStudent,
                        activities: value ? [value] : [],
                      })
                    }
                  >
                    <SelectTrigger id="edit-activities">
                      <SelectValue placeholder="اختر نشاط" />
                    </SelectTrigger>
                    <SelectContent>
                      {activities.map((activity) => (
                        <SelectItem key={activity} value={activity}>
                          {activity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-address">العنوان</Label>
                  <Input
                    id="edit-address"
                    value={currentStudent.address}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-medicalNotes">ملاحظات طبية</Label>
                  <Input
                    id="edit-medicalNotes"
                    value={currentStudent.medicalNotes || ""}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, medicalNotes: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-notes">ملاحظات عامة</Label>
                  <Input
                    id="edit-notes"
                    value={currentStudent.notes || ""}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, notes: e.target.value })}
                  />
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleEditStudent} className="bg-[#0a8a74] hover:bg-[#097a67]">
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار حذف طالبة */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف الطالبة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف بيانات الطالبة {currentStudent?.name} نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStudent} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* مربع حوار عرض بيانات طالبة */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>بيانات الطالبة</DialogTitle>
            <DialogDescription>عرض كافة بيانات الطالبة</DialogDescription>
          </DialogHeader>

          {currentStudent && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 p-1">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{currentStudent.name.charAt(0)}</span>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{currentStudent.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          currentStudent.status === "نشط"
                            ? "default"
                            : currentStudent.status === "غير نشط"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {currentStudent.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {currentStudent.grade} - {currentStudent.classroom}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">الرقم التعريفي: {currentStudent.studentId}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">المعلومات الشخصية</h3>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">تاريخ الميلاد</h4>
                        <p>{currentStudent.birthDate || "غير محدد"}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">العنوان</h4>
                        <p>{currentStudent.address}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">تاريخ الالتحاق</h4>
                        <p>{currentStudent.joinDate || "غير محدد"}</p>
                      </div>

                      {currentStudent.medicalNotes && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">ملاحظات طبية</h4>
                          <p>{currentStudent.medicalNotes}</p>
                        </div>
                      )}

                      {currentStudent.notes && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">ملاحظات عامة</h4>
                          <p>{currentStudent.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">معلومات الاتصال</h3>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">رقم هاتف ولي الأمر</h4>
                        <p dir="ltr" className="text-right">
                          {currentStudent.parentPhone}
                        </p>
                      </div>

                      {currentStudent.parentEmail && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">البريد الإلكتروني لولي الأمر</h4>
                          <p dir="ltr" className="text-right">
                            {currentStudent.parentEmail}
                          </p>
                        </div>
                      )}

                      {currentStudent.emergencyContact && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">رقم للطوارئ</h4>
                          <p dir="ltr" className="text-right">
                            {currentStudent.emergencyContact}
                          </p>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mt-6 mb-3">الأداء</h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <h4 className="text-sm font-medium text-muted-foreground">نسبة الحضور</h4>
                          <span>{currentStudent.attendance || 0}%</span>
                        </div>
                        <Progress
                          value={currentStudent.attendance}
                          className={`h-2 ${getProgressColor(currentStudent.attendance || 0)}`}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <h4 className="text-sm font-medium text-muted-foreground">الأداء الأكاديمي</h4>
                          <span>{currentStudent.academicPerformance || 0}%</span>
                        </div>
                        <Progress
                          value={currentStudent.academicPerformance}
                          className={`h-2 ${getProgressColor(currentStudent.academicPerformance || 0)}`}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <h4 className="text-sm font-medium text-muted-foreground">تقييم السلوك</h4>
                          <span>{currentStudent.behaviorRating || 0}%</span>
                        </div>
                        <Progress
                          value={currentStudent.behaviorRating}
                          className={`h-2 ${getProgressColor(currentStudent.behaviorRating || 0)}`}
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mt-6 mb-3">الأنشطة</h3>
                    <div className="flex flex-wrap gap-1">
                      {currentStudent.activities && currentStudent.activities.length > 0 ? (
                        currentStudent.activities.map((activity, index) => (
                          <Badge key={index} variant="outline">
                            {activity}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">لا توجد أنشطة مسجلة</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              إغلاق
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setViewDialogOpen(false)
                setEditDialogOpen(true)
              }}
            >
              تعديل البيانات
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                toggleStudentStatus(currentStudent)
                setViewDialogOpen(false)
              }}
              className={currentStudent?.status === "نشط" ? "text-red-500" : "text-green-500"}
            >
              {currentStudent?.status === "نشط" ? (
                <>
                  <UserX className="h-4 w-4 ml-1" />
                  إلغاء تنشيط
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 ml-1" />
                  تنشيط
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار الإجراءات المتعددة */}
      <AlertDialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الإجراء المتعدد</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف {selectedStudents.length} طالبة؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkAction("delete")}
              className="bg-destructive text-destructive-foreground"
            >
              حذف {selectedStudents.length} طالبة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* مربع حوار تصدير البيانات */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>تصدير بيانات الطالبات</DialogTitle>
            <DialogDescription>اختر خيارات التصدير المناسبة</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>تنسيق الملف</Label>
                <RadioGroup
                  value={exportFormat}
                  onValueChange={(value: "csv" | "excel" | "pdf") => setExportFormat(value)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="csv" id="format-csv" />
                    <Label htmlFor="format-csv" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" />
                      <span>CSV</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="excel" id="format-excel" />
                    <Label htmlFor="format-excel" className="flex items-center gap-2 cursor-pointer">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Excel</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="pdf" id="format-pdf" />
                    <Label htmlFor="format-pdf" className="flex items-center gap-2 cursor-pointer">
                      <FilePdf className="h-4 w-4" />
                      <span>PDF</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>نطاق التصدير</Label>
                <RadioGroup
                  value={exportScope}
                  onValueChange={(value: "filtered" | "all" | "selected") => setExportScope(value)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="filtered" id="scope-filtered" />
                    <Label htmlFor="scope-filtered" className="cursor-pointer">
                      الطالبات المصفاة ({filteredStudents.length} طالبة)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="all" id="scope-all" />
                    <Label htmlFor="scope-all" className="cursor-pointer">
                      جميع الطالبات ({students.length} طالبة)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="selected" id="scope-selected" disabled={selectedStudents.length === 0} />
                    <Label
                      htmlFor="scope-selected"
                      className={`cursor-pointer ${selectedStudents.length === 0 ? "opacity-50" : ""}`}
                    >
                      الطالبات المحددة ({selectedStudents.length} طالبة)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="export-filename">اسم الملف</Label>
                <Input
                  id="export-filename"
                  value={exportFileName}
                  onChange={(e) => setExportFileName(e.target.value)}
                  placeholder="اسم ملف التصدير"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-header">تضمين رأس الجدول</Label>
                  <Switch id="include-header" checked={includeHeader} onCheckedChange={setIncludeHeader} />
                </div>
              </div>

              {exportFormat === "pdf" && (
                <div className="space-y-2">
                  <Label>اتجاه الصفحة</Label>
                  <RadioGroup
                    value={exportOrientation}
                    onValueChange={(value: "portrait" | "landscape") => setExportOrientation(value)}
                    className="flex space-x-4 space-x-reverse"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="portrait" id="orientation-portrait" />
                      <Label htmlFor="orientation-portrait" className="cursor-pointer">
                        عمودي
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="landscape" id="orientation-landscape" />
                      <Label htmlFor="orientation-landscape" className="cursor-pointer">
                        أفقي
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>الحقول المراد تصديرها</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllExportFields}>
                    تحديد الكل
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllExportFields}>
                    إلغاء الكل
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[300px] border rounded-md p-2">
                <div className="space-y-2">
                  {exportableFields.map((field) => (
                    <div key={field.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`field-${field.id}`}
                        checked={exportFields.includes(field.id)}
                        onCheckedChange={() => toggleExportField(field.id)}
                      />
                      <Label htmlFor={`field-${field.id}`} className="cursor-pointer">
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleExport} className="bg-[#0a8a74] hover:bg-[#097a67]">
              <Download className="h-4 w-4 ml-2" />
              تصدير البيانات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* عنصر الرابط المخفي للتنزيل */}
      <a ref={exportLinkRef} className="hidden" />
    </div>
  )
}
