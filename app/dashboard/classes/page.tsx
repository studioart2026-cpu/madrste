"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, StarHalf, Users, PlusCircle, Pencil, Trash, Search, Calendar, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import { fetchClassesData, saveClassesData } from "@/lib/school-api"
import { defaultSchoolClasses, type SchoolClass } from "@/lib/school-data"
import { teacherNames } from "@/lib/teachers-directory"

type Class = SchoolClass

// بيانات تجريبية للفصول
const initialClassesData: Class[] = [
  // الترم الأول
  {
    id: "1",
    name: "١/١",
    level: "١",
    section: "١",
    teacher: "أ. نورة الأحمد",
    students: 25,
    rating: 4.5,
    capacity: 30,
    term: "الترم الأول",
  },
  {
    id: "2",
    name: "١/٢",
    level: "١",
    section: "٢",
    teacher: "أ. سارة المحمد",
    students: 22,
    rating: 4.2,
    capacity: 30,
    term: "الترم الأول",
  },
  {
    id: "6",
    name: "٢/١",
    level: "٢",
    section: "١",
    teacher: "أ. منى العبدالله",
    students: 30,
    rating: 4.1,
    capacity: 35,
    term: "الترم الأول",
  },
  {
    id: "7",
    name: "٢/٢",
    level: "٢",
    section: "٢",
    teacher: "أ. هند السعد",
    students: 28,
    rating: 3.9,
    capacity: 35,
    term: "الترم الأول",
  },
  {
    id: "12",
    name: "٣/١",
    level: "٣",
    section: "١",
    teacher: "أ. عبير الخالد",
    students: 32,
    rating: 4.6,
    capacity: 40,
    term: "الترم الأول",
  },

  // الترم الثاني
  {
    id: "3",
    name: "١/٣",
    level: "١",
    section: "٣",
    teacher: "أ. ريم الفهد",
    students: 28,
    rating: 3.8,
    capacity: 30,
    term: "الترم الثاني",
  },
  {
    id: "4",
    name: "١/٤",
    level: "١",
    section: "٤",
    teacher: "أ. لمياء السلطان",
    students: 26,
    rating: 4.0,
    capacity: 30,
    term: "الترم الثاني",
  },
  {
    id: "8",
    name: "٢/٣",
    level: "٢",
    section: "٣",
    teacher: "أ. أمل الناصر",
    students: 26,
    rating: 4.4,
    capacity: 35,
    term: "الترم الثاني",
  },
  {
    id: "9",
    name: "٢/٤",
    level: "٢",
    section: "٤",
    teacher: "أ. نوف العتيبي",
    students: 27,
    rating: 4.3,
    capacity: 35,
    term: "الترم الثاني",
  },
  {
    id: "13",
    name: "٣/٢",
    level: "٣",
    section: "٢",
    teacher: "أ. نورة الأحمد",
    students: 30,
    rating: 4.2,
    capacity: 40,
    term: "الترم الثاني",
  },

  // فصول إضافية (الترم الثاني)
  {
    id: "5",
    name: "١/٥",
    level: "١",
    section: "٥",
    teacher: "أ. سارة المحمد",
    students: 24,
    rating: 4.7,
    capacity: 30,
    term: "الترم الثاني",
  },
  {
    id: "10",
    name: "٢/٥",
    level: "٢",
    section: "٥",
    teacher: "أ. منى العبدالله",
    students: 29,
    rating: 4.5,
    capacity: 35,
    term: "الترم الثاني",
  },
  {
    id: "11",
    name: "٢/٦",
    level: "٢",
    section: "٦",
    teacher: "أ. هند السعد",
    students: 31,
    rating: 4.2,
    capacity: 35,
    term: "الترم الثاني",
  },
  {
    id: "14",
    name: "٣/٣",
    level: "٣",
    section: "٣",
    teacher: "أ. عبير الخالد",
    students: 28,
    rating: 4.8,
    capacity: 40,
    term: "الترم الثاني",
  },
  {
    id: "15",
    name: "٣/٤",
    level: "٣",
    section: "٤",
    teacher: "أ. ريم الفهد",
    students: 34,
    rating: 4.4,
    capacity: 40,
    term: "الترم الثاني",
  },
]

