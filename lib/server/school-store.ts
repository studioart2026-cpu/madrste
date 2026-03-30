import "server-only"

import { promises as fs } from "node:fs"
import path from "node:path"
import type { DashboardContent, DashboardPrincipalMessage } from "@/lib/dashboard-data"
import { defaultDashboardContent, normalizeDashboardContent } from "@/lib/dashboard-data"
import type { ManagedStudent } from "@/lib/student-roster"
import {
  type ClassScheduleMap,
  createDefaultGradeStudents,
  createDefaultStudentProfiles,
  defaultAttendanceRecords,
  defaultSchoolClasses,
  defaultSchoolNotes,
  defaultPeriodSlots,
  defaultScheduleData,
  mergeGradeStudentsWithRoster,
  mergeStudentProfilesWithStudents,
  mergeTeacherDirectory,
  getScheduleClassNames,
  normalizeText,
  normalizeTeacherDirectoryEntries,
  normalizeSchoolClasses,
  normalizeClassSchedulesPayload,
  normalizeSchoolNotes,
  syncAttendanceRecordsWithStudents,
  type AttendanceRecord,
  type DaySchedule,
  type GradeStudent,
  type PeriodSlot,
  type SchoolClass,
  type SchoolNote,
  type StudentProfileRecord,
} from "@/lib/school-data"
import {
  deleteManagedStudentAccountsByDirectoryEntries,
  deleteManagedTeacherAccountsByDirectoryEntries,
} from "@/lib/server/auth-store"
import { getServerDataDirectory } from "@/lib/server/data-directory"
import { mergeWithDefaultStudentRoster, normalizeStudentRoster } from "@/lib/student-roster"
import type { RegistrationRequest } from "@/lib/auth-types"
import type { TeacherDirectoryEntry } from "@/lib/teachers-directory"

interface SchoolDatabase {
  students: ManagedStudent[]
  attendanceRecords: AttendanceRecord[]
  gradeStudents: GradeStudent[]
  scheduleData: DaySchedule[]
  classSchedules: ClassScheduleMap
  periodSlots: PeriodSlot[]
  classes: SchoolClass[]
  teachers: TeacherDirectoryEntry[]
  notes: SchoolNote[]
  studentProfiles: StudentProfileRecord[]
  dashboardContent: DashboardContent
}

const DATA_DIRECTORY = getServerDataDirectory()
const SCHOOL_DATA_FILE = path.join(DATA_DIRECTORY, "school.json")

let mutationQueue = Promise.resolve()

const UNASSIGNED_TEACHER_LABEL = "غير مسند"

function normalizeTeacherReference(value: string | null | undefined) {
  return normalizeText(String(value || "").replace(/^أ\.\s*/u, ""))
}

function normalizeEmailValue(value: string | undefined) {
  return String(value || "").trim().toLowerCase()
}

function normalizePhoneValue(value: string | undefined) {
  return String(value || "").replace(/\D/g, "")
}

function normalizeStudentReference(value: string | null | undefined) {
  return normalizeText(String(value || ""))
}

function buildTeacherReferenceSet(teachers: TeacherDirectoryEntry[]) {
  return new Set(teachers.map((teacher) => normalizeTeacherReference(teacher.name)).filter(Boolean))
}

function isKnownTeacherReference(reference: string, teacherReferences: Set<string>) {
  const normalizedReference = normalizeTeacherReference(reference)
  return !normalizedReference || teacherReferences.has(normalizedReference)
}

function sanitizeClassesByTeachers(classes: SchoolClass[], teachers: TeacherDirectoryEntry[]) {
  const teacherReferences = buildTeacherReferenceSet(teachers)

  return classes.map((schoolClass) => ({
    ...schoolClass,
    teacher: isKnownTeacherReference(schoolClass.teacher, teacherReferences)
      ? schoolClass.teacher
      : UNASSIGNED_TEACHER_LABEL,
  }))
}

function sanitizeScheduleDaysByTeachers(scheduleData: DaySchedule[], teachers: TeacherDirectoryEntry[]) {
  const teacherReferences = buildTeacherReferenceSet(teachers)

  return scheduleData.map((day) => ({
    ...day,
    periods: day.periods.map((period) => {
      if (period.subject === "استراحة") {
        return { ...period, teacher: "" }
      }

      return {
        ...period,
        teacher: isKnownTeacherReference(period.teacher, teacherReferences) ? period.teacher : "",
      }
    }),
  }))
}

