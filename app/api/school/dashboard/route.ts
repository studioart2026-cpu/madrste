import { NextResponse } from "next/server"
import { getCurrentSessionUser } from "@/lib/server/auth-route"
import { getSchoolSnapshot, saveDashboardContent } from "@/lib/server/school-store"
import type { SessionUser } from "@/lib/auth-types"
import type { DashboardContent } from "@/lib/dashboard-data"

export const runtime = "nodejs"

type SchoolSnapshot = Awaited<ReturnType<typeof getSchoolSnapshot>>

function normalizeLookupText(value: string | undefined) {
  return String(value || "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

function normalizePhone(value: string | undefined) {
  return String(value || "").replace(/\D/g, "")
}

function roundPercentage(value: number) {
  return Math.round(value * 10) / 10
}

function getSeverityRank(severity: DashboardContent["smartAlerts"][number]["severity"]) {
  if (severity === "حرج") return 3
  if (severity === "متوسط") return 2
  return 1
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function hasMeaningfulProfileMetrics(profile: SchoolSnapshot["studentProfiles"][number]) {
  return profile.attendanceRate > 0 || profile.averageGrade > 0 || profile.behaviorScore > 0
}

function pluralizeStudents(count: number) {
  if (count === 1) return "طالبة واحدة"
  if (count === 2) return "طالبتان"
  return `${count} طالبات`
}

function resolveStudentReferences(snapshot: SchoolSnapshot, user: SessionUser) {
  const normalizedUserName = normalizeLookupText(user.name)
  const normalizedUserPhone = normalizePhone(user.phoneNumber)

  const matchedStudents = snapshot.students.filter((student) => {
    const matchesName = normalizeLookupText(student.name) === normalizedUserName
    const matchesPhone = normalizedUserPhone.length > 0 && normalizePhone(student.parentPhone) === normalizedUserPhone
    return matchesName || matchesPhone
  })

  return {
    ids: new Set(matchedStudents.map((student) => student.id)),
    names: new Set(
      matchedStudents.length > 0
        ? matchedStudents.map((student) => normalizeLookupText(student.name))
        : normalizedUserName
          ? [normalizedUserName]
          : [],
    ),
  }
}

function matchesResolvedStudent(
  input: { id?: string; name?: string },
  references: ReturnType<typeof resolveStudentReferences>,
) {
  if (input.id && references.ids.has(input.id)) {
    return true
  }

  const normalizedName = normalizeLookupText(input.name)
  return normalizedName.length > 0 && references.names.has(normalizedName)
}

function buildLatestGradeEntries(snapshot: SchoolSnapshot) {
  const latestByStudentAndSubject = new Map<
    string,
    { studentId: string; studentName: string; subject: string; grade: number; date: string }
  >()

  snapshot.gradeStudents.forEach((student) => {
    student.grades.forEach((grade) => {
      const subject = String(grade.subject || "").trim()
      if (!subject) {
        return
      }

      const key = `${student.id}:${normalizeLookupText(subject)}`
      const current = latestByStudentAndSubject.get(key)
      if (!current || String(grade.date || "") > current.date) {
        latestByStudentAndSubject.set(key, {
          studentId: student.id,
          studentName: student.name,
          subject,
          grade: Number(grade.grade) || 0,
          date: String(grade.date || ""),
        })
      }
    })
  })

  return Array.from(latestByStudentAndSubject.values())
}

function buildAttendanceSummaries(snapshot: SchoolSnapshot) {
  const relevantRecords = snapshot.attendanceRecords
    .filter((record) => Array.isArray(record.students) && record.students.length > 0)
    .sort((left, right) => String(right.date || "").localeCompare(String(left.date || "")))
    .slice(0, 10)

  const summaries = new Map<
    string,
    { studentId: string; studentName: string; absent: number; late: number; trackedDates: Set<string> }
  >()

  relevantRecords.forEach((record) => {
    record.students.forEach((student) => {
      const key = student.id ? String(student.id) : normalizeLookupText(student.name)
      const existing = summaries.get(key) || {
        studentId: String(student.id || ""),
        studentName: student.name,
        absent: 0,
        late: 0,
        trackedDates: new Set<string>(),
      }

      if (student.status === "absent") {
        existing.absent += 1
      }

      if (student.status === "late") {
        existing.late += 1
      }

      existing.trackedDates.add(record.date)
      summaries.set(key, existing)
    })
  })

  return Array.from(summaries.values()).map((summary) => ({
    ...summary,
    trackedDays: summary.trackedDates.size,
  }))
}

function buildRuntimeExecutiveMetrics(snapshot: SchoolSnapshot, fallback: DashboardContent["executiveMetrics"]) {
  const recentRecords = snapshot.attendanceRecords.filter((record) => Array.isArray(record.students) && record.students.length > 0)
  const recentStatuses = recentRecords.flatMap((record) => record.students.map((student) => student.status))
  const attendedStatuses = recentStatuses.filter((status) => status !== "absent")
  const lateCount = recentStatuses.filter((status) => status === "late").length
  const meaningfulProfiles = snapshot.studentProfiles.filter((profile) => hasMeaningfulProfileMetrics(profile))
  const averageAttendanceRate = roundPercentage(
    recentStatuses.length > 0
      ? (attendedStatuses.length / recentStatuses.length) * 100
      : average(meaningfulProfiles.map((profile) => profile.attendanceRate)),
  )

  const atRiskStudents = snapshot.studentProfiles.filter(
    (profile) =>
      hasMeaningfulProfileMetrics(profile) &&
      (profile.riskLevel === "مرتفع" || profile.averageGrade < 80 || profile.attendanceRate < 92),
  )
  const criticalStudents = atRiskStudents.filter(
    (profile) => profile.riskLevel === "مرتفع" || profile.averageGrade < 70 || profile.attendanceRate < 85,
  )
  const interventionPlans = snapshot.dashboardContent.interventionPlans
  const activePlans = interventionPlans.filter((plan) => plan.status !== "مكتمل")
  const completedPlans = interventionPlans.filter((plan) => plan.status === "مكتمل")

  return fallback.map((metric) => {
    if (metric.id === "attendance") {
      return {
        ...metric,
        value: `${averageAttendanceRate.toFixed(1)}%`,
        note:
          recentStatuses.length > 0
            ? `استنادًا إلى ${recentRecords.length} سجلات حضور فعلية`
            : "استنادًا إلى ملفات الطالبات الحالية",
      }
    }

    if (metric.id === "lateness") {
      return {
        ...metric,
        value: `${lateCount} حالة`,
        note:
          lateCount > 0
            ? `${lateCount} حالة تأخر ضمن أحدث السجلات`
            : "لا توجد حالات تأخر مسجلة حاليًا",
      }
    }

    if (metric.id === "risk") {
      return {
        ...metric,
        value: `${atRiskStudents.length} طالبة`,
        note: criticalStudents.length > 0 ? `${criticalStudents.length} في مستوى حرج` : "لا توجد حالات حرجة حاليًا",
      }
    }

    if (metric.id === "plans") {
      return {
        ...metric,
        value: `${interventionPlans.length} خطة`,
        note: `${activePlans.length} قيد التنفيذ و${completedPlans.length} مكتملة`,
      }
    }

    return metric
  })
}

function buildRuntimeUnifiedStudentRecord(
  snapshot: SchoolSnapshot,
  user: SessionUser,
  fallback: DashboardContent["unifiedStudentRecord"],
) {
  if (user.userType !== "student") {
    return fallback
  }

  const references = resolveStudentReferences(snapshot, user)
  const matchedProfile = snapshot.studentProfiles.find((profile) =>
    matchesResolvedStudent({ id: profile.id, name: profile.name }, references),
  )

  if (!matchedProfile) {
    return {
      ...fallback,
      name: user.name || fallback.name,
    }
  }

  return {
    name: matchedProfile.name,
    className: matchedProfile.className,
    guardian: matchedProfile.guardian,
    attendanceRate: matchedProfile.attendanceRate,
    averageGrade: matchedProfile.averageGrade,
    behaviorScore: matchedProfile.behaviorScore,
    riskLevel: matchedProfile.riskLevel,
    strengths: matchedProfile.strengths,
    supportNeeds: matchedProfile.supportNeeds,
  }
}

function buildRuntimeSmartAlerts(snapshot: SchoolSnapshot, user: SessionUser): DashboardContent["smartAlerts"] {
  const alerts: DashboardContent["smartAlerts"] = []
  const latestGrades = buildLatestGradeEntries(snapshot)
  const attendanceSummaries = buildAttendanceSummaries(snapshot)

  if (user.userType === "student") {
    const references = resolveStudentReferences(snapshot, user)
    const matchedProfile = snapshot.studentProfiles.find((profile) =>
      matchesResolvedStudent({ id: profile.id, name: profile.name }, references),
    )
    const matchedAttendance = attendanceSummaries.find((summary) =>
      matchesResolvedStudent({ id: summary.studentId, name: summary.studentName }, references),
    )
    const matchedGrades = latestGrades.filter((entry) =>
      matchesResolvedStudent({ id: entry.studentId, name: entry.studentName }, references),
    )

    if (matchedProfile && hasMeaningfulProfileMetrics(matchedProfile) && matchedProfile.averageGrade < 80) {
      alerts.push({
        id: `student-grade-${matchedProfile.id}`,
        title: "معدل درجاتك يحتاج متابعة",
        description: `متوسطك الحالي ${matchedProfile.averageGrade}% في فصل ${matchedProfile.className}.`,
        severity: matchedProfile.averageGrade < 70 ? "حرج" : "متوسط",
        audience: ["student"],
      })
    }

    if (matchedAttendance && matchedAttendance.absent > 0) {
      alerts.push({
        id: `student-absence-${matchedAttendance.studentId}`,
        title: "لديك غياب مسجل",
        description: `تم تسجيل ${matchedAttendance.absent} حالة غياب خلال ${matchedAttendance.trackedDays} أيام دراسية مسجلة.`,
        severity: matchedAttendance.absent >= 2 ? "متوسط" : "منخفض",
        audience: ["student"],
      })
    } else if (matchedAttendance && matchedAttendance.late > 0) {
      alerts.push({
        id: `student-late-${matchedAttendance.studentId}`,
        title: "لديك حالات تأخر",
        description: `تم تسجيل ${matchedAttendance.late} حالة تأخر خلال ${matchedAttendance.trackedDays} أيام دراسية مسجلة.`,
        severity: matchedAttendance.late >= 2 ? "متوسط" : "منخفض",
        audience: ["student"],
      })
    }

    const weakestGrade = matchedGrades.reduce<{ subject: string; grade: number } | null>((lowest, entry) => {
      if (!lowest || entry.grade < lowest.grade) {
        return { subject: entry.subject, grade: entry.grade }
      }
      return lowest
    }, null)

    if (weakestGrade && weakestGrade.grade < 75) {
      alerts.push({
        id: `student-subject-${normalizeLookupText(weakestGrade.subject)}`,
        title: `تحتاج ${weakestGrade.subject} إلى مراجعة`,
        description: `آخر درجة مسجلة في ${weakestGrade.subject} هي ${weakestGrade.grade}%.`,
        severity: weakestGrade.grade < 70 ? "حرج" : "متوسط",
        audience: ["student"],
      })
    }

    return alerts
      .sort((left, right) => getSeverityRank(right.severity) - getSeverityRank(left.severity))
      .slice(0, 3)
  }

  const lowAverageProfiles = snapshot.studentProfiles
    .filter((profile) => hasMeaningfulProfileMetrics(profile))
    .filter((profile) => profile.averageGrade < 80)
    .sort((left, right) => left.averageGrade - right.averageGrade)

  if (lowAverageProfiles.length > 0) {
    const focusStudent = lowAverageProfiles[0]
    alerts.push({
      id: `admin-low-average-${focusStudent.id}`,
      title: `انخفاض تحصيل للطالبة ${focusStudent.name}`,
      description: `${pluralizeStudents(lowAverageProfiles.length)} دون 80%، وأدنى متوسط حالي ${focusStudent.averageGrade}% في فصل ${focusStudent.className}.`,
      severity: focusStudent.averageGrade < 70 ? "حرج" : "متوسط",
      audience: ["admin", "teacher"],
    })
  }

  const lowSubjectGroups = latestGrades
    .filter((entry) => entry.grade < 75)
    .reduce<Record<string, { subject: string; count: number; lowestGrade: number }>>((groups, entry) => {
      const key = normalizeLookupText(entry.subject)
      const current = groups[key] || { subject: entry.subject, count: 0, lowestGrade: entry.grade }
      current.count += 1
      current.lowestGrade = Math.min(current.lowestGrade, entry.grade)
      groups[key] = current
      return groups
    }, {})

  const topLowSubject = Object.values(lowSubjectGroups).sort((left, right) => right.count - left.count || left.lowestGrade - right.lowestGrade)[0]
  if (topLowSubject) {
    alerts.push({
      id: `admin-subject-${normalizeLookupText(topLowSubject.subject)}`,
      title: `انخفاض درجات في ${topLowSubject.subject}`,
      description: `تم رصد درجات أقل من 75% لدى ${pluralizeStudents(topLowSubject.count)} في آخر سجل درجات لمادة ${topLowSubject.subject}.`,
      severity: topLowSubject.lowestGrade < 65 || topLowSubject.count >= 3 ? "حرج" : "متوسط",
      audience: ["admin", "teacher"],
    })
  }

  const repeatedAbsence = attendanceSummaries
    .filter((summary) => summary.absent >= 2)
    .sort((left, right) => right.absent - left.absent || right.late - left.late)[0]

  if (repeatedAbsence) {
    alerts.push({
      id: `admin-absence-${repeatedAbsence.studentId || normalizeLookupText(repeatedAbsence.studentName)}`,
      title: `غياب متكرر للطالبة ${repeatedAbsence.studentName}`,
      description: `تم تسجيل ${repeatedAbsence.absent} حالات غياب خلال ${repeatedAbsence.trackedDays} أيام حضور مسجلة.`,
      severity: repeatedAbsence.absent >= 3 ? "حرج" : "متوسط",
      audience: ["admin", "teacher"],
    })
  }

  const repeatedLate = attendanceSummaries
    .filter((summary) => summary.late >= 2)
    .sort((left, right) => right.late - left.late || right.absent - left.absent)[0]

  if (repeatedLate) {
    alerts.push({
      id: `admin-late-${repeatedLate.studentId || normalizeLookupText(repeatedLate.studentName)}`,
      title: `تأخر متكرر للطالبة ${repeatedLate.studentName}`,
      description: `تم تسجيل ${repeatedLate.late} حالات تأخر خلال ${repeatedLate.trackedDays} أيام حضور مسجلة.`,
      severity: repeatedLate.late >= 3 ? "متوسط" : "منخفض",
      audience: ["admin", "teacher"],
    })
  }

  const urgentProfiles = snapshot.studentProfiles.filter(
    (profile) =>
      hasMeaningfulProfileMetrics(profile) &&
      (profile.riskLevel === "مرتفع" || profile.averageGrade < 70 || profile.attendanceRate < 85),
  )

  if (urgentProfiles.length > 0) {
    alerts.push({
      id: "admin-high-risk-students",
      title: "طالبات بحاجة إلى متابعة عاجلة",
      description: `${pluralizeStudents(urgentProfiles.length)} بمستوى خطورة مرتفع أو بحضور/درجات منخفضة.`,
      severity: "حرج",
      audience: ["admin", "teacher"],
    })
  }

  const uniqueAlerts = new Map<string, DashboardContent["smartAlerts"][number]>()
  alerts.forEach((alert) => {
    if (!uniqueAlerts.has(alert.id)) {
      uniqueAlerts.set(alert.id, alert)
    }
  })

  return Array.from(uniqueAlerts.values())
    .sort((left, right) => getSeverityRank(right.severity) - getSeverityRank(left.severity))
    .slice(0, 4)
}

function buildRuntimeDashboardContent(snapshot: SchoolSnapshot, user: SessionUser): DashboardContent {
  return {
    ...snapshot.dashboardContent,
    executiveMetrics: buildRuntimeExecutiveMetrics(snapshot, snapshot.dashboardContent.executiveMetrics),
    smartAlerts: buildRuntimeSmartAlerts(snapshot, user),
    unifiedStudentRecord: buildRuntimeUnifiedStudentRecord(
      snapshot,
      user,
      snapshot.dashboardContent.unifiedStudentRecord,
    ),
  }
}

function buildErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "تعذر معالجة الطلب"
  if (message === "401") {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولًا" }, { status: 401 })
  }
  if (message === "403") {
    return NextResponse.json({ error: "ليست لديك صلاحية تنفيذ هذا الإجراء" }, { status: 403 })
  }
  return NextResponse.json({ error: message }, { status: 500 })
}

async function requireDashboardReadAccess() {
  const { user } = await getCurrentSessionUser()
  if (!user) {
    throw new Error("401")
  }
  return user
}

async function requireDashboardAdminAccess() {
  const user = await requireDashboardReadAccess()
  if (user.userType !== "admin") {
    throw new Error("403")
  }
  return user
}

export async function GET() {
  try {
    const user = await requireDashboardReadAccess()
    const snapshot = await getSchoolSnapshot()
    return NextResponse.json({ dashboard: buildRuntimeDashboardContent(snapshot, user) })
  } catch (error) {
    return buildErrorResponse(error)
  }
}

export async function PUT(request: Request) {
  try {
    await requireDashboardAdminAccess()
    const body = (await request.json()) as { dashboard?: DashboardContent }
    const snapshot = await getSchoolSnapshot()
    const submittedDashboard = body.dashboard || snapshot.dashboardContent
    const dashboard = await saveDashboardContent({
      ...submittedDashboard,
      executiveMetrics: snapshot.dashboardContent.executiveMetrics,
      smartAlerts: snapshot.dashboardContent.smartAlerts,
      unifiedStudentRecord: snapshot.dashboardContent.unifiedStudentRecord,
    })
    return NextResponse.json({ dashboard })
  } catch (error) {
    return buildErrorResponse(error)
  }
}
