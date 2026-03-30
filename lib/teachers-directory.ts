export interface TeacherDirectoryEntry {
  id: string
  name: string
  teacherId: string
  specialization: string
  department: string
  phone: string
  status: "نشط" | "غير نشط" | "إجازة"
  birthDate: string
  address: string
  notes?: string
  attendance?: number
  performance?: number
  lastLogin?: string
  profileImage?: string
  email?: string
  emergencyContact?: string
  medicalNotes?: string
  joinDate?: string
  classes?: string[]
  subjects?: string[]
}

export const teacherDirectory: TeacherDirectoryEntry[] = []

export const teacherNames = teacherDirectory.map((teacher) => `أ. ${teacher.name}`)

export const teacherNameBySpecialization: Record<string, string> = Object.fromEntries(
  teacherDirectory.map((teacher) => [teacher.specialization, `أ. ${teacher.name}`]),
)
