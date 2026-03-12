"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  FileText,
  Plus,
  Upload,
  Edit,
  Trash2,
  Check,
  AlertCircle,
  Calendar,
  Search,
  Filter,
  Clock,
  FileUp,
  X,
  Eye,
  BookOpen,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isBefore, addDays } from "date-fns"
import { ar } from "date-fns/locale"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/components/auth-provider"

// Define homework type
interface Homework {
  id: number
  title: string
  subject: string
  class: string
  dueDate: string
  status: "active" | "completed" | "overdue"
  description: string
  attachments?: string[]
  priority: "high" | "medium" | "low"
  createdAt: string
  completedAt?: string
  submissionCount?: number
  totalStudents?: number
}

export default function HomeworkPage() {
  const { toast } = useToast()
  const { userType, email } = useAuth()
  const isStudent = userType === "student"
  const studentEmailToClass: Record<string, string> = {
    "student@example.com": "1أ",
    "student2@example.com": "1ب",
  }
  const [selectedClass, setSelectedClass] = useState<string>(isStudent ? (studentEmailToClass[email || ""] || "1أ") : "all")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null)
  const [editedHomework, setEditedHomework] = useState<Homework | null>(null)

  // Dummy data for homework
  const [homeworks, setHomeworks] = useState<Homework[]>([
    {
      id: 1,
      title: "واجب الوحدة الخامسة",
      subject: "رياضيات",
      class: "1أ",
      dueDate: "2025-05-20",
      status: "active",
      description: "حل تمارين الصفحات 45-48 من كتاب الرياضيات",
      priority: "high",
      createdAt: "2025-05-15T10:30:00",
      submissionCount: 15,
      totalStudents: 25,
      attachments: ["واجب_الرياضيات.pdf"],
    },
    {
      id: 2,
      title: "تجربة علمية",
      subject: "علوم",
      class: "1أ",
      dueDate: "2025-05-22",
      status: "active",
      description: "كتابة تقرير عن التجربة العلمية التي تم إجراؤها في المختبر",
      priority: "medium",
      createdAt: "2025-05-14T11:15:00",
      submissionCount: 8,
      totalStudents: 25,
    },
    {
      id: 3,
      title: "قراءة قصة",
      subject: "لغة عربية",
      class: "1أ",
      dueDate: "2025-05-18",
      status: "completed",
      description: "قراءة القصة في الصفحات 30-35 وتلخيصها",
      priority: "medium",
      createdAt: "2025-05-10T09:45:00",
      completedAt: "2025-05-18T14:30:00",
      submissionCount: 23,
      totalStudents: 25,
    },
    {
      id: 4,
      title: "مشروع نهاية الفصل",
      subject: "اجتماعيات",
      class: "1أ",
      dueDate: "2025-05-30",
      status: "active",
      description: "إعداد مشروع عن الحضارات القديمة وتقديمه أمام الفصل",
      priority: "high",
      createdAt: "2025-05-12T13:20:00",
      submissionCount: 5,
      totalStudents: 25,
      attachments: ["تعليمات_المشروع.pdf", "نموذج_التقييم.docx"],
    },
    {
      id: 5,
      title: "تمارين الفصل الثالث",
      subject: "لغة إنجليزية",
      class: "1ب",
      dueDate: "2025-05-17",
      status: "overdue",
      description: "حل تمارين الفصل الثالث من كتاب اللغة الإنجليزية",
      priority: "low",
      createdAt: "2025-05-10T10:00:00",
      submissionCount: 18,
      totalStudents: 23,
    },
    {
      id: 6,
      title: "حفظ سورة الملك",
      subject: "تربية إسلامية",
      class: "2أ",
      dueDate: "2025-05-25",
      status: "active",
      description: "حفظ سورة الملك كاملة والاستعداد للتسميع",
      priority: "high",
      createdAt: "2025-05-15T08:30:00",
      submissionCount: 10,
      totalStudents: 27,
    },
    {
      id: 7,
      title: "رسم منظر طبيعي",
      subject: "فنية",
      class: "2ب",
      dueDate: "2025-05-19",
      status: "completed",
      description: "رسم منظر طبيعي باستخدام الألوان المائية",
      priority: "medium",
      createdAt: "2025-05-12T11:30:00",
      completedAt: "2025-05-19T12:45:00",
      submissionCount: 22,
      totalStudents: 24,
    },
    {
      id: 8,
      title: "بحث عن الطاقة المتجددة",
      subject: "علوم",
      class: "3أ",
      dueDate: "2025-05-28",
      status: "active",
      description: "إعداد بحث عن مصادر الطاقة المتجددة وأهميتها للبيئة",
      priority: "high",
      createdAt: "2025-05-14T09:15:00",
      submissionCount: 12,
      totalStudents: 26,
      attachments: ["مراجع_البحث.pdf"],
    },
  ])

  // New homework template
  const newHomeworkTemplate: Omit<Homework, "id" | "createdAt" | "status"> = {
    title: "",
    subject: "رياضيات",
    class: "1أ",
    dueDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
    description: "",
    priority: "medium",
  }

  const [newHomework, setNewHomework] = useState<Omit<Homework, "id" | "createdAt" | "status">>(newHomeworkTemplate)
  const [attachments, setAttachments] = useState<File[]>([])

  useEffect(() => {
    if (isStudent) {
      setSelectedClass(studentEmailToClass[email || ""] || "1أ")
    }
  }, [isStudent, email])

  // Check for overdue homework
  useEffect(() => {
    const today = new Date()
    const updatedHomeworks: Homework[] = homeworks.map((homework): Homework => {
      if (homework.status === "active" && isBefore(new Date(homework.dueDate), today)) {
        return { ...homework, status: "overdue" }
      }
      return homework
    })

    if (JSON.stringify(updatedHomeworks) !== JSON.stringify(homeworks)) {
      setHomeworks(updatedHomeworks)
    }
  }, [homeworks])

  // Filter homeworks based on selected class, subject, search term, and filters
  const filteredHomeworks = homeworks.filter((hw) => {
    const matchesClass = selectedClass === "all" || hw.class === selectedClass
    const matchesSubject = selectedSubject === "all" || hw.subject === selectedSubject
    const matchesSearch = hw.title.includes(searchTerm) || hw.description.includes(searchTerm)
    const matchesStatus = filterStatus === "all" || hw.status === filterStatus
    const matchesPriority = filterPriority === "all" || hw.priority === filterPriority

    return matchesClass && matchesSubject && matchesSearch && matchesStatus && matchesPriority
  })

  const handleEditHomework = (homework: Homework) => {
    setSelectedHomework(homework)
    setEditedHomework({ ...homework })
    setIsEditDialogOpen(true)
  }

  const handleViewHomework = (homework: Homework) => {
    setSelectedHomework(homework)
    setIsViewDialogOpen(true)
  }

  const handleDeleteHomework = (homework: Homework) => {
    setSelectedHomework(homework)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedHomework) {
      setHomeworks(homeworks.filter((hw) => hw.id !== selectedHomework.id))
      toast({
        title: "تم حذف الواجب",
        description: "تم حذف الواجب المنزلي بنجاح",
        variant: "default",
      })
    }
    setIsDeleteDialogOpen(false)
  }

  const saveEditedHomework = () => {
    if (editedHomework) {
      setHomeworks(homeworks.map((hw) => (hw.id === editedHomework.id ? editedHomework : hw)))
      toast({
        title: "تم تحديث الواجب",
        description: "تم تحديث الواجب المنزلي بنجاح",
        variant: "default",
      })
    }
    setIsEditDialogOpen(false)
  }

  const addNewHomework = () => {
    if (newHomework.title.trim() === "") {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال عنوان للواجب المنزلي",
        variant: "destructive",
      })
      return
    }

    if (!newHomework.dueDate) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى تحديد تاريخ التسليم",
        variant: "destructive",
      })
      return
    }

    const newId = Math.max(0, ...homeworks.map((hw) => hw.id)) + 1
    const attachmentNames = attachments.map((file) => file.name)

    const homeworkToAdd: Homework = {
      id: newId,
      ...newHomework,
      status: "active",
      createdAt: new Date().toISOString(),
      attachments: attachmentNames.length > 0 ? attachmentNames : undefined,
      submissionCount: 0,
      totalStudents: 25, // Default value
    }

    setHomeworks([homeworkToAdd, ...homeworks])
    setNewHomework(newHomeworkTemplate)
    setAttachments([])
    setIsAddDialogOpen(false)
    toast({
      title: "تمت إضافة الواجب",
      description: "تمت إضافة الواجب المنزلي بنجاح",
      variant: "default",
    })
  }

  const toggleHomeworkStatus = (id: number) => {
    setHomeworks(
      homeworks.map((hw) => {
        if (hw.id === id) {
          const newStatus: Homework["status"] = hw.status === "active" || hw.status === "overdue" ? "completed" : "active"
          const updatedHomework = {
            ...hw,
            status: newStatus,
            completedAt: newStatus === "completed" ? new Date().toISOString() : undefined,
          }

          toast({
            title: newStatus === "completed" ? "تم إكمال الواجب" : "تم إعادة تنشيط الواجب",
            description: newStatus === "completed" ? "تم تحديث حالة الواجب إلى مكتمل" : "تم تحديث حالة الواجب إلى نشط",
            variant: "default",
          })

          return updatedHomework
        }
        return hw
      }),
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files)
      setAttachments([...attachments, ...fileList])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const removeEditedAttachment = (index: number) => {
    if (editedHomework && editedHomework.attachments) {
      const updatedAttachments = [...editedHomework.attachments]
      updatedAttachments.splice(index, 1)
      setEditedHomework({
        ...editedHomework,
        attachments: updatedAttachments.length > 0 ? updatedAttachments : undefined,
      })
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
            نشط
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
            مكتمل
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">
            متأخر
          </Badge>
        )
      default:
        return <Badge variant="outline">غير محدد</Badge>
    }
  }

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            عالية
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            متوسطة
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            منخفضة
          </Badge>
        )
      default:
        return <Badge variant="outline">غير محدد</Badge>
    }
  }

  // Calculate statistics
  const calculateStats = () => {
    const totalHomework = filteredHomeworks.length
    const activeHomework = filteredHomeworks.filter((hw) => hw.status === "active").length
    const completedHomework = filteredHomeworks.filter((hw) => hw.status === "completed").length
    const overdueHomework = filteredHomeworks.filter((hw) => hw.status === "overdue").length
    const completionRate = totalHomework > 0 ? (completedHomework / totalHomework) * 100 : 0

    const submissionRate =
      filteredHomeworks.length > 0
        ? filteredHomeworks.reduce((sum, hw) => {
            const rate = hw.submissionCount && hw.totalStudents ? (hw.submissionCount / hw.totalStudents) * 100 : 0
            return sum + rate
          }, 0) / filteredHomeworks.length
        : 0

    return {
      totalHomework,
      activeHomework,
      completedHomework,
      overdueHomework,
      completionRate,
      submissionRate,
    }
  }

  const stats = calculateStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الواجبات المنزلية</h1>
        <p className="text-gray-500 mt-1">إدارة الواجبات المنزلية ومتابعتها</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isStudent}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="اختر الفصل" />
            </SelectTrigger>
            <SelectContent>
              {!isStudent && <SelectItem value="all">جميع الفصول</SelectItem>}
              <SelectItem value="1أ">الصف الأول (أ)</SelectItem>
              <SelectItem value="1ب">الصف الأول (ب)</SelectItem>
              <SelectItem value="2أ">الصف الثاني (أ)</SelectItem>
              <SelectItem value="2ب">الصف الثاني (ب)</SelectItem>
              <SelectItem value="3أ">الصف الثالث (أ)</SelectItem>
              <SelectItem value="3ب">الصف الثالث (ب)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="اختر المادة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المواد</SelectItem>
              <SelectItem value="رياضيات">رياضيات</SelectItem>
              <SelectItem value="علوم">علوم</SelectItem>
              <SelectItem value="لغة عربية">لغة عربية</SelectItem>
              <SelectItem value="لغة إنجليزية">لغة إنجليزية</SelectItem>
              <SelectItem value="تربية إسلامية">تربية إسلامية</SelectItem>
              <SelectItem value="اجتماعيات">اجتماعيات</SelectItem>
              <SelectItem value="فنية">فنية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="بحث في الواجبات..."
              className="pr-10 w-full md:w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

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
                  <Label htmlFor="status">الحالة</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="overdue">متأخر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">الأولوية</Label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="اختر الأولوية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="low">منخفضة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFilterStatus("all")
                      setFilterPriority("all")
                    }}
                  >
                    إعادة ضبط
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {!isStudent && (
            <Button className="bg-primary hover:bg-primary/90 transition-colors" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة واجب جديد
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="overflow-hidden">
          <div className="bg-blue-50 h-2" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">إجمالي الواجبات</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalHomework}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-green-50 h-2" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">واجبات نشطة</p>
                <h3 className="text-2xl font-bold mt-1">{stats.activeHomework}</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-yellow-50 h-2" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">نسبة الإكمال</p>
                <h3 className="text-2xl font-bold mt-1">{stats.completionRate.toFixed(1)}%</h3>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <Progress value={stats.completionRate} className="h-2 mt-4" />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-red-50 h-2" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">واجبات متأخرة</p>
                <h3 className="text-2xl font-bold mt-1">{stats.overdueHomework}</h3>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">الواجبات النشطة</TabsTrigger>
          <TabsTrigger value="completed">الواجبات المكتملة</TabsTrigger>
          <TabsTrigger value="all">جميع الواجبات</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>الواجبات النشطة</CardTitle>
                  <CardDescription>
                    الواجبات المنزلية الحالية للصف {selectedClass === "all" ? "جميع الفصول" : selectedClass}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    نشطة: {stats.activeHomework}
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    متأخرة: {stats.overdueHomework}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredHomeworks.filter((hw) => hw.status === "active" || hw.status === "overdue").length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">لا توجد واجبات نشطة</h3>
                  <p className="text-gray-500 mt-1">لم يتم العثور على أي واجبات نشطة تطابق معايير البحث</p>
                  {!isStudent && (
                    <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة واجب جديد
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[50px]">الرقم</TableHead>
                        <TableHead>عنوان الواجب</TableHead>
                        <TableHead>المادة</TableHead>
                        <TableHead>الفصل</TableHead>
                        <TableHead>تاريخ التسليم</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الأولوية</TableHead>
                        <TableHead>التسليم</TableHead>
                        <TableHead className="text-left">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHomeworks
                        .filter((hw) => hw.status === "active" || hw.status === "overdue")
                        .map((homework) => (
                          <TableRow key={homework.id} className="group hover:bg-gray-50">
                            <TableCell>{homework.id}</TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                {homework.attachments && homework.attachments.length > 0 && (
                                  <FileUp className="h-4 w-4 text-blue-500 ml-2" />
                                )}
                                {homework.title}
                              </div>
                            </TableCell>
                            <TableCell>{homework.subject}</TableCell>
                            <TableCell>{homework.class}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 ml-1 text-gray-500" />
                                {format(new Date(homework.dueDate), "dd/MM/yyyy", { locale: ar })}
                              </div>
                            </TableCell>
                            <TableCell>
                              {homework.status === "overdue" ? (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  متأخر
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  نشط
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{getPriorityBadge(homework.priority)}</TableCell>
                            <TableCell>
                              {homework.submissionCount !== undefined && homework.totalStudents !== undefined && (
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={(homework.submissionCount / homework.totalStudents) * 100}
                                    className="h-2 w-16"
                                  />
                                  <span className="text-xs">
                                    {homework.submissionCount}/{homework.totalStudents}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-left">
                              <div className="flex space-x-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => handleViewHomework(homework)}
                                >
                                  <Eye className="ml-2 h-4 w-4" />
                                  عرض
                                </Button>
                                {!isStudent && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      onClick={() => handleEditHomework(homework)}
                                    >
                                      <Edit className="ml-2 h-4 w-4" />
                                      تعديل
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => toggleHomeworkStatus(homework.id)}
                                    >
                                      <Check className="ml-2 h-4 w-4" />
                                      إكمال
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDeleteHomework(homework)}
                                    >
                                      <Trash2 className="ml-2 h-4 w-4" />
                                      حذف
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>الواجبات المكتملة</CardTitle>
                  <CardDescription>
                    الواجبات المنزلية المكتملة للصف {selectedClass === "all" ? "جميع الفصول" : selectedClass}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    مكتملة: {stats.completedHomework}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredHomeworks.filter((hw) => hw.status === "completed").length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">لا توجد واجبات مكتملة</h3>
                  <p className="text-gray-500 mt-1">لم يتم العثور على أي واجبات مكتملة تطابق معايير البحث</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[50px]">الرقم</TableHead>
                        <TableHead>عنوان الواجب</TableHead>
                        <TableHead>المادة</TableHead>
                        <TableHead>الفصل</TableHead>
                        <TableHead>تاريخ التسليم</TableHead>
                        <TableHead>تاريخ الإكمال</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>التسليم</TableHead>
                        <TableHead className="text-left">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHomeworks
                        .filter((hw) => hw.status === "completed")
                        .map((homework) => (
                          <TableRow key={homework.id} className="group hover:bg-gray-50">
                            <TableCell>{homework.id}</TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                {homework.attachments && homework.attachments.length > 0 && (
                                  <FileUp className="h-4 w-4 text-blue-500 ml-2" />
                                )}
                                {homework.title}
                              </div>
                            </TableCell>
                            <TableCell>{homework.subject}</TableCell>
                            <TableCell>{homework.class}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 ml-1 text-gray-500" />
                                {format(new Date(homework.dueDate), "dd/MM/yyyy", { locale: ar })}
                              </div>
                            </TableCell>
                            <TableCell>
                              {homework.completedAt && (
                                <div className="flex items-center">
                                  <Check className="h-4 w-4 ml-1 text-green-500" />
                                  {format(new Date(homework.completedAt), "dd/MM/yyyy HH:mm", { locale: ar })}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                مكتمل
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {homework.submissionCount !== undefined && homework.totalStudents !== undefined && (
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={(homework.submissionCount / homework.totalStudents) * 100}
                                    className="h-2 w-16"
                                  />
                                  <span className="text-xs">
                                    {homework.submissionCount}/{homework.totalStudents}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-left">
                              <div className="flex space-x-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => handleViewHomework(homework)}
                                >
                                  <Eye className="ml-2 h-4 w-4" />
                                  عرض
                                </Button>
                                {!isStudent && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      onClick={() => toggleHomeworkStatus(homework.id)}
                                    >
                                      <FileText className="ml-2 h-4 w-4" />
                                      إعادة تنشيط
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDeleteHomework(homework)}
                                    >
                                      <Trash2 className="ml-2 h-4 w-4" />
                                      حذف
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>جميع الواجبات</CardTitle>
                  <CardDescription>
                    جميع الواجبات المنزلية للصف {selectedClass === "all" ? "جميع الفصول" : selectedClass}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    نشطة: {stats.activeHomework}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    مكتملة: {stats.completedHomework}
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    متأخرة: {stats.overdueHomework}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredHomeworks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">لا توجد واجبات</h3>
                  <p className="text-gray-500 mt-1">لم يتم العثور على أي واجبات تطابق معايير البحث</p>
                  {!isStudent && (
                    <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة واجب جديد
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[50px]">الرقم</TableHead>
                        <TableHead>عنوان الواجب</TableHead>
                        <TableHead>المادة</TableHead>
                        <TableHead>الفصل</TableHead>
                        <TableHead>تاريخ التسليم</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الأولوية</TableHead>
                        <TableHead>التسليم</TableHead>
                        <TableHead className="text-left">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHomeworks.map((homework) => (
                        <TableRow key={homework.id} className="group hover:bg-gray-50">
                          <TableCell>{homework.id}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {homework.attachments && homework.attachments.length > 0 && (
                                <FileUp className="h-4 w-4 text-blue-500 ml-2" />
                              )}
                              {homework.title}
                            </div>
                          </TableCell>
                          <TableCell>{homework.subject}</TableCell>
                          <TableCell>{homework.class}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 ml-1 text-gray-500" />
                              {format(new Date(homework.dueDate), "dd/MM/yyyy", { locale: ar })}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(homework.status)}</TableCell>
                          <TableCell>{getPriorityBadge(homework.priority)}</TableCell>
                          <TableCell>
                            {homework.submissionCount !== undefined && homework.totalStudents !== undefined && (
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={(homework.submissionCount / homework.totalStudents) * 100}
                                  className="h-2 w-16"
                                />
                                <span className="text-xs">
                                  {homework.submissionCount}/{homework.totalStudents}
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-left">
                            <div className="flex space-x-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handleViewHomework(homework)}
                              >
                                <Eye className="ml-2 h-4 w-4" />
                                عرض
                              </Button>
                              {!isStudent && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => handleEditHomework(homework)}
                                  >
                                    <Edit className="ml-2 h-4 w-4" />
                                    تعديل
                                  </Button>
                                  {homework.status !== "completed" ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => toggleHomeworkStatus(homework.id)}
                                    >
                                      <Check className="ml-2 h-4 w-4" />
                                      إكمال
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      onClick={() => toggleHomeworkStatus(homework.id)}
                                    >
                                      <FileText className="ml-2 h-4 w-4" />
                                      إعادة تنشيط
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteHomework(homework)}
                                  >
                                    <Trash2 className="ml-2 h-4 w-4" />
                                    حذف
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-6">
              <div className="text-sm text-gray-500">
                إجمالي الواجبات: {filteredHomeworks.length} | نسبة الإكمال: {stats.completionRate.toFixed(1)}%
              </div>
              {!isStudent && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة واجب جديد
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Homework Dialog */}
      {!isStudent && <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>إضافة واجب منزلي جديد</DialogTitle>
            <DialogDescription>أدخل تفاصيل الواجب المنزلي الجديد</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الواجب</Label>
              <Input
                id="title"
                placeholder="أدخل عنوان الواجب"
                value={newHomework.title}
                onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">المادة</Label>
                <Select
                  value={newHomework.subject}
                  onValueChange={(value) => setNewHomework({ ...newHomework, subject: value })}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="اختر المادة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="رياضيات">رياضيات</SelectItem>
                    <SelectItem value="علوم">علوم</SelectItem>
                    <SelectItem value="لغة عربية">لغة عربية</SelectItem>
                    <SelectItem value="لغة إنجليزية">لغة إنجليزية</SelectItem>
                    <SelectItem value="تربية إسلامية">تربية إسلامية</SelectItem>
                    <SelectItem value="اجتماعيات">اجتماعيات</SelectItem>
                    <SelectItem value="فنية">فنية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">الفصل</Label>
                <Select
                  value={newHomework.class}
                  onValueChange={(value) => setNewHomework({ ...newHomework, class: value })}
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder="اختر الفصل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1أ">الصف الأول (أ)</SelectItem>
                    <SelectItem value="1ب">الصف الأول (ب)</SelectItem>
                    <SelectItem value="2أ">الصف الثاني (أ)</SelectItem>
                    <SelectItem value="2ب">الصف الثاني (ب)</SelectItem>
                    <SelectItem value="3أ">الصف الثالث (أ)</SelectItem>
                    <SelectItem value="3ب">الصف الثالث (ب)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">تاريخ التسليم</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newHomework.dueDate}
                  onChange={(e) => setNewHomework({ ...newHomework, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">الأولوية</Label>
                <Select
                  value={newHomework.priority}
                  onValueChange={(value) => setNewHomework({ ...newHomework, priority: value as any })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="اختر الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="low">منخفضة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">وصف الواجب</Label>
              <Textarea
                id="description"
                placeholder="أدخل وصف الواجب وتفاصيله"
                rows={4}
                value={newHomework.description}
                onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">إرفاق ملفات</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-1 text-sm text-gray-500">
                      <span className="font-semibold">اضغط للرفع</span> أو اسحب وأفلت
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOCX, PPTX, XLSX (حد أقصى 10MB)</p>
                  </div>
                  <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} multiple />
                </label>
              </div>
              {attachments.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">الملفات المرفقة:</p>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-blue-500 ml-2" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              <X className="ml-2 h-4 w-4" />
              إلغاء
            </Button>
            <Button onClick={addNewHomework}>
              <Check className="ml-2 h-4 w-4" />
              إضافة الواجب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>}

      {/* Edit Homework Dialog */}
      {!isStudent && <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>تعديل الواجب المنزلي</DialogTitle>
            <DialogDescription>تعديل تفاصيل الواجب المنزلي</DialogDescription>
          </DialogHeader>
          {editedHomework && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">عنوان الواجب</Label>
                <Input
                  id="edit-title"
                  value={editedHomework.title}
                  onChange={(e) => setEditedHomework({ ...editedHomework, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-subject">المادة</Label>
                  <Select
                    value={editedHomework.subject}
                    onValueChange={(value) => setEditedHomework({ ...editedHomework, subject: value })}
                  >
                    <SelectTrigger id="edit-subject">
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="رياضيات">رياضيات</SelectItem>
                      <SelectItem value="علوم">علوم</SelectItem>
                      <SelectItem value="لغة عربية">لغة عربية</SelectItem>
                      <SelectItem value="لغة إنجليزية">لغة إنجليزية</SelectItem>
                      <SelectItem value="تربية إسلامية">تربية إسلامية</SelectItem>
                      <SelectItem value="اجتماعيات">اجتماعيات</SelectItem>
                      <SelectItem value="فنية">فنية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-class">الفصل</Label>
                  <Select
                    value={editedHomework.class}
                    onValueChange={(value) => setEditedHomework({ ...editedHomework, class: value })}
                  >
                    <SelectTrigger id="edit-class">
                      <SelectValue placeholder="اختر الفصل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1أ">الصف الأول (أ)</SelectItem>
                      <SelectItem value="1ب">الصف الأول (ب)</SelectItem>
                      <SelectItem value="2أ">الصف الثاني (أ)</SelectItem>
                      <SelectItem value="2ب">الصف الثاني (ب)</SelectItem>
                      <SelectItem value="3أ">الصف الثالث (أ)</SelectItem>
                      <SelectItem value="3ب">الصف الثالث (ب)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-dueDate">تاريخ التسليم</Label>
                  <Input
                    id="edit-dueDate"
                    type="date"
                    value={editedHomework.dueDate}
                    onChange={(e) => setEditedHomework({ ...editedHomework, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">الأولوية</Label>
                  <Select
                    value={editedHomework.priority}
                    onValueChange={(value) => setEditedHomework({ ...editedHomework, priority: value as any })}
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue placeholder="اختر الأولوية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="low">منخفضة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">وصف الواجب</Label>
                <Textarea
                  id="edit-description"
                  rows={4}
                  value={editedHomework.description}
                  onChange={(e) => setEditedHomework({ ...editedHomework, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-file">الملفات المرفقة</Label>
                  <label
                    htmlFor="edit-file-upload"
                    className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    إضافة ملف جديد
                  </label>
                </div>
                {editedHomework.attachments && editedHomework.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {editedHomework.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-blue-500 ml-2" />
                          <span className="text-sm">{file}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500"
                          onClick={() => removeEditedAttachment(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">لا توجد ملفات مرفقة</div>
                )}
                <input id="edit-file-upload" type="file" className="hidden" onChange={handleFileChange} multiple />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="ml-2 h-4 w-4" />
              إلغاء
            </Button>
            <Button onClick={saveEditedHomework}>
              <Check className="ml-2 h-4 w-4" />
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>}

      {/* View Homework Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>تفاصيل الواجب المنزلي</DialogTitle>
            <DialogDescription>عرض تفاصيل الواجب المنزلي</DialogDescription>
          </DialogHeader>
          {selectedHomework && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{selectedHomework.title}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedHomework.subject} - {selectedHomework.class}
                  </p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(selectedHomework.status)}
                  {getPriorityBadge(selectedHomework.priority)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium">تاريخ الإنشاء:</p>
                  <p className="text-gray-700">
                    {format(new Date(selectedHomework.createdAt), "dd/MM/yyyy HH:mm", { locale: ar })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">تاريخ التسليم:</p>
                  <p className="text-gray-700">
                    {format(new Date(selectedHomework.dueDate), "dd/MM/yyyy", { locale: ar })}
                  </p>
                </div>
                {selectedHomework.completedAt && (
                  <div className="space-y-1">
                    <p className="font-medium">تاريخ الإكمال:</p>
                    <p className="text-gray-700">
                      {format(new Date(selectedHomework.completedAt), "dd/MM/yyyy HH:mm", { locale: ar })}
                    </p>
                  </div>
                )}
                {selectedHomework.submissionCount !== undefined && selectedHomework.totalStudents !== undefined && (
                  <div className="space-y-1">
                    <p className="font-medium">نسبة التسليم:</p>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(selectedHomework.submissionCount / selectedHomework.totalStudents) * 100}
                        className="h-2 w-24"
                      />
                      <span>
                        {selectedHomework.submissionCount}/{selectedHomework.totalStudents} (
                        {((selectedHomework.submissionCount / selectedHomework.totalStudents) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="font-medium">وصف الواجب:</p>
                <div className="bg-gray-50 p-3 rounded-md text-gray-700">{selectedHomework.description}</div>
              </div>

              {selectedHomework.attachments && selectedHomework.attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium">الملفات المرفقة:</p>
                  <div className="space-y-2">
                    {selectedHomework.attachments.map((file, index) => (
                      <div key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
                        <FileText className="h-4 w-4 text-blue-500 ml-2" />
                        <span className="text-sm">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              إغلاق
            </Button>
            {selectedHomework && !isStudent && (
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false)
                  handleEditHomework(selectedHomework)
                }}
              >
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {!isStudent && <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا الواجب؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف الواجب المنزلي نهائياً من النظام.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="ml-2 h-4 w-4" />
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>}
    </div>
  )
}
