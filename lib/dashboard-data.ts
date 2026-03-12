import {
  appointments,
  archivedDocuments,
  behaviorEntries,
  executiveMetrics,
  internalTasks,
  interventionPlans,
  monthlyAnalytics,
  parentMessages,
  smartAlerts,
  teacherPerformance,
  unifiedStudentRecord,
  type AppointmentEntry,
  type BehaviorEntry,
  type DocumentEntry,
  type ExecutiveMetric,
  type InternalTaskEntry,
  type InterventionPlan,
  type ParentMessageEntry,
  type SmartAlert,
  type StudentUnifiedRecord,
  type TeacherPerformanceEntry,
} from "@/lib/school-insights"

export interface MonthlyAnalyticsEntry {
  label: string
  lowPerformance: number
  improvedStudents: number
}

export interface DashboardPrincipalMessage {
  title: string
  body: string
}

export interface DashboardContent {
  principalMessage: DashboardPrincipalMessage
  executiveMetrics: ExecutiveMetric[]
  smartAlerts: SmartAlert[]
  interventionPlans: InterventionPlan[]
  unifiedStudentRecord: StudentUnifiedRecord
  behaviorEntries: BehaviorEntry[]
  archivedDocuments: DocumentEntry[]
  parentMessages: ParentMessageEntry[]
  appointments: AppointmentEntry[]
  internalTasks: InternalTaskEntry[]
  monthlyAnalytics: MonthlyAnalyticsEntry[]
  teacherPerformance: TeacherPerformanceEntry[]
}

export const defaultPrincipalMessage: DashboardPrincipalMessage = {
  title: "كلمة المديرة: الجازي العقيل للطالبات 💖",
  body: `بناتي الغاليات،
السلام عليكن ورحمة الله وبركاته،
أود أن أعبّر عن فخري الكبير بكن اليوم... أنتن الأمل والمستقبل، وبكن نرتقي ونفخر. اجتهدن، وامنحن أنفسكن الفرصة لتألّق لا ينطفئ. تذكّرن دائمًا أن الطموح لا سقف له، وأن لكل مجتهدة نصيب.
أثق أنكن قادرات على تحقيق أحلامكن، فكوني أنتِ البداية الجميلة لما تتمنين 💫
مع أطيب الأمنيات بالتوفيق والنجاح،
مديرتكن المحبة: الجازي العقيل 🌷`,
}

export const defaultDashboardContent: DashboardContent = {
  principalMessage: defaultPrincipalMessage,
  executiveMetrics,
  smartAlerts,
  interventionPlans,
  unifiedStudentRecord,
  behaviorEntries,
  archivedDocuments,
  parentMessages,
  appointments,
  internalTasks,
  monthlyAnalytics,
  teacherPerformance,
}

const normalizeString = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback

const normalizeStringArray = (values: unknown, fallback: string[]) =>
  Array.isArray(values) ? values.map((value) => String(value).trim()).filter(Boolean) : fallback

const normalizeExecutiveMetrics = (values: unknown) =>
  Array.isArray(values)
    ? values.map((entry, index) => {
        const fallback = executiveMetrics[index] || executiveMetrics[0]
        const item = (entry || {}) as Partial<ExecutiveMetric>
        return {
          id: normalizeString(item.id, fallback.id),
          title: normalizeString(item.title, fallback.title),
          value: normalizeString(item.value, fallback.value),
          note: normalizeString(item.note, fallback.note),
        } satisfies ExecutiveMetric
      })
    : executiveMetrics

const normalizeSmartAlerts = (values: unknown) =>
  Array.isArray(values)
    ? values.map((entry, index) => {
        const fallback = smartAlerts[index] || smartAlerts[0]
        const item = (entry || {}) as Partial<SmartAlert>
        return {
          id: normalizeString(item.id, fallback.id),
          title: normalizeString(item.title, fallback.title),
          description: normalizeString(item.description, fallback.description),
          severity:
            item.severity === "حرج" || item.severity === "متوسط" || item.severity === "منخفض"
              ? item.severity
              : fallback.severity,
          audience: Array.isArray(item.audience)
            ? item.audience.filter((audience): audience is SmartAlert["audience"][number] =>
                audience === "admin" || audience === "teacher" || audience === "student",
              )
            : fallback.audience,
        } satisfies SmartAlert
      })
    : smartAlerts

