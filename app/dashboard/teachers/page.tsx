"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pencil,
  Trash2,
  UserPlus,
  Search,
  X,
  RefreshCw,
  SlidersHorizontal,
  Users,
  UserCheck,
  UserX,
  Eye,
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart3,
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

// نموذج بيانات المعلمة
interface Teacher {
  id: string
  name: string
  teacherId: string
  specialization: string
  department: string
  phone: string
  status: "نشط" | "غير نشط" | "إجازة"
  birthDate: string
  address: string
  notes?: string
  attendance?: number
  performance?: number
  lastLogin?: string
  profileImage?: string
  email?: string
  emergencyContact?: string
  medicalNotes?: string
  joinDate?: string
  classes?: string[]
  subjects?: string[]
}

// بيانات تجريبية للمعلمات
const initialTeachers: Teacher[] = [
  {
    id: "1",
    name: "نورة الأحمد",
    teacherId: "T10001",
    specialization: "رياضيات",
    department: "قسم الرياضيات",
    phone: "0501234567",
    status: "نشط",
    birthDate: "1985-05-15",
    address: "الرياض، حي النزهة",
    attendance: 98,
    performance: 92,
    lastLogin: "2023-09-15",
    email: "noura@example.com",
    emergencyContact: "0509876543",
    classes: ["الصف الأول", "الصف الثاني"],
    subjects: ["رياضيات أساسية", "جبر"],
    joinDate: "2018-08-28",
  },
  {
    id: "2",
    name: "سارة المحمد",
    teacherId: "T10002",
    specialization: "علوم",
    department: "قسم العلوم",
    phone: "0507654321",
    status: "نشط",
    birthDate: "1987-03-22",
    address: "الرياض، حي الملقا",
    attendance: 95,
    performance: 90,
    lastLogin: "2023-09-14",
    email: "sarah@example.com",
    emergencyContact: "0501122334",
    classes: ["الصف الثاني", "الصف الثالث"],
    subjects: ["أحياء", "كيمياء"],
    joinDate: "2019-08-29",
  },
  {
    id: "3",
    name: "منى العبدالله",
    teacherId: "T10003",
    specialization: "لغة عربية",
    department: "قسم اللغة العربية",
    phone: "0551234567",
    status: "نشط",
    birthDate: "1982-11-10",
    address: "الرياض، حي الياسمين",
    attendance: 97,
    performance: 95,
    lastLogin: "2023-09-13",
    email: "mona@example.com",
    emergencyContact: "0552233445",
    classes: ["الصف الأول", "الصف الثالث"],
    subjects: ["نحو", "أدب عربي"],
    joinDate: "2017-08-30",
  },
  {
    id: "4",
    name: "هند السعد",
    teacherId: "T10004",
    specialization: "لغة إنجليزية",
    department: "قسم اللغة الإنجليزية",
    phone: "0561234567",
    status: "غير نشط",
    birthDate: "1988-09-05",
    address: "الرياض، حي الورود",
    attendance: 75,
    performance: 80,
    lastLogin: "2023-08-20",
    email: "hind@example.com",
    emergencyContact: "0563344556",
    medicalNotes: "إجازة مرضية",
    classes: ["الصف الثاني"],
    subjects: ["قواعد اللغة الإنجليزية"],
    joinDate: "2020-08-28",
  },
  {
    id: "5",
    name: "عبير الخالد",
    teacherId: "T10005",
    specialization: "تربية إسلامية",
    department: "قسم التربية الإسلامية",
    phone: "0571234567",
    status: "نشط",
    birthDate: "1980-07-18",
    address: "الرياض، حي الربيع",
    attendance: 99,
    performance: 93,
    lastLogin: "2023-09-15",
    email: "abeer@example.com",
    emergencyContact: "0574455667",
    classes: ["الصف الأول", "الصف الثاني", "الصف الثالث"],
    subjects: ["قرآن", "توحيد"],
    joinDate: "2016-08-29",
  },
  {
    id: "6",
    name: "ريم الفهد",
    teacherId: "T10006",
    specialization: "حاسب آلي",
    department: "قسم الحاسب",
    phone: "0581234567",
    status: "نشط",
    birthDate: "1990-04-12",
    address: "الرياض، حي العليا",
    attendance: 96,
    performance: 98,
    lastLogin: "2023-09-15",
    email: "reem@example.com",
    emergencyContact: "0585566778",
    classes: ["الصف الثاني", "الصف الثالث"],
    subjects: ["برمجة", "تقنية معلومات"],
    joinDate: "2021-08-30",
  },
  {
    id: "7",
    name: "لمياء السلطان",
    teacherId: "T10007",
    specialization: "اجتماعيات",
    department: "قسم الاجتماعيات",
    phone: "0591234567",
    status: "إجازة",
    birthDate: "1983-02-25",
    address: "الرياض، حي الصحافة",
    attendance: 85,
    performance: 88,
    lastLogin: "2023-07-10",
    email: "lamia@example.com",
    emergencyContact: "0596677889",
    classes: ["الصف الأول"],
    subjects: ["تاريخ", "جغرافيا"],
    joinDate: "2019-08-28",
  },
  {
    id: "8",
    name: "أمل الناصر",
    teacherId: "T10008",
    specialization: "فنية",
    department: "قسم التربية الفنية",
    phone: "0501122334",
    status: "نشط",
    birthDate: "1986-10-30",
    address: "الرياض، حي النخيل",
    attendance: 94,
    performance: 91,
    lastLogin: "2023-09-14",
    email: "amal@example.com",
    emergencyContact: "0507788990",
    classes: ["الصف الأول", "الصف الثاني", "الصف الثالث"],
    subjects: ["رسم", "أشغال يدوية"],
    joinDate: "2018-08-29",
  },
]