function sanitizeSchedulePayloadByTeachers(
  scheduleData: DaySchedule[],
  classSchedules: ClassScheduleMap,
  teachers: TeacherDirectoryEntry[],
) {
  return {
    scheduleData: sanitizeScheduleDaysByTeachers(scheduleData, teachers),
    classSchedules: Object.fromEntries(
      Object.entries(classSchedules).map(([className, schedule]) => [className, sanitizeScheduleDaysByTeachers(schedule, teachers)]),
    ) as ClassScheduleMap,
  }
}

function isSameTeacherDirectoryEntry(left: TeacherDirectoryEntry, right: TeacherDirectoryEntry) {
  const leftEmail = normalizeEmailValue(left.email)
  const rightEmail = normalizeEmailValue(right.email)
  if (leftEmail && rightEmail && leftEmail === rightEmail) {
    return true
  }

  const leftTeacherId = normalizeText(String(left.teacherId || ""))
  const rightTeacherId = normalizeText(String(right.teacherId || ""))
  if (leftTeacherId && rightTeacherId && leftTeacherId === rightTeacherId) {
    return true
  }

  const leftPhone = normalizePhoneValue(left.phone)
  const rightPhone = normalizePhoneValue(right.phone)
  if (leftPhone && rightPhone && leftPhone === rightPhone) {
    return true
  }

  return normalizeTeacherReference(left.name) === normalizeTeacherReference(right.name)
}

function isSameStudentDirectoryEntry(left: ManagedStudent, right: ManagedStudent) {
  const leftStudentId = normalizeStudentReference(left.studentId)
  const rightStudentId = normalizeStudentReference(right.studentId)
  if (leftStudentId && rightStudentId && leftStudentId === rightStudentId) {
    return true
  }

  const leftId = normalizeStudentReference(left.id)
  const rightId = normalizeStudentReference(right.id)
  if (leftId && rightId && leftId === rightId) {
    return true
  }

  const leftPhone = normalizePhoneValue(left.parentPhone)
  const rightPhone = normalizePhoneValue(right.parentPhone)
  if (leftPhone && rightPhone && leftPhone === rightPhone) {
    return true
  }

  const leftClassroom = normalizeStudentReference(left.classroom)
  const rightClassroom = normalizeStudentReference(right.classroom)
  if (leftClassroom && rightClassroom && leftClassroom !== rightClassroom) {
    return false
  }

  return normalizeStudentReference(left.name) === normalizeStudentReference(right.name)
}

function createSeedSchoolDatabase(): SchoolDatabase {
  const students = mergeWithDefaultStudentRoster()
  const schedule = normalizeClassSchedulesPayload({}, defaultPeriodSlots, getScheduleClassNames(defaultSchoolClasses, students), defaultScheduleData)

  return {
    students,
    attendanceRecords: syncAttendanceRecordsWithStudents(defaultAttendanceRecords, students),
    gradeStudents: createDefaultGradeStudents(students),
    scheduleData: schedule.scheduleData,
    classSchedules: schedule.classSchedules,
    periodSlots: schedule.periodSlots,
    classes: normalizeSchoolClasses(defaultSchoolClasses),
    teachers: mergeTeacherDirectory(),
    notes: normalizeSchoolNotes(defaultSchoolNotes),
    studentProfiles: createDefaultStudentProfiles(students),
    dashboardContent: normalizeDashboardContent(defaultDashboardContent),
  }
}

async function ensureDatabaseFile() {
  try {
    await fs.access(SCHOOL_DATA_FILE)
  } catch {
    await fs.mkdir(DATA_DIRECTORY, { recursive: true })
    await writeDatabase(createSeedSchoolDatabase())
  }
}

