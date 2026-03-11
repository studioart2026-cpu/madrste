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

type ClassroomDefinition = {
  grade: string
  classroom: string
  seededStudents?: ManagedStudent[]
}

const classroomDefinitions: ClassroomDefinition[] = [
  {
    grade: "أول متوسط",
    classroom: "١/١",
    seededStudents: [
      {
        id: "1",
        name: "سارة أحمد",
        studentId: "10001",
        grade: "أول متوسط",
        classroom: "١/١",
        parentPhone: "0501234567",
        status: "نشط",
        birthDate: "2013-05-15",
        address: "الرياض، حي النزهة",
        attendance: 95,
        academicPerformance: 88,
        behaviorRating: 92,
        lastLogin: "2026-03-10",
        parentEmail: "parent1@example.com",
        emergencyContact: "0509876543",
        activities: ["النادي العلمي", "القراءة"],
        joinDate: "2024-08-18",
      },
      {
        id: "10",
        name: "العنود سعد",
        studentId: "10010",
        grade: "أول متوسط",
        classroom: "١/١",
        parentPhone: "0503344556",
        status: "نشط",
        birthDate: "2013-11-20",
        address: "الرياض، حي الروضة",
        attendance: 93,
        academicPerformance: 87,
        behaviorRating: 90,
        lastLogin: "2026-03-09",
        parentEmail: "parent10@example.com",
        emergencyContact: "0509900112",
        activities: ["الرسم", "الموسيقى"],
        joinDate: "2024-08-18",
      },
    ],
  },
  { grade: "أول متوسط", classroom: "١/٢" },
  { grade: "أول متوسط", classroom: "١/٣" },
  { grade: "أول متوسط", classroom: "١/٤" },
  {
    grade: "ثاني متوسط",
    classroom: "٢/١",
    seededStudents: [
      {
        id: "5",
        name: "لمى عبدالله",
        studentId: "10005",
        grade: "ثاني متوسط",
        classroom: "٢/١",
        parentPhone: "0571234567",
        status: "نشط",
        birthDate: "2012-07-18",
        address: "الرياض، حي الربيع",
        attendance: 97,
        academicPerformance: 91,
        behaviorRating: 93,
        lastLogin: "2026-03-10",
        parentEmail: "parent5@example.com",
        emergencyContact: "0574455667",
        activities: ["المسرح", "القراءة"],
        joinDate: "2023-08-20",
      },
    ],
  },
  {
    grade: "ثاني متوسط",
    classroom: "٢/٢",
    seededStudents: [
      {
        id: "8",
        name: "منيرة خالد",
        studentId: "10008",
        grade: "ثاني متوسط",
        classroom: "٢/٢",
        parentPhone: "0501122334",
        status: "نشط",
        birthDate: "2012-10-30",
        address: "الرياض، حي النخيل",
        attendance: 94,
        academicPerformance: 89,
        behaviorRating: 91,
        lastLogin: "2026-03-08",
        parentEmail: "parent8@example.com",
        emergencyContact: "0507788990",
        medicalNotes: "نظارات طبية",
        activities: ["القراءة", "الشطرنج"],
        joinDate: "2023-08-20",
      },
    ],
  },
  {
    grade: "ثاني متوسط",
    classroom: "٢/٣",
    seededStudents: [
      {
        id: "2",
        name: "نورة محمد",
        studentId: "10002",
        grade: "ثاني متوسط",
        classroom: "٢/٣",
        parentPhone: "0507654321",
        status: "نشط",
        birthDate: "2012-03-22",
        address: "الرياض، حي الملقا",
        attendance: 98,
        academicPerformance: 94,
        behaviorRating: 90,
        lastLogin: "2026-03-10",
        parentEmail: "parent2@example.com",
        emergencyContact: "0501122334",
        activities: ["الرسم", "السباحة"],
        joinDate: "2023-08-20",
      },
    ],
  },
  { grade: "ثاني متوسط", classroom: "٢/٤" },
  { grade: "ثاني متوسط", classroom: "٢/٥" },
  { grade: "ثاني متوسط", classroom: "٢/٦" },
  {
    grade: "ثالث متوسط",
    classroom: "٣/١",
    seededStudents: [
      {
        id: "6",
        name: "دانة فهد",
        studentId: "10006",
        grade: "ثالث متوسط",
        classroom: "٣/١",
        parentPhone: "0581234567",
        status: "نشط",
        birthDate: "2011-04-12",
        address: "الرياض، حي العليا",
        attendance: 99,
        academicPerformance: 96,
        behaviorRating: 98,
        lastLogin: "2026-03-10",
        parentEmail: "parent6@example.com",
        emergencyContact: "0585566778",
        activities: ["البرمجة", "الروبوتات"],
        joinDate: "2022-08-24",
      },
    ],
  },
  {
    grade: "ثالث متوسط",
    classroom: "٣/٢",
    seededStudents: [
      {
        id: "3",
        name: "هند خالد",
        studentId: "10003",
        grade: "ثالث متوسط",
        classroom: "٣/٢",
        parentPhone: "0551234567",
        status: "نشط",
        birthDate: "2011-11-10",
        address: "الرياض، حي الياسمين",
        attendance: 92,
        academicPerformance: 85,
        behaviorRating: 95,
        lastLogin: "2026-03-08",
        parentEmail: "parent3@example.com",
        emergencyContact: "0552233445",
        activities: ["القراءة", "كرة السلة"],
        joinDate: "2022-08-24",
      },
    ],
  },
  {
    grade: "ثالث متوسط",
    classroom: "٣/٣",
    seededStudents: [
      {
        id: "9",
        name: "جواهر محمد",
        studentId: "10009",
        grade: "ثالث متوسط",
        classroom: "٣/٣",
        parentPhone: "0502233445",
        status: "نشط",
        birthDate: "2011-08-14",
        address: "الرياض، حي الملز",
        attendance: 96,
        academicPerformance: 93,
        behaviorRating: 94,
        lastLogin: "2026-03-10",
        parentEmail: "parent9@example.com",
        emergencyContact: "0508899001",
        activities: ["السباحة", "كرة القدم"],
        joinDate: "2022-08-24",
      },
    ],
  },
  { grade: "ثالث متوسط", classroom: "٣/٤" },
  { grade: "ثالث متوسط", classroom: "٣/٥" },
]