// قائمة المعلمات المعتمدة
const teachersList = teacherNames

export default function ClassesPage() {
  // حالة الفصول
  const [classes, setClasses] = useState<Class[]>(defaultSchoolClasses)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("term1")
  const [isSaving, setIsSaving] = useState(false)

  // حالات مربعات الحوار
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // الفصل المحدد للتعديل أو الحذف
  const [classToEdit, setClassToEdit] = useState<Class | null>(null)
  const [classToDelete, setClassToDelete] = useState<Class | null>(null)

  // حالة الفصل الجديد
  const [newClassData, setNewClassData] = useState({
    level: "١" as "١" | "٢" | "٣",
    section: "",
    teacher: teachersList[0],
    capacity: 30,
    term: "الترم الأول" as "الترم الأول" | "الترم الثاني",
  })

  useEffect(() => {
    let isMounted = true

    const loadClasses = async () => {
      try {
        const response = await fetchClassesData()
        if (!isMounted) {
          return
        }
        setClasses(Array.isArray(response.classes) && response.classes.length > 0 ? response.classes : defaultSchoolClasses)
      } catch {
        if (!isMounted) {
          return
        }
        setClasses(defaultSchoolClasses)
      }
    }

    void loadClasses()

    return () => {
      isMounted = false
    }
  }, [])

  const persistClasses = async (nextClasses: Class[]) => {
    const previousClasses = classes
    setClasses(nextClasses)
    setIsSaving(true)

    try {
      const response = await saveClassesData(nextClasses)
      setClasses(response.classes)
      return true
    } catch (error) {
      setClasses(previousClasses)
      toast({
        title: "تعذر حفظ الفصول",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ بيانات الفصول",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  // تصفية الفصول حسب الترم
  const firstTermClasses = classes.filter((cls) => cls.term === "الترم الأول")
  const secondTermClasses = classes.filter((cls) => cls.term === "الترم الثاني")
  
  // تصفية الفصول حسب البحث
  const filterClasses = (classesList: Class[]) => {
    if (!searchQuery) return classesList
    return classesList.filter(
      (cls) => cls.name.includes(searchQuery) || cls.teacher.includes(searchQuery) || cls.section.includes(searchQuery),
    )
  }

  // عرض تقييم الفصل
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
        <span className="mr-2 text-sm text-muted-foreground">{rating.toFixed(1)}</span>
      </div>
    )
  }

  // إضافة فصل جديد بشكل مباشر (للاختبار)
  const addTestClass = async () => {
    const newId = `test-${Date.now()}`
    const newClass: Class = {
      id: newId,
      name: "١/٩٩",
      level: "١",
      section: "٩٩",
      teacher: teachersList[0],
      students: 0,
      rating: 0,
      capacity: 30,
      term: "الترم الأول",
    }

    const updatedClasses = [...classes, newClass]
    const saved = await persistClasses(updatedClasses)
    if (!saved) {
      return
    }

    toast({
      title: "تم بنجاح",
      description: "تم إضافة فصل اختباري بنجاح",
    })
  }

  // إضافة فصل جديد من النموذج
  const handleAddClass = async () => {
    const normalizedSection = newClassData.section.trim()

    // التحقق من البيانات
    if (!normalizedSection) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الشعبة",
        variant: "destructive",
      })
      return
    }

    const duplicateClass = classes.some(
      (cls) =>
        cls.term === newClassData.term && cls.level === newClassData.level && cls.section.trim() === normalizedSection,
    )

    if (duplicateClass) {
      toast({
        title: "تعذر الإضافة",
        description: "الفصل موجود مسبقًا بنفس الترم والمرحلة والشعبة",
        variant: "destructive",
      })
      return
    }

    // إنشاء معرف فريد
    const newId = `new-${Date.now()}`

    // إنشاء كائن الفصل الجديد
    const newClass: Class = {
      id: newId,
      name: `${newClassData.level}/${normalizedSection}`,
      level: newClassData.level,
      section: normalizedSection,
      teacher: newClassData.teacher,
      students: 0,
      rating: 0,
      capacity: newClassData.capacity,
      term: newClassData.term,
    }

    // تحديث قائمة الفصول
    const saved = await persistClasses([...classes, newClass])
    if (!saved) {
      return
    }
    setActiveTab(newClass.term === "الترم الأول" ? "term1" : "term2")
    setSearchQuery("")

    // إغلاق مربع الحوار
    setIsAddDialogOpen(false)

    // إعادة تعيين الحقول
    setNewClassData({
      level: "١",
      section: "",
      teacher: teachersList[0],
      capacity: 30,
      term: "الترم الأول",
    })

    // عرض رسالة نجاح
    toast({
      title: "تم بنجاح",
      description: `تم إضافة الفصل ${newClass.name} بنجاح`,
    })
  }

  // تعديل فصل
  const handleEditClass = async () => {
    if (!classToEdit) return

    const updatedClasses = classes.map((cls) => (cls.id === classToEdit.id ? classToEdit : cls))
    const saved = await persistClasses(updatedClasses)
    if (!saved) {
      return
    }
    setIsEditDialogOpen(false)
    setClassToEdit(null)

    toast({
      title: "تم بنجاح",
      description: "تم تحديث بيانات الفصل بنجاح",
    })
  }

  // حذف فصل
  const handleDeleteClass = async () => {
    if (!classToDelete) return

    const updatedClasses = classes.filter((cls) => cls.id !== classToDelete.id)
    const saved = await persistClasses(updatedClasses)
    if (!saved) {
      return
    }
    setIsDeleteDialogOpen(false)
    setClassToDelete(null)

    toast({
      title: "تم بنجاح",
      description: `تم حذف الفصل ${classToDelete.name} بنجاح`,
    })
  }

  // عرض بطاقة الفصل
  const renderClassCard = (cls: Class) => (
    <Card key={cls.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-row-reverse justify-between items-start">
          <CardTitle>الفصل {cls.name}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setClassToEdit(cls)
                setIsEditDialogOpen(true)
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500"
              onClick={() => {
                setClassToDelete(cls)
                setIsDeleteDialogOpen(true)
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-row-reverse gap-2 mt-1">
          <Badge>المرحلة {cls.level}</Badge>
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
            <span>
              {cls.students} / {cls.capacity}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">التقييم:</span>
            {renderRating(cls.rating)}
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => setSelectedClass(selectedClass === cls.id ? null : cls.id)}
        >
          {selectedClass === cls.id ? "إخفاء التفاصيل" : "عرض التفاصيل"}
        </Button>

        {selectedClass === cls.id && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">معلومات إضافية</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">السعة القصوى: {cls.capacity} طالب</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">نسبة الإشغال: </span>
                <span>{Math.round((cls.students / cls.capacity) * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">الترم: {cls.term}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">الجدول الدراسي: </span>
                <span>الأحد، الثلاثاء، الخميس</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // عرض إحصائيات الترم
  const renderTermStats = (classes: Class[]) => {
    const totalStudents = classes.reduce((sum, cls) => sum + cls.students, 0)
    const totalCapacity = classes.reduce((sum, cls) => sum + cls.capacity, 0)
    const avgRating = classes.length > 0 ? classes.reduce((sum, cls) => sum + cls.rating, 0) / classes.length : 0

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium">عدد الفصول</h3>
              <p className="text-3xl font-bold mt-2">{classes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium">إجمالي الطلاب</h3>
              <p className="text-3xl font-bold mt-2">{totalStudents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium">نسبة الإشغال</h3>
              <p className="text-3xl font-bold mt-2">
                {totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium">متوسط التقييم</h3>
              <div className="flex justify-center mt-2">{renderRating(avgRating)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // نموذج إضافة فصل مبسط
  const SimpleAddClassForm = () => (
    <div className="p-4 border rounded-lg mb-6">
      <h3 className="text-lg font-bold mb-4">إضافة فصل جديد (مبسط)</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <Label htmlFor="simple-term">الترم</Label>
          <Select
            value={newClassData.term}
            onValueChange={(value) =>
              setNewClassData({ ...newClassData, term: value as "الترم الأول" | "الترم الثاني" })
            }
          >
            <SelectTrigger id="simple-term">
              <SelectValue placeholder="اختر الترم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="الترم الأول">الترم الأول</SelectItem>
              <SelectItem value="الترم الثاني">الترم الثاني</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="simple-level">المرحلة</Label>
          <Select
            value={newClassData.level}
            onValueChange={(value) => setNewClassData({ ...newClassData, level: value as "١" | "٢" | "٣" })}
          >
            <SelectTrigger id="simple-level">
              <SelectValue placeholder="اختر المرحلة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="١">أول متوسط</SelectItem>
              <SelectItem value="٢">ثاني متوسط</SelectItem>
              <SelectItem value="٣">ثالث متوسط</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="simple-section">الشعبة</Label>
          <Input
            id="simple-section"
            value={newClassData.section}
            onChange={(e) => setNewClassData({ ...newClassData, section: e.target.value })}
            placeholder="مثال: ١، ٢، ٣"
          />
        </div>
        <div>
          <Label htmlFor="simple-teacher">المعلم</Label>
          <Select
            value={newClassData.teacher}
            onValueChange={(value) => setNewClassData({ ...newClassData, teacher: value })}
          >
            <SelectTrigger id="simple-teacher">
              <SelectValue placeholder="اختر المعلم" />
            </SelectTrigger>
            <SelectContent>
              {teachersList.map((teacher) => (
                <SelectItem key={teacher} value={teacher}>
                  {teacher}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={() => void handleAddClass()} className="w-full" disabled={isSaving}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة فصل
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div dir="rtl" className="container mx-auto py-6 text-right">
      <div className="flex flex-row-reverse justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة الفصول الدراسية</h1>
        <div className="flex gap-2">
          <Button onClick={() => void addTestClass()} variant="outline" disabled={isSaving}>
            إضافة فصل اختباري
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="ml-2 h-4 w-4" />
                إضافة فصل (حوار)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة فصل جديد</DialogTitle>
                <DialogDescription>أدخل معلومات الفصل الجديد هنا.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="term">الترم</Label>
                  <Select
                    value={newClassData.term}
                    onValueChange={(value) =>
                      setNewClassData({
                        ...newClassData,
                        term: value as "الترم الأول" | "الترم الثاني",
                      })
                    }
                  >
                    <SelectTrigger id="term">
                      <SelectValue placeholder="اختر الترم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="الترم الأول">الترم الأول</SelectItem>
                      <SelectItem value="الترم الثاني">الترم الثاني</SelectItem>                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="level">المرحلة</Label>
                  <Select
                    value={newClassData.level}
                    onValueChange={(value) => setNewClassData({ ...newClassData, level: value as "١" | "٢" | "٣" })}
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="اختر المرحلة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="١">أول متوسط</SelectItem>
                      <SelectItem value="٢">ثاني متوسط</SelectItem>
                      <SelectItem value="٣">ثالث متوسط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="section">الشعبة</Label>
                  <Input
                    id="section"
                    value={newClassData.section}
                    onChange={(e) => setNewClassData({ ...newClassData, section: e.target.value })}
                    placeholder="مثال: ١، ٢، ٣"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="teacher">المعلم</Label>
                  <Select
                    value={newClassData.teacher}
                    onValueChange={(value) => setNewClassData({ ...newClassData, teacher: value })}
                  >
                    <SelectTrigger id="teacher">
                      <SelectValue placeholder="اختر المعلم" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachersList.map((teacher) => (
                        <SelectItem key={teacher} value={teacher}>
                          {teacher}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="capacity">السعة</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newClassData.capacity}
                    onChange={(e) =>
                      setNewClassData({ ...newClassData, capacity: Number.parseInt(e.target.value) || 30 })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    // إعادة تعيين الحقول
                    setNewClassData({
                      level: "١",
                      section: "",
                      teacher: teachersList[0],
                      capacity: 30,
                      term: "الترم الأول",
                    })
                  }}
                >
                  إلغاء
                </Button>
                <Button type="button" onClick={() => void handleAddClass()} disabled={isSaving}>
                  إضافة
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* نموذج إضافة مبسط */}
      <SimpleAddClassForm />

      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث عن فصل..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
      </div>

      <Tabs defaultValue="term1" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="term1">الترم الأول</TabsTrigger>
          <TabsTrigger value="term2">الترم الثاني</TabsTrigger>
        </TabsList>

        <TabsContent value="term1">
          <div className="flex flex-row-reverse items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">الترم الأول</h2>
            <Badge variant="outline" className="text-lg">
              <Calendar className="ml-2 h-4 w-4" />
              سبتمبر - ديسمبر
            </Badge>
          </div>
          {renderTermStats(firstTermClasses)}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filterClasses(firstTermClasses).map(renderClassCard)}
          </div>
          {filterClasses(firstTermClasses).length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              لا توجد فصول في هذا الترم. يمكنك إضافة فصول جديدة باستخدام نموذج "إضافة فصل جديد".
            </div>
          )}
        </TabsContent>

        <TabsContent value="term2">
          <div className="flex flex-row-reverse items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">الترم الثاني</h2>
            <Badge variant="outline" className="text-lg">
              <Calendar className="ml-2 h-4 w-4" />
              يناير - أبريل
            </Badge>
          </div>
          {renderTermStats(secondTermClasses)}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filterClasses(secondTermClasses).map(renderClassCard)}
          </div>
          {filterClasses(secondTermClasses).length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              لا توجد فصول في هذا الترم. يمكنك إضافة فصول جديدة باستخدام نموذج "إضافة فصل جديد".
            </div>
          )}
        </TabsContent>

        </Tabs>

      {/* مربع حوار تعديل الفصل */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الفصل</DialogTitle>
            <DialogDescription>قم بتعديل معلومات الفصل هنا.</DialogDescription>
          </DialogHeader>
          {classToEdit && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-term">الترم</Label>
                <Select
                  value={classToEdit.term}
                  onValueChange={(value) =>
                    setClassToEdit({
                      ...classToEdit,
                      term: value as "الترم الأول" | "الترم الثاني",
                    })
                  }
                >
                  <SelectTrigger id="edit-term">
                    <SelectValue placeholder="اختر الترم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الترم الأول">الترم الأول</SelectItem>
                    <SelectItem value="الترم الثاني">الترم الثاني</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-level">المرحلة</Label>
                <Select
                  value={classToEdit.level}
                  onValueChange={(value) => setClassToEdit({ ...classToEdit, level: value as "١" | "٢" | "٣" })}
                >
                  <SelectTrigger id="edit-level">
                    <SelectValue placeholder="اختر المرحلة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="١">أول متوسط</SelectItem>
                    <SelectItem value="٢">ثاني متوسط</SelectItem>
                    <SelectItem value="٣">ثالث متوسط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-section">الشعبة</Label>
                <Input
                  id="edit-section"
                  value={classToEdit.section}
                  onChange={(e) =>
                    setClassToEdit({
                      ...classToEdit,
                      section: e.target.value,
                      name: `${classToEdit.level}/${e.target.value}`,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-teacher">المعلم</Label>
                <Select
                  value={classToEdit.teacher}
                  onValueChange={(value) => setClassToEdit({ ...classToEdit, teacher: value })}
                >
                  <SelectTrigger id="edit-teacher">
                    <SelectValue placeholder="اختر المعلم" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachersList.map((teacher) => (
                      <SelectItem key={teacher} value={teacher}>
                        {teacher}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-students">عدد الطلاب</Label>
                <Input
                  id="edit-students"
                  type="number"
                  value={classToEdit.students}
                  onChange={(e) => setClassToEdit({ ...classToEdit, students: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-capacity">السعة</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={classToEdit.capacity}
                  onChange={(e) => setClassToEdit({ ...classToEdit, capacity: Number.parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => void handleEditClass()} disabled={isSaving}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار حذف الفصل */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الفصل</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف الفصل {classToDelete?.name}؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={() => void handleDeleteClass()} disabled={isSaving}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* إضافة مكون Toaster */}
      <Toaster />
    </div>
  )
}

