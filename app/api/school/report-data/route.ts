import { NextResponse } from "next/server"
import { getSchoolSnapshot } from "@/lib/server/school-store"
import { requireSchoolReadAccess } from "@/lib/server/school-route"

export const runtime = "nodejs"

export async function GET() {
  try {
    await requireSchoolReadAccess()
    const snapshot = await getSchoolSnapshot()
    return NextResponse.json({
      students: snapshot.students,
      attendanceRecords: snapshot.attendanceRecords,
      gradeStudents: snapshot.gradeStudents,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر معالجة الطلب"
    if (message === "401") {
      return NextResponse.json({ error: "يجب تسجيل الدخول أولًا" }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
