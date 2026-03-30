import { NextResponse } from "next/server"
import { getSchoolSnapshot, saveGrades } from "@/lib/server/school-store"
import { requireSchoolReadAccess, requireSchoolWriteAccess } from "@/lib/server/school-route"
import type { GradeStudent } from "@/lib/school-data"

export const runtime = "nodejs"

function normalizeText(value: string | undefined) {
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

export async function GET() {
  try {
    const user = await requireSchoolReadAccess()
    const snapshot = await getSchoolSnapshot()

    if (user.userType !== "student") {
      return NextResponse.json({ students: snapshot.gradeStudents })
    }

    const normalizedUserName = normalizeText(user.name)
    const normalizedUserPhone = normalizePhone(user.phoneNumber)

    const matchedRosterStudents = snapshot.students.filter((student) => {
      const matchesName = normalizeText(student.name) === normalizedUserName
      const matchesPhone = normalizedUserPhone.length > 0 && normalizePhone(student.parentPhone) === normalizedUserPhone
      return matchesName || matchesPhone
    })

    const matchedIds = new Set(matchedRosterStudents.map((student) => student.id))
    const matchedNames = new Set(matchedRosterStudents.map((student) => normalizeText(student.name)))

    const scopedStudents = snapshot.gradeStudents.filter((student) => {
      if (matchedIds.has(student.id)) {
        return true
      }

      const normalizedStudentName = normalizeText(student.name)
      if (matchedNames.has(normalizedStudentName)) {
        return true
      }

      return matchedIds.size === 0 && matchedNames.size === 0 && normalizedStudentName === normalizedUserName
    })

    return NextResponse.json({ students: scopedStudents })
  } catch (error) {
    return buildErrorResponse(error)
  }
}

export async function PUT(request: Request) {
  try {
    await requireSchoolWriteAccess()
    const body = (await request.json()) as { students?: GradeStudent[] }
    const students = await saveGrades(Array.isArray(body.students) ? body.students : [])
    return NextResponse.json({ students })
  } catch (error) {
    return buildErrorResponse(error)
  }
}
