import { NextResponse } from "next/server"
import { getSchoolSnapshot, saveAttendanceRecords } from "@/lib/server/school-store"
import { requireSchoolReadAccess, requireSchoolWriteAccess } from "@/lib/server/school-route"
import { mapManagedStudentsToSchoolStudents, type AttendanceRecord } from "@/lib/school-data"

export const runtime = "nodejs"

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
    await requireSchoolReadAccess()
    const snapshot = await getSchoolSnapshot()
    return NextResponse.json({
      students: mapManagedStudentsToSchoolStudents(snapshot.students),
      attendanceRecords: snapshot.attendanceRecords,
    })
  } catch (error) {
    return buildErrorResponse(error)
  }
}

export async function PUT(request: Request) {
  try {
    await requireSchoolWriteAccess()
    const body = (await request.json()) as { attendanceRecords?: AttendanceRecord[] }
    const attendanceRecords = await saveAttendanceRecords(Array.isArray(body.attendanceRecords) ? body.attendanceRecords : [])
    return NextResponse.json({ attendanceRecords })
  } catch (error) {
    return buildErrorResponse(error)
  }
}
