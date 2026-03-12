"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  ChevronDown,
  Filter,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Send,
  Trash2,
  Copy,
  CheckCircle,
  History,
  Save,
  Download,
  Users,
  RefreshCw,
  Eye,
  X,
  MoreHorizontal,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

// نموذج بيانات الطالبة وولي الأمر
interface ParentType {
  id: string
  name: string
  phone: string
  email?: string
  relation: string
  preferredContact: "واتساب" | "هاتف" | "بريد إلكتروني"
  lastContacted?: string
  responseRate?: number
}

interface StudentType {
  id: string
  name: string
  studentId: string
  grade: string
  classroom: string
  parents: ParentType[]
}

// نموذج بيانات الرسائل
interface MessageTemplateType {
  id: string
  title: string
  content: string
  category: string
  createdAt: string
}

interface SentMessageType {
  id: string
  templateId?: string
  title: string
  content: string
  recipients: string[]
  sentAt: string
  status: "نجاح" | "فشل" | "جزئي"
  deliveryRate: number
}

// بيانات تجريبية للطالبات وأولياء الأمور
const initialStudents: StudentType[] = [
  {
    id: "1",
    name: "سارة أحمد",
    studentId: "10001",
    grade: "الصف الأول",
    classroom: "١/١",
    parents: [
      {
        id: "p1",
        name: "أحمد محمد",
        phone: "0501234567",
        email: "ahmed@example.com",
        relation: "أب",
        preferredContact: "واتساب",
        lastContacted: "2023-05-10",
        responseRate: 90,
      },
      {
        id: "p2",
        name: "منى علي",
        phone: "0509876543",
        relation: "أم",
        preferredContact: "هاتف",
        lastContacted: "2023-05-12",
        responseRate: 95,
      },
    ],
  },
  {
    id: "2",
    name: "نورة محمد",
    studentId: "10002",
    grade: "الصف الثاني",
    classroom: "٢/٣",
    parents: [
      {
        id: "p3",
        name: "محمد خالد",
        phone: "0507654321",
        email: "mohammed@example.com",
        relation: "أب",
        preferredContact: "بريد إلكتروني",
        lastContacted: "2023-05-05",
        responseRate: 80,
      },
    ],
  },
  {
    id: "3",
    name: "هند خالد",
    studentId: "10003",
    grade: "الصف الثالث",
    classroom: "٣/٢",
    parents: [
      {
        id: "p4",
        name: "خالد عبدالله",
        phone: "0551234567",
        relation: "أب",
        preferredContact: "واتساب",
        lastContacted: "2023-05-15",
        responseRate: 100,
      },
      {
        id: "p5",
        name: "عائشة محمد",
        phone: "0552345678",
        email: "aisha@example.com",
        relation: "أم",
        preferredContact: "واتساب",
        lastContacted: "2023-05-14",
        responseRate: 85,
      },
    ],
  },
  {
    id: "4",
    name: "ريم سعد",
    studentId: "10004",
    grade: "الصف الأول",
    classroom: "١/٢",
    parents: [
      {
        id: "p6",
        name: "سعد فهد",
        phone: "0561234567",
        relation: "أب",
        preferredContact: "هاتف",
      },
    ],
  },
  {
    id: "5",
    name: "لمى عبدالله",
    studentId: "10005",
    grade: "الصف الثاني",
    classroom: "٢/١",
    parents: [
      {
        id: "p7",
        name: "عبدالله سعيد",
        phone: "0571234567",
        email: "abdullah@example.com",
        relation: "أب",
        preferredContact: "بريد إلكتروني",
        lastContacted: "2023-05-01",
        responseRate: 75,
      },
      {
        id: "p8",
        name: "نوف محمد",
        phone: "0572345678",
        relation: "أم",
        preferredContact: "واتساب",
        lastContacted: "2023-05-08",
        responseRate: 90,
      },
    ],
  },
]