const normalizeInterventionPlans = (values: unknown) =>
  Array.isArray(values)
    ? values.map((entry, index) => {
        const fallback = interventionPlans[index] || interventionPlans[0]
        const item = (entry || {}) as Partial<InterventionPlan>
        return {
          id: normalizeString(item.id, fallback.id),
          studentName: normalizeString(item.studentName, fallback.studentName),
          subject: normalizeString(item.subject, fallback.subject),
          owner: normalizeString(item.owner, fallback.owner),
          dueDate: normalizeString(item.dueDate, fallback.dueDate),
          status:
            item.status === "قيد التنفيذ" || item.status === "مكتمل" || item.status === "يحتاج متابعة"
              ? item.status
              : fallback.status,
          actions: normalizeStringArray(item.actions, fallback.actions),
        } satisfies InterventionPlan
      })
    : interventionPlans

const normalizeUnifiedStudentRecord = (value: unknown) => {
  const item = (value || {}) as Partial<StudentUnifiedRecord>
  return {
    name: normalizeString(item.name, unifiedStudentRecord.name),
    className: normalizeString(item.className, unifiedStudentRecord.className),
    guardian: normalizeString(item.guardian, unifiedStudentRecord.guardian),
    attendanceRate: Number(item.attendanceRate) || unifiedStudentRecord.attendanceRate,
    averageGrade: Number(item.averageGrade) || unifiedStudentRecord.averageGrade,
    behaviorScore: Number(item.behaviorScore) || unifiedStudentRecord.behaviorScore,
    riskLevel:
      item.riskLevel === "منخفض" || item.riskLevel === "متوسط" || item.riskLevel === "مرتفع"
        ? item.riskLevel
        : unifiedStudentRecord.riskLevel,
    strengths: normalizeStringArray(item.strengths, unifiedStudentRecord.strengths),
    supportNeeds: normalizeStringArray(item.supportNeeds, unifiedStudentRecord.supportNeeds),
  } satisfies StudentUnifiedRecord
}

const normalizeBehaviorEntries = (values: unknown) =>
  Array.isArray(values)
    ? values.map((entry, index) => {
        const fallback = behaviorEntries[index] || behaviorEntries[0]
        const item = (entry || {}) as Partial<BehaviorEntry>
        return {
          id: normalizeString(item.id, fallback.id),
          studentName: normalizeString(item.studentName, fallback.studentName),
          type:
            item.type === "إيجابي" || item.type === "ملاحظة" || item.type === "استدعاء" ? item.type : fallback.type,
          note: normalizeString(item.note, fallback.note),
          date: normalizeString(item.date, fallback.date),
        } satisfies BehaviorEntry
      })
    : behaviorEntries

const normalizeArchivedDocuments = (values: unknown) =>
  Array.isArray(values)
    ? values.map((entry, index) => {
        const fallback = archivedDocuments[index] || archivedDocuments[0]
        const item = (entry || {}) as Partial<DocumentEntry>
        return {
          id: normalizeString(item.id, fallback.id),
          title: normalizeString(item.title, fallback.title),
          studentName: normalizeString(item.studentName, fallback.studentName),
          category: normalizeString(item.category, fallback.category),
          updatedAt: normalizeString(item.updatedAt, fallback.updatedAt),
        } satisfies DocumentEntry
      })
    : archivedDocuments

const normalizeParentMessages = (values: unknown) =>
  Array.isArray(values)
    ? values.map((entry, index) => {
        const fallback = parentMessages[index] || parentMessages[0]
        const item = (entry || {}) as Partial<ParentMessageEntry>
        return {
          id: normalizeString(item.id, fallback.id),
          parentName: normalizeString(item.parentName, fallback.parentName),
          studentName: normalizeString(item.studentName, fallback.studentName),
          subject: normalizeString(item.subject, fallback.subject),
          status:
            item.status === "جديد" || item.status === "تم الرد" || item.status === "بانتظار المتابعة"
              ? item.status
              : fallback.status,
          lastUpdate: normalizeString(item.lastUpdate, fallback.lastUpdate),
        } satisfies ParentMessageEntry
      })
    : parentMessages

