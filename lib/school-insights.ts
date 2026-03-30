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
  { id: "attendance", title: "الحضور اليومي", value: "0%", note: "تظهر البيانات عند توفر سجلات فعلية" },
  { id: "lateness", title: "التأخر الصباحي", value: "0 حالة", note: "تظهر البيانات عند توفر سجلات فعلية" },
  { id: "risk", title: "حالات التعثر", value: "0 طالبة", note: "تظهر البيانات عند توفر سجلات فعلية" },
  { id: "plans", title: "الخطط العلاجية", value: "0 خطة", note: "تظهر البيانات عند توفر سجلات فعلية" },
]

export const monthlyAnalytics: Array<{ label: string; lowPerformance: number; improvedStudents: number }> = []

export const unifiedStudentRecord: StudentUnifiedRecord = {
  name: "",
  className: "",
  guardian: "",
  attendanceRate: 0,
  averageGrade: 0,
  behaviorScore: 0,
  riskLevel: "منخفض",
  strengths: [],
  supportNeeds: [],
}

export const smartAlerts: SmartAlert[] = []

export const interventionPlans: InterventionPlan[] = []

export const behaviorEntries: BehaviorEntry[] = []

export const archivedDocuments: DocumentEntry[] = []

export const teacherPerformance: TeacherPerformanceEntry[] = []

export const parentMessages: ParentMessageEntry[] = []

export const appointments: AppointmentEntry[] = []

export const internalTasks: InternalTaskEntry[] = []