function normalizeSchoolDatabase(data: Partial<SchoolDatabase>): SchoolDatabase {
  const students = Array.isArray(data.students) ? normalizeStudentRoster(data.students, []) : mergeWithDefaultStudentRoster()
  const gradeStudents = mergeGradeStudentsWithRoster(Array.isArray(data.gradeStudents) ? data.gradeStudents : [], students)
  const attendanceRecords = syncAttendanceRecordsWithStudents(
    Array.isArray(data.attendanceRecords) ? data.attendanceRecords : defaultAttendanceRecords,
    students,
  )
  const classes = normalizeSchoolClasses(Array.isArray(data.classes) ? data.classes : defaultSchoolClasses)
  const teachers = Array.isArray(data.teachers) ? normalizeTeacherDirectoryEntries(data.teachers, []) : mergeTeacherDirectory()
  const notes = normalizeSchoolNotes(Array.isArray(data.notes) ? data.notes : defaultSchoolNotes)
  const schedule = normalizeClassSchedulesPayload(
    data.classSchedules && typeof data.classSchedules === "object" ? (data.classSchedules as ClassScheduleMap) : {},
    Array.isArray(data.periodSlots) ? data.periodSlots : defaultPeriodSlots,
    getScheduleClassNames(classes, students),
    Array.isArray(data.scheduleData) ? data.scheduleData : defaultScheduleData,
  )
  const sanitizedClasses = sanitizeClassesByTeachers(classes, teachers)
  const sanitizedSchedule = sanitizeSchedulePayloadByTeachers(schedule.scheduleData, schedule.classSchedules, teachers)
  const studentProfiles = mergeStudentProfilesWithStudents(
    Array.isArray(data.studentProfiles) ? data.studentProfiles : [],
    students,
    gradeStudents,
    attendanceRecords,
  )
  const dashboardContent = normalizeDashboardContent(data.dashboardContent)

  return {
    students,
    attendanceRecords,
    gradeStudents,
    scheduleData: sanitizedSchedule.scheduleData,
    classSchedules: sanitizedSchedule.classSchedules,
    periodSlots: schedule.periodSlots,
    classes: sanitizedClasses,
    teachers,
    notes,
    studentProfiles,
    dashboardContent,
  }
}

async function readDatabase(): Promise<SchoolDatabase> {
  await ensureDatabaseFile()
  const raw = await fs.readFile(SCHOOL_DATA_FILE, "utf8")
  const parsed = JSON.parse(raw) as Partial<SchoolDatabase>
  return normalizeSchoolDatabase(parsed)
}

async function writeDatabase(data: SchoolDatabase) {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true })
  const tempFile = `${SCHOOL_DATA_FILE}.tmp`
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), "utf8")
  await fs.rename(tempFile, SCHOOL_DATA_FILE)
}

async function mutateDatabase<T>(mutator: (data: SchoolDatabase) => Promise<T> | T): Promise<T> {
  const run = mutationQueue.catch(() => undefined).then(async () => {
    const data = await readDatabase()
    const result = await mutator(data)
    const normalized = normalizeSchoolDatabase(data)
    await writeDatabase(normalized)
    return result
  })

  mutationQueue = run.then(
    () => undefined,
    () => undefined,
  )

  return run
}

export async function getSchoolSnapshot() {
  return readDatabase()
}

export async function saveStudents(students: ManagedStudent[]) {
  const result = await mutateDatabase((data) => {
    const previousStudents = Array.isArray(data.students) ? normalizeStudentRoster(data.students, []) : []
    const nextStudents = normalizeStudentRoster(students, [])
    const removedStudents = previousStudents.filter(
      (student) => !nextStudents.some((candidate) => isSameStudentDirectoryEntry(student, candidate)),
    )

    data.students = nextStudents
    data.gradeStudents = mergeGradeStudentsWithRoster(data.gradeStudents, data.students)
    data.attendanceRecords = syncAttendanceRecordsWithStudents(data.attendanceRecords, data.students)
    data.studentProfiles = mergeStudentProfilesWithStudents(
      data.studentProfiles,
      data.students,
      data.gradeStudents,
      data.attendanceRecords,
    )
    return {
      students: data.students,
      removedStudents,
    }
  })

  if (result.removedStudents.length > 0) {
    await deleteManagedStudentAccountsByDirectoryEntries(result.removedStudents)
  }

  return result.students
}

