export interface ExecutiveMetric {
  id: string
  title: string
  value: string
  note: string
}

export interface StudentUnifiedRecord {
  name: string
  className: string
  guardian: string
  attendanceRate: number
  averageGrade: number
  behaviorScore: number
  riskLevel: "منخفض" | "متوسط" | "مرتفع"
  strengths: string[]
  supportNeeds: string[]
}

export interface SmartAlert {
  id: string
  title: string
  description: string
  severity: "حرج" | "متوسط" | "منخفض"
  audience: Array<"admin" | "teacher" | "student">
}

export interface InterventionPlan {
  id: string
  studentName: string
  subject: string
  owner: string
  dueDate: string
  status: "قيد التنفيذ" | "مكتمل" | "يحتاج متابعة"
  actions: string[]
}

export interface BehaviorEntry {
  id: string
  studentName: string
  type: "إيجابي" | "ملاحظة" | "استدعاء"
  note: string
  date: string
}

export interface DocumentEntry {
  id: string
  title: string
  studentName: string
  category: string
  updatedAt: string
}

export interface TeacherPerformanceEntry {
  id: string
  name: string
  attendance: number
  gradeCompletion: number
  responseTime: string
  weeklyLoad: string
}

export interface ParentMessageEntry {
  id: string
  parentName: string
  studentName: string
  subject: string
  status: "جديد" | "تم الرد" | "بانتظار المتابعة"
  lastUpdate: string
}

export interface AppointmentEntry {
  id: string
  title: string
  owner: string
  date: string
  status: "مؤكد" | "بانتظار التأكيد" | "مكتمل"
}

export interface InternalTaskEntry {
  id: string
  title: string
  owner: string
  dueDate: string
  priority: "عالية" | "متوسطة" | "منخفضة"
  status: "جديد" | "قيد التنفيذ" | "مغلق"
}

export const executiveMetrics: ExecutiveMetric[] = [
  { id: "attendance", title: "الحضور اليومي", value: "96.8%", note: "تحسن 1.4% عن الأسبوع الماضي" },
  { id: "lateness", title: "التأخر الصباحي", value: "12 حالة", note: "4 حالات تحتاج متابعة فورية" },
  { id: "risk", title: "حالات التعثر", value: "7 طالبات", note: "3 في مستوى حرج" },
  { id: "plans", title: "الخطط العلاجية", value: "11 خطة", note: "8 قيد التنفيذ و3 مكتملة" },
]

export const monthlyAnalytics = [
  { label: "الرياضيات", lowPerformance: 18, improvedStudents: 6 },
  { label: "العلوم", lowPerformance: 11, improvedStudents: 10 },
  { label: "اللغة العربية", lowPerformance: 9, improvedStudents: 12 },
  { label: "اللغة الإنجليزية", lowPerformance: 14, improvedStudents: 8 },
]

export const unifiedStudentRecord: StudentUnifiedRecord = {
  name: "سارة أحمد",
  className: "١/١",
  guardian: "ولية الأمر: أم سارة",
  attendanceRate: 94,
  averageGrade: 88,
  behaviorScore: 96,
  riskLevel: "متوسط",
  strengths: ["التزام عالي في الواجبات", "تحسن مستمر في اللغة العربية", "مشاركة صفية نشطة"],
  supportNeeds: ["تقوية في الرياضيات", "متابعة التأخر الصباحي", "خطة مراجعة قبل الاختبارات"],
}

export const smartAlerts: SmartAlert[] = [
  {
    id: "a1",
    title: "انخفاض درجات في الرياضيات",
    description: "3 طالبات انخفض متوسطهن هذا الأسبوع لأقل من 60%.",
    severity: "حرج",
    audience: ["admin", "teacher"],
  },
  {
    id: "a2",
    title: "غياب متكرر للطالبة سارة أحمد",
    description: "تم تسجيل غيابين خلال 5 أيام دراسية.",
    severity: "متوسط",
    audience: ["admin", "teacher", "student"],
  },
  {
    id: "a3",
    title: "موعد اختبار علوم غدًا",
    description: "تنبيه تلقائي للطالبات والمعلمات قبل الاختبار النهائي.",
    severity: "منخفض",
    audience: ["teacher", "student"],
  },
]