// قوالب الرسائل التجريبية
const initialMessageTemplates: MessageTemplateType[] = [
  {
    id: "t1",
    title: "دعوة لاجتماع أولياء الأمور",
    content:
      "السلام عليكم ورحمة الله وبركاته\nندعوكم لحضور اجتماع أولياء الأمور يوم [التاريخ] الساعة [الوقت] في [المكان].\nنأمل حضوركم لمناقشة مستوى الطالبات وسير العملية التعليمية.\nمع خالص الشكر والتقدير",
    category: "اجتماعات",
    createdAt: "2023-04-01",
  },
  {
    id: "t2",
    title: "إشعار بموعد الاختبارات",
    content:
      "السلام عليكم ورحمة الله وبركاته\nنود إشعاركم بأن اختبارات الفصل الدراسي ستبدأ يوم [التاريخ].\nنرجو التأكد من استعداد الطالبات وحضورهن في الموعد المحدد.\nمع تمنياتنا للجميع بالتوفيق والنجاح",
    category: "اختبارات",
    createdAt: "2023-04-05",
  },
  {
    id: "t3",
    title: "تذكير بالواجبات المنزلية",
    content:
      "السلام عليكم ورحمة الله وبركاته\nنود تذكيركم بضرورة متابعة الواجبات المنزلية للطالبة [اسم الطالبة] في مادة [المادة].\nموعد التسليم هو يوم [اليوم].\nشكراً لتعاونكم",
    category: "واجبات",
    createdAt: "2023-04-10",
  },
  {
    id: "t4",
    title: "إشعار بغياب الطالبة",
    content:
      "السلام عليكم ورحمة الله وبركاته\nنود إشعاركم بغياب الطالبة [اسم الطالبة] اليوم عن المدرسة.\nنرجو التواصل مع إدارة المدرسة لتوضيح سبب الغياب.\nمع خالص الشكر",
    category: "غياب",
    createdAt: "2023-04-15",
  },
  {
    id: "t5",
    title: "دعوة لحضور نشاط مدرسي",
    content:
      "السلام عليكم ورحمة الله وبركاته\nيسرنا دعوتكم لحضور [اسم النشاط] الذي ستقيمه المدرسة يوم [التاريخ] الساعة [الوقت].\nستشارك الطالبة [اسم الطالبة] في هذا النشاط.\nنتطلع لحضوركم ومشاركتكم",
    category: "أنشطة",
    createdAt: "2023-04-20",
  },
]

// سجل الرسائل المرسلة
const initialSentMessages: SentMessageType[] = [
  {
    id: "m1",
    templateId: "t1",
    title: "دعوة لاجتماع أولياء الأمور",
    content:
      "السلام عليكم ورحمة الله وبركاته\nندعوكم لحضور اجتماع أولياء الأمور يوم الخميس 20/5/2023 الساعة 10:00 صباحاً في قاعة الاجتماعات بالمدرسة.\nنأمل حضوركم لمناقشة مستوى الطالبات وسير العملية التعليمية.\nمع خالص الشكر والتقدير",
    recipients: ["0501234567", "0509876543", "0507654321", "0551234567"],
    sentAt: "2023-05-15T10:30:00",
    status: "نجاح",
    deliveryRate: 100,
  },
  {
    id: "m2",
    templateId: "t2",
    title: "إشعار بموعد الاختبارات",
    content:
      "السلام عليكم ورحمة الله وبركاته\nنود إشعاركم بأن اختبارات الفصل الدراسي ستبدأ يوم الأحد 10/6/2023.\nنرجو التأكد من استعداد الطالبات وحضورهن في الموعد المحدد.\nمع تمنياتنا للجميع بالتوفيق والنجاح",
    recipients: ["0501234567", "0507654321", "0551234567", "0552345678", "0561234567", "0571234567", "0572345678"],
    sentAt: "2023-05-10T09:15:00",
    status: "جزئي",
    deliveryRate: 85,
  },
  {
    id: "m3",
    templateId: "t4",
    title: "إشعار بغياب الطالبة",
    content:
      "السلام عليكم ورحمة الله وبركاته\nنود إشعاركم بغياب الطالبة ريم سعد اليوم عن المدرسة.\nنرجو التواصل مع إدارة المدرسة لتوضيح سبب الغياب.\nمع خالص الشكر",
    recipients: ["0561234567"],
    sentAt: "2023-05-08T08:45:00",
    status: "نجاح",
    deliveryRate: 100,
  },
]

// فئات الرسائل
const messageCategories = ["اجتماعات", "اختبارات", "واجبات", "غياب", "أنشطة", "سلوك", "إنجازات", "عام"]

// Mock data for parents
const mockParents = [
  {
    id: 1,
    studentName: "سارة أحمد",
    parentName: "أحمد محمد",
    phone: "966501234567",
    lastContact: "2023-05-10",
    class: "الصف الثالث أ",
  },
  {
    id: 2,
    studentName: "نورة خالد",
    parentName: "خالد إبراهيم",
    phone: "966502345678",
    lastContact: "2023-05-08",
    class: "الصف الثالث أ",
  },
  {
    id: 3,
    studentName: "هند سعيد",
    parentName: "سعيد عبدالله",
    phone: "966503456789",
    lastContact: "2023-05-05",
    class: "الصف الثالث ب",
  },
  {
    id: 4,
    studentName: "ريم فهد",
    parentName: "فهد سلطان",
    phone: "966504567890",
    lastContact: "2023-05-03",
    class: "الصف الثالث ب",
  },
  {
    id: 5,
    studentName: "منى عبدالرحمن",
    parentName: "عبدالرحمن ناصر",
    phone: "966505678901",
    lastContact: "2023-05-01",
    class: "الصف الرابع أ",
  },
  {
    id: 6,
    studentName: "لمى سلمان",
    parentName: "سلمان عبدالعزيز",
    phone: "966506789012",
    lastContact: "2023-04-28",
    class: "الصف الرابع أ",
  },
  {
    id: 7,
    studentName: "دانة محمد",
    parentName: "محمد عبدالله",
    phone: "966507890123",
    lastContact: "2023-04-25",
    class: "الصف الرابع ب",
  },
  {
    id: 8,
    studentName: "جواهر سعد",
    parentName: "سعد فيصل",
    phone: "966508901234",
    lastContact: "2023-04-22",
    class: "الصف الرابع ب",
  },
]