const targetStudentsPerClassroom = 8
const firstNames = [
  "رهف",
  "جود",
  "ليان",
  "تالا",
  "شهد",
  "لولوة",
  "ريماس",
  "أريج",
  "بسمة",
  "سديم",
  "رغد",
  "مها",
  "لجين",
  "آسية",
  "تمارا",
  "هيا",
  "مشاعل",
  "أثير",
  "ديما",
  "فرح",
  "بنان",
  "يارا",
  "غلا",
  "لانا",
  "ميس",
  "سدن",
  "نجلاء",
  "هاجر",
  "نجود",
  "مرام",
  "أفنان",
  "رزان",
  "جنى",
  "جوري",
  "لين",
  "سلسبيل",
]

const familyNames = [
  "القحطاني",
  "المطيري",
  "العتيبي",
  "الشمري",
  "الزهراني",
  "الجهني",
  "الحربي",
  "الغامدي",
  "العنزي",
  "الدوسري",
  "السبيعي",
  "الشهري",
]

const neighborhoods = [
  "حي النزهة",
  "حي الملقا",
  "حي الياسمين",
  "حي الورود",
  "حي الربيع",
  "حي العليا",
  "حي الصحافة",
  "حي النخيل",
  "حي الملز",
  "حي الروضة",
  "حي العقيق",
  "حي حطين",
]

const activitySets = [
  ["النادي العلمي", "القراءة"],
  ["الرسم", "المسرح"],
  ["السباحة", "الشطرنج"],
  ["البرمجة", "الروبوتات"],
  ["الإذاعة المدرسية", "كرة السلة"],
  ["الخط العربي", "المهارات الرقمية"],
]

export const defaultGrades = Array.from(new Set(classroomDefinitions.map((entry) => entry.grade)))
export const defaultClassrooms = classroomDefinitions.map((entry) => entry.classroom)

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
  return "ثالث متوسط"
}

const usedNames = new Set(
  classroomDefinitions.flatMap((entry) => (entry.seededStudents || []).map((student) => normalizeName(student.name))),
)

let generatedNameCursor = 0
const generateStudentName = () => {
  while (generatedNameCursor < firstNames.length * familyNames.length) {
    const firstName = firstNames[generatedNameCursor % firstNames.length]
    const familyName = familyNames[Math.floor(generatedNameCursor / firstNames.length) % familyNames.length]
    generatedNameCursor += 1
    const candidate = `${firstName} ${familyName}`
    const normalizedCandidate = normalizeName(candidate)
    if (!usedNames.has(normalizedCandidate)) {
      usedNames.add(normalizedCandidate)
      return candidate
    }
  }

  const fallback = `طالبة ${generatedNameCursor}`
  generatedNameCursor += 1
  return fallback
}

const buildPhoneNumber = (seed: number, offset = 0) => `05${String(10000000 + seed * 137 + offset * 211).slice(-8)}`

