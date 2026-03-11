import { defaultStudentRoster, mergeWithDefaultStudentRoster, type ManagedStudent } from "@/lib/student-roster"
import { unifiedStudentRecord } from "@/lib/school-insights"
import { teacherDirectory, teacherNameBySpecialization, type TeacherDirectoryEntry } from "@/lib/teachers-directory"

export type AttendanceStatus = "present" | "absent" | "late" | "excused"
export type RiskLevel = "منخفض" | "متوسط" | "مرتفع"
export type SchoolTerm = "الترم الأول" | "الترم الثاني"

export interface AttendanceStudent {
  id: number
  name: string
  status: AttendanceStatus
  notes?: string
}

export interface AttendanceRecord {
  id: number
  date: string
  class: string
  students: AttendanceStudent[]
  savedAt?: string
}

export interface Period {
  id: number
  time: string
  subject: string
  teacher: string
  room: string
}

export interface DaySchedule {
  id: number
  day: string
  periods: Period[]
}

export interface PeriodSlot {
  id: number
  name: string
  start: string
  end: string
}

export interface GradeEntry {
  subject: string
  grade: number
  date: string
  examType: string
}

export interface GradeStudent {
  id: string
  name: string
  class: string
  section: string
  grades: GradeEntry[]
}

export interface SchoolStudentSummary {
  id: string
  name: string
  classroom: string
}

export interface StudentReportProfile {
  id: string
  name: string
  className: string
  term: SchoolTerm
  grades: Array<{ subject: string; score: number }>
  attendance: Array<{ date: string; status: "حاضر" | "غائب" | "متأخر" }>
}

export interface SchoolClass {
  id: string
  name: string
  level: "١" | "٢" | "٣"
  section: string
  teacher: string
  students: number
  rating: number
  capacity: number
  term: SchoolTerm
}

export interface SchoolNote {
  id: string
  title: string
  content: string
  date: string
  images: string[]
}

export interface StudentProfileRecord {
  id: string
  name: string
  className: string
  guardian: string
  attendanceRate: number
  averageGrade: number
  behaviorScore: number
  riskLevel: RiskLevel
  strengths: string[]
  supportNeeds: string[]
}

export const ALL_SUBJECTS = [
  "الرياضيات",
  "العلوم",
  "اللغة العربية",
  "اللغة الإنجليزية",
  "التربية الإسلامية",
  "الاجتماعيات",
  "الحاسب",
  "التربية الفنية",
  "التربية البدنية",
] as const

export const scheduleClasses = [
  { id: "1-1", name: "١/١" },
  { id: "1-2", name: "١/٢" },
  { id: "1-3", name: "١/٣" },
  { id: "1-4", name: "١/٤" },
  { id: "1-5", name: "١/٥" },
  { id: "2-1", name: "٢/١" },
  { id: "2-2", name: "٢/٢" },
  { id: "2-3", name: "٢/٣" },
  { id: "2-4", name: "٢/٤" },
  { id: "2-5", name: "٢/٥" },
  { id: "3-1", name: "٣/١" },
  { id: "3-2", name: "٣/٢" },
  { id: "3-3", name: "٣/٣" },
  { id: "3-4", name: "٣/٤" },
  { id: "3-5", name: "٣/٥" },
]

export const scheduleTeachers = teacherDirectory.map((teacher) => ({
  id: teacher.teacherId,
  name: `أ. ${teacher.name}`,
}))

export const scheduleSubjects = [
  "الرياضيات",
  "اللغة العربية",
  "العلوم",
  "اللغة الإنجليزية",
  "التربية الإسلامية",
  "الاجتماعيات",
  "التربية البدنية",
  "الحاسوب",
  "الفنية",
]

export const schoolTeacherSpecializations = [
  "رياضيات",
  "علوم",
  "لغة عربية",
  "لغة إنجليزية",
  "تربية إسلامية",
  "حاسب آلي",
  "اجتماعيات",
  "فنية",
  "تربية بدنية",
] as const

export const schoolTeacherDepartments = [
  "قسم الرياضيات",
  "قسم العلوم",
  "قسم اللغة العربية",
  "قسم اللغة الإنجليزية",
  "قسم التربية الإسلامية",
  "قسم الحاسب",
  "قسم الاجتماعيات",
  "قسم التربية الفنية",
  "قسم التربية البدنية",
] as const

export const schoolTeacherClasses = [
  "الصف الأول",
  "الصف الثاني",
  "الصف الثالث",
  "الصف الرابع",
  "الصف الخامس",
  "الصف السادس",
] as const