export const interventionPlans: InterventionPlan[] = [
  {
    id: "p1",
    studentName: "سارة أحمد",
    subject: "الرياضيات",
    owner: "أ. نورة الأحمد",
    dueDate: "2026-03-18",
    status: "قيد التنفيذ",
    actions: ["جلسة علاجية يوم الأحد", "واجبات قصيرة يومية", "متابعة ولية الأمر"],
  },
  {
    id: "p2",
    studentName: "ريم سعد",
    subject: "اللغة الإنجليزية",
    owner: "أ. هند السعد",
    dueDate: "2026-03-20",
    status: "يحتاج متابعة",
    actions: ["اختبار تشخيصي", "تدريب على المفردات", "تقرير أسبوعي للمرشدة"],
  },
]

export const behaviorEntries: BehaviorEntry[] = [
  { id: "b1", studentName: "سارة أحمد", type: "إيجابي", note: "مبادرة ممتازة في النشاط العلمي", date: "2026-03-09" },
  { id: "b2", studentName: "ريم سعد", type: "ملاحظة", note: "تأخر صباحي متكرر هذا الأسبوع", date: "2026-03-08" },
  { id: "b3", studentName: "نورة محمد", type: "استدعاء", note: "تمت جدولة اجتماع مع ولية الأمر", date: "2026-03-07" },
]

export const archivedDocuments: DocumentEntry[] = [
  { id: "d1", title: "عذر غياب طبي", studentName: "سارة أحمد", category: "أعذار", updatedAt: "2026-03-05" },
  { id: "d2", title: "خطة علاجية - رياضيات", studentName: "سارة أحمد", category: "خطط علاجية", updatedAt: "2026-03-09" },
  { id: "d3", title: "نموذج موافقة نشاط", studentName: "نورة محمد", category: "نماذج", updatedAt: "2026-03-04" },
]

export const teacherPerformance: TeacherPerformanceEntry[] = [
  { id: "t1", name: "أ. نورة الأحمد", attendance: 98, gradeCompletion: 100, responseTime: "4 ساعات", weeklyLoad: "18 حصة" },
  { id: "t2", name: "أ. سارة المحمد", attendance: 95, gradeCompletion: 93, responseTime: "6 ساعات", weeklyLoad: "17 حصة" },
  { id: "t3", name: "أ. منى العبدالله", attendance: 97, gradeCompletion: 96, responseTime: "5 ساعات", weeklyLoad: "16 حصة" },
]

export const parentMessages: ParentMessageEntry[] = [
  { id: "m1", parentName: "أم سارة", studentName: "سارة أحمد", subject: "استفسار عن الخطة العلاجية", status: "تم الرد", lastUpdate: "2026-03-10" },
  { id: "m2", parentName: "أم ريم", studentName: "ريم سعد", subject: "طلب موعد مع المعلمة", status: "بانتظار المتابعة", lastUpdate: "2026-03-10" },
  { id: "m3", parentName: "أم نورة", studentName: "نورة محمد", subject: "مرفق عذر غياب", status: "جديد", lastUpdate: "2026-03-11" },
]

export const appointments: AppointmentEntry[] = [
  { id: "ap1", title: "اجتماع ولية أمر - سارة أحمد", owner: "المرشدة الطلابية", date: "2026-03-12 09:30", status: "مؤكد" },
  { id: "ap2", title: "متابعة خطة علاجية", owner: "أ. نورة الأحمد", date: "2026-03-13 10:15", status: "بانتظار التأكيد" },
  { id: "ap3", title: "لقاء تقييم شهري", owner: "الوكيلة", date: "2026-03-17 11:00", status: "مكتمل" },
]

export const internalTasks: InternalTaskEntry[] = [
  { id: "task1", title: "اعتماد خطة الأسبوع العلاجي", owner: "المديرة", dueDate: "2026-03-12", priority: "عالية", status: "قيد التنفيذ" },
  { id: "task2", title: "مراجعة رصد درجات الصف الثاني", owner: "أ. سارة المحمد", dueDate: "2026-03-13", priority: "متوسطة", status: "جديد" },
  { id: "task3", title: "إغلاق طلبات التسجيل الجديدة", owner: "قسم القبول", dueDate: "2026-03-14", priority: "عالية", status: "قيد التنفيذ" },
]
