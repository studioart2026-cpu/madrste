export type StudentStatus = "نشط" | "غير نشط" | "منقول"

export interface ManagedStudent {
  id: string
  name: string
  studentId: string
  grade: string
  classroom: string
  parentPhone: string
  status: StudentStatus
  birthDate: string
  address: string
  notes?: string
  attendance?: number
  academicPerformance?: number
  behaviorRating?: number
  lastLogin?: string
  profileImage?: string
  parentEmail?: string
  emergencyContact?: string
  medicalNotes?: string
  joinDate?: string
  activities?: string[]
}

export const defaultGrades = ["أول متوسط", "ثاني متوسط", "ثالث متوسط"]

export const defaultClassrooms = [
  "١/١",
  "١/٢",
  "١/٣",
  "١/٤",
  "١/٥",
  "٢/١",
  "٢/٢",
  "٢/٣",
  "٢/٤",
  "٢/٥",
  "٢/٦",
  "٣/١",
  "٣/٢",
  "٣/٣",
  "٣/٤",
  "٣/٥",
]

const normalizeName = (value: string) =>
  value
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()

const inferGradeFromClassroom = (classroom: string) => {
  if (classroom.startsWith("١/")) return "أول متوسط"
  if (classroom.startsWith("٢/")) return "ثاني متوسط"
  if (classroom.startsWith("٣/")) return "ثالث متوسط"
  return ""
}

export const defaultStudentRoster: ManagedStudent[] = []

const sortStudents = (students: ManagedStudent[]) => {
  const classroomOrder = new Map(defaultClassrooms.map((classroom, index) => [classroom, index]))

  return [...students].sort((left, right) => {
    const classroomDelta =
      (classroomOrder.get(left.classroom) ?? Number.MAX_SAFE_INTEGER) -
      (classroomOrder.get(right.classroom) ?? Number.MAX_SAFE_INTEGER)
    if (classroomDelta !== 0) return classroomDelta

    const leftStudentId = Number.parseInt(left.studentId, 10)
    const rightStudentId = Number.parseInt(right.studentId, 10)
    if (Number.isFinite(leftStudentId) && Number.isFinite(rightStudentId) && leftStudentId !== rightStudentId) {
      return leftStudentId - rightStudentId
    }

    return left.name.localeCompare(right.name, "ar")
  })
}

const isSameStudent = (reference: ManagedStudent, candidate: Partial<ManagedStudent>) => {
  if (candidate.studentId && candidate.studentId.trim() === reference.studentId) return true
  if (candidate.id && candidate.id.trim() === reference.id) return true

  if (candidate.name && candidate.classroom) {
    return normalizeName(candidate.name) === normalizeName(reference.name) && candidate.classroom.trim() === reference.classroom
  }

  return false
}

const hydrateStudent = (candidate: Partial<ManagedStudent>, fallback: ManagedStudent, index: number): ManagedStudent => ({
  ...fallback,
  ...candidate,
  id: (candidate.id || fallback.id || String(index + 1)).trim(),
  name: (candidate.name || fallback.name).trim(),
  studentId: (candidate.studentId || fallback.studentId).trim(),
  grade: (candidate.grade || fallback.grade).trim(),
  classroom: (candidate.classroom || fallback.classroom).trim(),
  parentPhone: (candidate.parentPhone || fallback.parentPhone).trim(),
  status: candidate.status || fallback.status,
  birthDate: candidate.birthDate ?? fallback.birthDate,
  address: candidate.address ?? fallback.address,
  notes: candidate.notes ?? fallback.notes,
  attendance: candidate.attendance ?? fallback.attendance,
  academicPerformance: candidate.academicPerformance ?? fallback.academicPerformance,
  behaviorRating: candidate.behaviorRating ?? fallback.behaviorRating,
  lastLogin: candidate.lastLogin ?? fallback.lastLogin,
  profileImage: candidate.profileImage ?? fallback.profileImage,
  parentEmail: candidate.parentEmail ?? fallback.parentEmail,
  emergencyContact: candidate.emergencyContact ?? fallback.emergencyContact,
  medicalNotes: candidate.medicalNotes ?? fallback.medicalNotes,
  joinDate: candidate.joinDate ?? fallback.joinDate,
  activities: Array.isArray(candidate.activities) ? candidate.activities.filter(Boolean) : fallback.activities,
})

const buildExtraStudent = (candidate: Partial<ManagedStudent>, index: number): ManagedStudent | null => {
  if (!candidate.name || !candidate.classroom) return null

  const fallbackSeed = 500 + index
  const fallback: ManagedStudent = {
    id: candidate.id?.trim() || String(fallbackSeed),
    name: candidate.name.trim(),
    studentId: candidate.studentId?.trim() || String(20000 + fallbackSeed),
    grade: String(candidate.grade || inferGradeFromClassroom(candidate.classroom)).trim(),
    classroom: candidate.classroom.trim(),
    parentPhone: candidate.parentPhone?.trim() || "",
    status: candidate.status || "نشط",
    birthDate: candidate.birthDate || "",
    address: candidate.address || "",
    attendance: candidate.attendance,
    academicPerformance: candidate.academicPerformance,
    behaviorRating: candidate.behaviorRating,
    lastLogin: candidate.lastLogin,
    profileImage: candidate.profileImage,
    parentEmail: candidate.parentEmail,
    emergencyContact: candidate.emergencyContact,
    medicalNotes: candidate.medicalNotes,
    joinDate: candidate.joinDate || "",
    activities: Array.isArray(candidate.activities) ? candidate.activities.filter(Boolean) : [],
    notes: candidate.notes,
  }

  return hydrateStudent(candidate, fallback, index)
}

export const normalizeStudentRoster = (
  savedStudents: Partial<ManagedStudent>[] = [],
  fallbackStudents: ManagedStudent[] = [],
) => {
  const normalizedSavedStudents = Array.isArray(savedStudents) ? savedStudents : []
  const normalizedFallbackStudents = Array.isArray(fallbackStudents) ? fallbackStudents : []
  const usedIndexes = new Set<number>()

  const mergedFallbacks = normalizedFallbackStudents.map((student, index) => {
    const matchedIndex = normalizedSavedStudents.findIndex(
      (candidate, candidateIndex) => !usedIndexes.has(candidateIndex) && isSameStudent(student, candidate),
    )

    if (matchedIndex === -1) return student

    usedIndexes.add(matchedIndex)
    return hydrateStudent(normalizedSavedStudents[matchedIndex], student, index)
  })

  const extraStudents = normalizedSavedStudents.flatMap((candidate, index) => {
    if (usedIndexes.has(index)) return []
    const builtStudent = buildExtraStudent(candidate, index)
    return builtStudent ? [builtStudent] : []
  })

  return sortStudents([...mergedFallbacks, ...extraStudents])
}

export const mergeWithDefaultStudentRoster = (savedStudents: Partial<ManagedStudent>[] = []) =>
  normalizeStudentRoster(savedStudents, defaultStudentRoster)