export const schoolTeacherSubjects = [
  "رياضيات أساسية",
  "جبر",
  "هندسة",
  "أحياء",
  "كيمياء",
  "فيزياء",
  "نحو",
  "أدب عربي",
  "قواعد اللغة الإنجليزية",
  "قرآن",
  "توحيد",
  "فقه",
  "برمجة",
  "تقنية معلومات",
  "تاريخ",
  "جغرافيا",
  "رسم",
  "أشغال يدوية",
] as const

export const defaultPeriodSlots: PeriodSlot[] = [
  { id: 1, name: "الأولى", start: "08:00", end: "08:45" },
  { id: 2, name: "الثانية", start: "08:50", end: "09:35" },
  { id: 3, name: "الثالثة", start: "09:40", end: "10:25" },
  { id: 5, name: "الرابعة", start: "11:20", end: "12:05" },
  { id: 6, name: "الخامسة", start: "12:10", end: "12:55" },
  { id: 7, name: "السادسة", start: "13:00", end: "13:45" },
]

export const defaultScheduleData: DaySchedule[] = [
  {
    id: 1,
    day: "الأحد",
    periods: [
      { id: 1, time: "08:00 - 08:45", subject: "الرياضيات", teacher: teacherNameBySpecialization["رياضيات"], room: "101" },
      { id: 2, time: "08:50 - 09:35", subject: "اللغة العربية", teacher: teacherNameBySpecialization["لغة عربية"], room: "102" },
      { id: 3, time: "09:40 - 10:25", subject: "العلوم", teacher: teacherNameBySpecialization["علوم"], room: "103" },
      { id: 4, time: "10:30 - 11:15", subject: "استراحة", teacher: "", room: "" },
      { id: 5, time: "11:20 - 12:05", subject: "اللغة الإنجليزية", teacher: teacherNameBySpecialization["لغة إنجليزية"], room: "104" },
      { id: 6, time: "12:10 - 12:55", subject: "التربية الإسلامية", teacher: teacherNameBySpecialization["تربية إسلامية"], room: "105" },
      { id: 7, time: "13:00 - 13:45", subject: "الاجتماعيات", teacher: teacherNameBySpecialization["اجتماعيات"], room: "106" },
    ],
  },
  {
    id: 2,
    day: "الاثنين",
    periods: [
      { id: 1, time: "08:00 - 08:45", subject: "العلوم", teacher: teacherNameBySpecialization["علوم"], room: "103" },
      { id: 2, time: "08:50 - 09:35", subject: "الرياضيات", teacher: teacherNameBySpecialization["رياضيات"], room: "101" },
      { id: 3, time: "09:40 - 10:25", subject: "اللغة الإنجليزية", teacher: teacherNameBySpecialization["لغة إنجليزية"], room: "104" },
      { id: 4, time: "10:30 - 11:15", subject: "استراحة", teacher: "", room: "" },
      { id: 5, time: "11:20 - 12:05", subject: "اللغة العربية", teacher: teacherNameBySpecialization["لغة عربية"], room: "102" },
      { id: 6, time: "12:10 - 12:55", subject: "التربية البدنية", teacher: teacherNameBySpecialization["تربية بدنية"], room: "ملعب" },
      { id: 7, time: "13:00 - 13:45", subject: "الحاسوب", teacher: teacherNameBySpecialization["حاسب آلي"], room: "معمل 1" },
    ],
  },
  {
    id: 3,
    day: "الثلاثاء",
    periods: [
      { id: 1, time: "08:00 - 08:45", subject: "اللغة العربية", teacher: teacherNameBySpecialization["لغة عربية"], room: "102" },
      { id: 2, time: "08:50 - 09:35", subject: "الاجتماعيات", teacher: teacherNameBySpecialization["اجتماعيات"], room: "106" },
      { id: 3, time: "09:40 - 10:25", subject: "الرياضيات", teacher: teacherNameBySpecialization["رياضيات"], room: "101" },
      { id: 4, time: "10:30 - 11:15", subject: "استراحة", teacher: "", room: "" },
      { id: 5, time: "11:20 - 12:05", subject: "العلوم", teacher: teacherNameBySpecialization["علوم"], room: "103" },
      { id: 6, time: "12:10 - 12:55", subject: "اللغة الإنجليزية", teacher: teacherNameBySpecialization["لغة إنجليزية"], room: "104" },
      { id: 7, time: "13:00 - 13:45", subject: "الفنية", teacher: teacherNameBySpecialization["فنية"], room: "107" },
    ],
  },
  {
    id: 4,
    day: "الأربعاء",
    periods: [
      { id: 1, time: "08:00 - 08:45", subject: "التربية الإسلامية", teacher: teacherNameBySpecialization["تربية إسلامية"], room: "105" },
      { id: 2, time: "08:50 - 09:35", subject: "العلوم", teacher: teacherNameBySpecialization["علوم"], room: "103" },
      { id: 3, time: "09:40 - 10:25", subject: "اللغة العربية", teacher: teacherNameBySpecialization["لغة عربية"], room: "102" },
      { id: 4, time: "10:30 - 11:15", subject: "استراحة", teacher: "", room: "" },
      { id: 5, time: "11:20 - 12:05", subject: "الرياضيات", teacher: teacherNameBySpecialization["رياضيات"], room: "101" },
      { id: 6, time: "12:10 - 12:55", subject: "الحاسوب", teacher: teacherNameBySpecialization["حاسب آلي"], room: "معمل 1" },
      { id: 7, time: "13:00 - 13:45", subject: "اللغة الإنجليزية", teacher: teacherNameBySpecialization["لغة إنجليزية"], room: "104" },
    ],
  },
  {
    id: 5,
    day: "الخميس",
    periods: [
      { id: 1, time: "08:00 - 08:45", subject: "اللغة الإنجليزية", teacher: teacherNameBySpecialization["لغة إنجليزية"], room: "104" },
      { id: 2, time: "08:50 - 09:35", subject: "الرياضيات", teacher: teacherNameBySpecialization["رياضيات"], room: "101" },
      { id: 3, time: "09:40 - 10:25", subject: "التربية الإسلامية", teacher: teacherNameBySpecialization["تربية إسلامية"], room: "105" },
      { id: 4, time: "10:30 - 11:15", subject: "استراحة", teacher: "", room: "" },
      { id: 5, time: "11:20 - 12:05", subject: "اللغة العربية", teacher: teacherNameBySpecialization["لغة عربية"], room: "102" },
      { id: 6, time: "12:10 - 12:55", subject: "العلوم", teacher: teacherNameBySpecialization["علوم"], room: "103" },
      { id: 7, time: "13:00 - 13:45", subject: "التربية البدنية", teacher: teacherNameBySpecialization["تربية بدنية"], room: "ملعب" },
    ],
  },
]