// Mock message templates
const messageTemplates = [
  {
    id: 1,
    title: "دعوة لاجتماع أولياء الأمور",
    content:
      "السلام عليكم ورحمة الله وبركاته\nندعوكم لحضور اجتماع أولياء الأمور يوم [التاريخ] الساعة [الوقت] في [المكان].\nمع تحيات إدارة المدرسة",
  },
  {
    id: 2,
    title: "إشعار بالاختبارات",
    content:
      "السلام عليكم ورحمة الله وبركاته\nنود إشعاركم بأن اختبارات الفصل الدراسي ستبدأ يوم [التاريخ].\nنرجو الاهتمام بمراجعة المواد الدراسية.\nمع تحيات إدارة المدرسة",
  },
  {
    id: 3,
    title: "تذكير بالواجبات",
    content: "السلام عليكم ورحمة الله وبركاته\nنود تذكيركم بمتابعة الواجبات المدرسية للطالب/ة.\nمع تحيات إدارة المدرسة",
  },
  {
    id: 4,
    title: "إشعار بالغياب",
    content:
      "السلام عليكم ورحمة الله وبركاته\nنود إشعاركم بغياب الطالب/ة عن الدوام المدرسي ليوم [التاريخ].\nنرجو التكرم بتوضيح سبب الغياب.\nمع تحيات إدارة المدرسة",
  },
]

// Mock message history
const initialMessageHistory = [
  {
    id: 1,
    recipients: ["أحمد محمد", "خالد إبراهيم"],
    content:
      "السلام عليكم ورحمة الله وبركاته\nندعوكم لحضور اجتماع أولياء الأمور يوم الخميس القادم الساعة 6 مساءً في قاعة الاجتماعات بالمدرسة.\nمع تحيات إدارة المدرسة",
    date: "2023-05-10",
    type: "جماعية",
  },
  {
    id: 2,
    recipients: ["سعيد عبدالله"],
    content:
      "السلام عليكم ورحمة الله وبركاته\nنود إشعاركم بغياب الطالبة هند عن الدوام المدرسي ليوم الأربعاء 8 مايو.\nنرجو التكرم بتوضيح سبب الغياب.\nمع تحيات إدارة المدرسة",
    date: "2023-05-08",
    type: "فردية",
  },
]

// WhatsApp icon component
const WhatsappIconComponent = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 6.628 5.373 12 12 12 6.628 0 12-5.373 12-12 0-6.628-5.373-12-12-12zm.029 18.88a7.947 7.947 0 0 1-3.77-.954l-4.179 1.097 1.116-4.085a7.9 7.9 0 0 1-1.039-3.939c0-4.365 3.549-7.913 7.914-7.913 4.366 0 7.914 3.548 7.914 7.913 0 4.366-3.549 7.914-7.914 7.914l-.042-.033z" />
  </svg>
)