const normalizeAppointments = (values: unknown) =>
  Array.isArray(values)
    ? values.map((entry, index) => {
        const fallback = appointments[index] || appointments[0]
        const item = (entry || {}) as Partial<AppointmentEntry>
        return {
          id: normalizeString(item.id, fallback.id),
          title: normalizeString(item.title, fallback.title),
          owner: normalizeString(item.owner, fallback.owner),
          date: normalizeString(item.date, fallback.date),
          status:
            item.status === "مؤكد" || item.status === "بانتظار التأكيد" || item.status === "مكتمل"
              ? item.status
              : fallback.status,
        } satisfies AppointmentEntry
      })
    : appointments

const normalizeInternalTasks = (values: unknown) =>
  Array.isArray(values)
    ? values.map((entry, index) => {
        const fallback = internalTasks[index] || internalTasks[0]
        const item = (entry || {}) as Partial<InternalTaskEntry>
        return {
          id: normalizeString(item.id, fallback.id),
          title: normalizeString(item.title, fallback.title),
          owner: normalizeString(item.owner, fallback.owner),
          dueDate: normalizeString(item.dueDate, fallback.dueDate),
          priority:
            item.priority === "عالية" || item.priority === "متوسطة" || item.priority === "منخفضة"
              ? item.priority
              : fallback.priority,
          status:
            item.status === "جديد" || item.status === "قيد التنفيذ" || item.status === "مغلق"
              ? item.status
              : fallback.status,
        } satisfies InternalTaskEntry
      })
    : internalTasks

const normalizeMonthlyAnalytics = (values: unknown) =>
  Array.isArray(values)
    ? values.map((entry, index) => {
        const fallback = monthlyAnalytics[index] || monthlyAnalytics[0]
        const item = (entry || {}) as Partial<MonthlyAnalyticsEntry>
        return {
          label: normalizeString(item.label, fallback.label),
          lowPerformance: Number(item.lowPerformance) || fallback.lowPerformance,
          improvedStudents: Number(item.improvedStudents) || fallback.improvedStudents,
        } satisfies MonthlyAnalyticsEntry
      })
    : monthlyAnalytics

const normalizeTeacherPerformance = (values: unknown) =>
  Array.isArray(values)
    ? values.map((entry, index) => {
        const fallback = teacherPerformance[index] || teacherPerformance[0]
        const item = (entry || {}) as Partial<TeacherPerformanceEntry>
        return {
          id: normalizeString(item.id, fallback.id),
          name: normalizeString(item.name, fallback.name),
          attendance: Number(item.attendance) || fallback.attendance,
          gradeCompletion: Number(item.gradeCompletion) || fallback.gradeCompletion,
          responseTime: normalizeString(item.responseTime, fallback.responseTime),
          weeklyLoad: normalizeString(item.weeklyLoad, fallback.weeklyLoad),
        } satisfies TeacherPerformanceEntry
      })
    : teacherPerformance

export const normalizeDashboardContent = (input?: Partial<DashboardContent>): DashboardContent => ({
  principalMessage: {
    title: normalizeString(input?.principalMessage?.title, defaultPrincipalMessage.title),
    body: normalizeString(input?.principalMessage?.body, defaultPrincipalMessage.body),
  },
  executiveMetrics: normalizeExecutiveMetrics(input?.executiveMetrics),
  smartAlerts: normalizeSmartAlerts(input?.smartAlerts),
  interventionPlans: normalizeInterventionPlans(input?.interventionPlans),
  unifiedStudentRecord: normalizeUnifiedStudentRecord(input?.unifiedStudentRecord),
  behaviorEntries: normalizeBehaviorEntries(input?.behaviorEntries),
  archivedDocuments: normalizeArchivedDocuments(input?.archivedDocuments),
  parentMessages: normalizeParentMessages(input?.parentMessages),
  appointments: normalizeAppointments(input?.appointments),
  internalTasks: normalizeInternalTasks(input?.internalTasks),
  monthlyAnalytics: normalizeMonthlyAnalytics(input?.monthlyAnalytics),
  teacherPerformance: normalizeTeacherPerformance(input?.teacherPerformance),
})