export const defaultSchoolClasses: SchoolClass[] = [
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
    rating: 4,
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

export const defaultSchoolNotes: SchoolNote[] = [
  {
    id: "1",
    title: "اجتماع فريق العمل",
    content: "مناقشة خطة العمل للربع القادم وتوزيع المهام.",
    date: "2026-03-09",
    images: [],
  },
  {
    id: "2",
    title: "مراجعة الميزانية",
    content: "تحليل المصروفات والإيرادات وتحديد فرص التوفير.",
    date: "2026-03-08",
    images: [],
  },
  {
    id: "3",
    title: "تطوير المناهج",
    content: "تحديث المناهج الدراسية لتواكب التطورات الحديثة في التعليم.",
    date: "2026-03-07",
    images: [],
  },
]

export const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim()

const normalizeStringArray = (values: unknown, fallback: string[] = []) =>
  Array.isArray(values) ? values.map((value) => String(value).trim()).filter(Boolean) : fallback

export const normalizeClassLabel = (className: string): string => {
  if (className.includes("متوسط")) return className
  if (className.includes("الصف الأول")) return "أول متوسط"
  if (className.includes("الصف الثاني")) return "ثاني متوسط"
  if (className.includes("الصف الثالث")) return "ثالث متوسط"
  return className
}

export const normalizeSectionLabel = (sectionName?: string): string => {
  if (sectionName && sectionName.includes("شعبة")) return sectionName
  if (sectionName && sectionName.trim().length > 0) return `شعبة ${sectionName.trim()}`
  return "شعبة ١"
}

export const classFromLevel = (level: string): string => {
  if (["1", "١"].includes(level)) return "أول متوسط"
  if (["2", "٢"].includes(level)) return "ثاني متوسط"
  if (["3", "٣"].includes(level)) return "ثالث متوسط"
  return "أول متوسط"
}

export const classFromDirectory = (grade?: string, classroom?: string): string => {
  if (grade && grade.trim().length > 0) return normalizeClassLabel(grade)

  if (classroom && classroom.includes("/")) {
    const level = classroom.split("/")[0]?.trim() || ""
    return classFromLevel(level)
  }

  return "أول متوسط"
}

export const sectionFromClassroom = (classroom?: string): string => {
  if (classroom && classroom.includes("/")) {
    const section = classroom.split("/")[1]?.trim() || ""
    if (section) return `شعبة ${section}`
  }
  return normalizeSectionLabel()
}

export const mapManagedStudentsToSchoolStudents = (students: ManagedStudent[]): SchoolStudentSummary[] =>
  students
    .filter((student) => student.status !== "منقول")
    .map((student) => ({
      id: student.id,
      name: student.name,
      classroom: student.classroom,
    }))

const buildInitialGradeEntries = (student: ManagedStudent, index: number): GradeEntry[] => {
  const subjectRotation = [
    ALL_SUBJECTS[index % ALL_SUBJECTS.length],
    ALL_SUBJECTS[(index + 1) % ALL_SUBJECTS.length],
    ALL_SUBJECTS[(index + 2) % ALL_SUBJECTS.length],
  ]

  return [
    { subject: subjectRotation[0], grade: 78 + (index % 20), date: "2025-10-12", examType: "فصلي أول" },
    { subject: subjectRotation[1], grade: 74 + ((index * 3) % 22), date: "2026-01-20", examType: "فصلي ثاني" },
    { subject: subjectRotation[2], grade: 70 + ((index * 5) % 25), date: "2026-03-03", examType: "قصير" },
  ].map((entry, entryIndex) => ({
    ...entry,
    grade: Math.min(100, Math.max(55, entry.grade + (Number.parseInt(student.id, 10) || entryIndex) % 4)),
  }))
}

export const mergeGradeStudentsWithRoster = (
  savedStudents: Partial<GradeStudent>[] = [],
  roster: ManagedStudent[] = mergeWithDefaultStudentRoster(),
): GradeStudent[] => {
  const normalizedSaved = Array.isArray(savedStudents) ? savedStudents : []
  const usedSavedIndexes = new Set<number>()

  const mergedFromRoster = roster.map((student, index) => {
    const matchedIndex = normalizedSaved.findIndex(
      (candidate, candidateIndex) =>
        !usedSavedIndexes.has(candidateIndex) &&
        ((candidate.id && candidate.id === student.id) ||
          (candidate.name && normalizeText(candidate.name) === normalizeText(student.name))),
    )

    const existing = matchedIndex >= 0 ? normalizedSaved[matchedIndex] : undefined
    if (matchedIndex >= 0) {
      usedSavedIndexes.add(matchedIndex)
    }

    return {
      id: student.id,
      name: student.name,
      class: student.grade,
      section: sectionFromClassroom(student.classroom),
      grades: Array.isArray(existing?.grades)
        ? existing!.grades.map((grade) => ({
            subject: grade.subject || ALL_SUBJECTS[0],
            grade: Number(grade.grade) || 0,
            date: grade.date || "2025-10-12",
            examType: grade.examType || "فصلي أول",
          }))
        : buildInitialGradeEntries(student, index),
    } satisfies GradeStudent
  })

  const extraStudents = normalizedSaved.flatMap((student, index) => {
    if (usedSavedIndexes.has(index) || !student.name) return []

    return [
      {
        id: student.id || `extra-grade-${index + 1}`,
        name: student.name,
        class: normalizeClassLabel(student.class || "أول متوسط"),
        section: normalizeSectionLabel(student.section),
        grades: Array.isArray(student.grades)
          ? student.grades.map((grade) => ({
              subject: grade.subject || ALL_SUBJECTS[0],
              grade: Number(grade.grade) || 0,
              date: grade.date || "2025-10-12",
              examType: grade.examType || "فصلي أول",
            }))
          : [],
      } satisfies GradeStudent,
    ]
  })

  return [...mergedFromRoster, ...extraStudents]
}

const buildSeedAttendanceStudents = (classroom: string, statuses: AttendanceStatus[]) =>
  defaultStudentRoster
    .filter((student) => student.classroom === classroom)
    .slice(0, statuses.length)
    .map((student, index) => ({
      id: Number.parseInt(student.id, 10) || 1000 + index,
      name: student.name,
      status: statuses[index],
      notes:
        statuses[index] === "absent"
          ? index % 2 === 0
            ? "مرض"
            : "ظروف عائلية"
          : statuses[index] === "late"
            ? "تأخرت 10 دقائق"
            : statuses[index] === "excused"
              ? "إذن طبي"
              : undefined,
    }))

export const defaultAttendanceRecords: AttendanceRecord[] = [
  {
    id: 1,
    date: "2026-03-10",
    class: "١/١",
    students: buildSeedAttendanceStudents("١/١", ["present", "present", "absent", "present", "present", "late", "excused", "present"]),
    savedAt: "2026-03-10T08:30:00.000Z",
  },
  {
    id: 2,
    date: "2026-03-09",
    class: "١/١",
    students: buildSeedAttendanceStudents("١/١", ["present", "absent", "present", "present", "late", "present", "present", "present"]),
    savedAt: "2026-03-09T08:45:00.000Z",
  },
]

export const createDefaultGradeStudents = (students: ManagedStudent[] = mergeWithDefaultStudentRoster()) =>
  mergeGradeStudentsWithRoster([], students)

export const createDefaultSchoolStudents = () => mergeWithDefaultStudentRoster(defaultStudentRoster)

export const mergeTeacherDirectory = (savedTeachers: Partial<TeacherDirectoryEntry>[] = []) => {
  const normalizedSavedTeachers = Array.isArray(savedTeachers) ? savedTeachers : []
  const usedIndexes = new Set<number>()

  const mergedDefaults = teacherDirectory.map((teacher, index) => {
    const matchedIndex = normalizedSavedTeachers.findIndex(
      (candidate, candidateIndex) =>
        !usedIndexes.has(candidateIndex) &&
        ((candidate.id && candidate.id === teacher.id) ||
          (candidate.teacherId && candidate.teacherId === teacher.teacherId) ||
          (candidate.name && normalizeText(candidate.name) === normalizeText(teacher.name))),
    )

    const matchedTeacher = matchedIndex >= 0 ? normalizedSavedTeachers[matchedIndex] : undefined
    if (matchedIndex >= 0) {
      usedIndexes.add(matchedIndex)
    }

    return {
      ...teacher,
      ...matchedTeacher,
      id: String(matchedTeacher?.id || teacher.id || index + 1),
      name: String(matchedTeacher?.name || teacher.name).trim(),
      teacherId: String(matchedTeacher?.teacherId || teacher.teacherId).trim(),
      specialization: String(matchedTeacher?.specialization || teacher.specialization).trim(),
      department: String(matchedTeacher?.department || teacher.department).trim(),
      phone: String(matchedTeacher?.phone || teacher.phone).trim(),
      status: (matchedTeacher?.status || teacher.status) as TeacherDirectoryEntry["status"],
      birthDate: String(matchedTeacher?.birthDate || teacher.birthDate || ""),
      address: String(matchedTeacher?.address || teacher.address || ""),
      notes: matchedTeacher?.notes || teacher.notes,
      attendance: matchedTeacher?.attendance ?? teacher.attendance ?? 100,
      performance: matchedTeacher?.performance ?? teacher.performance ?? 90,
      lastLogin: matchedTeacher?.lastLogin || teacher.lastLogin,
      profileImage: matchedTeacher?.profileImage || teacher.profileImage,
      email: matchedTeacher?.email || teacher.email,
      emergencyContact: matchedTeacher?.emergencyContact || teacher.emergencyContact,
      medicalNotes: matchedTeacher?.medicalNotes || teacher.medicalNotes,
      joinDate: matchedTeacher?.joinDate || teacher.joinDate,
      classes: normalizeStringArray(matchedTeacher?.classes, teacher.classes || []),
      subjects: normalizeStringArray(matchedTeacher?.subjects, teacher.subjects || []),
    } satisfies TeacherDirectoryEntry
  })

  const extraTeachers = normalizedSavedTeachers.flatMap((teacher, index) => {
    if (usedIndexes.has(index) || !teacher.name || !teacher.teacherId) {
      return []
    }

    return [
      {
        id: String(teacher.id || `teacher-${index + 1}`),
        name: teacher.name.trim(),
        teacherId: teacher.teacherId.trim(),
        specialization: String(teacher.specialization || schoolTeacherSpecializations[0]),
        department: String(teacher.department || schoolTeacherDepartments[0]),
        phone: String(teacher.phone || ""),
        status: (teacher.status || "نشط") as TeacherDirectoryEntry["status"],
        birthDate: String(teacher.birthDate || ""),
        address: String(teacher.address || ""),
        notes: teacher.notes,
        attendance: teacher.attendance ?? 100,
        performance: teacher.performance ?? 90,
        lastLogin: teacher.lastLogin,
        profileImage: teacher.profileImage,
        email: teacher.email,
        emergencyContact: teacher.emergencyContact,
        medicalNotes: teacher.medicalNotes,
        joinDate: teacher.joinDate || "2026-03-11",
        classes: normalizeStringArray(teacher.classes),
        subjects: normalizeStringArray(teacher.subjects),
      } satisfies TeacherDirectoryEntry,
    ]
  })

  return [...mergedDefaults, ...extraTeachers]
}

export const normalizeSchoolClasses = (classes: Partial<SchoolClass>[] = []) => {
  const normalizedClasses = Array.isArray(classes) ? classes : []
  const fallbackMap = new Map(defaultSchoolClasses.map((item) => [item.id, item] as const))

  return normalizedClasses.length > 0
    ? normalizedClasses.map((item, index) => {
        const fallback = fallbackMap.get(String(item.id || "")) || defaultSchoolClasses[index] || defaultSchoolClasses[0]
        const level = String(item.level || fallback.level) as SchoolClass["level"]
        const section = String(item.section || fallback.section).trim()

        return {
          id: String(item.id || fallback.id || `class-${index + 1}`),
          name: String(item.name || `${level}/${section || fallback.section}`).trim(),
          level,
          section: section || fallback.section,
          teacher: String(item.teacher || fallback.teacher).trim(),
          students: Number(item.students) || 0,
          rating: Number(item.rating) || 0,
          capacity: Number(item.capacity) || fallback.capacity,
          term: (item.term || fallback.term) as SchoolTerm,
        } satisfies SchoolClass
      })
    : defaultSchoolClasses
}

export const normalizeSchoolNotes = (notes: Array<Partial<SchoolNote> & { image?: string }> = []) => {
  const normalizedNotes = Array.isArray(notes) ? notes : []

  return normalizedNotes.length > 0
    ? normalizedNotes.map((note, index) => ({
        id: String(note.id || `note-${index + 1}`),
        title: String(note.title || `ملاحظة ${index + 1}`).trim(),
        content: String(note.content || "").trim(),
        date: String(note.date || new Date().toISOString().split("T")[0]),
        images: Array.isArray(note.images)
          ? note.images.map((image) => String(image)).filter(Boolean)
          : note.image
            ? [String(note.image)]
            : [],
      }))
    : defaultSchoolNotes
}

export const syncAttendanceRecordsWithStudents = (
  records: AttendanceRecord[] = [],
  students: ManagedStudent[] = mergeWithDefaultStudentRoster(),
) => {
  const byNumericId = new Map(
    students
      .map((student) => ({
        key: Number.parseInt(student.id, 10),
        name: student.name,
        classroom: student.classroom,
      }))
      .filter((entry) => Number.isFinite(entry.key))
      .map((entry) => [entry.key, entry] as const),
  )

  const byName = new Map(
    students.map((student) => [normalizeText(student.name), { name: student.name, classroom: student.classroom }] as const),
  )

  return (Array.isArray(records) ? records : []).map((record, recordIndex) => ({
    id: Number(record.id) || recordIndex + 1,
    date: record.date,
    class: record.class,
    savedAt: record.savedAt,
    students: (Array.isArray(record.students) ? record.students : []).map((student, studentIndex) => {
      const byId = byNumericId.get(Number(student.id))
      const byStudentName = byName.get(normalizeText(student.name))
      const matched = byId && byId.classroom === record.class ? byId : byStudentName && byStudentName.classroom === record.class ? byStudentName : null

      return {
        id: Number(student.id) || 1000 + studentIndex,
        name: matched?.name || student.name,
        status: student.status,
        notes: student.notes,
      } satisfies AttendanceStudent
    }),
  }))
}

const syncPeriods = (periods: Period[], periodSlots: PeriodSlot[]) =>
  periods.map((period) => {
    const slot = periodSlots.find((entry) => entry.id === period.id)
    if (!slot || period.subject === "استراحة") {
      return period
    }

    return {
      ...period,
      time: `${slot.start} - ${slot.end}`,
    }
  })

export const normalizeSchedulePayload = (
  scheduleData: DaySchedule[] = defaultScheduleData,
  periodSlots: PeriodSlot[] = defaultPeriodSlots,
) => {
  const normalizedSlots = (Array.isArray(periodSlots) ? periodSlots : defaultPeriodSlots).map((slot, index) => ({
    id: Number(slot.id) || defaultPeriodSlots[index]?.id || index + 1,
    name: slot.name || defaultPeriodSlots[index]?.name || `الحصة ${index + 1}`,
    start: slot.start || defaultPeriodSlots[index]?.start || "08:00",
    end: slot.end || defaultPeriodSlots[index]?.end || "08:45",
  }))

  const normalizedSchedule = (Array.isArray(scheduleData) ? scheduleData : defaultScheduleData).map((day, dayIndex) => ({
    id: Number(day.id) || dayIndex + 1,
    day: day.day || defaultScheduleData[dayIndex]?.day || `اليوم ${dayIndex + 1}`,
    periods: syncPeriods(Array.isArray(day.periods) ? day.periods : defaultScheduleData[dayIndex]?.periods || [], normalizedSlots),
  }))

  return {
    scheduleData: normalizedSchedule,
    periodSlots: normalizedSlots,
  }
}

const gradeEntryTerm = (entry: GradeEntry): "الترم الأول" | "الترم الثاني" => {
  if (entry.examType.includes("ثاني")) return "الترم الثاني"

  const month = Number.parseInt((entry.date || "").split("-")[1] || "0", 10)
  if (month >= 1 && month <= 6) return "الترم الثاني"
  return "الترم الأول"
}

const attendanceTerm = (date: string): "الترم الأول" | "الترم الثاني" => {
  const month = Number.parseInt((date || "").split("-")[1] || "0", 10)
  if (month >= 1 && month <= 6) return "الترم الثاني"
  return "الترم الأول"
}

export const buildReportProfiles = (input: {
  students: ManagedStudent[]
  gradeStudents: GradeStudent[]
  attendanceRecords: AttendanceRecord[]
}) => {
  const gradeLookup = new Map(
    input.gradeStudents.map((student) => [student.id, student] as const),
  )

  return input.students.flatMap((student) => {
    const gradeStudent = gradeLookup.get(student.id)

    return (["الترم الأول", "الترم الثاني"] as const).map((term) => {
      const grades = (gradeStudent?.grades || [])
        .filter((entry) => gradeEntryTerm(entry) === term)
        .map((entry) => ({
          subject: entry.subject,
          score: entry.grade,
        }))

      const attendance = input.attendanceRecords.flatMap((record) => {
        if (record.class !== student.classroom || attendanceTerm(record.date) !== term) {
          return []
        }

        const matchedStudent = record.students.find(
          (entry) => Number(entry.id) === Number.parseInt(student.id, 10) || normalizeText(entry.name) === normalizeText(student.name),
        )

        if (!matchedStudent) {
          return []
        }

        return [
          {
            date: record.date,
            status:
              matchedStudent.status === "present"
                ? "حاضر"
                : matchedStudent.status === "absent"
                  ? "غائب"
                  : "متأخر",
          } as const,
        ]
      })

      return {
        id: student.id,
        name: student.name,
        className: student.grade,
        term,
        grades,
        attendance,
      } satisfies StudentReportProfile
    })
  })
}

const calculateAttendanceRate = (student: ManagedStudent, attendanceRecords: AttendanceRecord[]) => {
  const matchedStatuses = attendanceRecords.flatMap((record) => {
    if (record.class !== student.classroom) {
      return []
    }

    const matchedStudent = record.students.find(
      (entry) => Number(entry.id) === Number.parseInt(student.id, 10) || normalizeText(entry.name) === normalizeText(student.name),
    )

    return matchedStudent ? [matchedStudent.status] : []
  })

  if (matchedStatuses.length === 0) {
    return student.attendance ?? unifiedStudentRecord.attendanceRate
  }

  const attendedCount = matchedStatuses.filter((status) => status !== "absent").length
  return Math.round((attendedCount / matchedStatuses.length) * 100)
}

const calculateAverageGrade = (student: ManagedStudent, gradeStudents: GradeStudent[]) => {
  const matchedStudent = gradeStudents.find(
    (entry) => entry.id === student.id || normalizeText(entry.name) === normalizeText(student.name),
  )

  if (!matchedStudent || matchedStudent.grades.length === 0) {
    return student.academicPerformance ?? unifiedStudentRecord.averageGrade
  }

  const total = matchedStudent.grades.reduce((sum, entry) => sum + entry.grade, 0)
  return Math.round(total / matchedStudent.grades.length)
}

const deriveRiskLevel = (attendanceRate: number, averageGrade: number, behaviorScore: number): RiskLevel => {
  if (attendanceRate < 85 || averageGrade < 70 || behaviorScore < 75) {
    return "مرتفع"
  }
  if (attendanceRate < 92 || averageGrade < 80 || behaviorScore < 85) {
    return "متوسط"
  }
  return "منخفض"
}

const buildDefaultStudentProfile = (
  student: ManagedStudent,
  gradeStudents: GradeStudent[],
  attendanceRecords: AttendanceRecord[],
) => {
  const attendanceRate = calculateAttendanceRate(student, attendanceRecords)
  const averageGrade = calculateAverageGrade(student, gradeStudents)
  const behaviorScore = student.behaviorRating ?? unifiedStudentRecord.behaviorScore

  return {
    id: student.id,
    name: student.name,
    className: student.classroom,
    guardian: student.parentPhone ? `ولية الأمر: ${student.parentPhone}` : unifiedStudentRecord.guardian,
    attendanceRate,
    averageGrade,
    behaviorScore,
    riskLevel: deriveRiskLevel(attendanceRate, averageGrade, behaviorScore),
    strengths: unifiedStudentRecord.strengths,
    supportNeeds: unifiedStudentRecord.supportNeeds,
  } satisfies StudentProfileRecord
}

export const mergeStudentProfilesWithStudents = (
  savedProfiles: Partial<StudentProfileRecord>[] = [],
  students: ManagedStudent[] = mergeWithDefaultStudentRoster(),
  gradeStudents: GradeStudent[] = mergeGradeStudentsWithRoster([], students),
  attendanceRecords: AttendanceRecord[] = syncAttendanceRecordsWithStudents(defaultAttendanceRecords, students),
) => {
  const normalizedProfiles = Array.isArray(savedProfiles) ? savedProfiles : []
  const usedIndexes = new Set<number>()

  const mergedProfiles = students.map((student) => {
    const matchedIndex = normalizedProfiles.findIndex(
      (profile, profileIndex) =>
        !usedIndexes.has(profileIndex) &&
        ((profile.id && profile.id === student.id) || (profile.name && normalizeText(profile.name) === normalizeText(student.name))),
    )

    const defaultProfile = buildDefaultStudentProfile(student, gradeStudents, attendanceRecords)
    const savedProfile = matchedIndex >= 0 ? normalizedProfiles[matchedIndex] : undefined
    if (matchedIndex >= 0) {
      usedIndexes.add(matchedIndex)
    }

    return {
      ...defaultProfile,
      ...savedProfile,
      id: student.id,
      name: student.name,
      className: String(savedProfile?.className || defaultProfile.className).trim(),
      guardian: String(savedProfile?.guardian || defaultProfile.guardian).trim(),
      attendanceRate: Number(savedProfile?.attendanceRate) || defaultProfile.attendanceRate,
      averageGrade: Number(savedProfile?.averageGrade) || defaultProfile.averageGrade,
      behaviorScore: Number(savedProfile?.behaviorScore) || defaultProfile.behaviorScore,
      riskLevel: (savedProfile?.riskLevel || defaultProfile.riskLevel) as RiskLevel,
      strengths: normalizeStringArray(savedProfile?.strengths, defaultProfile.strengths),
      supportNeeds: normalizeStringArray(savedProfile?.supportNeeds, defaultProfile.supportNeeds),
    } satisfies StudentProfileRecord
  })

  const extraProfiles = normalizedProfiles.flatMap((profile, index) => {
    if (usedIndexes.has(index) || !profile.name) {
      return []
    }

    const attendanceRate = Number(profile.attendanceRate) || unifiedStudentRecord.attendanceRate
    const averageGrade = Number(profile.averageGrade) || unifiedStudentRecord.averageGrade
    const behaviorScore = Number(profile.behaviorScore) || unifiedStudentRecord.behaviorScore

    return [
      {
        id: String(profile.id || `student-profile-${index + 1}`),
        name: String(profile.name).trim(),
        className: String(profile.className || unifiedStudentRecord.className).trim(),
        guardian: String(profile.guardian || unifiedStudentRecord.guardian).trim(),
        attendanceRate,
        averageGrade,
        behaviorScore,
        riskLevel: (profile.riskLevel || deriveRiskLevel(attendanceRate, averageGrade, behaviorScore)) as RiskLevel,
        strengths: normalizeStringArray(profile.strengths, unifiedStudentRecord.strengths),
        supportNeeds: normalizeStringArray(profile.supportNeeds, unifiedStudentRecord.supportNeeds),
      } satisfies StudentProfileRecord,
    ]
  })

  return [...mergedProfiles, ...extraProfiles]
}

export const createDefaultStudentProfiles = (
  students: ManagedStudent[] = mergeWithDefaultStudentRoster(),
  gradeStudents: GradeStudent[] = mergeGradeStudentsWithRoster([], students),
  attendanceRecords: AttendanceRecord[] = syncAttendanceRecordsWithStudents(defaultAttendanceRecords, students),
) => mergeStudentProfilesWithStudents([], students, gradeStudents, attendanceRecords)