export default function CommunicationPage() {
  const { toast } = useToast()
  const [students, setStudents] = useState<StudentType[]>(initialStudents)
  const [messageTemplatesState, setMessageTemplates] = useState<MessageTemplateType[]>(initialMessageTemplates)
  const [sentMessages, setSentMessages] = useState<SentMessageType[]>(initialSentMessages)

  // حالة البحث والفلترة
  const [searchTerm, setSearchTerm] = useState("")
  const [filterGrade, setFilterGrade] = useState<string>("")
  const [filterClassroom, setFilterClassroom] = useState<string>("")

  // حالة الرسائل
  const [selectedParents, setSelectedParents] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplateType | null>(null)
  const [messageTitle, setMessageTitle] = useState("")
  const [messageContent, setMessageContent] = useState("")
  const [newTemplate, setNewTemplate] = useState<Omit<MessageTemplateType, "id" | "createdAt">>({
    title: "",
    content: "",
    category: "عام",
  })

  // حالة مربعات الحوار
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isViewMessageDialogOpen, setIsViewMessageDialogOpen] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<SentMessageType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // الصفوف والفصول المتاحة
  const grades = Array.from(new Set(students.map((student) => student.grade)))
  const classrooms = Array.from(new Set(students.map((student) => student.classroom)))

  // تصفية الطلاب حسب البحث والفلاتر
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.includes(searchTerm) ||
      student.studentId.includes(searchTerm) ||
      student.parents.some(
        (parent) =>
          parent.name.includes(searchTerm) ||
          parent.phone.includes(searchTerm) ||
          (parent.email && parent.email.includes(searchTerm)),
      )

    const matchesGrade = filterGrade ? student.grade === filterGrade : true
    const matchesClassroom = filterClassroom ? student.classroom === filterClassroom : true

    return matchesSearch && matchesGrade && matchesClassroom
  })

  // تحديد/إلغاء تحديد جميع أولياء الأمور
  const toggleSelectAllParents = () => {
    if (selectedParents.length === getAllParentIds().length) {
      setSelectedParents([])
    } else {
      setSelectedParents(getAllParentIds())
    }
  }

  // الحصول على جميع معرفات أولياء الأمور
  const getAllParentIds = () => {
    return filteredStudents.flatMap((student) => student.parents.map((parent) => parent.id))
  }

  // تحديد/إلغاء تحديد ولي أمر
  const toggleSelectParent = (parentId: string) => {
    if (selectedParents.includes(parentId)) {
      setSelectedParents(selectedParents.filter((id) => id !== parentId))
    } else {
      setSelectedParents([...selectedParents, parentId])
    }
  }

  // تحديد/إلغاء تحديد جميع أولياء أمور طالبة
  const toggleSelectStudentParents = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    if (!student) return

    const parentIds = student.parents.map((parent) => parent.id)
    const allSelected = parentIds.every((id) => selectedParents.includes(id))

    if (allSelected) {
      setSelectedParents(selectedParents.filter((id) => !parentIds.includes(id)))
    } else {
      const newSelectedParents = [...selectedParents]
      parentIds.forEach((id) => {
        if (!newSelectedParents.includes(id)) {
          newSelectedParents.push(id)
        }
      })
      setSelectedParents(newSelectedParents)
    }
  }

  // التحقق مما إذا كانت جميع أولياء أمور طالبة محددين
  const areAllStudentParentsSelected = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    if (!student) return false

    return student.parents.every((parent) => selectedParents.includes(parent.id))
  }

  // الحصول على أرقام هواتف أولياء الأمور المحددين
  const getSelectedParentPhones = () => {
    const phones: string[] = []
    students.forEach((student) => {
      student.parents.forEach((parent) => {
        if (selectedParents.includes(parent.id)) {
          phones.push(parent.phone)
        }
      })
    })
    return phones
  }

  // إعادة تعيين نموذج الرسالة
  const resetMessageForm = () => {
    setSelectedTemplate(null)
    setMessageTitle("")
    setMessageContent("")
  }

  // اختيار قالب رسالة
  const selectTemplate = (template: MessageTemplateType) => {
    setSelectedTemplate(template)
    setMessageTitle(template.title)
    setMessageContent(template.content)
  }

  // إرسال رسالة
  const sendMessage = () => {
    if (!messageTitle.trim() || !messageContent.trim()) {
      toast({
        title: "خطأ في الإرسال",
        description: "يرجى إدخال عنوان ومحتوى الرسالة",
        variant: "destructive",
      })
      return
    }

    if (selectedParents.length === 0) {
      toast({
        title: "خطأ في الإرسال",
        description: "يرجى اختيار مستلم واحد على الأقل",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // محاكاة عملية الإرسال
    setTimeout(() => {
      const newMessage: SentMessageType = {
        id: `m${sentMessages.length + 1}`,
        templateId: selectedTemplate?.id,
        title: messageTitle,
        content: messageContent,
        recipients: getSelectedParentPhones(),
        sentAt: new Date().toISOString(),
        status: "نجاح",
        deliveryRate: 100,
      }

      setSentMessages([newMessage, ...sentMessages])
      setIsComposeDialogOpen(false)
      resetMessageForm()
      setSelectedParents([])
      setIsLoading(false)

      toast({
        title: "تم الإرسال بنجاح",
        description: `تم إرسال الرسالة إلى ${newMessage.recipients.length} من أولياء الأمور`,
      })
    }, 1500)
  }

  // حفظ قالب رسالة جديد
  const saveTemplate = () => {
    if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
      toast({
        title: "خطأ في الحفظ",
        description: "يرجى إدخال عنوان ومحتوى القالب",
        variant: "destructive",
      })
      return
    }

    const newTemplateWithId: MessageTemplateType = {
      ...newTemplate,
      id: `t${messageTemplatesState.length + 1}`,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setMessageTemplates([...messageTemplatesState, newTemplateWithId])
    setIsTemplateDialogOpen(false)
    setNewTemplate({
      title: "",
      content: "",
      category: "عام",
    })

    toast({
      title: "تم الحفظ بنجاح",
      description: "تم حفظ قالب الرسالة الجديد",
    })
  }

  // حذف قالب رسالة
  const deleteTemplate = (templateId: string) => {
    setMessageTemplates(messageTemplatesState.filter((template) => template.id !== templateId))

    toast({
      title: "تم الحذف بنجاح",
      description: "تم حذف قالب الرسالة",
    })
  }

  // إرسال رسالة واتساب
  const sendWhatsAppMessage = (phone: string, message = "") => {
    const content = message || "السلام عليكم ورحمة الله وبركاته"
    const encodedMessage = encodeURIComponent(content)
    window.open(`https://wa.me/${phone.replace(/^0/, "966")}?text=${encodedMessage}`, "_blank")

    toast({
      title: "جاري فتح واتساب",
      description: "تم فتح نافذة واتساب للتواصل المباشر",
    })
  }

  // تصدير بيانات أولياء الأمور
  const exportParentsData = () => {
    const headers = ["اسم الطالبة", "الصف", "الفصل", "اسم ولي الأمر", "رقم الهاتف", "البريد الإلكتروني", "صلة القرابة"]

    const rows = students.flatMap((student) =>
      student.parents.map((parent) => [
        student.name,
        student.grade,
        student.classroom,
        parent.name,
        parent.phone,
        parent.email || "",
        parent.relation,
      ]),
    )

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `بيانات_أولياء_الأمور_${new Date().toLocaleDateString("ar-SA")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "تم التصدير بنجاح",
      description: "تم تصدير بيانات أولياء الأمور بنجاح",
    })
  }

  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSearchTerm("")
    setFilterGrade("")
    setFilterClassroom("")
  }

  // Mock data for parents
  const [parents, setParents] = useState(mockParents)
  const [selectedClass, setSelectedClass] = useState("الكل")
  const [selectedParentsState, setSelectedParentsState] = useState<number[]>([])
  const [messageContentState, setMessageContentState] = useState("")
  const [messageHistoryState, setMessageHistoryState] = useState(initialMessageHistory)
  const [isComposeOpen, setIsComposeOpenState] = useState(false)
  const [selectedTemplateState, setSelectedTemplateState] = useState<number | null>(null)
  const [templates, setTemplates] = useState(messageTemplates)
  const [newTemplateState, setNewTemplateState] = useState({ title: "", content: "" })
  const [isNewTemplateOpen, setIsNewTemplateOpenState] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<{ id: number; title: string; content: string } | null>(null)

  // Filter parents based on search term and selected class
  const filteredParents = parents.filter((parent) => {
    const matchesSearch =
      parent.studentName.includes(searchTerm) ||
      parent.parentName.includes(searchTerm) ||
      parent.phone.includes(searchTerm)

    const matchesClass = selectedClass === "الكل" || parent.class === selectedClass

    return matchesSearch && matchesClass
  })

  // Get unique classes for filter dropdown
  const classes = ["الكل", ...Array.from(new Set(parents.map((parent) => parent.class)))]

  // Handle parent selection for group messaging
  const toggleParentSelectionState = (parentId: number) => {
    setSelectedParentsState((prev) =>
      prev.includes(parentId) ? prev.filter((id) => id !== parentId) : [...prev, parentId],
    )
  }

  // Handle sending a message
  const handleSendMessageState = () => {
    if (messageContentState.trim() === "" || selectedParentsState.length === 0) return

    const selectedParentNames = parents
      .filter((parent) => selectedParentsState.includes(parent.id))
      .map((parent) => parent.parentName)

    const newMessage = {
      id: messageHistoryState.length + 1,
      recipients: selectedParentNames,
      content: messageContentState,
      date: new Date().toISOString().split("T")[0],
      type: selectedParentsState.length > 1 ? "جماعية" : "فردية",
    }

    setMessageHistoryState([newMessage, ...messageHistoryState])
    setMessageContentState("")
    setSelectedParentsState([])
    setIsComposeOpenState(false)
  }

  // Handle selecting a message template
  const handleSelectTemplateState = (templateId: number) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setMessageContentState(template.content)
      setSelectedTemplateState(templateId)
    }
  }

  // Handle saving a new template
  const handleSaveTemplateState = () => {
    if (newTemplateState.title.trim() === "" || newTemplateState.content.trim() === "") return

    if (editingTemplate) {
      // Update existing template
      setTemplates(
        templates.map((t) =>
          t.id === editingTemplate.id ? { ...t, title: newTemplateState.title, content: newTemplateState.content } : t,
        ),
      )
    } else {
      // Add new template
      const newTemplateObj = {
        id: templates.length + 1,
        title: newTemplateState.title,
        content: newTemplateState.content,
      }
      setTemplates([...templates, newTemplateObj])
    }

    setNewTemplateState({ title: "", content: "" })
    setEditingTemplate(null)
    setIsNewTemplateOpenState(false)
  }

  // Handle editing a template
  const handleEditTemplateState = (template: (typeof messageTemplates)[0]) => {
    setEditingTemplate(template)
    setNewTemplateState({ title: template.title, content: template.content })
    setIsNewTemplateOpenState(true)
  }

  // Handle deleting a template
  const handleDeleteTemplateState = (templateId: number) => {
    setTemplates(templates.filter((t) => t.id !== templateId))
  }

  // Handle deleting a message from history
  const handleDeleteMessageState = (messageId: number) => {
    setMessageHistoryState(messageHistoryState.filter((m) => m.id !== messageId))
  }

  // Generate WhatsApp URL for direct messaging
  const getWhatsAppUrl = (phone: string, message = "") => {
    const formattedPhone = phone.startsWith("+") ? phone.substring(1) : phone
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
  }

  const WhatsappIcon = WhatsappIconComponent

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">التواصل مع أولياء الأمور</h1>
        <p className="text-gray-500 mt-1">إرسال رسائل واتساب وإشعارات لأولياء أمور الطالبات</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setIsComposeDialogOpen(true)} className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>إرسال رسالة جديدة</span>
          </Button>

          <Button variant="outline" onClick={() => setIsTemplateDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>إضافة قالب جديد</span>
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportParentsData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>تصدير البيانات</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>فلترة</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>فلترة البيانات</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <div className="p-2 space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="grade-filter">الصف الدراسي</Label>
                  <Select value={filterGrade} onValueChange={setFilterGrade}>
                    <SelectTrigger id="grade-filter">
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

                <div className="space-y-1">
                  <Label htmlFor="classroom-filter">الفصل</Label>
                  <Select value={filterClassroom} onValueChange={setFilterClassroom}>
                    <SelectTrigger id="classroom-filter">
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

                <Button variant="outline" size="sm" onClick={resetFilters} className="w-full mt-2">
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="parents">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="parents">أولياء الأمور</TabsTrigger>
          <TabsTrigger value="templates">قوالب الرسائل</TabsTrigger>
          <TabsTrigger value="history">سجل الرسائل</TabsTrigger>
        </TabsList>

        <TabsContent value="parents" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>قائمة أولياء الأمور</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث عن طالبة أو ولي أمر..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-8"
                  />
                </div>
              </div>
              <CardDescription>
                {selectedParents.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <span>تم تحديد {selectedParents.length} من أولياء الأمور</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsComposeDialogOpen(true)}
                      className="h-7 px-2 text-xs"
                    >
                      إرسال رسالة للمحددين
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedParents([])}
                      className="h-7 px-2 text-xs"
                    >
                      إلغاء التحديد
                    </Button>
                  </div>
                ) : (
                  <span>يمكنك تحديد أولياء الأمور لإرسال رسائل جماعية</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedParents.length > 0 && selectedParents.length === getAllParentIds().length}
                          onCheckedChange={toggleSelectAllParents}
                          aria-label="تحديد الكل"
                        />
                      </TableHead>
                      <TableHead className="text-right">الطالبة</TableHead>
                      <TableHead className="text-right">الصف/الفصل</TableHead>
                      <TableHead className="text-right">ولي الأمر</TableHead>
                      <TableHead className="text-right">رقم الهاتف</TableHead>
                      <TableHead className="text-right">وسيلة التواصل المفضلة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <React.Fragment key={student.id}>
                          <TableRow className="bg-muted/50">
                            <TableCell>
                              <Checkbox
                                checked={areAllStudentParentsSelected(student.id)}
                                onCheckedChange={() => toggleSelectStudentParents(student.id)}
                                aria-label={`تحديد جميع أولياء أمور ${student.name}`}
                              />
                            </TableCell>
                            <TableCell colSpan={6} className="font-medium">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span>{student.name}</span>
                                  <Badge variant="outline">{student.studentId}</Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSelectStudentParents(student.id)}
                                  className="text-xs"
                                >
                                  {areAllStudentParentsSelected(student.id) ? "إلغاء تحديد الكل" : "تحديد الكل"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {student.parents.map((parent) => (
                            <TableRow key={parent.id} className="hover:bg-muted/50">
                              <TableCell>
                                <Checkbox
                                  checked={selectedParents.includes(parent.id)}
                                  onCheckedChange={() => toggleSelectParent(parent.id)}
                                  aria-label={`تحديد ${parent.name}`}
                                />
                              </TableCell>
                              <TableCell></TableCell>
                              <TableCell>
                                {student.grade} - {student.classroom}
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span>{parent.name}</span>
                                  <span className="text-xs text-muted-foreground">{parent.relation}</span>
                                </div>
                              </TableCell>
                              <TableCell dir="ltr" className="text-right">
                                {parent.phone}
                              </TableCell>
                              <TableCell>
                                <Badge variant={parent.preferredContact === "واتساب" ? "default" : "outline"}>
                                  {parent.preferredContact}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => sendWhatsAppMessage(parent.phone)}
                                    title="إرسال رسالة واتساب"
                                  >
                                    <WhatsappIcon className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedParents([parent.id])
                                      setIsComposeDialogOpen(true)
                                    }}
                                    title="إرسال رسالة"
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      window.location.href = `tel:${parent.phone}`
                                    }}
                                    title="اتصال هاتفي"
                                  >
                                    <Phone className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          لا توجد بيانات تطابق معايير البحث
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-6">
              <div className="text-sm text-muted-foreground">
                إجمالي أولياء الأمور: {students.reduce((total, student) => total + student.parents.length, 0)}
              </div>
              <Button variant="outline" onClick={exportParentsData} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>تصدير البيانات</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>قوالب الرسائل</CardTitle>
                <Button onClick={() => setIsTemplateDialogOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>إضافة قالب جديد</span>
                </Button>
              </div>
              <CardDescription>قوالب جاهزة للرسائل المتكررة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {messageTemplatesState.map((template) => (
                  <Card key={template.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>خيارات</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTemplate(template)
                                setIsComposeDialogOpen(true)
                              }}
                            >
                              <Send className="h-4 w-4 ml-2" />
                              <span>استخدام القالب</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                navigator.clipboard.writeText(template.content)
                                toast({
                                  title: "تم النسخ",
                                  description: "تم نسخ محتوى القالب إلى الحافظة",
                                })
                              }}
                            >
                              <Copy className="h-4 w-4 ml-2" />
                              <span>نسخ المحتوى</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteTemplate(template.id)} className="text-red-500">
                              <Trash2 className="h-4 w-4 ml-2" />
                              <span>حذف القالب</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription>
                        <Badge variant="outline">{template.category}</Badge>
                        <span className="text-xs text-muted-foreground mr-2">تاريخ الإنشاء: {template.createdAt}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm max-h-24 overflow-hidden text-ellipsis whitespace-pre-line">
                        {template.content}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template)
                          setIsComposeDialogOpen(true)
                        }}
                      >
                        استخدام القالب
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(template.content)
                          toast({
                            title: "تم النسخ",
                            description: "تم نسخ محتوى القالب إلى الحافظة",
                          })
                        }}
                      >
                        نسخ المحتوى
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {messageTemplatesState.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">لا توجد قوالب رسائل. قم بإضافة قالب جديد.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجل الرسائل المرسلة</CardTitle>
              <CardDescription>تاريخ الرسائل المرسلة لأولياء الأمور</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">عنوان الرسالة</TableHead>
                      <TableHead className="text-right">تاريخ الإرسال</TableHead>
                      <TableHead className="text-right">عدد المستلمين</TableHead>
                      <TableHead className="text-right">حالة الإرسال</TableHead>
                      <TableHead className="text-right">نسبة التوصيل</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentMessages.map((message) => (
                      <TableRow key={message.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{message.title}</TableCell>
                        <TableCell>{new Date(message.sentAt).toLocaleString("ar-SA")}</TableCell>
                        <TableCell>{message.recipients.length} مستلم</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              message.status === "نجاح"
                                ? "default"
                                : message.status === "فشل"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {message.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={message.deliveryRate}
                              className={`h-2 ${
                                message.deliveryRate >= 90
                                  ? "bg-green-500"
                                  : message.deliveryRate >= 70
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                            />
                            <span className="text-xs">{message.deliveryRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setCurrentMessage(message)
                                setIsViewMessageDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setMessageTitle(message.title)
                                setMessageContent(message.content)
                                setIsComposeDialogOpen(true)
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {sentMessages.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          لا توجد رسائل مرسلة بعد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* مربع حوار إرسال رسالة جديدة */}
      <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>إرسال رسالة جديدة</DialogTitle>
            <DialogDescription>
              {selectedParents.length > 0
                ? `سيتم إرسال الرسالة إلى ${selectedParents.length} من أولياء الأمور`
                : "اختر المستلمين وأدخل محتوى الرسالة"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-4">
              <div className="space-y-2">
                <Label>قوالب الرسائل</Label>
                <Select
                  value={selectedTemplate?.id || ""}
                  onValueChange={(value) => {
                    if (value) {
                      const template = messageTemplatesState.find((t) => t.id === value)
                      if (template) selectTemplate(template)
                    } else {
                      resetMessageForm()
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر قالب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون قالب</SelectItem>
                    {messageTemplatesState.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>المستلمون ({selectedParents.length})</Label>
                  {selectedParents.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedParents([])}>
                      إلغاء الكل
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-[200px] border rounded-md p-2">
                  {selectedParents.length > 0 ? (
                    <div className="space-y-2">
                      {students.map((student) =>
                        student.parents
                          .filter((parent) => selectedParents.includes(parent.id))
                          .map((parent) => (
                            <div key={parent.id} className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{parent.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {student.name} - {parent.relation}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleSelectParent(parent.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )),
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Users className="h-8 w-8 mb-2" />
                      <p className="text-sm">لم يتم اختيار مستلمين بعد</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message-title">عنوان الرسالة</Label>
                <Input
                  id="message-title"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  placeholder="أدخل عنوان الرسالة"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message-content">محتوى الرسالة</Label>
                <Textarea
                  id="message-content"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="أدخل محتوى الرسالة"
                  className="min-h-[200px]"
                />
              </div>

              <div className="text-sm text-muted-foreground">
                <p>يمكنك استخدام الرموز التالية في الرسالة:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>[اسم الطالبة] - سيتم استبداله باسم الطالبة</li>
                  <li>[اسم ولي الأمر] - سيتم استبداله باسم ولي الأمر</li>
                  <li>[التاريخ] - سيتم استبداله بالتاريخ الحالي</li>
                  <li>[اليوم] - سيتم استبداله باليوم الحالي</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={sendMessage} disabled={isLoading} className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>إرسال الرسالة</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار إضافة قالب جديد */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة قالب رسالة جديد</DialogTitle>
            <DialogDescription>أدخل بيانات قالب الرسالة الجديد ليتم استخدامه لاحقاً</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-title">عنوان القالب</Label>
                <Input
                  id="template-title"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  placeholder="أدخل عنوان القالب"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-category">فئة القالب</Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
                >
                  <SelectTrigger id="template-category">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {messageCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-content">محتوى القالب</Label>
              <Textarea
                id="template-content"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                placeholder="أدخل محتوى القالب"
                className="min-h-[200px]"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>يمكنك استخدام الرموز التالية في القالب:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>[اسم الطالبة] - سيتم استبداله باسم الطالبة</li>
                <li>[اسم ولي الأمر] - سيتم استبداله باسم ولي الأمر</li>
                <li>[التاريخ] - سيتم استبداله بالتاريخ المحدد</li>
                <li>[اليوم] - سيتم استبداله باليوم المحدد</li>
                <li>[الوقت] - سيتم استبداله بالوقت المحدد</li>
                <li>[المكان] - سيتم استبداله بالمكان المحدد</li>
                <li>[المادة] - سيتم استبداله باسم المادة</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={saveTemplate} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span>حفظ القالب</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار عرض الرسالة */}
      <Dialog open={isViewMessageDialogOpen} onOpenChange={setIsViewMessageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الرسالة</DialogTitle>
            <DialogDescription>تفاصيل الرسالة المرسلة وحالة التوصيل</DialogDescription>
          </DialogHeader>

          {currentMessage && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{currentMessage.title}</h3>
                <Badge
                  variant={
                    currentMessage.status === "نجاح"
                      ? "default"
                      : currentMessage.status === "فشل"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {currentMessage.status}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <History className="h-4 w-4" />
                  <span>تاريخ الإرسال: {new Date(currentMessage.sentAt).toLocaleString("ar-SA")}</span>
                </div>
                <Separator orientation="vertical" className="hidden sm:block h-4" />
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>عدد المستلمين: {currentMessage.recipients.length}</span>
                </div>
                <Separator orientation="vertical" className="hidden sm:block h-4" />
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>نسبة التوصيل: {currentMessage.deliveryRate}%</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>محتوى الرسالة</Label>
                <div className="p-4 border rounded-md bg-muted/50 whitespace-pre-line">{currentMessage.content}</div>
              </div>

              <div className="space-y-2">
                <Label>المستلمون</Label>
                <ScrollArea className="h-[150px] border rounded-md p-2">
                  <div className="space-y-2">
                    {currentMessage.recipients.map((phone, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span dir="ltr">{phone}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => sendWhatsAppMessage(phone)}
                        >
                          <WhatsappIcon className="h-4 w-4 text-green-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewMessageDialogOpen(false)}>
              إغلاق
            </Button>
            <Button
              onClick={() => {
                if (currentMessage) {
                  setMessageTitle(currentMessage.title)
                  setMessageContent(currentMessage.content)
                  setIsViewMessageDialogOpen(false)
                  setIsComposeDialogOpen(true)
                }
              }}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              <span>إعادة استخدام</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
