import type { DashboardContent, DashboardPrincipalMessage } from "@/lib/dashboard-data"
import type { ManagedStudent } from "@/lib/student-roster"
import type {
  AttendanceRecord,
  DaySchedule,
  GradeStudent,
  PeriodSlot,
  SchoolClass,
  SchoolNote,
  SchoolStudentSummary,
  StudentProfileRecord,
} from "@/lib/school-data"
import type { TeacherDirectoryEntry } from "@/lib/teachers-directory"

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  })

  const data = (await response.json().catch(() => ({}))) as T & { error?: string }
  if (!response.ok) {
    throw new Error(data.error || "تعذر إكمال الطلب")
  }

  return data
}

export async function fetchStudents() {
  return requestJson<{ students: ManagedStudent[] }>("/api/school/students", {
    method: "GET",
  })
}

export async function saveStudents(students: ManagedStudent[]) {
  return requestJson<{ students: ManagedStudent[] }>("/api/school/students", {
    method: "PUT",
    body: JSON.stringify({ students }),
  })
}

export async function fetchAttendanceData() {
  return requestJson<{ students: SchoolStudentSummary[]; attendanceRecords: AttendanceRecord[] }>("/api/school/attendance", {
    method: "GET",
  })
}

export async function saveAttendanceRecords(attendanceRecords: AttendanceRecord[]) {
  return requestJson<{ attendanceRecords: AttendanceRecord[] }>("/api/school/attendance", {
    method: "PUT",
    body: JSON.stringify({ attendanceRecords }),
  })
}

export async function fetchScheduleData() {
  return requestJson<{ scheduleData: DaySchedule[]; periodSlots: PeriodSlot[] }>("/api/school/schedule", {
    method: "GET",
  })
}

export async function saveScheduleData(scheduleData: DaySchedule[], periodSlots: PeriodSlot[]) {
  return requestJson<{ scheduleData: DaySchedule[]; periodSlots: PeriodSlot[] }>("/api/school/schedule", {
    method: "PUT",
    body: JSON.stringify({ scheduleData, periodSlots }),
  })
}

export async function fetchGradesData() {
  return requestJson<{ students: GradeStudent[] }>("/api/school/grades", {
    method: "GET",
  })
}

export async function saveGradesData(students: GradeStudent[]) {
  return requestJson<{ students: GradeStudent[] }>("/api/school/grades", {
    method: "PUT",
    body: JSON.stringify({ students }),
  })
}

export async function fetchReportData() {
  return requestJson<{
    students: ManagedStudent[]
    attendanceRecords: AttendanceRecord[]
    gradeStudents: GradeStudent[]
  }>("/api/school/report-data", {
    method: "GET",
  })
}

export async function fetchClassesData() {
  return requestJson<{ classes: SchoolClass[] }>("/api/school/classes", {
    method: "GET",
  })
}

export async function saveClassesData(classes: SchoolClass[]) {
  return requestJson<{ classes: SchoolClass[] }>("/api/school/classes", {
    method: "PUT",
    body: JSON.stringify({ classes }),
  })
}

export async function fetchTeachersData() {
  return requestJson<{ teachers: TeacherDirectoryEntry[] }>("/api/school/teachers", {
    method: "GET",
  })
}

export async function saveTeachersData(teachers: TeacherDirectoryEntry[]) {
  return requestJson<{ teachers: TeacherDirectoryEntry[] }>("/api/school/teachers", {
    method: "PUT",
    body: JSON.stringify({ teachers }),
  })
}

export async function fetchNotesData() {
  return requestJson<{ notes: SchoolNote[] }>("/api/school/notes", {
    method: "GET",
  })
}

export async function saveNotesData(notes: SchoolNote[]) {
  return requestJson<{ notes: SchoolNote[] }>("/api/school/notes", {
    method: "PUT",
    body: JSON.stringify({ notes }),
  })
}

export async function fetchStudentProfilesData() {
  return requestJson<{ students: ManagedStudent[]; profiles: StudentProfileRecord[] }>("/api/school/student-profiles", {
    method: "GET",
  })
}

export async function saveStudentProfilesData(profiles: StudentProfileRecord[]) {
  return requestJson<{ profiles: StudentProfileRecord[] }>("/api/school/student-profiles", {
    method: "PUT",
    body: JSON.stringify({ profiles }),
  })
}

export async function fetchDashboardData() {
  return requestJson<{ dashboard: DashboardContent }>("/api/school/dashboard", {
    method: "GET",
  })
}

export async function saveDashboardData(dashboard: DashboardContent) {
  return requestJson<{ dashboard: DashboardContent }>("/api/school/dashboard", {
    method: "PUT",
    body: JSON.stringify({ dashboard }),
  })
}

export async function saveDashboardPrincipalMessage(principalMessage: DashboardPrincipalMessage) {
  return requestJson<{ dashboard: DashboardContent }>("/api/school/dashboard/principal-message", {
    method: "PATCH",
    body: JSON.stringify({ principalMessage }),
  })
}