export async function saveAttendanceRecords(records: AttendanceRecord[]) {
  return mutateDatabase((data) => {
    data.attendanceRecords = syncAttendanceRecordsWithStudents(records, data.students)
    data.studentProfiles = mergeStudentProfilesWithStudents(
      data.studentProfiles,
      data.students,
      data.gradeStudents,
      data.attendanceRecords,
    )
    return data.attendanceRecords
  })
}

export async function saveGrades(gradeStudents: GradeStudent[]) {
  return mutateDatabase((data) => {
    data.gradeStudents = mergeGradeStudentsWithRoster(gradeStudents, data.students)
    data.studentProfiles = mergeStudentProfilesWithStudents(
      data.studentProfiles,
      data.students,
      data.gradeStudents,
      data.attendanceRecords,
    )
    return data.gradeStudents
  })
}

export async function saveSchedule(input: { classSchedules?: ClassScheduleMap; scheduleData?: DaySchedule[]; periodSlots?: PeriodSlot[] }) {
  return mutateDatabase((data) => {
    const classNames = getScheduleClassNames(data.classes, data.students)
    const nextClassSchedules =
      input.classSchedules && Object.keys(input.classSchedules).length > 0
        ? input.classSchedules
        : Array.isArray(input.scheduleData)
          ? (Object.fromEntries(classNames.map((className) => [className, input.scheduleData || defaultScheduleData])) as ClassScheduleMap)
          : data.classSchedules

    const normalized = normalizeClassSchedulesPayload(
      nextClassSchedules,
      Array.isArray(input.periodSlots) && input.periodSlots.length > 0 ? input.periodSlots : data.periodSlots,
      classNames,
      data.scheduleData,
    )
    const sanitized = sanitizeSchedulePayloadByTeachers(normalized.scheduleData, normalized.classSchedules, data.teachers)

    data.scheduleData = sanitized.scheduleData
    data.classSchedules = sanitized.classSchedules
    data.periodSlots = normalized.periodSlots
    return {
      scheduleData: sanitized.scheduleData,
      classSchedules: sanitized.classSchedules,
      periodSlots: normalized.periodSlots,
    }
  })
}

export async function saveClasses(classes: SchoolClass[]) {
  return mutateDatabase((data) => {
    data.classes = sanitizeClassesByTeachers(normalizeSchoolClasses(classes), data.teachers)
    return data.classes
  })
}

export async function saveTeachers(teachers: TeacherDirectoryEntry[]) {
  const result = await mutateDatabase((data) => {
    const previousTeachers = Array.isArray(data.teachers) ? normalizeTeacherDirectoryEntries(data.teachers, []) : []
    const nextTeachers = normalizeTeacherDirectoryEntries(teachers, [])
    const removedTeachers = previousTeachers.filter(
      (teacher) => !nextTeachers.some((candidate) => isSameTeacherDirectoryEntry(teacher, candidate)),
    )
    const sanitizedSchedule = sanitizeSchedulePayloadByTeachers(data.scheduleData, data.classSchedules, nextTeachers)

    data.teachers = nextTeachers
    data.classes = sanitizeClassesByTeachers(data.classes, nextTeachers)
    data.scheduleData = sanitizedSchedule.scheduleData
    data.classSchedules = sanitizedSchedule.classSchedules

    return {
      teachers: data.teachers,
      removedTeachers,
    }
  })

  if (result.removedTeachers.length > 0) {
    await deleteManagedTeacherAccountsByDirectoryEntries(result.removedTeachers)
  }

  return result.teachers
}