const buildGeneratedStudent = (
  definition: ClassroomDefinition,
  sequence: number,
  classroomIndex: number,
  seed: number,
): ManagedStudent => {
  const name = generateStudentName()
  const joinYear = definition.grade === "أول متوسط" ? 2024 : definition.grade === "ثاني متوسط" ? 2023 : 2022

  return {
    id: String(seed),
    name,
    studentId: String(10000 + seed),
    grade: definition.grade,
    classroom: definition.classroom,
    parentPhone: buildPhoneNumber(seed),
    status: "نشط",
    birthDate: `${definition.grade === "أول متوسط" ? 2013 : definition.grade === "ثاني متوسط" ? 2012 : 2011}-${String((sequence % 9) + 1).padStart(2, "0")}-${String((sequence % 27) + 1).padStart(2, "0")}`,
    address: `الرياض، ${neighborhoods[(classroomIndex + sequence) % neighborhoods.length]}`,
    attendance: 90 + ((classroomIndex + sequence) % 9),
    academicPerformance: 82 + ((classroomIndex * 3 + sequence) % 15),
    behaviorRating: 84 + ((classroomIndex * 5 + sequence) % 14),
    lastLogin: `2026-03-${String(((seed + sequence) % 9) + 2).padStart(2, "0")}`,
    parentEmail: `parent${10000 + seed}@example.com`,
    emergencyContact: buildPhoneNumber(seed, 1),
    joinDate: `${joinYear}-08-${String(((sequence + classroomIndex) % 7) + 18).padStart(2, "0")}`,
    activities: activitySets[(classroomIndex + sequence) % activitySets.length],
    medicalNotes: seed % 17 === 0 ? "تحتاج إلى متابعة بسيطة أثناء النشاط الرياضي" : undefined,
  }
}

export const defaultStudentRoster: ManagedStudent[] = classroomDefinitions.flatMap((definition, classroomIndex) => {
  const seededStudents = (definition.seededStudents || []).map((student) => ({
    ...student,
    grade: definition.grade,
    classroom: definition.classroom,
    status: student.status === "منقول" ? "نشط" : student.status,
  }))

  const generatedStudents = Array.from(
    { length: Math.max(0, targetStudentsPerClassroom - seededStudents.length) },
    (_, index) => buildGeneratedStudent(definition, index, classroomIndex, 100 + classroomIndex * targetStudentsPerClassroom + index + 1),
  )

  return [...seededStudents, ...generatedStudents]
})

const sortStudents = (students: ManagedStudent[]) => {
  const classroomOrder = new Map(defaultClassrooms.map((classroom, index) => [classroom, index]))

  return [...students].sort((left, right) => {
    const classroomDelta = (classroomOrder.get(left.classroom) || 0) - (classroomOrder.get(right.classroom) || 0)
    if (classroomDelta !== 0) return classroomDelta
    return Number.parseInt(left.studentId, 10) - Number.parseInt(right.studentId, 10)
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
  birthDate: candidate.birthDate || fallback.birthDate,
  address: candidate.address || fallback.address,
  notes: candidate.notes || fallback.notes,
  attendance: candidate.attendance ?? fallback.attendance,
  academicPerformance: candidate.academicPerformance ?? fallback.academicPerformance,
  behaviorRating: candidate.behaviorRating ?? fallback.behaviorRating,
  lastLogin: candidate.lastLogin || fallback.lastLogin,
  profileImage: candidate.profileImage || fallback.profileImage,
  parentEmail: candidate.parentEmail || fallback.parentEmail,
  emergencyContact: candidate.emergencyContact || fallback.emergencyContact,
  medicalNotes: candidate.medicalNotes || fallback.medicalNotes,
  joinDate: candidate.joinDate || fallback.joinDate,
  activities: candidate.activities && candidate.activities.length > 0 ? candidate.activities : fallback.activities,
})

const buildExtraStudent = (candidate: Partial<ManagedStudent>, index: number): ManagedStudent | null => {
  if (!candidate.name || !candidate.classroom) return null

  const inferredGrade = candidate.grade || inferGradeFromClassroom(candidate.classroom)
  const fallbackSeed = 500 + index
  const fallback: ManagedStudent = {
    id: candidate.id?.trim() || String(fallbackSeed),
    name: candidate.name.trim(),
    studentId: candidate.studentId?.trim() || String(20000 + fallbackSeed),
    grade: inferredGrade,
    classroom: candidate.classroom.trim(),
    parentPhone: candidate.parentPhone?.trim() || buildPhoneNumber(fallbackSeed),
    status: candidate.status || "نشط",
    birthDate: candidate.birthDate || "2012-01-01",
    address: candidate.address || `الرياض، ${neighborhoods[index % neighborhoods.length]}`,
    attendance: candidate.attendance ?? 95,
    academicPerformance: candidate.academicPerformance ?? 88,
    behaviorRating: candidate.behaviorRating ?? 90,
    lastLogin: candidate.lastLogin || "2026-03-10",
    profileImage: candidate.profileImage,
    parentEmail: candidate.parentEmail || `parent${20000 + fallbackSeed}@example.com`,
    emergencyContact: candidate.emergencyContact || buildPhoneNumber(fallbackSeed, 1),
    medicalNotes: candidate.medicalNotes,
    joinDate: candidate.joinDate || "2024-08-18",
    activities: candidate.activities && candidate.activities.length > 0 ? candidate.activities : activitySets[index % activitySets.length],
    notes: candidate.notes,
  }

  return hydrateStudent(candidate, fallback, index)
}

export const mergeWithDefaultStudentRoster = (savedStudents: Partial<ManagedStudent>[] = []) => {
  const normalizedSavedStudents = Array.isArray(savedStudents) ? savedStudents : []
  const usedIndexes = new Set<number>()

  const mergedDefaults = defaultStudentRoster.map((student, index) => {
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

  return sortStudents([...mergedDefaults, ...extraStudents])
}
