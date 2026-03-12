import "server-only"

import { promises as fs } from "node:fs"
import path from "node:path"
import type { DashboardContent, DashboardPrincipalMessage } from "@/lib/dashboard-data"
import { defaultDashboardContent, normalizeDashboardContent } from "@/lib/dashboard-data"
import type { ManagedStudent } from "@/lib/student-roster"
import {
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
  normalizeSchoolClasses,
  normalizeSchoolNotes,
  normalizeSchedulePayload,
  syncAttendanceRecordsWithStudents,
  type AttendanceRecord,
  type DaySchedule,
  type GradeStudent,
  type PeriodSlot,
  type SchoolClass,
  type SchoolNote,
  type StudentProfileRecord,
} from "@/lib/school-data"
import { getServerDataDirectory } from "@/lib/server/data-directory"
import { mergeWithDefaultStudentRoster } from "@/lib/student-roster"
import type { TeacherDirectoryEntry } from "@/lib/teachers-directory"

interface SchoolDatabase {
  students: ManagedStudent[]
  attendanceRecords: AttendanceRecord[]
  gradeStudents: GradeStudent[]
  scheduleData: DaySchedule[]
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

function createSeedSchoolDatabase(): SchoolDatabase {
  const students = mergeWithDefaultStudentRoster()
  return {
    students,
    attendanceRecords: syncAttendanceRecordsWithStudents(defaultAttendanceRecords, students),
    gradeStudents: createDefaultGradeStudents(students),
    ...normalizeSchedulePayload(defaultScheduleData, defaultPeriodSlots),
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
  const students = mergeWithDefaultStudentRoster(Array.isArray(data.students) ? data.students : [])
  const gradeStudents = mergeGradeStudentsWithRoster(Array.isArray(data.gradeStudents) ? data.gradeStudents : [], students)
  const attendanceRecords = syncAttendanceRecordsWithStudents(
    Array.isArray(data.attendanceRecords) ? data.attendanceRecords : defaultAttendanceRecords,
    students,
  )
  const classes = normalizeSchoolClasses(Array.isArray(data.classes) ? data.classes : defaultSchoolClasses)
  const teachers = mergeTeacherDirectory(Array.isArray(data.teachers) ? data.teachers : [])
  const notes = normalizeSchoolNotes(Array.isArray(data.notes) ? data.notes : defaultSchoolNotes)
  const schedule = normalizeSchedulePayload(
    Array.isArray(data.scheduleData) ? data.scheduleData : defaultScheduleData,
    Array.isArray(data.periodSlots) ? data.periodSlots : defaultPeriodSlots,
  )
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
    scheduleData: schedule.scheduleData,
    periodSlots: schedule.periodSlots,
    classes,
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
  return mutateDatabase((data) => {
    data.students = mergeWithDefaultStudentRoster(students)
    data.gradeStudents = mergeGradeStudentsWithRoster(data.gradeStudents, data.students)
    data.attendanceRecords = syncAttendanceRecordsWithStudents(data.attendanceRecords, data.students)
    data.studentProfiles = mergeStudentProfilesWithStudents(
      data.studentProfiles,
      data.students,
      data.gradeStudents,
      data.attendanceRecords,
    )
    return data.students
  })
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

export async function saveSchedule(input: { scheduleData: DaySchedule[]; periodSlots: PeriodSlot[] }) {
  return mutateDatabase((data) => {
    const normalized = normalizeSchedulePayload(input.scheduleData, input.periodSlots)
    data.scheduleData = normalized.scheduleData
    data.periodSlots = normalized.periodSlots
    return normalized
  })
}

export async function saveClasses(classes: SchoolClass[]) {
  return mutateDatabase((data) => {
    data.classes = normalizeSchoolClasses(classes)
    return data.classes
  })
}

export async function saveTeachers(teachers: TeacherDirectoryEntry[]) {
  return mutateDatabase((data) => {
    data.teachers = mergeTeacherDirectory(teachers)
    return data.teachers
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