// قائمة التخصصات
const specializations = [
  "رياضيات",
  "علوم",
  "لغة عربية",
  "لغة إنجليزية",
  "تربية إسلامية",
  "حاسب آلي",
  "اجتماعيات",
  "فنية",
  "تربية بدنية",
]

// قائمة الأقسام
const departments = [
  "قسم الرياضيات",
  "قسم العلوم",
  "قسم اللغة العربية",
  "قسم اللغة الإنجليزية",
  "قسم التربية الإسلامية",
  "قسم الحاسب",
  "قسم الاجتماعيات",
  "قسم التربية الفنية",
  "قسم التربية البدنية",
]

// قائمة الصفوف
const classes = ["الصف الأول", "الصف الثاني", "الصف الثالث", "الصف الرابع", "الصف الخامس", "الصف السادس"]

// قائمة المواد
const subjects = [
  "رياضيات أساسية",
  "جبر",
  "هندسة",
  "أحياء",
  "كيمياء",
  "فيزياء",
  "نحو",
  "أدب عربي",
  "قواعد اللغة الإنجليزية",
  "قرآن",
  "توحيد",
  "فقه",
  "برمجة",
  "تقنية معلومات",
  "تاريخ",
  "جغرافيا",
  "رسم",
  "أشغال يدوية",
]

const TEACHERS_STORAGE_KEY = "teachersData"