export async function syncApprovedRegistrationRequestToSchoolData(request: RegistrationRequest) {
  if (request.userType !== "teacher" && request.userType !== "student") {
    return
  }

  return mutateDatabase((data) => {
    const normalizedName = request.name.trim()
    const normalizedEmail = request.email.trim().toLowerCase()
    const normalizedPhone = String(request.phoneNumber || "").replace(/\D/g, "")
    const today = new Date().toISOString().split("T")[0]

    if (request.userType === "teacher") {
      const alreadyExists = data.teachers.some((teacher) => {
        const teacherEmail = String(teacher.email || "").trim().toLowerCase()
        const teacherPhone = String(teacher.phone || "").replace(/\D/g, "")
        return (
          normalizeText(teacher.name) === normalizeText(normalizedName) ||
          teacherEmail === normalizedEmail ||
          (normalizedPhone.length > 0 && teacherPhone === normalizedPhone)
        )
      })

      if (!alreadyExists) {
        const nextId =
          Math.max(
            0,
            ...data.teachers
              .map((teacher) => Number.parseInt(String(teacher.id || "0"), 10))
              .filter((value) => Number.isFinite(value)),
          ) + 1

        const nextTeacherNumber =
          Math.max(
            10000,
            ...data.teachers
              .map((teacher) => Number.parseInt(String(teacher.teacherId || "").replace(/\D/g, ""), 10))
              .filter((value) => Number.isFinite(value)),
          ) + 1

        data.teachers = normalizeTeacherDirectoryEntries(
          [
            ...data.teachers,
            {
              id: String(nextId),
              name: normalizedName,
              teacherId: `T${nextTeacherNumber}`,
              specialization: "",
              department: "",
              phone: request.phoneNumber || "",
              status: "نشط",
              birthDate: "",
              address: "",
              attendance: undefined,
              performance: undefined,
              email: normalizedEmail,
              joinDate: today,
              lastLogin: "",
              classes: [],
              subjects: [],
              notes: "تمت إضافتها تلقائيًا بعد الموافقة على التسجيل",
            },
          ],
          [],
        )
      }

      return
    }

    const alreadyExists = data.students.some((student) => {
      const parentPhone = String(student.parentPhone || "").replace(/\D/g, "")
      return normalizeText(student.name) === normalizeText(normalizedName) || (normalizedPhone.length > 0 && parentPhone === normalizedPhone)
    })

    if (alreadyExists) {
      return
    }

    const nextId =
      Math.max(
        0,
        ...data.students
          .map((student) => Number.parseInt(String(student.id || "0"), 10))
          .filter((value) => Number.isFinite(value)),
      ) + 1

    const nextStudentId =
      Math.max(
        10000,
        ...data.students
          .map((student) => Number.parseInt(String(student.studentId || "0"), 10))
          .filter((value) => Number.isFinite(value)),
      ) + 1

    data.students = normalizeStudentRoster(
      [
        ...data.students,
        {
          id: String(nextId),
          name: normalizedName,
          studentId: String(nextStudentId),
          grade: "",
          classroom: "",
          parentPhone: request.phoneNumber || "",
          status: "نشط",
          birthDate: "",
          address: "",
          attendance: undefined,
          academicPerformance: undefined,
          behaviorRating: undefined,
          joinDate: today,
          lastLogin: "",
          activities: [],
          notes: "تمت إضافتها تلقائيًا بعد الموافقة على التسجيل",
        },
      ],
      [],
    )
    data.gradeStudents = mergeGradeStudentsWithRoster(data.gradeStudents, data.students)
    data.attendanceRecords = syncAttendanceRecordsWithStudents(data.attendanceRecords, data.students)
    data.studentProfiles = mergeStudentProfilesWithStudents(
      data.studentProfiles,
      data.students,
      data.gradeStudents,
      data.attendanceRecords,
    )
  })
}

export async function saveNotes(notes: SchoolNote[]) {
  return mutateDatabase((data) => {
    data.notes = normalizeSchoolNotes(notes)
    return data.notes
  })
}

export async function saveStudentProfiles(studentProfiles: StudentProfileRecord[]) {
  return mutateDatabase((data) => {
    data.studentProfiles = mergeStudentProfilesWithStudents(
      studentProfiles,
      data.students,
      data.gradeStudents,
      data.attendanceRecords,
    )
    return data.studentProfiles
  })
}

export async function saveDashboardContent(dashboardContent: DashboardContent) {
  return mutateDatabase((data) => {
    data.dashboardContent = normalizeDashboardContent(dashboardContent)
    return data.dashboardContent
  })
}

export async function saveDashboardPrincipalMessage(principalMessage: DashboardPrincipalMessage) {
  return mutateDatabase((data) => {
    data.dashboardContent = normalizeDashboardContent({
      ...data.dashboardContent,
      principalMessage,
    })
    return data.dashboardContent
  })
}