export default function TeachersPage() {
  const { toast } = useToast()
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers)
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSpecialization, setFilterSpecialization] = useState<string>("")
  const [filterDepartment, setFilterDepartment] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [filterClass, setFilterClass] = useState<string>("")
  const [sortField, setSortField] = useState<keyof Teacher>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"table" | "cards" | "detailed">("table")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [attendanceFilter, setAttendanceFilter] = useState<number | null>(null)
  const [performanceFilter, setPerformanceFilter] = useState<number | null>(null)

  // حالات مربعات الحوار
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false)
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // نموذج إضافة معلمة جديدة
  const [newTeacher, setNewTeacher] = useState<Omit<Teacher, "id">>({
    name: "",
    teacherId: "",
    specialization: "",
    department: "",
    phone: "",
    status: "نشط",
    birthDate: "",
    address: "",
    attendance: 100,
    performance: 90,
    classes: [],
    subjects: [],
  })

  // تحميل بيانات المعلمات من localStorage عند فتح الصفحة
  useEffect(() => {
    try {
      const savedTeachers = localStorage.getItem(TEACHERS_STORAGE_KEY)
      if (savedTeachers) {
        const parsedTeachers = JSON.parse(savedTeachers)
        if (Array.isArray(parsedTeachers)) {
          setTeachers(parsedTeachers)
        }
      }
    } catch (error) {
      console.error("فشل تحميل بيانات المعلمات من التخزين المحلي:", error)
    } finally {
      setHasLoadedFromStorage(true)
    }
  }, [])

  // حفظ بيانات المعلمات تلقائياً بعد أي تعديل
  useEffect(() => {
    if (!hasLoadedFromStorage) return
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(teachers))
  }, [teachers, hasLoadedFromStorage])

  // محاكاة تحميل البيانات
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [refreshTrigger])

  // تصفية المعلمات حسب البحث والفلاتر
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.includes(searchTerm) ||
      teacher.teacherId.includes(searchTerm) ||
      teacher.phone.includes(searchTerm) ||
      (teacher.email && teacher.email.includes(searchTerm))

    const matchesSpecialization = filterSpecialization ? teacher.specialization === filterSpecialization : true
    const matchesDepartment = filterDepartment ? teacher.department === filterDepartment : true
    const matchesStatus = filterStatus ? teacher.status === filterStatus : true
    const matchesClass = filterClass ? teacher.classes?.some((cls) => cls === filterClass) : true

    const matchesAttendance = attendanceFilter ? (teacher.attendance || 0) >= attendanceFilter : true
    const matchesPerformance = performanceFilter ? (teacher.performance || 0) >= performanceFilter : true

    return (
      matchesSearch &&
      matchesSpecialization &&
      matchesDepartment &&
      matchesStatus &&
      matchesClass &&
      matchesAttendance &&
      matchesPerformance
    )
  })

  // ترتيب المعلمات
  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
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

  // تبديل اتجاه الترتيب
  const toggleSort = (field: keyof Teacher) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // إضافة معلمة جديدة
  const handleAddTeacher = () => {
    const maxId = teachers.length > 0 ? Math.max(...teachers.map((t) => Number.parseInt(t.id, 10) || 0)) : 0
    const newId = (maxId + 1).toString()
    const teacherWithId = {
      ...newTeacher,
      id: newId,
      joinDate: new Date().toISOString().split("T")[0],
      lastLogin: new Date().toISOString().split("T")[0],
    }

    setTeachers([...teachers, teacherWithId])
    setAddDialogOpen(false)
    toast({
      title: "تمت الإضافة بنجاح",
      description: `تمت إضافة المعلمة ${newTeacher.name} بنجاح`,
      variant: "default",
    })

    // إعادة تعيين نموذج الإضافة
    setNewTeacher({
      name: "",
      teacherId: "",
      specialization: "",
      department: "",
      phone: "",
      status: "نشط",
      birthDate: "",
      address: "",
      attendance: 100,
      performance: 90,
      classes: [],
      subjects: [],
    })
  }

  // تعديل بيانات معلمة
  const handleEditTeacher = () => {
    if (!currentTeacher) return

    setTeachers(teachers.map((teacher) => (teacher.id === currentTeacher.id ? currentTeacher : teacher)))

    setEditDialogOpen(false)
    toast({
      title: "تم التعديل بنجاح",
      description: `تم تعديل بيانات المعلمة ${currentTeacher.name} بنجاح`,
      variant: "default",
    })
  }

  // حذف معلمة
  const handleDeleteTeacher = () => {
    if (!currentTeacher) return

    setTeachers(teachers.filter((teacher) => teacher.id !== currentTeacher.id))
    setDeleteDialogOpen(false)
    toast({
      title: "تم الحذف بنجاح",
      description: `تم حذف المعلمة ${currentTeacher.name} بنجاح`,
      variant: "destructive",
    })
  }

  // تغيير حالة المعلمة (نشط/غير نشط)
  const toggleTeacherStatus = (teacher: Teacher | null) => {
    if (!teacher) return

    const newStatus: Teacher["status"] = teacher.status === "نشط" ? "غير نشط" : "نشط"
    const updatedTeachers = teachers.map((t) => {
      if (t.id === teacher.id) {
        return { ...t, status: newStatus }
      }
      return t
    })

    setTeachers(updatedTeachers)

    toast({
      title: "تم تغيير الحالة بنجاح",
      description: `تم تغيير حالة المعلمة ${teacher.name} إلى ${newStatus}`,
      variant: newStatus === "نشط" ? "default" : "destructive",
    })
  }

  // تحديد/إلغاء تحديد جميع المعلمات
  const toggleSelectAll = () => {
    if (selectedTeachers.length === filteredTeachers.length) {
      setSelectedTeachers([])
    } else {
      setSelectedTeachers(filteredTeachers.map((teacher) => teacher.id))
    }
  }

  // تحديد/إلغاء تحديد معلمة
  const toggleSelectTeacher = (id: string) => {
    if (selectedTeachers.includes(id)) {
      setSelectedTeachers(selectedTeachers.filter((teacherId) => teacherId !== id))
    } else {
      setSelectedTeachers([...selectedTeachers, id])
    }
  }

  // إجراء على المعلمات المحددة
  const handleBulkAction = (action: "activate" | "deactivate" | "delete") => {
    if (selectedTeachers.length === 0) return

    let updatedTeachers = [...teachers]
    let actionMessage = ""

    if (action === "delete") {
      updatedTeachers = teachers.filter((teacher) => !selectedTeachers.includes(teacher.id))
      actionMessage = "تم حذف المعلمات المحددة بنجاح"
    } else {
      updatedTeachers = teachers.map((teacher) => {
        if (selectedTeachers.includes(teacher.id)) {
          return {
            ...teacher,
            status: action === "activate" ? "نشط" : "غير نشط",
          }
        }
        return teacher
      })
      actionMessage =
        action === "activate" ? "تم تنشيط المعلمات المحددة بنجاح" : "تم إلغاء تنشيط المعلمات المحددة بنجاح"
    }

    setTeachers(updatedTeachers)
    setSelectedTeachers([])
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
    setFilterSpecialization("")
    setFilterDepartment("")
    setFilterStatus("")
    setFilterClass("")
    setAttendanceFilter(null)
    setPerformanceFilter(null)
    setShowAdvancedFilters(false)
  }

  // تحديث البيانات
  const refreshData = () => {
    setIsLoading(true)
    setRefreshTrigger((prev) => prev + 1)

    toast({
      title: "جاري تحديث البيانات",
      description: "يتم تحديث بيانات المعلمات...",
    })
  }

  // إحصائيات المعلمات
  const teacherStats = {
    total: teachers.length,
    active: teachers.filter((t) => t.status === "نشط").length,
    inactive: teachers.filter((t) => t.status === "غير نشط").length,
    onLeave: teachers.filter((t) => t.status === "إجازة").length,
    averageAttendance: Math.round(
      teachers.reduce((sum, teacher) => sum + (teacher.attendance || 0), 0) / teachers.length,
    ),
    averagePerformance: Math.round(
      teachers.reduce((sum, teacher) => sum + (teacher.performance || 0), 0) / teachers.length,
    ),
  }

  // تحديد لون البطاقة حسب الحالة
  const getCardColor = (status: string) => {
    switch (status) {
      case "نشط":
        return "border-green-200 bg-green-50"
      case "غير نشط":
        return "border-red-200 bg-red-50"
      case "إجازة":
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
            <h1 className="text-3xl font-bold">إدارة المعلمات</h1>
            <p className="text-gray-500 mt-1">إضافة وتعديل وحذف بيانات المعلمات</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="flex items-center gap-2 bg-[#0a8a74] hover:bg-[#097a67]"
            >
              <UserPlus className="h-4 w-4" />
              <span>إضافة معلمة</span>
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
              إجمالي المعلمات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teacherStats.total}</div>
            <p className="text-sm text-muted-foreground mt-1">معلمة مسجلة في النظام</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-green-300 transition-colors"
          onClick={() => applyStatusFilter("نشط")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              المعلمات النشطات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teacherStats.active}</div>
            <p className="text-sm text-muted-foreground mt-1">
              نسبة {Math.round((teacherStats.active / teacherStats.total) * 100)}% من الإجمالي
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
              المعلمات غير النشطات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teacherStats.inactive}</div>
            <p className="text-sm text-muted-foreground mt-1">
              نسبة {Math.round((teacherStats.inactive / teacherStats.total) * 100)}% من الإجمالي
            </p>
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
            <div className="text-3xl font-bold">{teacherStats.averagePerformance}%</div>
            <div className="mt-2">
              <Progress value={teacherStats.averagePerformance} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>قائمة المعلمات</CardTitle>
              <CardDescription>
                {isLoading ? (
                  <span>جاري تحميل البيانات...</span>
                ) : (
                  <span>
                    عدد المعلمات: {filteredTeachers.length} من أصل {teachers.length}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
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
                  <DropdownMenuItem onClick={() => applyStatusFilter("إجازة")}>إجازة</DropdownMenuItem>
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

              {selectedTeachers.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      إجراءات ({selectedTeachers.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>إجراءات متعددة</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkAction("activate")}>
                      تنشيط المعلمات المحددة
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("deactivate")}>
                      إلغاء تنشيط المعلمات المحددة
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setBulkActionDialogOpen(true)} className="text-red-500">
                      حذف المعلمات المحددة
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="list">قائمة المعلمات</TabsTrigger>
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
                        placeholder="اسم المعلمة أو الرقم أو رقم الهاتف"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>التخصص</Label>
                    <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
                      <SelectTrigger>
                        <SelectValue placeholder="جميع التخصصات" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">جميع التخصصات</SelectItem>
                        {specializations.map((specialization) => (
                          <SelectItem key={specialization} value={specialization}>
                            {specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>القسم</Label>
                    <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="جميع الأقسام" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">جميع الأقسام</SelectItem>
                        {departments.map((department) => (
                          <SelectItem key={department} value={department}>
                            {department}
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
                        <SelectItem value="إجازة">إجازة</SelectItem>
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
                          <Label>الصف</Label>
                          <Select value={filterClass} onValueChange={setFilterClass}>
                            <SelectTrigger>
                              <SelectValue placeholder="جميع الصفوف" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">جميع الصفوف</SelectItem>
                              {classes.map((cls) => (
                                <SelectItem key={cls} value={cls}>
                                  {cls}
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
                          <Label>الأداء (أكبر من أو يساوي)</Label>
                          <Select
                            value={performanceFilter?.toString() || ""}
                            onValueChange={(value) => setPerformanceFilter(value ? Number.parseInt(value) : null)}
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
                                  selectedTeachers.length === filteredTeachers.length && filteredTeachers.length > 0
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
                            <TableHead
                              className="text-right cursor-pointer"
                              onClick={() => toggleSort("specialization")}
                            >
                              <div className="flex items-center gap-1">
                                التخصص
                                {sortField === "specialization" &&
                                  (sortDirection === "asc" ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  ))}
                              </div>
                            </TableHead>
                            <TableHead className="text-right">القسم</TableHead>
                            <TableHead className="text-right">رقم الهاتف</TableHead>
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
                          {sortedTeachers.length > 0 ? (
                            sortedTeachers.map((teacher) => (
                              <TableRow key={teacher.id} className="hover:bg-muted/50">
                                <TableCell>
                                  <Checkbox
                                    checked={selectedTeachers.includes(teacher.id)}
                                    onCheckedChange={() => toggleSelectTeacher(teacher.id)}
                                    aria-label={`تحديد ${teacher.name}`}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{teacher.name}</TableCell>
                                <TableCell>{teacher.teacherId}</TableCell>
                                <TableCell>{teacher.specialization}</TableCell>
                                <TableCell>{teacher.department}</TableCell>
                                <TableCell dir="ltr" className="text-right">
                                  {teacher.phone}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      teacher.status === "نشط"
                                        ? "default"
                                        : teacher.status === "غير نشط"
                                          ? "destructive"
                                          : "outline"
                                    }
                                  >
                                    {teacher.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setCurrentTeacher(teacher)
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
                                        setCurrentTeacher(teacher)
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
                                        setCurrentTeacher(teacher)
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
                                        toggleTeacherStatus(teacher)
                                      }}
                                      title={teacher.status === "نشط" ? "تغيير إلى غير نشط" : "تغيير إلى نشط"}
                                    >
                                      {teacher.status === "نشط" ? (
                                        <UserX className="h-4 w-4 text-red-500" />
                                      ) : (
                                        <UserCheck className="h-4 w-4 text-green-500" />
                                      )}
                                      <span className="sr-only">
                                        {teacher.status === "نشط" ? "تغيير إلى غير نشط" : "تغيير إلى نشط"}
                                      </span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                لا توجد معلمات تطابق معايير البحث
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
                        {sortedTeachers.map((teacher) => (
                          <motion.div
                            key={teacher.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className={`overflow-hidden ${getCardColor(teacher.status)}`}>
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-lg">{teacher.name}</CardTitle>
                                    <CardDescription>
                                      {teacher.specialization} - {teacher.department}
                                    </CardDescription>
                                  </div>
                                  <Checkbox
                                    checked={selectedTeachers.includes(teacher.id)}
                                    onCheckedChange={() => toggleSelectTeacher(teacher.id)}
                                    aria-label={`تحديد ${teacher.name}`}
                                  />
                                </div>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">الرقم:</p>
                                    <p>{teacher.teacherId}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">الحالة:</p>
                                    <Badge
                                      variant={
                                        teacher.status === "نشط"
                                          ? "default"
                                          : teacher.status === "غير نشط"
                                            ? "destructive"
                                            : "outline"
                                      }
                                    >
                                      {teacher.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">الحضور:</p>
                                    <div className="flex items-center gap-2">
                                      <Progress
                                        value={teacher.attendance}
                                        className={`h-2 ${getProgressColor(teacher.attendance || 0)}`}
                                      />
                                      <span className="text-xs">{teacher.attendance}%</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">الأداء:</p>
                                    <div className="flex items-center gap-2">
                                      <Progress
                                        value={teacher.performance}
                                        className={`h-2 ${getProgressColor(teacher.performance || 0)}`}
                                      />
                                      <span className="text-xs">{teacher.performance}%</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="flex justify-between pt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentTeacher(teacher)
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
                                      setCurrentTeacher(teacher)
                                      setEditDialogOpen(true)
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setCurrentTeacher(teacher)
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
                                      toggleTeacherStatus(teacher)
                                    }}
                                    title={teacher.status === "نشط" ? "تغيير إلى غير نشط" : "تغيير إلى نشط"}
                                  >
                                    {teacher.status === "نشط" ? (
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

                      {sortedTeachers.length === 0 && (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                          لا توجد معلمات تطابق معايير البحث
                        </div>
                      )}
                    </div>
                  )}

                  {viewMode === "detailed" && (
                    <div className="space-y-6">
                      {sortedTeachers.length > 0 ? (
                        sortedTeachers.map((teacher) => (
                          <motion.div
                            key={teacher.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card>
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                      <span className="text-lg font-bold text-primary">{teacher.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                      <CardTitle className="flex items-center gap-2">
                                        {teacher.name}
                                        <Badge
                                          variant={
                                            teacher.status === "نشط"
                                              ? "default"
                                              : teacher.status === "غير نشط"
                                                ? "destructive"
                                                : "outline"
                                          }
                                        >
                                          {teacher.status}
                                        </Badge>
                                      </CardTitle>
                                      <CardDescription>
                                        {teacher.specialization} - {teacher.department} | الرقم: {teacher.teacherId}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <Checkbox
                                    checked={selectedTeachers.includes(teacher.id)}
                                    onCheckedChange={() => toggleSelectTeacher(teacher.id)}
                                    aria-label={`تحديد ${teacher.name}`}
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
                                          <span className="text-muted-foreground">رقم الهاتف:</span>
                                          <span dir="ltr">{teacher.phone}</span>
                                        </p>
                                        {teacher.email && (
                                          <p className="flex items-center gap-2">
                                            <span className="text-muted-foreground">البريد الإلكتروني:</span>
                                            <span dir="ltr">{teacher.email}</span>
                                          </p>
                                        )}
                                        {teacher.emergencyContact && (
                                          <p className="flex items-center gap-2">
                                            <span className="text-muted-foreground">رقم الطوارئ:</span>
                                            <span dir="ltr">{teacher.emergencyContact}</span>
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="text-sm font-medium mb-1">معلومات شخصية</h4>
                                      <div className="text-sm space-y-1">
                                        <p className="flex items-center gap-2">
                                          <span className="text-muted-foreground">تاريخ الميلاد:</span>
                                          <span>{teacher.birthDate}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                          <span className="text-muted-foreground">العنوان:</span>
                                          <span>{teacher.address}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                          <span className="text-muted-foreground">تاريخ التعيين:</span>
                                          <span>{teacher.joinDate || "غير محدد"}</span>
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">الأداء</h4>
                                      <div className="space-y-3">
                                        <div>
                                          <div className="flex justify-between text-sm mb-1">
                                            <span>نسبة الحضور</span>
                                            <span>{teacher.attendance || 0}%</span>
                                          </div>
                                          <Progress
                                            value={teacher.attendance}
                                            className={`h-2 ${getProgressColor(teacher.attendance || 0)}`}
                                          />
                                        </div>
                                        <div>
                                          <div className="flex justify-between text-sm mb-1">
                                            <span>الأداء</span>
                                            <span>{teacher.performance || 0}%</span>
                                          </div>
                                          <Progress
                                            value={teacher.performance}
                                            className={`h-2 ${getProgressColor(teacher.performance || 0)}`}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {teacher.medicalNotes && (
                                      <div>
                                        <h4 className="text-sm font-medium mb-1">ملاحظات طبية</h4>
                                        <p className="text-sm">{teacher.medicalNotes}</p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">الصفوف</h4>
                                      <div className="flex flex-wrap gap-1">
                                        {teacher.classes && teacher.classes.length > 0 ? (
                                          teacher.classes.map((cls, index) => (
                                            <Badge key={index} variant="outline">
                                              {cls}
                                            </Badge>
                                          ))
                                        ) : (
                                          <span className="text-sm text-muted-foreground">لا توجد صفوف مسجلة</span>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="text-sm font-medium mb-1">المواد</h4>
                                      <div className="flex flex-wrap gap-1">
                                        {teacher.subjects && teacher.subjects.length > 0 ? (
                                          teacher.subjects.map((subject, index) => (
                                            <Badge key={index} variant="outline">
                                              {subject}
                                            </Badge>
                                          ))
                                        ) : (
                                          <span className="text-sm text-muted-foreground">لا توجد مواد مسجلة</span>
                                        )}
                                      </div>
                                    </div>

                                    {teacher.notes && (
                                      <div>
                                        <h4 className="text-sm font-medium mb-1">ملاحظات</h4>
                                        <p className="text-sm">{teacher.notes}</p>
                                      </div>
                                    )}

                                    <div>
                                      <h4 className="text-sm font-medium mb-1">آخر تسجيل دخول</h4>
                                      <p className="text-sm">{teacher.lastLogin || "غير محدد"}</p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="flex justify-end gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentTeacher(teacher)
                                    setViewDialogOpen(true)
                                  }}
                                >
                                  عرض التفاصيل
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentTeacher(teacher)
                                    setEditDialogOpen(true)
                                  }}
                                >
                                  تعديل
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentTeacher(teacher)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  حذف
                                </Button>
                                <Button
                                  variant={teacher.status === "نشط" ? "destructive" : "default"}
                                  size="sm"
                                  onClick={() => toggleTeacherStatus(teacher)}
                                >
                                  {teacher.status === "نشط" ? (
                                    <>
                                      <UserX className="h-4 w-4 ml-2" />
                                      إلغاء تنشيط
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-4 w-4 ml-2" />
                                      تنشيط
                                    </>
                                  )}
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-muted-foreground">لا توجد معلمات تطابق معايير البحث</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* مربع حوار إضافة معلمة جديدة */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة معلمة جديدة</DialogTitle>
            <DialogDescription>أدخل بيانات المعلمة الجديدة. جميع الحقول المميزة بـ * مطلوبة.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المعلمة *</Label>
                <Input
                  id="name"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  placeholder="الاسم الكامل"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacherId">رقم المعلمة *</Label>
                <Input
                  id="teacherId"
                  value={newTeacher.teacherId}
                  onChange={(e) => setNewTeacher({ ...newTeacher, teacherId: e.target.value })}
                  placeholder="الرقم التعريفي"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">التخصص *</Label>
                <Select
                  value={newTeacher.specialization}
                  onValueChange={(value) => setNewTeacher({ ...newTeacher, specialization: value })}
                >
                  <SelectTrigger id="specialization">
                    <SelectValue placeholder="اختر التخصص" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((specialization) => (
                      <SelectItem key={specialization} value={specialization}>
                        {specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">القسم *</Label>
                <Select
                  value={newTeacher.department}
                  onValueChange={(value) => setNewTeacher({ ...newTeacher, department: value })}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <Input
                  id="phone"
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={newTeacher.email || ""}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  placeholder="example@school.edu.sa"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select
                  value={newTeacher.status}
                  onValueChange={(value: "نشط" | "غير نشط" | "إجازة") =>
                    setNewTeacher({ ...newTeacher, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نشط">نشط</SelectItem>
                    <SelectItem value="غير نشط">غير نشط</SelectItem>
                    <SelectItem value="إجازة">إجازة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">تاريخ الميلاد</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={newTeacher.birthDate}
                  onChange={(e) => setNewTeacher({ ...newTeacher, birthDate: e.target.value })}
                  dir="ltr"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={newTeacher.address}
                  onChange={(e) => setNewTeacher({ ...newTeacher, address: e.target.value })}
                  placeholder="العنوان التفصيلي"
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddTeacher} className="bg-[#0a8a74] hover:bg-[#097a67]">
              إضافة المعلمة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار تعديل بيانات معلمة */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المعلمة</DialogTitle>
            <DialogDescription>تعديل بيانات المعلمة {currentTeacher?.name}</DialogDescription>
          </DialogHeader>

          {currentTeacher && (
            <ScrollArea className="max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">اسم المعلمة</Label>
                  <Input
                    id="edit-name"
                    value={currentTeacher.name}
                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-teacherId">رقم المعلمة</Label>
                  <Input
                    id="edit-teacherId"
                    value={currentTeacher.teacherId}
                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, teacherId: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-specialization">التخصص</Label>
                  <Select
                    value={currentTeacher.specialization}
                    onValueChange={(value) => setCurrentTeacher({ ...currentTeacher, specialization: value })}
                  >
                    <SelectTrigger id="edit-specialization">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((specialization) => (
                        <SelectItem key={specialization} value={specialization}>
                          {specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-department">القسم</Label>
                  <Select
                    value={currentTeacher.department}
                    onValueChange={(value) => setCurrentTeacher({ ...currentTeacher, department: value })}
                  >
                    <SelectTrigger id="edit-department">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">الحالة</Label>
                  <Select
                    value={currentTeacher.status}
                    onValueChange={(value: "نشط" | "غير نشط" | "إجازة") =>
                      setCurrentTeacher({ ...currentTeacher, status: value })
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="نشط">نشط</SelectItem>
                      <SelectItem value="غير نشط">غير نشط</SelectItem>
                      <SelectItem value="إجازة">إجازة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-phone">رقم الهاتف</Label>
                  <Input
                    id="edit-phone"
                    value={currentTeacher.phone}
                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, phone: e.target.value })}
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={currentTeacher.email || ""}
                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, email: e.target.value })}
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-birthDate">تاريخ الميلاد</Label>
                  <Input
                    id="edit-birthDate"
                    type="date"
                    value={currentTeacher.birthDate}
                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, birthDate: e.target.value })}
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-address">العنوان</Label>
                  <Input
                    id="edit-address"
                    value={currentTeacher.address}
                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, address: e.target.value })}
                  />
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleEditTeacher} className="bg-[#0a8a74] hover:bg-[#097a67]">
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار حذف معلمة */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف المعلمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف بيانات المعلمة {currentTeacher?.name} نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeacher} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* مربع حوار عرض بيانات معلمة */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>بيانات المعلمة</DialogTitle>
            <DialogDescription>عرض كافة بيانات المعلمة</DialogDescription>
          </DialogHeader>

          {currentTeacher && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 p-1">
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{currentTeacher.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{currentTeacher.name}</h2>
                    <p className="text-muted-foreground">
                      {currentTeacher.specialization} - {currentTeacher.department}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{currentTeacher.teacherId}</Badge>
                      <Badge
                        variant={
                          currentTeacher.status === "نشط"
                            ? "default"
                            : currentTeacher.status === "غير نشط"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {currentTeacher.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">معلومات الاتصال</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">رقم الهاتف:</span>
                        <span dir="ltr">{currentTeacher.phone}</span>
                      </div>
                      {currentTeacher.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">البريد الإلكتروني:</span>
                          <span dir="ltr">{currentTeacher.email}</span>
                        </div>
                      )}
                      {currentTeacher.emergencyContact && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">رقم الطوارئ:</span>
                          <span dir="ltr">{currentTeacher.emergencyContact}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">معلومات شخصية</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">تاريخ الميلاد:</span>
                        <span>{currentTeacher.birthDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">العنوان:</span>
                        <span>{currentTeacher.address}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">تاريخ التعيين:</span>
                        <span>{currentTeacher.joinDate || "غير محدد"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">الأداء والحضور</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted-foreground">الأداء:</span>
                        <span>{currentTeacher.performance}%</span>
                      </div>
                      <Progress
                        value={currentTeacher.performance}
                        className={`h-3 ${getProgressColor(currentTeacher.performance || 0)}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted-foreground">الحضور:</span>
                        <span>{currentTeacher.attendance}%</span>
                      </div>
                      <Progress
                        value={currentTeacher.attendance}
                        className={`h-3 ${getProgressColor(currentTeacher.attendance || 0)}`}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">الصفوف المسندة</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentTeacher.classes && currentTeacher.classes.length > 0 ? (
                        currentTeacher.classes.map((cls, index) => (
                          <Badge key={index} variant="outline">
                            {cls}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">لا توجد صفوف مسندة</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">المواد</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentTeacher.subjects && currentTeacher.subjects.length > 0 ? (
                        currentTeacher.subjects.map((subject, index) => (
                          <Badge key={index} variant="secondary">
                            {subject}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">لا توجد مواد</p>
                      )}
                    </div>
                  </div>
                </div>

                {currentTeacher.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-3">ملاحظات</h3>
                      <p>{currentTeacher.notes}</p>
                    </div>
                  </>
                )}
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
              variant={currentTeacher?.status === "نشط" ? "destructive" : "default"}
              onClick={() => {
                toggleTeacherStatus(currentTeacher)
                setViewDialogOpen(false)
              }}
            >
              {currentTeacher?.status === "نشط" ? "إلغاء تنشيط" : "تنشيط"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار الإجراءات الجماعية */}
      <AlertDialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف المعلمات المحددة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف بيانات {selectedTeachers.length} معلمة نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkAction("delete")}
              className="bg-destructive text-destructive-foreground"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
